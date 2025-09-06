import { Facility } from "@/modules/facility/facility.model";
import { RoomType } from "@/modules/room-type/room-type.model";

export const seedKostTypeFacilities = async () => {
  const kostTypes = await RoomType.find();
  const facilities = await Facility.find({ category: "room" }); // ✅ Hanya fasilitas kamar

  if (kostTypes.length === 0 || facilities.length === 0) {
    console.error("❌ Seeder gagal: Tidak ada Kost Type atau fasilitas kamar.");
    return;
  }

  const kostTypeFacilitiesToInsert = [] as any;

  for (const kostType of kostTypes) {
    const selectedFacilities = facilities
      .sort(() => 0.4 - Math.random())
      .slice(0, 3);
    selectedFacilities.forEach((facility) => {
      // ✅ Update array `fasilitas` di model KostType
      RoomType.findByIdAndUpdate(kostType._id, {
        $push: { facilities: facility._id },
      }).exec();
    });
  }

  console.log("✅ Fasilitas Tipe Kost berhasil di-seed!");
};
