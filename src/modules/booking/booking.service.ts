import { roomRepository } from "../room/room.repository";
import { notificationService } from "../notification/notification.service";

import dayjs from "dayjs";
import "dayjs/locale/id"; // opsional: jika mau Bahasa Indonesia
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(isSameOrAfter);
import { reviewRepository } from "../review/review.repository";
import {
  BookingStatus,
  CreateBookingPayload,
  StopRequestStatus,
} from "./booking.types";

import { FilterQuery, PopulateOptions } from "mongoose";
import { ResponseError } from "@/utils/response-error.utils";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { RoomStatus } from "../room/room.type";
import { bookingRepository } from "./booking.repository";
import payoutService from "../payout/payout.service";
import { userRepository } from "../user/user.repository";
import { IBooking } from "./booking.model";
import { generateInvoiceCode } from "@/utils/generateInvoiceCode";
import { invoiceRepository } from "../invoice/invoice.repository";
import { agenda } from "@/config/agenda";
import { NotificationType } from "../notification/notification.type";
dayjs.locale("id");

export const BookingService = {
  async create(payload: CreateBookingPayload, tenantId: string) {
    const roomType = (await roomTypeRepository.findById(payload.roomType, [
      {
        path: "kost",
      },
      {
        path: "rooms",
      },
    ])) as any;

    if (!roomType) throw new ResponseError(404, "Kost type not found");
    if (!roomType.kost.isPublished)
      throw new ResponseError(400, "Kost is not active");

    const existing = await bookingRepository.findAll({
      tenant: tenantId,
    });

    const inProgressStatuses = [
      BookingStatus.PENDING,
      BookingStatus.WAITING_FOR_PAYMENT,
      BookingStatus.WAITING_FOR_CHECKIN,
      BookingStatus.APPROVED,
      BookingStatus.ACTIVE,
      BookingStatus.WAITING_FOR_CHECKOUT,
    ];

    // Cek apakah sudah pernah ajukan ke kost yang sama
    const duplicateBooking = existing.find(
      (b: IBooking) =>
        b.roomType.toString() === roomType._id.toString() &&
        inProgressStatuses.includes(b.status)
    );

    if (duplicateBooking) {
      throw new ResponseError(
        400,
        "You already have a booking in this kost that is still in process"
      );
    }

    const availableRooms = roomType.rooms?.filter(
      (room: any) => room.status === RoomStatus.AVAILABLE
    );

    // Cek apakah masih ada kamar tersedia

    if (availableRooms && availableRooms.length === 0)
      throw new ResponseError(400, "No available rooms");

    const endDate = dayjs(payload.startDate)
      .add(payload.duration, "month")
      .toDate();

    const totalPrice = roomType.price + 10000; // TODO: extract ke fungsi hitungHargaBooking

    const booking = await bookingRepository.create({
      ...payload,
      tenant: tenantId,
      kost: roomType.kost._id,
      owner: roomType.kost.owner,
      endDate,
      totalPrice,
      // confirmDueDate,
      confirmDueDate: dayjs().add(1, "minute").toDate(), // ⏳ TEST: 1 menit
    });

    await notificationService.sendNotification(
      roomType.kost.owner,
      "owner",
      NotificationType.BOOKING,
      `Ada penyewa baru yang mengajukan sewa untuk kost ${roomType.kost.name} - ${roomType.name}`,
      "Booking Request",
      { bookingId: booking._id }
    );

    // Schedule expire 3 hari kalau owner tidak konfirmasi
    await agenda.schedule("in 3 days", "expire-booking-confirm", {
      bookingId: booking._id.toString(),
    });

    return booking;
  },
  async approve(roomId: string, bookingId: string) {
    const booking = (await bookingRepository.findById(bookingId, [
      {
        path: "roomType",
        select: "name",
      },
      {
        path: "kost",
        select: "name",
      },
    ])) as any;

    if (!booking) throw new ResponseError(404, "Booking not found");
    if (booking.status !== BookingStatus.PENDING)
      throw new ResponseError(400, "Booking has already been processed");
    // if (booking.owner.toString() !== ownerId) throw new Error("Akses ditolak.");

    const room = (await roomRepository.findById(roomId, [
      {
        path: "roomType",
      },
    ])) as any;

    if (!room || room.status !== RoomStatus.AVAILABLE) {
      throw new ResponseError(400, "Kamar tidak tersedia atau sudah dipesan");
    }

    const duration = booking.duration || 1;

    const invoices = await Promise.all(
      Array.from({ length: duration }).map((_, i) => {
        const dueDate = dayjs(booking.startDate).add(i, "month").toDate();

        return invoiceRepository.create({
          booking: booking._id,
          user: booking.tenant,
          type: "tenant",

          amount: booking.totalPrice,
          dueDate,
          status: "unpaid",
          description: `Tagihan bulan ke-${i + 1}`,
          invoiceNumber: generateInvoiceCode(),
        });
      })
    );

    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.WAITING_FOR_PAYMENT,
      room: roomId,
      paymentDeadline: dayjs().add(1, "day").toDate(),
      confirmedAt: new Date(),
      confirmDueDate: null,
      firstInvoice: invoices[0]._id, // 🔥 penting
    });

    // // Update status kamar jadi "occupied"
    await roomRepository.updateById(roomId, {
      status: RoomStatus.OCCUPIED,
    });

    await agenda.schedule("in 1 day", "expire-booking-payment", {
      bookingId: bookingId,
    });

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Pengajuan sewa untuk kost ${booking.kost.name} - ${booking.roomType.name} disetujui oleh pemilik`,
      "Booking Approved",
      { bookingId: booking._id }
    );
  },
  async reject(bookingId: string, rejectionReason: string) {
    const booking = (await bookingRepository.findById(bookingId, [
      {
        path: "roomType",
        select: "name",
      },
      {
        path: "kost",
        select: "name",
      },
    ])) as any;

    if (!booking)
      throw new ResponseError(404, "Pengajuan sewa tidak ditemukan.");

    if (booking.status !== BookingStatus.PENDING)
      throw new ResponseError(400, "Pengajuan sewa sudah diproses.");

    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.REJECTED,
      rejectionReason,
      confirmDueDate: null,
    });

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Pengajuan sewa untuk kost ${booking.kost.name} - ${booking.roomType.name} ditolak oleh pemilik kost`,
      "Booking Approved",
      { bookingId: booking._id }
    );
  },

  async uploadDocument(req: any) {
    if (!req.file) throw new ResponseError(400, "File tidak ditemukan");

    // return url
    const url = (req.file as any).path;

    return url;
  },

  async checkIn(bookingId: string, tenantId: string) {
    // 1. Cari booking
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ResponseError(404, "Booking not found");

    if (booking.tenant.toString() !== tenantId)
      throw new ResponseError(403, "Unauthorized");

    if (booking.status !== BookingStatus.WAITING_FOR_CHECKIN)
      throw new ResponseError(400, "Booking cannot be checked in");

    // 2. Pastikan sudah waktunya check in
    const today = dayjs().tz("Asia/Jakarta").startOf("day"); // → 2025-06-25 00:00:00
    const startDate = dayjs(booking.startDate)
      .tz("Asia/Jakarta")
      .startOf("day");

    if (today.isBefore(startDate))
      throw new ResponseError(400, "Check-in date has not yet arrived");

    const invoice = await invoiceRepository.findOne({
      booking: bookingId,
      status: "paid",
    });

    if (!invoice) throw new ResponseError(400, "No paid invoice found");
    const owner = await userRepository.findById(booking.owner.toString());
    if (!owner) throw new ResponseError(404, "User not found");

    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.ACTIVE,
      checkInAt: new Date(),
    });

    await payoutService.createPayout(invoice, owner);

    return booking;
  },
  async checkOut(bookingId: string, tenantId: string) {
    const booking = (await bookingRepository.findById(bookingId)) as any;
    if (!booking) throw new ResponseError(404, "Booking not found");

    if (booking.tenant.toString() !== tenantId)
      throw new ResponseError(403, "Unauthorized");

    const stopRequestApproved =
      booking.stopRequest?.status === StopRequestStatus.APPROVED;
    const isAllowedStatus =
      booking.status === BookingStatus.WAITING_FOR_CHECKOUT;

    if (!stopRequestApproved && !isAllowedStatus) {
      throw new ResponseError(400, "Check-out not allowed");
    }

    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.COMPLETED,
      checkOutAt: new Date(),
    });
    await roomRepository.updateById(booking.room.toString(), {
      status: RoomStatus.AVAILABLE,
    });
  },
  async stopRentRequest(bookingId: string, payload: any) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ResponseError(404, "Booking tidak ditemukan");

    if (booking.status !== BookingStatus.ACTIVE) {
      throw new ResponseError(400, "Booking must be active to request stop");
    }

    await bookingRepository.updateById(booking._id, {
      stopRequest: {
        status: StopRequestStatus.PENDING,
        requestedStopDate: payload.stopDate,
        reason: payload.reason,
      },
    });

    await notificationService.sendNotification(
      booking.owner.toString(),
      "owner",
      "booking",
      `Penyewa sedang menajukan berhenti sewa. Silahkan konfirmasi`,
      "Berhenti Sewa",
      { bookingId: booking._id }
    );
  },

  async cancelBooking(bookingId: string, tenantId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) throw new ResponseError(404, "Booking not found");

    // pastikan tenant hanya bisa cancel booking miliknya
    if (booking.tenant.toString() !== tenantId) {
      throw new ResponseError(403, "Not authorized to cancel this booking");
    }

    // hanya bisa cancel kalau status waiting_payment atau active (belum check-in)
    if (booking.status !== BookingStatus.PENDING) {
      throw new ResponseError(403, "Booking tidak bisa dibatalkan");
    }

    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.CANCELLED,
    });
    await notificationService.sendNotification(
      booking.owner.toString(),
      "owner",
      "booking",
      `Penyewa membatalkan pengajuan sewanya`,
      "Batal Sewa",
      { bookingId: booking._id }
    );
  },

  async acceptStopRent(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ResponseError(404, "Booking not found");

    if (!booking.stopRequest) {
      throw new ResponseError(400, "No stop request found on booking");
    }
    await invoiceRepository.deleteMany({
      booking: booking._id,
      status: "unpaid",
    });
    booking.stopRequest.status = StopRequestStatus.APPROVED;

    const start = dayjs(booking.startDate);
    const end = dayjs(new Date());

    await bookingRepository.updateById(booking._id, {
      duration: Math.max(end.diff(start, "month"), 1),
      status: BookingStatus.WAITING_FOR_CHECKOUT,
      endDate: new Date(),
      stopRequest: {
        status: StopRequestStatus.APPROVED,
        requestedStopDate: booking.stopRequest?.requestedStopDate,
      },
    });

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Pemilik kost menyutujuai pengajuan berhenti sewa Anda`,
      "Pengajuan Berhenti Sewa",
      { bookingId: booking._id }
    );

    // Schedule auto check-out
    await agenda.schedule(booking.endDate, "auto-check-out", {
      bookingId: booking._id.toString(),
    });
  },

  async stopRentTenant(payload: any) {
    // const { bookingId } = validate(stopRentRequestSchema, payload);

    const booking = await bookingRepository.findById(payload.bookingId);
    if (!booking) throw new ResponseError(404, "Booking not found");

    if (booking.status !== BookingStatus.ACTIVE) {
      throw new ResponseError(400, "Booking must be active");
    }

    await invoiceRepository.deleteMany({
      booking: booking._id,
      status: "unpaid",
    });

    // Set status to waiting for checkout
    const now = new Date();

    const start = dayjs(booking.startDate);
    const end = dayjs(now);

    await bookingRepository.updateById(booking._id, {
      endDate: now,
      duration: Math.max(end.diff(start, "month"), 1),
      status: BookingStatus.WAITING_FOR_CHECKOUT,
      stopRequest: {
        status: StopRequestStatus.APPROVED,
        requestedStopDate: payload.stopDate,
        reason: payload.reason,
      },
    });

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Pemilik kost memberhentikan sewa anda`,
      "Pengajuan Berhenti Sewa",
      { bookingId: booking._id }
    );
  },
  async rejectStopRent(bookingId: string, rejectionReason: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ResponseError(404, "Booking not found");

    if (!booking.stopRequest) {
      throw new ResponseError(400, "No stop rent request exists");
    }
    await bookingRepository.updateById(booking._id, {
      stopRequest: {
        status: StopRequestStatus.REJECTED,
        rejectionReason,
      },
    });
    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Pemilik kost menolak pengajuan berhenti sewa Anda`,
      "Pengajuan Berhenti Sewa",
      { bookingId: booking._id }
    );
  },

  async getAllBookingsAdmin(options: any = {}) {
    const { page = 1, limit = 10, search = "" } = options;

    const skip = (page - 1) * limit;

    const query: FilterQuery<IBooking> = {};

    // Hitung total
    const total = await bookingRepository.count(query);

    const populate: PopulateOptions[] = [
      {
        path: "roomType",
        select: "name",
        populate: [
          {
            path: "kost",
            select: "name type address",
            populate: { path: "address" },
          },
          { path: "photos", select: "url" },
        ],
      },
      { path: "tenant", select: "name foto_profile" },
    ];

    // Ambil data review dengan populate dan pagination
    const bookings = await bookingRepository.findAll(
      query,
      {
        skip,
        limit,
      },
      populate
    );

    const totalPages = Math.ceil(total / limit);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: bookings,
    };
  },

  async getAllBookingsTenant(tenantId: any) {
    const bookings = await bookingRepository.findAll(
      {
        tenant: tenantId,
        status: {
          $ne: BookingStatus.COMPLETED,
        },
      },
      {},
      [
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name type address",
              populate: { path: "address" },
            },
            { path: "photos", select: "url" },
          ],
        },
        { path: "tenant", select: "name foto_profile" },
      ]
    );

    const formatted = await Promise.all(
      bookings.map(async (booking: any) => {
        const roomType = booking.roomType;
        const kost = roomType.kost;

        let invoiceUnpaid: string | null = null;
        if (booking.status === BookingStatus.WAITING_FOR_PAYMENT) {
          let invoice = await invoiceRepository.findOne({
            booking: booking._id,
          });
          invoiceUnpaid = invoice?.invoiceNumber || null;
        }
        return {
          id: booking._id,
          kostId: roomType._id,
          fotoKamar: roomType.photos?.[0].url || null,
          namaKost: `${kost?.name} ${roomType?.name}`,
          jenisKost: kost?.type,
          address: `${kost?.address?.city}, ${kost?.address?.district}`,
          tanggalMasuk: dayjs(booking.startDate).format("D MMMM YYYY"),
          tanggalDiajukan: dayjs(booking.createdAt).format("D MMMM YYYY"),
          paymentDeadline: booking.paymentDeadline
            ? dayjs(booking.paymentDeadline).format("D MMMM YYYY HH:mm")
            : null,
          durasi: booking.duration,
          status: booking.status,
          harga: booking.totalPrice,
          invoiceUnpaid, // tambahkan invoice di sini
          rejectReason: booking.rejectionReason || null,
        };
      })
    );

    return formatted;
  },

  async getAllBookingsOwner(ownerId: string, rawStatus: any) {
    // Mapping nama status dari frontend ke backend
    const statusMap: Record<string, BookingStatus> = {
      pending: BookingStatus.PENDING,
      menunggu_pembayaran: BookingStatus.WAITING_FOR_PAYMENT,
      menunggu_checkin: BookingStatus.WAITING_FOR_CHECKIN,
      berakhir: BookingStatus.COMPLETED,
      ditolak: BookingStatus.REJECTED,
      dibatalkan: BookingStatus.EXPIRED,
      kadaluarsa: BookingStatus.EXPIRED,
    };

    let statusFilter: any = {};

    if (statusMap[rawStatus]) {
      statusFilter = statusMap[rawStatus];
    } else {
      statusFilter = {
        $in: [
          BookingStatus.PENDING,
          BookingStatus.WAITING_FOR_PAYMENT,
          BookingStatus.WAITING_FOR_CHECKIN,
          BookingStatus.COMPLETED,
          BookingStatus.REJECTED,
          BookingStatus.EXPIRED,
        ],
      };
    }

    const bookings = await bookingRepository.findAll(
      {
        owner: ownerId,
        status: statusFilter,
      },
      {},
      [
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name type",
              populate: { path: "address", select: "city district" },
            },
            { path: "photos", select: "url" },
          ],
        },
        { path: "tenant", select: "name foto_profile" },
      ]
    );

    const formatted = bookings.map((booking: any) => {
      const roomType = booking.roomType;
      const kost = roomType.kost;

      return {
        id: booking._id,
        kost: {
          kostId: kost._id,
          roomTypeId: roomType._id,
          fotoKamar: roomType.photos?.[0].url || null, // Ambil 1 foto saja
          namaKost: `${kost?.name} ${roomType?.name}`,
          jenisKost: kost?.type,
          address: `${kost?.address?.city}, ${kost?.address?.district}`,
        },
        tenant: {
          id: booking.tenant._id,
          name: booking.tenant.name,
          foto_profile: booking.tenant.foto_profil,
        },

        tanggalMasuk: dayjs(booking.startDate).format("D MMMM YYYY"),
        tanggalDiajukan: dayjs(booking.createdAt).format("D MMMM YYYY"),
        expireDate: booking.expires_at
          ? dayjs(booking.expires_at).format("D MMMM YYYY HH:mm")
          : null,
        durasi: booking.duration,
        status: booking.status,
        harga: booking.totalPrice,
      };
    });

    return formatted;
  },

  async getBookingHistoryTenant(tenantId: string) {
    const bookings = await bookingRepository.findAll(
      {
        tenant: tenantId,
        status: BookingStatus.COMPLETED,
      },
      {},
      [
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name type address",
              populate: { path: "address" },
            },
            { path: "photos", select: "url" },
          ],
        },
        { path: "tenant", select: "name foto_profile" },
      ]
    );

    // Format output yang hanya diperlukan
    const formatted = bookings.map((booking: any) => {
      const roomType = booking.roomType;
      const kost = roomType.kost;

      return {
        id: booking._id,
        roomTypeId: roomType._id,
        fotoKamar: roomType.photos?.[0].url || null, // Ambil 1 foto saja
        namaKost: `${kost?.name} ${roomType?.name}`,
        jenisKost: kost?.type,
        address: `${kost?.address?.city}, ${kost?.address?.district}`,
        tanggalMasuk: dayjs(booking.startDate).format("D MMMM YYYY"),
        tanggalDiajukan: dayjs(booking.createdAt).format("D MMMM YYYY"),
        durasi: booking.duration,
        status: booking.status,
        harga: booking.total_price,
      };
    });

    return formatted;
  },
  async getActiveBookings(tenantId: string) {
    const booking = (await bookingRepository.findOne(
      {
        tenant: tenantId,
        status: {
          $in: [BookingStatus.ACTIVE, BookingStatus.WAITING_FOR_CHECKOUT],
        },
      },
      [
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name type",
              populate: {
                path: "address",
                select: "city district",
              },
            },
            {
              path: "photos",
              select: "url",
            },
          ],
        },
        {
          path: "room",
          select: "number floor",
        },
      ]
    )) as any;
    if (!booking) return null;

    const invoices = await invoiceRepository.findAll({
      booking: booking._id,
    });

    const roomType = booking.roomType;
    const kost = roomType?.kost;
    const address = kost?.address;

    const review = await reviewRepository.findOne({ booking: booking._id });

    const stopRequest = booking.stopRequest;

    const today = dayjs();

    const stopDate = stopRequest?.requestedStopDate
      ? dayjs(stopRequest?.requestedStopDate)
      : null;

    return {
      bookingId: booking._id,
      roomTypeId: roomType._id,
      kostName: `${kost?.name} - ${roomType.name}`,
      type: kost?.type,
      photo: roomType?.photos[0].url || [],
      address: `${address?.city}, ${address?.district}`,
      size: roomType?.size,
      price: roomType?.harga,
      room: `${booking.room.number}, Lantai ${booking.room.floor}`, // atau ambil info dari roomType.rooms jika perlu detail kamar
      stopRequest: stopRequest
        ? {
            status: stopRequest?.status || "Tidak Ada",
            stopDate:
              dayjs(stopRequest.requestedStopDate).format("D MMMM YYYY") ||
              null,
            canCheckOut: stopDate && today.isSameOrAfter(stopDate, "day"),
          }
        : null,
      reviewed: !!review,
      review: review
        ? {
            rating: review.rating,
            ulasan: review.comment,
          }
        : null,
      invoices,
    };
  },
  async getActiveBookingsOwner(ownerId: string) {
    const bookings = await bookingRepository.findAll(
      {
        owner: ownerId,
        status: {
          $in: [
            BookingStatus.ACTIVE,
            BookingStatus.WAITING_FOR_CHECKIN,
            BookingStatus.WAITING_FOR_CHECKOUT,
          ],
        },
      },
      {},
      [
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name type address",
              populate: { path: "address" },
            },
            { path: "photos", select: "url" },
          ],
        },
        { path: "tenant", select: "name foto_profil" },
      ]
    );

    // Format output yang hanya diperlukan
    const formatted = bookings.map((booking: any) => {
      const roomType = booking.roomType;
      const kost = roomType.kost;
      return {
        id: booking._id,
        tenantName: booking.tenant.name,
        namaKost: `${kost?.name} - ${roomType?.name}`,
        avatar: booking.tenant.foto_profil,
        tanggalMasuk: dayjs(booking.startDate).format("D MMMM YYYY"),
        durasi: booking.duration,
        status:
          booking.status === BookingStatus.ACTIVE
            ? "Sedang Menyewa"
            : booking.status === BookingStatus.WAITING_FOR_CHECKIN
            ? "Akan Masuk"
            : booking.status,
        berhentiSewa: booking.stopRequest
          ? {
              status: booking.stopRequest?.status,
              stopDate:
                booking.stopRequest?.requestedStopDate &&
                dayjs(booking.stopRequest?.requestedStopDate).format(
                  "D MMMM YYYY"
                ),
              reaseon: booking.stopReques?.reason,
            }
          : null,
      };
    });

    return formatted;
  },
  async getDetailBookingOwner(bookingId: string) {
    const booking = (await bookingRepository.findById(bookingId, [
      {
        path: "roomType",
        select: "name",
        populate: [
          {
            path: "kost",
            select: "name",
          },
        ],
      },
      {
        path: "tenant",
        select:
          "name email foto_profil pekerjaan kontak_darurat  phone jenis_kelamin",
      },
      {
        path: "room",
        select: "number",
      },
    ])) as any;

    if (!booking) throw new ResponseError(404, "Booking not found");

    return {
      roomTypeId: booking.roomType._id,
      tanggal_masuk: dayjs(booking.startDate).format("D MMMM YYYY"),
      tanggal_selesai: dayjs(booking.endDate).format("D MMMM YYYY"),
      durasi: booking.duration,
      biaya_sewa: booking.totalPrice,
      name: `${booking.roomType.kost.name} - ${booking.roomType.name}`,
      kamar: booking.room.number,
      status:
        booking.status === BookingStatus.ACTIVE
          ? "Sedang Menyewa"
          : booking.status === BookingStatus.WAITING_FOR_CHECKIN
          ? "Akan Masuk"
          : booking.status,
      tenant: {
        id: booking.tenant._id,
        name: booking.tenant.name,
        email: booking.tenant.email,
        phone: booking.tenant.phone,
        emergency_contact: booking.tenant.kontak_darurat,
        gender: booking.tenant.jenis_kelamin,
        pekerjaan: booking.tenant.pekerjaan,
        photo: booking.tenant.foto_profil,
        ktp: null,
      },
    };
  },
};
