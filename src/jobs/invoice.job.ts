import { agenda } from "@/config/agenda";
import { Invoice } from "../modules/invoice/invoice.model";
import { Job, JobAttributesData } from "agenda";

interface CancelInvoice extends JobAttributesData {
  invoiceId: string; // app-specific type
}

// Define job
agenda.define<CancelInvoice>(
  "cancel-unpaid-invoice",
  async (job: Job<CancelInvoice>) => {
    const { invoiceId } = job.attrs.data;

    console.log(
      `⏰ [AGENDA] Running job: cancel-unpaid-invoice for ${invoiceId}`
    );

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      console.log(`⚠️ Invoice ${invoiceId} not found`);
      return;
    }

    // Kalau bukan subscription, jangan cancel
    if (invoice.type !== "owner" || !invoice.subscription) {
      console.log(`⏭ Invoice ${invoice._id} bukan subscription, skip`);
      return;
    }

    // Jika invoice masih unpaid setelah 24 jam → cancel
    if (invoice.status === "unpaid") {
      invoice.status = "cancelled";
      await invoice.save();

      console.log(`❌ Invoice ${invoice._id} cancelled (timeout)`);
      // TODO: kirim notifikasi ke owner kalau invoice dibatalkan
    } else {
      console.log(`✅ Invoice ${invoice._id} status: ${invoice.status}, skip`);
    }
  }
);

// Job untuk tandai overdue booking invoice
agenda.define("mark-overdue-booking-invoices", async () => {
  console.log("⏰ [AGENDA] Running job: mark-overdue-booking-invoices");

  const now = new Date();

  const result = await Invoice.updateMany(
    {
      type: "tenant",
      booking: { $exists: true },
      status: "unpaid",
      dueDate: { $lt: now },
    },
    { $set: { status: "overdue" } }
  );

  console.log(`⚠️ Overdue booking invoices updated: ${result.modifiedCount}`);
});
