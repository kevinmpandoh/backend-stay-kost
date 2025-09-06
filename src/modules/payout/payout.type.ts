export interface PayoutPayload {
  ownerId: string;
  amount: number;
  notes: string;
  invoiceId: string;
  reason?: string;
}

export enum PayoutStatus {
  PENDING = "pending",
  WAITING_BANK_ACCOUNT = "waiting_bank_account",
  PROCESSED = "processed",
  REJECTED = "rejected",
  SUCCESS = "success",
  FAILED = "failed",
}
