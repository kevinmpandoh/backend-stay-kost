import { subscriptionRepository } from "./subscription.repository";

import { invoiceRepository } from "../invoice/invoice.repository";
import { packageRepository } from "../package/package.repository";
import { Types } from "mongoose";
import { ResponseError } from "@/utils/response-error.utils";
import { agenda } from "@/config/agenda";

class SubscriptionService {
  // Owner pilih paket → generate invoice
  async createSubscription(ownerId: string, packageId: string) {
    const pkg = await packageRepository.findById(packageId);
    if (!pkg || !pkg.isActive)
      throw new ResponseError(404, "Package not found");

    // Buat subscription status pending
    const subscription = await subscriptionRepository.create({
      owner: ownerId,
      package: packageId,
      status: "pending",
    });

    console.log(subscription);

    // Buat invoice untuk bayar paket
    const invoice = await invoiceRepository.create({
      invoiceNumber: "INV-" + Date.now(), // generator lebih bagus
      user: ownerId,
      type: "owner",
      subscription: subscription._id as Types.ObjectId,
      amount: pkg.price,

      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari
      status: "unpaid",
      description: `Langganan paket ${pkg.name} (${pkg.duration} hari)`,
    });

    // Schedule job cancel invoice 24 jam kemudian
    await agenda.schedule("in 24 hours", "cancel-unpaid-invoice", {
      invoiceId: invoice._id.toString(),
    });

    console.log(`📅 Cancel job scheduled for invoice ${invoice._id}`);

    return invoice;
  }

  // Get subscription aktif milik owner
  async getMySubscription(ownerId: string) {
    return await subscriptionRepository.findOne({ owner: ownerId }, [
      {
        path: "package",
      },
    ]);
  }

  async getAll() {
    return await subscriptionRepository.findAll();
  }

  async cancelSubscription(subscriptionId: string, ownerId: string) {
    const sub = await subscriptionRepository.findById(subscriptionId);
    if (!sub) throw new ResponseError(404, "Subscription not found");
    if (String(sub.owner) !== String(ownerId))
      throw new ResponseError(403, "Unauthorized");
    if (sub.status !== "active" && sub.status !== "pending")
      throw new ResponseError(400, "Cannot cancel");

    sub.status = "canceled";
    return sub.save();
  }

  // Dipanggil dari callback payment → aktifkan subscription
  async activateSubscription(subscriptionId: string) {
    const sub = await subscriptionRepository.findById(subscriptionId);
    if (!sub) throw new ResponseError(404, "Subscription not found");

    const pkg = await packageRepository.findById(sub.package);
    if (!pkg) throw new ResponseError(404, "Package not found");

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + pkg.duration); // misal duration = 30 hari

    sub.status = "active";
    sub.startDate = now;
    sub.endDate = endDate;
    await sub.save();

    return sub;
  }
}

export const subscriptionService = new SubscriptionService();
