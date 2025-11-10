import { Kost } from "@/modules/kost/kost.model";
import kostData from "./data/kostData";
import { User } from "@/modules/user/user.model";
import { Facility } from "@/modules/facility/facility.model";
import { Rule } from "@/modules/rule/rule.model";
import { KostStatus } from "@/modules/kost/kost.type";
import { RoomTypeStatus } from "@/modules/room-type/room-type.type";
import { RoomType } from "@/modules/room-type/room-type.model";
import { Room } from "@/modules/room/room.model";
import { RoomStatus } from "@/modules/room/room.type";
import { PhotoKost } from "@/modules/photo-kost/photo-kost.model";
import { PhotoRoom } from "@/modules/photo-room/photo-room.model";
import { Wishlist } from "@/modules/wishlist/wishlist.model";

export const seedKosts = async () => {
  await Kost.deleteMany();
  await RoomType.deleteMany();
  await Room.deleteMany();
  await PhotoKost.deleteMany();
  await PhotoRoom.deleteMany();

  await Wishlist.deleteMany();

  const owners = await User.find({
    role: "owner",
  }); // Ambil semua owner yang ada
  const facilities = await Facility.find({ category: "kost" });
  const roomFacilities = await Facility.find({ category: "room" });
  const rules = await Rule.find();

  if (owners.length === 0 || facilities.length === 0 || rules.length === 0) {
    console.error(
      "❌ Seeder gagal: Pastikan owner, fasilitas, dan peraturan sudah ada."
    );
    return;
  }

  for (const kost of kostData) {
    const randomOwner = owners[Math.floor(Math.random() * owners.length)];
    // const address = await Address.create(kost.alamat);

    const address = kost.address;

    const newKost = await Kost.create({
      name: kost.name,
      description: kost.description,
      type: kost.type,
      // Ubah format koordinat ke GeoJSON
      address: {
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        coordinates: {
          type: "Point",
          coordinates: [address.coordinates.lng, address.coordinates.lat], // GeoJSON: lng, lat
        },
      },
      owner: randomOwner._id,
      facilities: facilities
        .filter((f) => kost.facilities.includes(f.name))
        .map((f) => f._id),
      rules: rules.filter((r) => kost.rules.includes(r.name)).map((r) => r._id),
      status: kost.status || KostStatus.DRAFT,
      isPublished: kost.isPublished || false,
    });

    // === Foto Kost ===
    const kostPhotoIds = [];
    if (kost.photos && kost.photos.length > 0) {
      for (const photo of kost.photos) {
        const p = await PhotoKost.create({
          kost: newKost._id,
          owner: randomOwner._id,
          category: photo.category,
          url: photo.url,
          publicId: photo.url.split("/").pop()?.split(".")[0] || "",
        });
        kostPhotoIds.push(p._id);
      }
      await Kost.findByIdAndUpdate(newKost._id, { photos: kostPhotoIds });
    }

    if (kost.roomTypes && kost.roomTypes.length > 0) {
      for (const rt of kost.roomTypes) {
        const matchedFacilities = roomFacilities
          .filter((f) => rt.facilities.includes(f.name))
          .map((f) => f._id);

        const newRoomType = await RoomType.create({
          kost: newKost._id,
          name: rt.name,
          size: rt.size,
          price: rt.price,
          facilities: matchedFacilities,
          status: RoomTypeStatus.ACTIVE,
        });

        // === Foto Kamar ===
        const roomPhotoIds = [];
        if (rt.roomPhotos && rt.roomPhotos.length > 0) {
          for (const photo of rt.roomPhotos) {
            const pr = await PhotoRoom.create({
              roomType: newRoomType._id,
              owner: randomOwner._id,
              category: photo.category,
              url: photo.url,
              publicId: photo.url.split("/").pop()?.split(".")[0] || "",
            });
            roomPhotoIds.push(pr._id);
          }
          await RoomType.findByIdAndUpdate(newRoomType._id, {
            photos: roomPhotoIds,
          });
        }

        const total = rt.totalRooms || 0;
        const occupied = rt.occupiedRooms || 0;
        const available = total - occupied;

        const roomIds = [];

        for (let i = 1; i <= total; i++) {
          const status =
            i <= occupied ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE;
          const newRoom = await Room.create({
            roomType: newRoomType._id,
            number: `${i}`,
            floor: i <= 5 ? 1 : 2, // contoh logika sederhana
            status,
          });
          roomIds.push(newRoom._id);
        }

        // Update RoomType → tambahkan referensi rooms
        await RoomType.findByIdAndUpdate(newRoomType._id, {
          $set: { rooms: roomIds },
        });

        // Update kost untuk menambahkan referensi ke roomType
        await Kost.findByIdAndUpdate(newKost._id, {
          $push: { roomTypes: newRoomType._id },
        });

        console.log(
          `🏠 ${rt.name} (${kost.name}): ${total} kamar (${occupied} booked, ${available} available)`
        );
      }
    }
  }

  console.log("✅ Kost, Alamat, Fasilitas & Peraturan Seeded");
};
