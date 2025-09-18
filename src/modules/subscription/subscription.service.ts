import { subscriptionRepository } from "./subscription.repository";

import { invoiceRepository } from "../invoice/invoice.repository";
import { packageRepository } from "../package/package.repository";
import { Types } from "mongoose";
import { ResponseError } from "@/utils/response-error.utils";
import { agenda } from "@/config/agenda";
import dayjs from "dayjs";
import { paymentRepository } from "../payment/payment.repository";
import { PaymentStatus } from "../payment/payment.model";
import { midtrans } from "@/config/midtrans";

class SubscriptionService {
  // Owner pilih paket → generate invoice
  async createSubscription(
    ownerId: string,
    packageId: string,
    duration: number
  ) {
    const pkg = await packageRepository.findById(packageId);
    if (!pkg || !pkg.isActive)
      throw new ResponseError(404, "Package not found");

    // cari durasi yang dipilih dari package
    const selectedDuration = pkg.durations.find(
      (d: any) => d.duration === duration
    );
    if (!selectedDuration) {
      throw new ResponseError(400, "Invalid duration for this package");
    }

    // Buat subscription status pending
    const subscription = await subscriptionRepository.create({
      owner: ownerId,
      package: packageId,
      status: "pending",
      duration: selectedDuration.duration,
    });

    // Buat invoice untuk bayar paket
    const invoice = await invoiceRepository.create({
      invoiceNumber: "INV-" + Date.now(), // generator lebih bagus
      user: ownerId,
      type: "owner",
      subscription: subscription._id as Types.ObjectId,
      amount: selectedDuration.price,

      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari
      status: "unpaid",
      description: `Langganan paket ${pkg.name} (${duration} bulan)`,
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
    return await subscriptionRepository.findAll(
      { owner: ownerId },
      {
        sort: {
          createdAt: -1,
        },
      },
      [
        {
          path: "package",
        },
      ]
    );
  }

  async getCurrentSubscription(ownerId: string) {
    return await subscriptionRepository.findOne(
      { owner: ownerId, status: "active" },
      [
        {
          path: "package",
        },
      ]
    );
  }

  async getAll() {
    const subscriptions = await subscriptionRepository.findAll(
      {
        status: "active",
      },
      {
        sort: {
          createdAt: 1,
        },
      },
      [{ path: "owner package" }]
    );

    return subscriptions.map((subscription: any) => {
      const owner = subscription.owner;
      const packageOwner = subscription.package;
      return {
        id: subscription._id,
        duration: `${subscription.duration} bulan`,
        startDate: dayjs(subscription.startDate).format("D MMMM YYYY"),
        endDate: subscription?.endDate
          ? dayjs(subscription?.endDate).format("D MMMM YYYY")
          : "-",
        owner: {
          id: owner._id,
          name: owner.name,
          phone: owner.phone,
          email: owner.email,
          photo: owner.avatarUrl,
        },
        package: packageOwner
          ? {
              type: packageOwner.type,
              name: packageOwner.name,
              description: packageOwner.description,
              maxKost: packageOwner.maxKost,
              maxRoom: packageOwner.maxRoom,
            }
          : null,
      };
    });
  }

  getSubscriptionInvoices = async (ownerId: string) => {
    const invoices = await invoiceRepository.findAll(
      {
        user: ownerId,
        type: "owner",
      },
      {
        sort: { createdAt: -1 },
      },
      [
        {
          path: "subscription",
          populate: "package",
        },
      ]
    );

    const formatedData = invoices.map((inv: any) => ({
      id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      packageName: inv.subscription?.package?.name ?? "-",
      packageDuration: inv.subscription?.duration
        ? `${inv.metadata?.extendDuration || inv.subscription?.duration} Bulan`
        : "-",
      totalPrice: inv.amount,
      status: inv.status, // unpaid | paid | expired
      createdAt: dayjs(inv.createdAt).format("D MMMM YYYY"),
    }));

    return formatedData;
  };

  async cancelSubscriptionInvoice({
    invoiceId,
    ownerId,
  }: {
    invoiceId: string;
    ownerId: string;
  }) {
    const invoice = await invoiceRepository.findOne({
      _id: invoiceId,
      user: ownerId,
      type: "owner",
      status: "unpaid",
    });

    if (!invoice)
      throw new ResponseError(
        404,
        "Invoice tidak ditemukan atau sudah dibayar"
      );

    if (invoice.subscription) {
      await subscriptionRepository.updateById(invoice.subscription, {
        status: "expired",
      });
    }
    // Update status invoice
    invoice.status = "cancelled";
    await invoice.save();

    // Batalkan subscription terkait

    const payment = await paymentRepository.findOne({ invoice: invoice._id });
    if (payment) {
      await midtrans.transaction.cancel(payment.externalId);
      payment.status = PaymentStatus.CANCELLED;
      await payment.save();
    }

    return invoice;
  }

  // Dipanggil dari callback payment → aktifkan subscription
  async activateSubscription({
    subscriptionId,
    duration,
  }: {
    subscriptionId: string;
    duration: number;
  }) {
    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ResponseError(404, "Subscription not found");

    const pkg = await packageRepository.findById(subscription.package);
    if (!pkg) throw new ResponseError(404, "Package not found");

    const now = dayjs();

    // cek durasi yang dipilih waktu create subscription
    const selectedDuration = pkg.durations.find(
      (d: any) => d.duration === subscription.duration
    );
    if (!selectedDuration) {
      throw new ResponseError(400, "Invalid duration for this package");
    }

    // Cek apakah owner masih punya subscription aktif lain
    const activeSub = await subscriptionRepository.findOne({
      owner: subscription.owner,
      status: "active",
      $or: [
        { endDate: { $gte: now.toDate() } },
        { endDate: null }, // free unlimited
      ],
    });

    if (!activeSub) {
      // --- Case 1: Aktivasi baru ---
      subscription.startDate = now.toDate();
      subscription.endDate = now.add(subscription.duration, "month").toDate();
      subscription.status = "active";
      await subscription.save();
      return subscription;
    }

    // false terus padahal seharusnya true
    if (
      (activeSub._id as Types.ObjectId).toString() ===
      (subscription._id as Types.ObjectId).toString()
    ) {
      // --- Case 2: Perpanjangan (same subscription, extend endDate) ---
      const result = await subscriptionRepository.updateById(activeSub._id, {
        duration: activeSub.duration + duration,
        endDate: dayjs(activeSub.endDate).add(duration, "month").toDate(),
      });

      return result;
    }

    await subscriptionRepository.updateById(activeSub._id, {
      status: "expired",
    });

    await subscriptionRepository.updateById(subscription._id, {
      status: "active",
      startDate: now.toDate(),
      endDate: now.add(subscription.duration, "month").toDate(),
    });

    return subscription;
  }

  async fallbackToFree(ownerId: string) {
    // 1. Cari paket free
    const freePackage = await packageRepository.findOne({
      type: "free",
      isActive: true,
    });
    if (!freePackage) throw new ResponseError(404, "Free package not found");

    // 2. Tutup semua subscription aktif
    await subscriptionRepository.update(
      { owner: ownerId, status: "active" },
      { $set: { status: "expired" } }
    );

    // 3. Buat subscription baru free
    const newSub = await subscriptionRepository.create({
      owner: ownerId,
      package: freePackage._id,
      status: "active",
      startDate: new Date(),
      endDate: null,
    });

    return newSub;
  }
  async renewSubscription(
    ownerId: string,
    subscriptionId: string,
    duration: number
  ) {
    const subscription = (await subscriptionRepository.findById(
      subscriptionId,
      [{ path: "package" }]
    )) as any;
    if (!subscription) throw new ResponseError(404, "Package not found");

    if (subscription.status !== "active")
      throw new ResponseError(400, "Subscription is not active");

    const pendingInvoice = await invoiceRepository.findOne({
      subscription: subscriptionId,
      status: "unpaid",
    });
    if (pendingInvoice)
      throw new ResponseError(400, "You have a pending invoice");

    // cari durasi yang dipilih dari package
    const selectedDuration = subscription.package.durations.find(
      (d: any) => d.duration === duration
    );
    if (!selectedDuration) {
      throw new ResponseError(400, "Invalid duration for this package");
    }

    // Buat invoice untuk bayar paket
    const invoice = await invoiceRepository.create({
      invoiceNumber: "INV-" + Date.now(), // generator lebih bagus
      user: ownerId,
      type: "owner",
      subscription: subscription._id as Types.ObjectId,
      amount: selectedDuration.price,

      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari
      status: "unpaid",
      description: `Langganan paket ${subscription.package.name} (${duration} bulan)`,
      metadata: {
        extendDuration: duration,
        oldEndDate: subscription.endDate,
      },
    });

    // Schedule job cancel invoice 24 jam kemudian
    await agenda.schedule("in 24 hours", "cancel-unpaid-invoice", {
      invoiceId: invoice._id.toString(),
    });

    console.log(`📅 Cancel job scheduled for invoice ${invoice._id}`);

    return invoice;
  }
}

export const subscriptionService = new SubscriptionService();
