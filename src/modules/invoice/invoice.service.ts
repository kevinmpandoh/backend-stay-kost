import { ResponseError } from "@/utils/response-error.utils";
import { invoiceRepository } from "./invoice.repository";
import { BookingStatus } from "../booking/booking.types";
import { midtrans } from "@/config/midtrans";
import { generateMidtransParams } from "@/utils/generateMidtransParams";
import { paymentRepository } from "../payment/payment.repository";
import { PaymentStatus } from "../payment/payment.model";
import dayjs from "dayjs";
import { Invoice } from "./invoice.model";
import mongoose from "mongoose";

const getInvoice = async (invoiceNumber: string, userId: string) => {
  const invoice = (await invoiceRepository.findOne(
    {
      invoiceNumber,
      user: userId,
      status: "unpaid",
    },
    [
      {
        path: "booking",
        populate: [
          {
            path: "kost",
          },
          {
            path: "roomType",
            populate: "photos",
          },
        ],
      },
      {
        path: "subscription",
        populate: "package",
      },
    ]
  )) as any;

  if (!invoice) {
    throw new ResponseError(404, "Invoice tidak ditemukan");
  }

  const payment = await paymentRepository.findOne({
    invoice: invoice._id,
    status: PaymentStatus.PENDING,
  });

  if (invoice.booking) {
    const kost = invoice.booking.kost;
    const roomType = invoice.booking.roomType;

    return {
      id: invoice._id,
      type: "booking",
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      kostName: `${kost.name} - ${roomType.name}`,
      kostType: kost.type,
      photos: roomType?.photos?.[0]?.url,
      address: `${kost.address.district}, ${kost.address.city}`,
      startDate: dayjs(invoice.booking.startDate).format("D MMMM YYYY"),
      endDate: dayjs(invoice.booking.endDate).format("D MMMM YYYY"),
      duration: invoice.booking.duration,
      payment,
    };
  }

  // --- Case 2: Invoice untuk Subscription ---
  if (invoice.subscription) {
    const pkg = invoice.subscription.package;

    return {
      id: invoice._id,
      type: "subscription",
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      packageName: pkg.name,
      packageFeatures: pkg.features,
      packageDuration: invoice.subscription.duration, // bulan
      payment,
    };
  }

  throw new ResponseError(
    400,
    "Invoice tidak valid (tidak ada booking / subscription)"
  );
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

const getOwnerInvoices = async (req: any) => {
  const ownerId = req.user.id;
  const status = req.query.status;
  const search = req.query.search;
  let month = req.query.month || dayjs().format("YYYY-MM");

  if (!dayjs(month, "YYYY-MM", true).isValid()) {
    month = dayjs().format("YYYY-MM");
  }

  const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
  const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

  const pipeline: any[] = [
    // Join ke booking
    {
      $lookup: {
        from: "bookings",
        localField: "booking",
        foreignField: "_id",
        as: "booking",
      },
    },
    { $unwind: "$booking" },

    // Join tenant
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    // Join kost
    {
      $lookup: {
        from: "kosts",
        localField: "booking.kost",
        foreignField: "_id",
        as: "kost",
      },
    },
    { $unwind: "$kost" },

    // Join roomType
    {
      $lookup: {
        from: "roomtypes",
        localField: "booking.roomType",
        foreignField: "_id",
        as: "roomType",
      },
    },
    { $unwind: "$roomType" },

    // Join room
    {
      $lookup: {
        from: "rooms",
        localField: "booking.room",
        foreignField: "_id",
        as: "room",
      },
    },
    { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },

    // Join payout
    {
      $lookup: {
        from: "payouts",
        localField: "_id", // invoice._id
        foreignField: "invoice",
        as: "payout",
      },
    },
    { $unwind: { path: "$payout", preserveNullAndEmptyArrays: true } },

    // Filter by owner
    {
      $match: {
        "booking.owner": new mongoose.Types.ObjectId(ownerId),
        dueDate: { $gte: startDate, $lte: endDate },
        ...(status ? { status } : {}),
      },
    },
  ];

  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "user.name": regex },
          { "kost.name": regex },
          { "roomType.name": regex },
        ],
      },
    });
  }

  // Projection hasil akhir
  pipeline.push({
    $project: {
      id: "$_id",
      invoice: "$invoice",

      tenant: {
        name: "$user.name",
        photo: "$user.avatarUrl",
        email: "$user.email",
        phone: "$user.phone",
      },

      kost: {
        name: "$kost.name",
        roomType: "$roomType.name",
        numberRoom: "$room.number",
        floor: "$room.floor",
      },

      dueDate: "$dueDate",
      status: "$status",
      total: "$amount",

      payout: {
        payoutNumber: "$payout.payoutNumber",
        amount: "$payout.amount",
        platformFee: "$payout.platformFee",
        netAmount: "$payout.netAmount",
        status: "$payout.status",
        transferredAt: "$payout.transferredAt",
        visibleFailedReason: "$payout.visibleFailedReason",
        note: "$payout.note",
      },
    },
  });

  const invoices = await Invoice.aggregate(pipeline);

  return invoices.map((invoice: any) => {
    const dueDate = dayjs(invoice.dueDate);
    const now = dayjs();

    const daysDiff = dueDate.diff(now, "day");
    const isDueToday = dueDate.isSame(now, "day");
    const isLate = now.isAfter(dueDate, "day");
    const daysLate = isLate ? now.diff(dueDate, "day") : 0;

    return {
      ...invoice,
      dueDate: dueDate.format("D MMMM YYYY"),
      daysRemaining: daysDiff,
      isDueToday,
      isLate,
      daysLate,
    };
  });
};

const getAdminInvoices = async ({
  search,
  status,
  month = dayjs().format("YYYY-MM"),
}: any) => {
  if (!dayjs(month, "YYYY-MM", true).isValid()) {
    month = dayjs().format("YYYY-MM"); // fallback ke bulan sekarang
  }

  const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
  const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

  const pipeline: any[] = [
    // Join ke booking
    {
      $lookup: {
        from: "bookings",
        localField: "booking",
        foreignField: "_id",
        as: "booking",
      },
    },
    { $unwind: "$booking" },

    // Join tenant
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    {
      $match: {
        dueDate: { $gte: startDate, $lte: endDate },
        ...(status ? { status } : {}),
      },
    },
  ];

  // Search by tenant name, kost name, or roomType
  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [{ "user.name": regex }],
      },
    });
  }

  const invoices = await Invoice.aggregate(pipeline);

  // post-process (hitung daysRemaining, late, dll)
  return invoices.map((invoice: any) => {
    const dueDate = dayjs(invoice.dueDate);
    const now = dayjs();

    const daysDiff = dueDate.diff(now, "day");
    const isDueToday = dueDate.isSame(now, "day");
    const isLate = now.isAfter(dueDate, "day");
    const daysLate = isLate ? now.diff(dueDate, "day") : 0;

    return {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      user: {
        name: invoice.user.name,
        email: invoice.user.email,
        phone: invoice.user.phone,
        photo: invoice.user.photo,
      },
      status: invoice.status,
      amount: invoice.amount,
      dueDate: dueDate.format("D MMMM YYYY"),
      daysRemaining: daysDiff,
      isDueToday,
      isLate,
      daysLate,
    };
  });
};

export default {
  getInvoice,
  createPayment,
  getOwnerInvoices,
  getAdminInvoices,
};
