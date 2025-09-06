import { Booking } from "@/modules/booking/booking.model";
import { BookingStatus } from "@/modules/booking/booking.types";
import { RoomType } from "@/modules/room-type/room-type.model";
import { Room } from "@/modules/room/room.model";
import { User } from "@/modules/user/user.model";

export const seedFinishedBookingsPerKostType = async () => {
  await Booking.deleteMany();

  const kostTypes = await RoomType.find();
  const tenants = await User.find({ role: "tenant" });
  const owners = await User.find({ role: "owner" });

  if (kostTypes.length === 0 || tenants.length === 0 || owners.length === 0) {
    console.error("❌ Tidak cukup data untuk membuat booking.");
    return;
  }

  for (const kostType of kostTypes) {
    const rooms = await Room.find({ roomType: kostType._id });
    if (rooms.length === 0) {
      console.warn(`⚠️ Tidak ada room untuk kostType ${kostType._id}`);
      continue;
    }

    const jumlahBooking = Math.floor(Math.random() * 6) + 1; // 1–6

    for (let i = 0; i < jumlahBooking; i++) {
      const penyewa = tenants[Math.floor(Math.random() * tenants.length)];
      const pemilik = owners[Math.floor(Math.random() * owners.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];

      const durasi = Math.floor(Math.random() * 6) + 1; // 1–6 bulan
      const offsetBulan = i + 1;
      const tanggalSelesai = new Date();
      tanggalSelesai.setMonth(tanggalSelesai.getMonth() - offsetBulan);
      const tanggalMasuk = new Date(tanggalSelesai);
      tanggalMasuk.setMonth(tanggalMasuk.getMonth() - durasi);

      await Booking.create({
        room: room._id,
        tenant: penyewa._id,
        owner: pemilik._id,
        kost: kostType.kost,
        roomType: kostType._id,
        status: BookingStatus.COMPLETED,
        startDate: tanggalMasuk,
        endDate: tanggalSelesai,
        duration: durasi,
        totalPrice: durasi * kostType.price,
        reviewed: true,
      });
    }
  }

  console.log("✅ Seeder booking selesai (1–6 per kost type) berhasil!");
};
