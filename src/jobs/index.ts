// File: backend/src/jobs/index.ts
import { agenda, initAgenda } from "@/config/agenda";
import "./subscription.job"; // import definisi job
import "./booking.job";

export async function startJobs() {
  await initAgenda();

  // schedule job harian
  await agenda.every("0 0 * * *", "check-subscription-expired"); // tiap jam 00:00
  await agenda.every("0 9 * * *", "reminder-subscription-expired"); // tiap jam 09:00 pagi
  await agenda.every("0 * * * *", "mark-overdue-booking-invoices");
  await agenda.every("0 0 * * *", "check-subscription-expired"); // tiap jam 00:00

  console.log("📅 Agenda jobs scheduled");
}
