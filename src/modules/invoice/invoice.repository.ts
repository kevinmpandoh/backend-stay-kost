import { BaseRepository } from "../../core/base.repository";
import { IInvoice, Invoice } from "./invoice.model";

export class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() {
    super(Invoice);
  }

  async findFirstUnpaidByBooking(bookingId: string) {
    return this.model
      .findOne({ booking: bookingId, status: "unpaid" })
      .sort({ dueDate: 1 });
  }
}

export const invoiceRepository = new InvoiceRepository();
