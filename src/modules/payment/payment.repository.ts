import { BaseRepository } from "@/core/base.repository";
import PaymentModel, { IPayment } from "./payment.model";

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(PaymentModel);
  }
  async findPendingByBooking(bookingId: string) {
    return this.model.findOne({ bookingId, status: "pending" });
  }
  async addAttempt(paymentId: string, attempt: any) {
    return this.model.findByIdAndUpdate(
      paymentId,
      {
        $push: { attempts: attempt },
        paymentCode: attempt.paymentCode,
        expiredAt: attempt.expiredAt,
      },
      { new: true }
    );
  }
}

export const paymentRepository = new PaymentRepository();
