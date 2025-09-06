import cron from "node-cron";
import logger from "../config/logger";
export function startScheduler() {
  // run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      logger.info("Scheduler tick: check expirations");
      // TODO: check PaymentTransaction.expiredAt -> set status expired
      // TODO: check Booking.confirmDeadline -> cancel
      // TODO: check Subscription.endDate -> expire subscription and deactivate costs
    } catch (err) {
      logger.error("Scheduler error", err);
    }
  });
}
