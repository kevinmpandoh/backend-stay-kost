import { agenda } from "@/config/agenda";
import { subscriptionRepository } from "@/modules/subscription/subscription.repository";
import { subscriptionService } from "@/modules/subscription/subscription.service";
import dayjs from "dayjs";
import { notificationService } from "@/modules/notification/notification.service";

// Job untuk cek expired subscription
agenda.define("check-subscription-expired", async () => {
  console.log("⏰ [AGENDA] Running job: check-subscription-expired");
  const expiredSubs = await subscriptionRepository.findAll({
    status: "active",
    endDate: { $lt: new Date() },
  });

  for (const sub of expiredSubs) {
    await subscriptionService.fallbackToFree(sub.owner.toString());
    console.log(`🔄 Owner ${sub.owner} fallback ke paket Free`);
  }
});

// Job untuk reminder H-3 expired
agenda.define("reminder-subscription-expired", async () => {
  console.log("⏰ [AGENDA] Running job: reminder-subscription-expired");
  const targetDate = dayjs().add(3, "day").endOf("day").toDate();

  // Cari subscription yang akan expired 3 hari lagi
  const expiringSubs = await subscriptionRepository.findAll({
    status: "active",
    endDate: {
      $gte: dayjs(targetDate).startOf("day").toDate(),
      $lte: targetDate,
    },
  });

  for (const sub of expiringSubs) {
    // Kirim notifikasi (email, push notif, dsb)
    await notificationService.sendNotification(
      sub.owner.toString(),
      "owner",
      "subscription",
      `Langganan paket Anda akan berakhir pada ${dayjs(sub.endDate).format(
        "DD MMM YYYY"
      )}. Segera perpanjang agar tetap aktif.`,
      "Langganan akan segera berakhir"
    );

    console.log(`📢 Reminder dikirim ke Owner ${sub.owner}`);
  }
});
