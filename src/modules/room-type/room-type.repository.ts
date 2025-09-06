import { BaseRepository } from "../../core/base.repository";
import { FilterQuery } from "mongoose";

import { IRoomType, RoomType } from "./room-type.model";

export class RoomTypeRepository extends BaseRepository<IRoomType> {
  constructor() {
    super(RoomType);
  }

  async isNameTaken(
    name: string,
    ownerId: string,
    excludeId?: string
  ): Promise<boolean> {
    const filter: FilterQuery<IRoomType> = { name, owner: ownerId };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return !!(await this.model.exists(filter));
  }
}

export const roomTypeRepository = new RoomTypeRepository();
