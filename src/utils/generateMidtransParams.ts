import { ResponseError } from "./response-error.utils";

interface CustomerDetails {
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  options?: any;
}

export const generateMidtransParams = (
  paymentProvider: string,
  invoice: string,
  amount: number,
  expiryTime?: any,
  customer?: CustomerDetails
  // options?: { custom_expiry?: any }
) => {
  const startTime = new Date(); // waktu saat ini

  // Hitung waktu tersisa
  const durationInSeconds = Math.floor(
    (expiryTime.getTime() - startTime.getTime()) / 1000
  );

  // Jika sudah expired, jangan lanjut
  if (durationInSeconds <= 0) {
    throw new ResponseError(400, "Waktu pembayaran telah habis");
  }
  const baseParams = {
    transaction_details: {
      order_id: invoice,
      gross_amount: amount,
    },

    customer_details: customer,

    custom_expiry: {
      expiry_duration: durationInSeconds,
      unit: "second",
    },

    // ...options,
  };

  // Bank Transfer (BNI, BRI, BCA, CIMB)
  if (["bni", "bri", "bca", "cimb"].includes(paymentProvider)) {
    return {
      ...baseParams,
      payment_type: "bank_transfer",
      bank_transfer: {
        bank: paymentProvider,
      },
    };
  }

  // Mandiri (E-Channel)
  if (paymentProvider === "mandiri") {
    return {
      ...baseParams,
      payment_type: "echannel",
      echannel: {
        bill_info1: "Jenis Pembayaran",
        bill_info2: "Bayar Kost",
      },
    };
  }

  // Permata
  if (paymentProvider === "permata") {
    return {
      ...baseParams,
      payment_type: "permata",
    };
  }

  // GoPay
  if (paymentProvider === "gopay") {
    return {
      ...baseParams,
      payment_type: "gopay",
      gopay: {
        enable_callback: true,
        callback_url: "someapps://callback",
      },
    };
  }

  if (paymentProvider === "qris") {
    return {
      ...baseParams,
      payment_type: "qris",
      qris: {},
    };
  }

  throw new ResponseError(400, "Metode pembayaran tidak valid");
};
