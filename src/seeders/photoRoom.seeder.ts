import {
  PhotoRoom,
  PhotoRoomCategory,
} from "@/modules/photo-room/photo-room.model";
import { photoRoomData } from "./data/photoRoom";
import { RoomType } from "@/modules/room-type/room-type.model";

export const seedPhotoRooms = async () => {
  await PhotoRoom.deleteMany();

  const kostTypes = (await RoomType.find().populate("kost", "owner")) as any;
  if (kostTypes.length === 0) {
    console.error("❌ Seeder gagal: Tidak ada tipe kost.");
    return;
  }

  const getRandomUrl = (kategori: keyof typeof photoRoomData) => {
    const list = photoRoomData[kategori];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };

  for (const kostType of kostTypes) {
    const photoIds = [];

    // Wajib: Dalam Kamar
    const dalamKamarUrl = getRandomUrl(PhotoRoomCategory.INSIDE_ROOM);
    const dalamKamarPhoto = await PhotoRoom.create({
      roomType: kostType._id,
      owner: kostType.kost.owner,
      category: PhotoRoomCategory.INSIDE_ROOM,
      url: dalamKamarUrl,
      publicId: dalamKamarUrl.split("/").pop()?.split(".")[0] || "",
    });
    photoIds.push(dalamKamarPhoto._id);

    // Opsional: Depan Kamar
    if (
      photoRoomData[PhotoRoomCategory.INSIDE_ROOM] &&
      photoRoomData[PhotoRoomCategory.INSIDE_ROOM].length > 0
    ) {
      const depanKamarUrl = getRandomUrl(PhotoRoomCategory.INSIDE_ROOM);
      const depanKamarPhoto = await PhotoRoom.create({
        roomType: kostType._id,
        owner: kostType.kost.owner,
        category: PhotoRoomCategory.INSIDE_ROOM,
        url: depanKamarUrl,
        publicId: depanKamarUrl.split("/").pop()?.split(".")[0] || "",
      });
      photoIds.push(depanKamarPhoto._id);
    }

    // Opsional: Kamar Mandi
    if (
      photoRoomData[PhotoRoomCategory.BATH_ROOM] &&
      photoRoomData[PhotoRoomCategory.BATH_ROOM].length > 0
    ) {
      const kamarMandiUrl = getRandomUrl(PhotoRoomCategory.BATH_ROOM);
      const urlParts = kamarMandiUrl.split("/");
      const fileName = urlParts.pop()!; // "abc123xyz.jpg"
      const folder = urlParts.slice(urlParts.indexOf("upload") + 1).join("/");
      const kamarMandiPhoto = await PhotoRoom.create({
        roomType: kostType._id,
        owner: kostType.kost.owner,
        category: PhotoRoomCategory.BATH_ROOM,
        url: kamarMandiUrl,
        publicId: `${folder}/${fileName.split(".")[0]}`,
      });
      photoIds.push(kamarMandiPhoto._id);
    }

    await RoomType.findByIdAndUpdate(kostType._id, {
      $push: { photos: { $each: photoIds } },
    });
  }

  console.log("✅ Foto Tipe Kost berhasil di-seed dan diperbarui di KostType!");
};
