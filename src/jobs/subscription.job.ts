import { agenda } from "@/config/agenda";
import { Subscription } from "../modules/subscription/subscription.model";

// Job untuk cek expired subscription
agenda.define("check-subscription-expired", async () => {
  console.log("⏰ [AGENDA] Running job: check-subscription-expired");
  const now = new Date();

  const result = await Subscription.updateMany(
    { endDate: { $lte: now }, status: "active" },
    { $set: { status: "expired" } }
  );

  console.log(`✅ Expired subscriptions updated: ${result.modifiedCount}`);
});

// Job untuk reminder H-3 expired
agenda.define("reminder-subscription-expired", async () => {
  console.log("⏰ [AGENDA] Running job: reminder-subscription-expired");

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const subscriptions = await Subscription.find({
    endDate: { $lte: threeDaysLater, $gte: now },
    status: "active",
  }).populate("owner package");

  subscriptions.forEach((sub: any) => {
    console.log(
      `🔔 Reminder: Subscription ${sub._id} (${sub.package.name}) milik ${sub.owner} akan expired pada ${sub.endDate}`
    );
    // TODO: kirim email / push notif di sini
  });
});
