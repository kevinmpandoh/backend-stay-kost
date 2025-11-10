import { ResponseError } from "@/utils/response-error.utils";
import { roomRepository } from "./room.repository";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { bookingRepository } from "../booking/booking.repository";
import { BookingStatus } from "../booking/booking.types";

const getAll = async () => {
  return await roomRepository.findAll();
};

const createRoom = async ({
  roomTypeId,
  payload,
}: {
  roomTypeId: string;
  payload: any;
}) => {
  const newRoom = await roomRepository.create({
    ...payload,
    roomType: roomTypeId,
  });
  await roomTypeRepository.updateById(roomTypeId, {
    $push: {
      rooms: newRoom._id,
    },
  });
};

const getRooms = async (roomTypeId: string, status: any) => {
  if (!roomTypeId) {
    throw new ResponseError(404, "Kost Type ID is required");
  }

  if (!status) {
    return await roomRepository.findAll({
      roomType: roomTypeId,
    });
  } else {
    return await roomRepository.findAll({
      roomType: roomTypeId,
      status: status,
    });
  }
};

const updateRoom = async (roomId: string, payload: any) => {
  const room = await roomRepository.findById(roomId);
  if (!room) throw new ResponseError(404, "Room not found");

  const booking = await bookingRepository.findOne({
    room: roomId,
    status: {
      $in: [
        BookingStatus.ACTIVE,
        BookingStatus.WAITING_FOR_CHECKIN,
        BookingStatus.WAITING_FOR_PAYMENT,
      ],
    },
  });

  if (booking) {
    throw new ResponseError(400, "Cannot update room that has active bookings");
  }

  const newRoom = await roomRepository.updateById(roomId, payload);

  return newRoom;
};
const deleteRoom = async (roomId: string) => {
  const room = await roomRepository.findById(roomId);
  if (!room) throw new ResponseError(404, "Room not found");

  const booking = await bookingRepository.findOne({
    room: roomId,
    status: {
      $in: [
        BookingStatus.ACTIVE,
        BookingStatus.WAITING_FOR_CHECKIN,
        BookingStatus.WAITING_FOR_PAYMENT,
      ],
    },
  });

  if (booking) {
    throw new ResponseError(400, "Cannot update room that has active bookings");
  }
  return await roomRepository.deleteById(roomId);
};

export default {
  getAll,
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
};
