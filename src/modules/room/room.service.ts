import { ResponseError } from "@/utils/response-error.utils";
import { roomRepository } from "./room.repository";
import { roomTypeRepository } from "../room-type/room-type.repository";

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
  const newRoom = await roomRepository.updateById(roomId, payload);
  if (!newRoom) throw new ResponseError(404, "Room not found");
  return newRoom;
};
const deleteRoom = async (roomId: string) => {
  return await roomRepository.deleteById(roomId);
};

export default {
  getAll,
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
};
