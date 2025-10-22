import { agenda } from "@/config/agenda";
import { Booking } from "../modules/booking/booking.model";
import { BookingStatus } from "@/modules/booking/booking.types";
import { Invoice } from "@/modules/invoice/invoice.model";
import { Room } from "@/modules/room/room.model";
import { RoomStatus } from "@/modules/room/room.type";
import { notificationService } from "@/modules/notification/notification.service";

// Owner tidak konfirmasi dalam 3 hari
agenda.define("expire-booking-confirm", async (job: any) => {
  const { bookingId } = job.attrs.data as { bookingId: string };
  console.log(
    `[Agenda] Running expire-booking-confirm for booking: ${bookingId}`
  );
  const booking = await Booking.findById(bookingId);

  if (!booking) return;
  if (
    booking.status === BookingStatus.PENDING &&
    booking.confirmDueDate < new Date()
  ) {
    booking.status = BookingStatus.EXPIRED;
    await booking.save();
    await Room.findByIdAndUpdate(booking.room, {
      status: RoomStatus.AVAILABLE,
    });
    await notificationService.sendNotification(
      booking.owner.toString(),
      "owner",
      "booking",
      `Booking dengan ID ${bookingId} telah kadaluarsa karena Anda tidak mengkonfirmasi dalam batas waktu yang ditentukan.`,
      "Booking Kadaluarsa"
    );

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Booking dengan ID ${bookingId} telah kadaluarsa karena pemilik tidak mengkonfirmasi dalam batas waktu yang ditentukan.`,
      "Booking Kadaluarsa"
    );

    console.log(`❌ Booking ${bookingId} expired (owner tidak konfirmasi)`);
  } else {
    console.log(
      `[Agenda] Booking ${bookingId} still valid or already processed`
    );
  }
});

// Tenant tidak bayar dalam 1 hari
agenda.define("expire-booking-payment", async (job: any) => {
  const { bookingId } = job.attrs.data as { bookingId: string };
  const booking = await Booking.findById(bookingId);

  if (!booking) return;
  if (booking.status === BookingStatus.WAITING_FOR_PAYMENT) {
    booking.status = BookingStatus.EXPIRED;
    await booking.save();

    await Invoice.deleteMany({ booking: booking._id });
    await Room.findByIdAndUpdate(booking.room, {
      status: RoomStatus.AVAILABLE,
    });
    await notificationService.sendNotification(
      booking.owner.toString(),
      "owner",
      "booking",
      `Booking dengan ID ${bookingId} telah kadaluarsa karena penyewa tidak melakukan pembayaran dalam batas waktu yang ditentukan.`,
      "Booking Kadaluarsa"
    );

    await notificationService.sendNotification(
      booking.tenant.toString(),
      "tenant",
      "booking",
      `Booking dengan ID ${bookingId} telah kadaluarsa karena Anda tidak melakukan pembayaran dalam batas waktu yang ditentukan.`,
      "Booking Kadaluarsa"
    );

    console.log(`❌ Booking ${bookingId} expired (tenant tidak bayar)`);
  }
});

// Auto check-in di startDate
agenda.define("auto-check-in", async (job: any) => {
  const { bookingId } = job.attrs.data as { bookingId: string };
  const booking = await Booking.findById(bookingId);

  if (!booking) return;
  if (
    booking.status === BookingStatus.WAITING_FOR_CHECKIN &&
    !booking.checkInAt
  ) {
    booking.checkInAt = new Date();
    await booking.save();
    console.log(`✅ Booking ${bookingId} auto check-in`);
  }
});

// Auto check-out di endDate
agenda.define("auto-check-out", async (job: any) => {
  const { bookingId } = job.attrs.data as { bookingId: string };
  const booking = await Booking.findById(bookingId);

  if (!booking) return;
  if (
    booking.status === BookingStatus.WAITING_FOR_CHECKOUT &&
    !booking.checkOutAt
  ) {
    booking.checkOutAt = new Date();
    booking.status = BookingStatus.COMPLETED;
    await booking.save();
    console.log(`✅ Booking ${bookingId} auto check-out`);
  }
});
