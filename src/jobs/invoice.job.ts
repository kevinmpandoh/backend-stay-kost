import { agenda } from "@/config/agenda";
import { Invoice } from "../modules/invoice/invoice.model";
import { Job, JobAttributesData } from "agenda";
import { notificationService } from "@/modules/notification/notification.service";

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

agenda.define("reminder-tenant-invoice", async () => {
  console.log("⏰ [AGENDA] Running job: reminder-tenant-invoice");

  const now = new Date();

  // Cari invoice tenant yang unpaid dan akan jatuh tempo dalam 3 hari
  const soonDueInvoices = (await Invoice.find({
    type: "tenant",
    status: "unpaid",
    dueDate: {
      $gte: now, // belum jatuh tempo
      $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // dalam 3 hari ke depan
    },
  }).populate("user")) as any; // asumsikan ada relasi tenant

  for (const inv of soonDueInvoices) {
    const dueDateStr = inv.dueDate.toLocaleDateString("id-ID");
    console.log(
      `📢 Reminder: Invoice ${inv._id} akan jatuh tempo pada ${inv.dueDate}`
    );
    await notificationService.sendNotification(
      soonDueInvoices.user._id,
      "tenant",
      "payment",
      `Tagihan Anda akan jatuh tempo pada ${dueDateStr}`,
      "Pengingat Pembayaran",
      {
        invoiceId: inv._id,
        dueDate: inv.dueDate,
        amount: inv.amount,
      }
    );
  }

  // Cari invoice tenant yang sudah jatuh tempo
  const overdueInvoices = (await Invoice.find({
    type: "tenant",
    status: "unpaid",
    dueDate: { $lt: now },
  }).populate("user")) as any;

  for (const inv of overdueInvoices) {
    console.log(`📢 Reminder: Invoice ${inv._id} sudah jatuh tempo!`);
    // TODO: kirim notifikasi ke tenant

    await notificationService.sendNotification(
      inv.user._id.toString(),
      "tenant",
      "payment",
      `Tagihan Anda dengan nomor ${inv._id} sudah jatuh tempo.`,
      "Pembayaran Terlambat",
      {
        invoiceId: inv._id,
        dueDate: inv.dueDate,
        amount: inv.amount,
      }
    );
  }
});
