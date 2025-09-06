import { ResponseError } from "@/utils/response-error.utils";
import { invoiceRepository } from "./invoice.repository";
import { BookingStatus } from "../booking/booking.types";
import { midtrans } from "@/config/midtrans";
import { generateMidtransParams } from "@/utils/generateMidtransParams";
import { paymentRepository } from "../payment/payment.repository";
import { PaymentStatus } from "../payment/payment.model";

const getInvoice = async (invoiceNumber: string, userId: string) => {
  const invoice = await invoiceRepository.findOne({
    invoiceNumber,
    user: userId,
  });

  if (!invoice) {
    throw new ResponseError(404, "Invoice tidak ditemukan");
  }

  const payment = await paymentRepository.findOne({
    invoice: invoice._id,
    status: PaymentStatus.PENDING,
  });

  return {
    ...invoice.toObject(),
    payment,
  };
};
const createPayment = async (
  invoiceNumber: string,
  userId: string,
  payload: {
    provider: string;
    method: string;
    channel: string;
  }
) => {
  const invoice = (await invoiceRepository.findOne(
    {
      invoiceNumber,
      user: userId,
    },
    [
      {
        path: "booking",
      },
    ]
  )) as any;

  if (!invoice) {
    throw new ResponseError(404, "Invoice tidak ditemukan");
  }

  let expiryTime: Date;

  if (
    invoice.booking &&
    invoice.booking.status === BookingStatus.WAITING_FOR_PAYMENT &&
    invoice.booking.paymentDeadline
  ) {
    expiryTime = new Date(invoice.booking.paymentDeadline);
  } else {
    // default: 24 jam dari sekarang
    const now = new Date();
    expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  const params = generateMidtransParams(
    payload.channel,
    invoiceNumber,
    invoice.amount,
    expiryTime
  );

  const transaction = await midtrans.charge(params);
  console.log(transaction, "TRANSAKSINYA");

  if (transaction.status_code !== "201") {
    throw new ResponseError(
      transaction.status_code,
      transaction.status_message || "Midtrans Error",
      transaction.validation_messages || []
    );
  }

  const payment = await paymentRepository.create({
    invoice: invoice._id,
    user: userId,
    amount: invoice.amount,

    provider: payload.provider,
    method: payload.method,
    channel: payload.channel,

    vaNumber:
      transaction.va_numbers?.[0]?.va_number ||
      transaction.permata_va_number ||
      "",
    billerCode: transaction.biller_code || "",
    billKey: transaction.bill_key || "",
    qrisUrl: transaction.actions?.[0]?.url || "",

    externalId: transaction.transaction_id,
    status: PaymentStatus.PENDING,
    expiredAt: expiryTime,
  });

  return payment;
};

export default {
  getInvoice,
  createPayment,
};
