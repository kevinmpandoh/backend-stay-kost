import { bookingRepository } from "../booking/booking.repository";
import { BookingStatus, StopRequestStatus } from "../booking/booking.types";
import { Kost } from "../kost/kost.model";
import mongoose from "mongoose";
import { RoomStatus } from "../room/room.type";
import { Invoice } from "../invoice/invoice.model";
import { userRepository } from "../user/user.repository";
import { kostRepository } from "../kost/kost.repository";
import { payoutRepository } from "../payout/payout.repository";
import { Payout } from "../payout/payout.model";

export const DashboardService = {
  async getOwnerDashboard(ownerId: string) {
    const totalRequests = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.PENDING,
    });

    const totalUnpaidInvoices = await Invoice.aggregate([
      {
        $match: {
          status: "unpaid",
          dueDate: { $lt: new Date() },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.owner": new mongoose.Types.ObjectId(ownerId),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalInvoices: { $sum: 1 },
        },
      },
    ]);

    const activeTenants = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.ACTIVE,
    });

    const totalRooms = await Kost.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $lookup: {
          from: "roomTypes",
          localField: "_id",
          foreignField: "kost",
          as: "roomTypes",
        },
      },
      { $unwind: "$roomTypes" },
      {
        $lookup: {
          from: "rooms",
          localField: "roomTypes._id",
          foreignField: "roomTypes",
          as: "rooms",
        },
      },
      { $unwind: "$rooms" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$rooms.status", RoomStatus.AVAILABLE] }, 1, 0],
            },
          },
          occupied: {
            $sum: {
              $cond: [{ $eq: ["$rooms.status", RoomStatus.OCCUPIED] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalRevenue = await Invoice.aggregate([
      { $match: { type: "tenant", status: "paid" } },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      { $match: { "booking.owner": ownerId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const monthlyRevenue = await Invoice.aggregate([
      // {
      //   $match: {
      //     // user: new mongoose.Types.ObjectId(ownerId),
      //     status: "paid",
      //     dueDate: { $gte: oneYearAgo },
      //   },
      // },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.owner": new mongoose.Types.ObjectId(ownerId),
          status: "paid",
          dueDate: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            tahun: { $year: "$dueDate" },
            bulan: { $month: "$dueDate" },
          },
          total: { $sum: "$amount" }, // total keuntungan admin
        },
      },
      { $sort: { "_id.tahun": 1, "_id.bulan": 1 } },

      // {
      //   $group: {
      //     _id: { $month: "$dueDate" },
      //     total: { $sum: "$amount" },
      //   },
      // },
      // { $sort: { _id: 1 } },
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0
    );

    const unpaidInvoices = await Invoice.aggregate([
      {
        $match: {
          status: "unpaid",
          dueDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.owner": new mongoose.Types.ObjectId(ownerId),
        },
      },
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
          localField: "booking.room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "roomtypes",
          localField: "booking.roomType",
          foreignField: "_id",
          as: "roomType",
        },
      },
      { $unwind: "$roomType" },
      {
        $project: {
          _id: 1,
          tenant: "$tenant.name",
          room: "$room.number",
          roomType: "$roomType.name",
          amount: "$amount",
          dueDate: "$dueDate",
          invoiceNumber: 1,
        },
      },
      { $sort: { dueDate: -1 } },
      { $limit: 5 },
    ]);

    const rentRequests = await bookingRepository.count({
      owner: ownerId,
      status: BookingStatus.PENDING,
      stopRequest: { $exists: false },
    });

    const stopRequests = await bookingRepository.count({
      owner: ownerId,
      "stopRequest.status": StopRequestStatus.PENDING,
    });

    return {
      totalRequests,
      totalUnpaid: totalUnpaidInvoices[0] || {
        totalAmount: 0,
        totalInvoices: 0,
      },
      activeTenants,
      rentRequests,
      stopRequests,
      rooms: {
        total: totalRooms.length > 0 ? totalRooms[0].total : 0,
        available: totalRooms.length > 0 ? totalRooms[0].available : 0,
        occupied: totalRooms.length > 0 ? totalRooms[0].occupied : 0,
      },
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
      unpaidInvoices,
    };
  },

  async getAdminDashboard() {
    // Total pengajuan kost (belum disetujui)
    const totalPengajuanKost = await Kost.countDocuments({
      status: "pending", // atau field lain sesuai schema kamu
    });

    // Total penyewa
    const totalPenyewa = await userRepository.count({ role: "tenant" });

    // Total pemilik kost
    const totalPemilikKost = await userRepository.count({ role: "owner" });

    // Total kost aktif
    const totalKostAktif = await kostRepository.count({ isPublished: true });

    // Total keuntungan admin
    const totalKeuntunganAdmin = await Invoice.aggregate([
      { $match: { type: "owner", status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }, // pastikan invoice punya field admin_fee
        },
      },
    ]);

    // Payout pending
    const payoutPending = await payoutRepository.count({ status: "pending" });

    // Pendapatan per bulan (1 tahun terakhir)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const pendapatanPerBulan = await Invoice.aggregate([
      {
        $match: {
          type: "owner",
          status: "paid",
          dueDate: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            tahun: { $year: "$dueDate" },
            bulan: { $month: "$dueDate" },
          },
          total: { $sum: "$amount" }, // total keuntungan admin
        },
      },
      { $sort: { "_id.tahun": 1, "_id.bulan": 1 } },
    ]);

    const payoutHistory = await Payout.find()
      .populate("owner", "name email") // kalau mau tampilkan data pemilik
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      totalKostRequest: totalPengajuanKost,
      totalTenants: totalPenyewa,
      totalOwners: totalPemilikKost,
      totalKostActive: totalKostAktif,
      monthlyIncome: totalKeuntunganAdmin[0]?.total || 0,
      payout_pending: payoutPending,
      pendapatan_per_bulan: pendapatanPerBulan,
      payoutHistory,
    };
  },
};
