import { BaseRepository } from "../../core/base.repository";
import { IInvoice, Invoice } from "./invoice.model";

export class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() {
    super(Invoice);
  }
}

export const invoiceRepository = new InvoiceRepository();
