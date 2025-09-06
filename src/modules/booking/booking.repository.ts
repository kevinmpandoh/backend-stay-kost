import { BaseRepository } from "../../core/base.repository";
import { Booking, IBooking } from "./booking.model";

export class BookingRepository extends BaseRepository<IBooking> {
  constructor() {
    super(Booking);
  }
}

export const bookingRepository = new BookingRepository();
