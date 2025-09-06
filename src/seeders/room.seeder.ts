import { RoomType } from "@/modules/room-type/room-type.model";
import { Room } from "@/modules/room/room.model";
import { RoomStatus } from "@/modules/room/room.type";

export const seedRooms = async () => {
  await Room.deleteMany();

  const kostTypes = await RoomType.find();
  if (kostTypes.length === 0) {
    console.error("❌ Seeder gagal: Tidak ada Kost Type.");
    return;
  }

  const roomsToInsert = [] as any;

  for (const kostType of kostTypes) {
    const numRooms = Math.floor(Math.random() * 5) + 1;
    const roomIds = [];

    for (let i = 1; i <= numRooms; i++) {
      const room = await Room.create({
        roomType: kostType._id,
        number: `${kostType.name}-00${i}`,
        floor: Math.floor(Math.random() * 3) + 1,
        status:
          Math.random() > 0.2 ? RoomStatus.AVAILABLE : RoomStatus.OCCUPIED,
      });

      roomIds.push(room._id);
    }

    // ✅ Update array `rooms` di model KostType
    await RoomType.findByIdAndUpdate(kostType._id, {
      $push: { rooms: { $each: roomIds } },
    });
  }

  await Room.insertMany(roomsToInsert);
  console.log("✅ Rooms berhasil di-seed!");
};
