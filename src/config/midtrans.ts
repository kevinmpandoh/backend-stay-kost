import { env } from "./env";

const midtransClient = require("midtrans-client");

export const midtrans = new midtransClient.CoreApi({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

export const payoutCreator = new midtransClient.Iris({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.MIDTRANS_PAYOUT_KEY_CREATOR,
});

export const payoutApproval = new midtransClient.Iris({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.MIDTRANS_PAYOUT_KEY_APPROVER,
});
