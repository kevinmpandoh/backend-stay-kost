import { RoomType } from "@/modules/room-type/room-type.model";
import roomTypeData from "./data/roomTypeData";
import { Kost } from "@/modules/kost/kost.model";

export const seedRoomTypes = async () => {
  await RoomType.deleteMany();

  const kosts = await Kost.find();
  if (kosts.length === 0) {
    console.error("❌ Seeder gagal: Tidak ada kost.");
    return;
  }

  const insertedKostTypes = [];

  for (const kost of kosts) {
    // Minimal 1, maksimal 3 atau 4 tipe
    const jumlahTipe = Math.floor(Math.random() * 2) + 1; // Hasil: 1 - 3
    const tipeCount = Math.random() < 0.5 ? jumlahTipe : jumlahTipe + 1; // 50% chance jadi 2 - 4

    const tipeUntukKost = [];

    for (let i = 0; i < tipeCount; i++) {
      const randomData =
        roomTypeData[Math.floor(Math.random() * roomTypeData.length)];
      const newKostType = new RoomType({
        ...randomData,
        kost: kost._id,
      });
      await newKostType.save();
      tipeUntukKost.push(newKostType._id);
      insertedKostTypes.push(newKostType);
    }

    // Simpan referensi ke model Kost
    await Kost.findByIdAndUpdate(kost._id, {
      $set: { roomTypes: tipeUntukKost },
    });
  }

  console.log(
    `✅ ${insertedKostTypes.length} Kost Type berhasil di-seed untuk ${kosts.length} kost!`
  );
};
