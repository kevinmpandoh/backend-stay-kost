import { Facility } from "@/modules/facility/facility.model";
import facilitiesData from "./data/facilityData";

export const seedFacilities = async () => {
  await Facility.deleteMany(); // Hapus semua data sebelumnya

  const facilities = await Facility.insertMany(facilitiesData);

  console.log(
    "✅ Fasilitas Seeded:",
    facilities.length,
    "fasilitas berhasil ditambahkan."
  );
  return facilities;
};
