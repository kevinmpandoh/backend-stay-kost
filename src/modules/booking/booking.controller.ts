import { NextFunction, Request, Response } from "express";
import { BookingService } from "./booking.service";
import { CreateBookingPayload, UpdateBookingPayload } from "./booking.types";

export const bookingController = {
  async getActiveBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id; // ID penyewa dari token
      const activeBookings = await BookingService.getActiveBookings(tenantId);
      res.json({ status: "success", data: activeBookings });
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = {
        roomType: req.body.roomType,
        startDate: req.body.startDate, // ISO date
        duration: req.body.duration,
        note: req.body.note,
        idDocument: req.body.idDocument,
      } as CreateBookingPayload;

      const tenantId = req.user.id;
      const result = await BookingService.create(payload, tenantId);
      res
        .status(201)
        .json({ message: "Booking berhasil dibuat", data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = {
        startDate: req.body.startDate, // ISO date
      } as UpdateBookingPayload;

      const { bookingId } = req.params;
      // const tenantId = req.user.id;
      const result = await BookingService.update(payload, bookingId);
      res
        .status(201)
        .json({ message: "Booking berhasil dibuat", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAllBookingAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getAllBookingsAdmin({
        query: req.validatedQuery,
      });
      res.status(200).json({ status: "success", ...result });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.uploadDocument(req);
      res
        .status(200)
        .json({ message: "Dokumen berhasil diupload", data: result });
    } catch (error) {
      next(error);
    }
  },

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const bookingId = req.params.bookingId;
      await BookingService.checkIn(bookingId, tenantId);

      res.json({ message: "Check-in berhasil" });
    } catch (error) {
      next(error);
    }
  },
  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const { bookingId } = req.params;
      await BookingService.checkOut(bookingId, tenantId);

      res.status(200).json({
        message: "Check-out berhasil, sewa telah selesai",
      });
    } catch (error) {
      next(error);
    }
  },
  async stopRentRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const payload = {
        stopDate: req.body.stopDate,
        reason: req.body.reason,
      };
      const booking = await BookingService.stopRentRequest(bookingId, payload);

      res.status(200).json({
        message: "Permintaan berhenti sewa berhasil diajukan tes",
        booking,
      });
    } catch (error) {
      next(error);
    }
  },
  async getBookingListTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const bookings = await BookingService.getAllBookingsTenant(tenantId);
      res.status(200).json({ status: "success", data: bookings });
    } catch (error) {
      next(error);
    }
  },
  async getDetailBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const bookings = await BookingService.getDetailBooking(bookingId);
      res.status(200).json(bookings);
    } catch (error) {
      next(error);
    }
  },
  async getBookingHistoryTenant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = req.user.id;
      const bookings = await BookingService.getBookingHistoryTenant(tenantId);
      res.status(200).json({ status: "success", data: bookings });
    } catch (error) {
      next(error);
    }
  },
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const roomId = req.body.room;
      await BookingService.approve(roomId, bookingId);

      res.status(200).json({
        status: "success",
        message: "Pengajuan sewa berhasil diterima",
      });
    } catch (error) {
      next(error);
    }
  },
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const rejectionReason = req.body.rejectionReason;
      const { bookingId } = req.params;
      const roomId = req.body.room;

      await BookingService.reject(bookingId, rejectionReason);

      res.json({
        status: "success",
        message: "Pengajuan sewa berhasil ditolak.",
      });
    } catch (error) {
      next(error);
    }
  },

  async acceptStopRent(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      await BookingService.acceptStopRent(bookingId);

      res.status(200).json({
        status: "success",
        message: "Permintaan berhenti sewa diterima",
      });
    } catch (error) {
      next(error);
    }
  },
  async stopRent(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = {
        bookingId: req.params.bookingId,
        stopDate: req.body.stopDate,
        reason: req.body.reason,
      };
      await BookingService.stopRentTenant(payload);

      res.status(200).json({
        status: "success",
        message: "Permintaan berhenti sewa diterima",
      });
    } catch (error) {
      next(error);
    }
  },
  async rejectStopRent(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { rejectionReason } = req.body;
      await BookingService.rejectStopRent(bookingId, rejectionReason);

      res.status(200).json({
        status: "success",
        message: "Permintaan berhenti sewa ditolak",
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllBookingOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;

      const bookings = await BookingService.getAllBookingsOwner({
        ownerId,
        query: req.validatedQuery,
      });
      res.status(200).json({ status: "success", data: bookings });
    } catch (error) {
      next(error);
    }
  },
  async getAllActiveBookingOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ownerId = req.user.id;
      const bookings = await BookingService.getActiveBookingsOwner(ownerId);
      res.status(200).json({ status: "success", data: bookings });
    } catch (error) {
      next(error);
    }
  },

  async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const tenantId = req.user.id; // dari middleware auth

      const result = await BookingService.cancelBooking(bookingId, tenantId);

      res.status(200).json({
        message: "Booking cancelled successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
};
