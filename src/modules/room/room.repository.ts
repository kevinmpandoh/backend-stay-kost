import { FilterQuery } from "mongoose";
import { BaseRepository } from "../../core/base.repository";
import { Room } from "./room.model";
import { IRoom, RoomInput } from "./room.type";

export class RoomRepository extends BaseRepository<IRoom> {
  constructor() {
    super(Room);
  }

  async createMany(rooms: RoomInput[]): Promise<IRoom[]> {
    return this.model.insertMany(rooms);
  }
}

export const roomRepository = new RoomRepository();
