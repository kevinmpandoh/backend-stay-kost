import Agenda from "agenda";
import { env } from "../config/env"; // pastikan ada MONGO_URI di config kamu

export const agenda = new Agenda({
  db: {
    address: env.MONGO_URI,
    collection: "agendaJobs",
  },
  processEvery: "30 seconds", // cek job tiap 30 detik
  maxConcurrency: 20, // maksimal job paralel
});

export async function initAgenda() {
  await agenda.start();
  console.log("✅ Agenda started");
}
