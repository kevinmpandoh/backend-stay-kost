import { payoutApproval, payoutCreator } from "@/config/midtrans";
import { payoutRepository } from "./payout.repository";
import { ResponseError } from "@/utils/response-error.utils";
import crypto from "crypto";

import { userRepository } from "../user/user.repository";
import { PayoutPayload, PayoutStatus } from "./payout.type";
import { IInvoice } from "../invoice/invoice.model";
import { IUser } from "../user/user.model";

import { generatePayoutNumber } from "@/utils/generatePayoutNumber";
import { mapPayoutError } from "@/utils/payoutErrorMapper";
import { env } from "@/config/env";
import { notificationService } from "../notification/notification.service";

const getAllPayout = async ({
  query,
}: {
  query: {
    status: string;
    search: string;
    sort: string;
    page: number;
  };
}) => {
  const payouts = await payoutRepository.findPayoutsWithFilters({
    page: query.page || 1,
    limit: 10,
    status: query.status,
    search: query.search,
    sort: query.sort,
  });

  return {
    data: payouts.docs,
    pagination: {
      total: payouts.totalDocs,
      page: payouts.page,
      limit: payouts.limit,
      totalPages: payouts.totalPages,
      hasNextPage: payouts.hasNextPage,
      hasPrevPage: payouts.hasPrevPage,
    },
  };
};

const getAllBeneficiaries = async () => {
  return await payoutApproval.getBeneficiaries();
};

const updateBeneficiaries = async (aliasName: string, payload: any) => {
  return await payoutApproval.updateBeneficiaries({
    name: payload.name,
    account: payload.account,
    bank: payload.bank,
    alias_name: aliasName,
    email: payload.email,
  });
};

const createPayout = async ({
  invoice,
  ownerId,
}: {
  invoice: IInvoice;
  ownerId: string;
}) => {
  const owner = await userRepository.findById(ownerId);

  if (!owner) throw new ResponseError(404, "Owner tidak ditemukan");

  const amount = invoice.amount;
  const fee = Math.floor(amount * 0.05); // contoh 5% fee
  const netAmount = amount - fee;

  const payoutData = {
    payoutNumber: generatePayoutNumber(),
    owner: owner._id,
    invoice: invoice._id,
    amount: 1,
    platformFee: fee,
    netAmount,
    currency: "IDR",
    provider: "midtrans",
  };

  if (
    !owner.bank?.accountNumber ||
    !owner.bank?.bankCode ||
    !owner.bank?.accountName ||
    !owner.bank?.aliasName
  ) {
    const newPayout = await payoutRepository.create({
      ...payoutData,
      status: PayoutStatus.PENDING,
      visibleFailedReason:
        "Rekening bank belum lengkap. Silahkan lengkapi rekening bank agar pembayaran bisa diproses.",
      note: "Pembayaran Kost",
    });

    await notificationService.sendNotification(
      newPayout.owner.toString(),
      "owner",
      "payout",
      `Pembayaran Kost berjumlah Rp${newPayout.amount.toLocaleString()} GAGAL di transfer ke rekening anda karena Rekening Bank belum lengkap. Silahkan lengkap data rekeningnya`,
      "Payoout Failed",
      { payoutId: newPayout.invoice }
    );
  } else {
    // kirim ke payment gateway (contoh Midtrans Disbursement API)
    try {
      const response = await payoutCreator.createPayouts({
        payouts: [
          {
            amount: 1,
            notes: `Payout for invoice ${invoice._id}`,
            beneficiary_name: owner.bank.accountName,
            beneficiary_account: owner.bank.accountNumber,
            beneficiary_bank: owner.bank.bankCode,
          },
        ],
      });

      const payoutRes = response.payouts?.[0];

      // Approve otomatis
      const res = await payoutApproval.approvePayouts({
        reference_nos: [payoutRes.reference_no],
      });

      await payoutRepository.create({
        ...payoutData,
        provider: "midtrans",
        method: "bank_transfer",
        channel: owner.bank.bankCode,
        accountName: owner.bank.accountName,
        accountNumber: owner.bank.accountNumber,
        externalId: payoutRes.reference_no,
        note: "Pembayaran Kost",
        requestedAt: new Date(),
      });
    } catch (err: any) {
      throw new ResponseError(
        400,
        err.ApiResponse.error_message,
        err.ApiResponse.errors
      );
    }
  }
};

const approvePayout = async (payoutId: string) => {
  // Cek payout di database
  const payout = (await payoutRepository.findById(payoutId)) as any;
  if (!payout) throw new ResponseError(404, "Payout tidak ditemukan.");

  if (payout.status !== "pending")
    throw new ResponseError(400, "Payout sudah diproses.");

  if (!payout.midtrans_payout_id) {
    if (!payout.owner.rekening_bank.nomor_rekening)
      throw new ResponseError(400, "Rekening bank belum lengkap");
    const payoutData = {
      amount: payout.jumlah,
      beneficiary_name: payout.owner.rekening_bank?.nama_pemilik,
      beneficiary_account: payout.owner.rekening_bank?.nomor_rekening,
      beneficiary_bank: payout.owner.rekening_bank?.nama_bank,
      notes: `Pembayaran kost`,
    };

    const response = await payoutCreator.createPayouts({
      payouts: [payoutData],
    });

    if (response.payouts[0].status === "queued") {
      await payoutRepository.updateById(payout._id, {
        midtrans_payout_id: response.payouts[0].reference_no,
        reason: null,
      });

      const midtransResponse = await payoutApproval.approvePayouts({
        reference_nos: [response.payouts[0].reference_no],
      });

      return midtransResponse;
    }
  }

  // Approve payout via Midtrans
  const midtransResponse = await payoutApproval.approvePayouts({
    reference_nos: [payout.midtrans_payout_id],
  });

  return midtransResponse;
};

const sendPayout = async (payoutId: string) => {
  // Cek payout di database
  const payout = (await payoutRepository.findById(payoutId, [
    { path: "owner" },
  ])) as any;
  if (!payout) throw new ResponseError(404, "Payout tidak ditemukan.");

  if ([PayoutStatus.SUCCESS, PayoutStatus.PROCESSED].includes(payout.status)) {
    throw new ResponseError(400, "Payout sudah diproses.");
  }

  const owner = payout.owner;

  if (
    !owner.bank.accountName ||
    !owner.bank.accountNumber ||
    !owner.bank.bankCode
  )
    throw new ResponseError(400, "Rekening bank belum lengkap");

  try {
    // Data payout yang dikirim ke Midtrans
    const payoutData = {
      amount: 1,
      beneficiary_name: owner.bank.accountName,
      beneficiary_account: owner.bank.accountNumber,
      beneficiary_bank: owner.bank.bankCode,
      notes: `Pembayaran kost `,
    };

    // 1. Buat payout baru ke Midtrans
    const response = await payoutCreator.createPayouts({
      payouts: [payoutData],
    });

    const payoutRes = response.payouts?.[0];
    if (!payoutRes)
      throw new ResponseError(400, "Midtrans tidak mengembalikan data payout");

    // 2. Approve payout
    const tes = await payoutApproval.approvePayouts({
      reference_nos: [payoutRes.reference_no],
    });

    // 3. Update di database
    await payoutRepository.updateById(payout._id, {
      accountName: owner.bank.accountName,
      accountNumber: owner.bank.accountNumber,
      status: PayoutStatus.PROCESSED, // sementara, tunggu callback Midtrans
      method: "bank_transfer",
      provider: "midtrans",
      channel: owner.bank.bankCode,
      externalId: payoutRes.reference_no, // jangan ditimpa lagi
      failedReason: null,
      isInternalError: false,
      visibleFailedReason: null,
    });

    return { success: true, referenceNo: payoutRes.reference_no };
  } catch (err: any) {
    // Simpan alasan gagal supaya admin bisa lihat
    await payoutRepository.updateById(payoutId, {
      status: PayoutStatus.FAILED,
      failedReason: err.ApiResponse?.error_message || err.message,
    });
    throw new ResponseError(
      400,
      "Gagal mengirim payout",
      err.ApiResponse || err
    );
  }
};

const rejectPayout = async (payoutId: string) => {
  // Cek payout di database
  const payoutData = await payoutRepository.findById(payoutId);
  if (!payoutData) throw new ResponseError(404, "Payout tidak ditemukan.");
  if (payoutData.status !== "pending")
    throw new ResponseError(400, "Payout sudah diproses.");

  // Approve payout via Midtrans
  await payoutApproval.rejectPayouts({
    reference_nos: [payoutData.externalId],
    reject_reason: "Testing",
  });

  // Update status payout di database
  payoutData.status = PayoutStatus.REJECTED;
  await payoutData.save();
};

const createAutoPayout = async ({
  ownerId,
  amount,
  reason = "Waiting for bank account",
  notes,
  invoiceId,
}: PayoutPayload) => {
  const owner = await userRepository.findById(ownerId);
  if (!owner) throw new ResponseError(404, "Pemilik tidak ditemukan");
  if (
    !owner?.bank?.accountNumber ||
    !owner.bank?.bankCode ||
    !owner.bank?.accountName
  ) {
    await payoutRepository.create({
      owner: owner._id,
      amount,
      status: PayoutStatus.PENDING,
      failedReason: reason,
      externalId: "",
      invoice: invoiceId,
      requestedAt: new Date(),
    });
    return;
  }

  const response = await payoutCreator.createPayouts({
    payouts: [
      {
        amount,
        notes,
        beneficiary_name: owner.bank?.accountName,
        beneficiary_account: owner.bank?.accountNumber,
        beneficiary_bank: owner.bank?.bankCode,
      },
    ],
  });

  const payoutRes = response.payouts?.[0];
  if (!payoutRes || payoutRes.status !== "queued") {
    await payoutRepository.create({
      owner: owner._id,
      amount,
      status: PayoutStatus.FAILED,
      failedReason: reason,
      externalId: "",
      invoice: invoiceId,
      requestedAt: new Date(),
    });
    throw new ResponseError(400, "Payout gagal dikirim");
  }
  // Approve otomatis
  const res = await payoutApproval.approvePayouts({
    reference_nos: [payoutRes.reference_no],
  });

  await payoutRepository.create({
    payoutNumber: "PO-202508-0001",
    owner: ownerId,
    amount: 1,
    invoice: invoiceId,
    accountName: owner.bank?.accountName,
    accountNumber: owner.bank?.accountNumber,
    method: "bank_transfer",
    provider: "midtrans",
    channel: owner.bank.bankCode,
    externalId: payoutRes.reference_no,
    requestedAt: new Date(),
  });
};

interface PayoutNotificationArgs {
  rawBody: string;
  headers: any;
  body: any;
}

const processPayoutNotification = async ({
  rawBody,
  headers,
  body,
}: PayoutNotificationArgs) => {
  const irisSignature = headers["iris-signature"];
  const expectedSignature = crypto
    .createHash("sha512")
    .update(rawBody + env.MIDTRANS_PAYOUT_MERCHANT_KEY)
    .digest("hex");

  if (irisSignature !== expectedSignature) {
    throw new ResponseError(403, "Invalid IRIS signature");
  }

  // --- 2. Lanjut proses seperti biasa ---
  const { reference_no, status, updated_at, error_code, error_message } = body;

  const payout = await payoutRepository.findOne({
    externalId: reference_no,
  });
  if (!payout) throw new ResponseError(404, "Payout tidak ditemukan");
  if (status === "processed") {
    payout.status = PayoutStatus.PROCESSED;
    payout.updatedAt = updated_at;
    payout.save();
  } else if (status === "completed") {
    payout.status = PayoutStatus.SUCCESS;
    payout.transferredAt = new Date();
    payout.visibleFailedReason = "";
    (payout.isInternalError = false), (payout.failedReason = "");
    payout.updatedAt = updated_at;
    payout.save();

    await notificationService.sendNotification(
      payout.owner.toString(),
      "owner",
      "payout",
      `Pembayaran Kost berjumlah Rp${payout.amount.toLocaleString()} berhasil di transfer ke rekening anda`,
      "Payoout Success",
      { payotuId: payout.invoice }
    );
  } else if (status === "failed") {
    const mapped = mapPayoutError(error_code, error_message);

    // Simpan untuk admin
    payout.failedReason = mapped.adminReason;
    payout.isInternalError = mapped.isInternalError;

    // Kalau internal → tetap pending di UI owner
    if (mapped.isInternalError) {
      payout.status = PayoutStatus.PENDING;
      payout.visibleFailedReason = mapped.ownerMessage; // optional field buat owner
    } else {
      payout.status = PayoutStatus.FAILED;
      payout.visibleFailedReason = mapped.ownerMessage; // optional field buat owner
      await notificationService.sendNotification(
        payout.owner.toString(),
        "owner",
        "payout",
        `Pembayaran Kost berjumlah Rp${payout.amount.toLocaleString()} GAGAL di transfer ke rekening anda karena ${
          mapped.ownerMessage
        }`,
        "Payoout Failed",
        { payotuId: payout.invoice }
      );
    }
    payout.save();
  }
  return payout;
};

export default {
  getAllPayout,
  processPayoutNotification,
  getAllBeneficiaries,
  createPayout,
  approvePayout,
  sendPayout,
  rejectPayout,
  updateBeneficiaries,
  createAutoPayout,
};
