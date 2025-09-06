import { BaseRepository } from "../../core/base.repository";

import { IPhotoRoom, PhotoRoom } from "./photo-room.model";

export class PhotoRoomRepository extends BaseRepository<IPhotoRoom> {
  constructor() {
    super(PhotoRoom);
  }
}

export const photoRoomRepository = new PhotoRoomRepository();
