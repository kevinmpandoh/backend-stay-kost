import crypto from "crypto";
import { paymentRepository, PaymentRepository } from "./payment.repository";
import { midtrans } from "../../config/midtrans";
import logger from "../../config/logger";
import { ResponseError } from "@/utils/response-error.utils";
import { PaymentStatus } from "./payment.model";
import { invoiceRepository } from "../invoice/invoice.repository";
import { BookingStatus } from "../booking/booking.types";
import { bookingRepository } from "../booking/booking.repository";
import dayjs from "dayjs";
import { subscriptionService } from "../subscription/subscription.service";
import { agenda } from "@/config/agenda";
import { notificationService } from "../notification/notification.service";
import { env } from "@/config/env";

export class PaymentService {
  private repo = new PaymentRepository();

  static async getAllPaymentTenant(tenantId: string) {
    const payment = await paymentRepository.findAll(
      {
        user: tenantId,
      },
      {},
      [
        {
          path: "invoice",
          populate: {
            path: "booking",
            populate: [
              {
                path: "roomType",
              },
              {
                path: "kost",
              },
            ],
          },
        },
      ]
    );
    return payment.map((data: any) => {
      const roomType = data.invoice.booking.roomType;
      const kost = data.invoice.booking.kost;

      return {
        id: data._id,
        kost: `${kost.name} - ${roomType.name}`,

        paymentMethod: data.method,
        channel: data.channel,
        status: data.status,
        amount: data.amount,
        desciption: data.invoice.description,
        payment_date: dayjs(data.paidAt).format("D MMMM YYYY"),
        invoice: data.invoice.invoiceNumber,
      };
    });
  }

  static async handleMidtransCallback(body: any) {
    console.log(body, "DATA");
    // --- 1. Verifikasi Signature ---
    const rawSignature =
      body.order_id +
      body.status_code +
      body.gross_amount +
      env.MIDTRANS_SERVER_KEY;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(rawSignature)
      .digest("hex");

    if (body.signature_key !== expectedSignature) {
      throw new ResponseError(403, "Invalid signature");
    }

    // --- 2. Ambil Payment dari DB ---
    const payment = (await paymentRepository.findOne(
      {
        externalId: body.transaction_id,
      },
      [
        {
          path: "invoice",
          populate: {
            path: "booking",
          },
        },
        {
          path: "user",
          select: "role",
        },
      ]
    )) as any;

    if (!payment) {
      throw new ResponseError(404, "Payment not found");
    }

    // --- 3. Tentukan status baru ---
    let newStatus:
      | PaymentStatus.PENDING
      | PaymentStatus.SUCCESS
      | PaymentStatus.FAILED = PaymentStatus.PENDING;
    if (body.transaction_status === "settlement") {
      newStatus = PaymentStatus.SUCCESS;
    } else if (["expire", "cancel", "deny"].includes(body.transaction_status)) {
      newStatus = PaymentStatus.FAILED;
    }

    // --- 4. Update Payment & Invoice ---
    if (payment.status !== newStatus) {
      payment.status = newStatus;

      if (newStatus === PaymentStatus.SUCCESS) {
        payment.paidAt = new Date();
        const invoice = await invoiceRepository.updateById(
          payment.invoice._id.toString(),
          {
            status: "paid",
          }
        );

        if (invoice && invoice.subscription) {
          await subscriptionService.activateSubscription(
            invoice.subscription.toString()
          );
        }

        // jika ini invoice booking pertama → aktifkan booking
        if (
          payment.invoice.booking &&
          payment.invoice.booking.status === BookingStatus.WAITING_FOR_PAYMENT
        ) {
          const booking = await bookingRepository.updateById(
            payment.invoice.booking,
            {
              status: BookingStatus.WAITING_FOR_CHECKIN,
              paymentDeadline: null,
            }
          );
          await bookingRepository.update(
            {
              _id: payment.invoice.booking,
              status: {
                $in: [BookingStatus.PENDING, BookingStatus.WAITING_FOR_PAYMENT],
              },
            },
            {
              $set: { status: BookingStatus.EXPIRED },
            }
          );

          // Schedule auto check-in
          if (booking) {
            await agenda.schedule(booking.startDate, "auto-check-in", {
              bookingId: booking._id.toString(),
            });
          }

          // Pembayaran untuk sewa kamar {roomName} gagal atau kadaluarsa
        }
        await notificationService.sendNotification(
          payment.user._id,
          payment.user.role === "owner" ? "owner" : "tenant",
          "payment",
          `Pembayaran Rp${payment.amount.toLocaleString()} berhasil`,
          "Payment Success",
          { invoiceId: invoice?._id }
        );
      } else if (newStatus === PaymentStatus.FAILED) {
        await notificationService.sendNotification(
          payment.user._id,
          payment.user.role === "owner" ? "owner" : "tenant",
          "payment",
          `Pembayaran dengan invoice ${
            body.order_id
          } berjumlah Rp${payment.amount.toLocaleString()} gagal dibayarkan`,
          "Payment Success"
        );
      }
      await payment.save();
    }

    return { paymentId: payment._id, status: payment.status };
  }

  static async checkStatus(paymentId: string, userId: string) {
    // 1. Ambil payment
    const payment = (await paymentRepository.findById(paymentId, [
      {
        path: "invoice",
        populate: {
          path: "booking",
        },
      },
    ])) as any;
    if (!payment) throw new ResponseError(404, "Payment not found");
    if (payment.user.toString() !== userId)
      throw new ResponseError(403, "Forbidden");

    // 2. Call ke Midtrans API
    const response = await midtrans.transaction.status(payment.externalId);

    // 3. Update status di DB
    let newStatus:
      | PaymentStatus.PENDING
      | PaymentStatus.SUCCESS
      | PaymentStatus.FAILED = PaymentStatus.PENDING;
    if (
      response.transaction_status === "settlement" ||
      response.transaction_status === "capture"
    ) {
      newStatus = PaymentStatus.SUCCESS;
    } else if (
      response.transaction_status === "expire" ||
      response.transaction_status === "deny" ||
      response.transaction_status === "cancel"
    ) {
      newStatus = PaymentStatus.FAILED;
    }

    if (payment.status !== newStatus) {
      payment.status = newStatus;
      if (newStatus === PaymentStatus.SUCCESS) {
        payment.paidAt = new Date();
        const invoice = await invoiceRepository.updateById(
          payment.invoice._id.toString(),
          {
            status: "paid",
          }
        );

        if (invoice && invoice.subscription) {
          await subscriptionService.activateSubscription(
            invoice.subscription.toString()
          );
        }

        // jika ini invoice booking pertama → aktifkan booking
        if (
          payment.invoice.booking &&
          payment.invoice.booking.status === BookingStatus.WAITING_FOR_PAYMENT
        ) {
          await bookingRepository.updateById(payment.invoice.booking, {
            status: BookingStatus.WAITING_FOR_CHECKIN,
            paymentDeadline: null,
          });
          await bookingRepository.update(
            {
              _id: payment.invoice.booking,
              status: {
                $in: [BookingStatus.PENDING, BookingStatus.WAITING_FOR_PAYMENT],
              },
            },
            {
              $set: { status: BookingStatus.EXPIRED },
            }
          );
        }
      }
      await payment.save();
    }

    return {
      paymentId: payment._id,
      status: payment.status,
      invoice: payment.invoice,
    };
  }

  async createSubscriptionTransaction(
    ownerId: string,
    subscriptionId: string,
    amount: number,
    method: string
  ) {
    const tx = await this.repo.create({
      userId: ownerId,
      subscriptionId,
      type: "subscription",
      amount,
      status: "pending",
    } as any);

    const orderId = `SUB-${subscriptionId}-${Date.now()}`;
    const payload: any = {
      payment_type: method === "bank_transfer" ? "bank_transfer" : method,
      transaction_details: { order_id: orderId, gross_amount: amount },
    };
    if (method === "bank_transfer") payload.bank_transfer = { bank: "bca" };

    const response = await midtrans.charge(payload);
    logger.debug("midtrans response", response);

    const attempt = {
      paymentCode:
        response.va_numbers?.[0]?.va_number || response.transaction_id,
      expiredAt: response.expiry_time
        ? new Date(response.expiry_time)
        : new Date(Date.now() + 24 * 3600 * 1000),
      createdAt: new Date(),
    };

    await this.repo.addAttempt(tx._id.toString(), attempt);
    return { tx, midtrans: response };
  }

  async handleNotification(payload: any) {
    // implementasi: verifikasi signature, cari order_id -> update tx status
    logger.info("Received midtrans notification", payload);
    // contoh minimal: cari transaksi by order_id mapping (but this requires storing order_id in DB)
  }
}
