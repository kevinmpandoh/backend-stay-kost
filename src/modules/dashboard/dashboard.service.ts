import { bookingRepository } from "../booking/booking.repository";
import { BookingStatus, StopRequestStatus } from "../booking/booking.types";
import { Kost } from "../kost/kost.model";
import mongoose from "mongoose";
import { RoomStatus } from "../room/room.type";
import { Invoice } from "../invoice/invoice.model";

export const DashboardService = {
  async getOwnerDashboard(ownerId: string) {
    const totalRequest = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.PENDING,
    });
    // Hitung jumlah penyewa yang belum membayar
    const totalUnpaid = await Invoice.countDocuments({
      type: "tenant",
      status: "unpaid",
    }).populate({
      path: "booking",
      match: { owner: ownerId }, // filter hanya booking milik owner ini
    });

    // Hitung total penyewa yang aktif
    const activeTenants = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.ACTIVE,
    });

    const totalRooms = await Kost.aggregate([
      { $match: { pemilik: new mongoose.Types.ObjectId(ownerId) } }, // Cari kost berdasarkan pemilik
      {
        $lookup: {
          from: "roomTypes", // Gabungkan dengan koleksi KostType
          localField: "_id",
          foreignField: "kost",
          as: "roomTypes",
        },
      },
      { $unwind: "$roomTypes" }, // Pisahkan array KostType menjadi dokumen individual
      {
        $lookup: {
          from: "rooms", // Gabungkan dengan koleksi Room
          localField: "roomTypes._id",
          foreignField: "roomTypes",
          as: "rooms",
        },
      },
      { $unwind: "$rooms" }, // Pisahkan array rooms menjadi dokumen individual
      {
        $group: {
          _id: null,
          total_kamar: { $sum: 1 }, // Hitung semua kamar
          kamar_tersedia: {
            $sum: {
              $cond: [{ $eq: ["$rooms.status", RoomStatus.AVAILABLE] }, 1, 0],
            },
          }, // Hitung kamar yang tersedia
          kamar_terisi: {
            $sum: {
              $cond: [{ $eq: ["$rooms.status", RoomStatus.OCCUPIED] }, 1, 0],
            },
          }, // Hitung kamar yang terisi
        },
      },
    ]);

    // Hitung total keuntungan dari pembayaran sukses
    const totalKeuntungan = await Invoice.aggregate([
      { $match: { type: "tenant", status: "paid" } },
      {
        $lookup: {
          from: "bookings", // Gabungkan dengan koleksi Room
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      { $match: { "booking.owner": ownerId } }, // hanya invoice utk booking owner ini
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const pendapatanPerBulan = await Invoice.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(ownerId),
          status: "paid",
          due_date: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: { $month: "$dueDate" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const awalBulan = new Date();
    awalBulan.setDate(1);
    const akhirBulan = new Date(
      awalBulan.getFullYear(),
      awalBulan.getMonth() + 1,
      0
    );

    const tagihanBelumDibayar = await Invoice.aggregate([
      {
        $match: {
          //   user: new mongoose.Types.ObjectId(ownerId),
          status: "unpaid",
          due_date: { $gte: awalBulan, $lte: akhirBulan },
        },
      },
      {
        $lookup: {
          from: "bookings", // Gabungkan dengan koleksi Room
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "users",
          localField: "booking.tenant",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: "$tenant" },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "roomType",
          localField: "roomType",
          foreignField: "_id",
          as: "roomType",
        },
      },
      { $unwind: "$roomType" },
      {
        $project: {
          _id: 1,
          penyewa: "$tenant.name",
          kamar: "$room.nomor",
          tipe_kost: "$roomType.name",
          jumlah_tagihan: "$amount",
          jatuh_tempo: "$due_date",
          invoice: 1,
        },
      },
      { $sort: { jatuh_tempo: -1 } }, // Urutkan berdasarkan tanggal jatuh tempo
      { $limit: 5 },
    ]);

    const jumlahPengajuanSewa = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.PENDING,
      stopRequest: { $exists: false }, // Bukan pengajuan berhenti
    });

    const jumlahPengajuanBerhenti = await bookingRepository.count({
      owner: ownerId,
      "stopRequest.status": StopRequestStatus.PENDING,
    });

    return {
      totalRequest,
      totalUnpaid,
      activeTenants,
      jumlah_pengajuan_sewa: jumlahPengajuanSewa,
      jumlah_pengajuan_berhenti: jumlahPengajuanBerhenti,
      room: {
        total_kamar: totalRooms.length > 0 ? totalRooms[0].total_kamar : 0,
        kamar_tersedia:
          totalRooms.length > 0 ? totalRooms[0].kamar_tersedia : 0,
        kamar_terisi: totalRooms.length > 0 ? totalRooms[0].kamar_terisi : 0,
      },
      total_keuntungan: totalKeuntungan[0]?.total || 0,
      pendapatanPerBulan,
      tagihanBelumDibayar,
    };
  },
  async getAdminDashboard() {},
};
