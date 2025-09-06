import { BaseRepository } from "../../core/base.repository";

import { IPhotoKost, PhotoKost } from "./photo-kost.model";

export class PhotoKostRepository extends BaseRepository<IPhotoKost> {
  constructor() {
    super(PhotoKost);
  }
}

export const photoKostRepository = new PhotoKostRepository();
