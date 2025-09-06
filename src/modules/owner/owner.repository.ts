import { BaseRepository } from "../../core/base.repository";
import { IOwner, Owner } from "../owner/owner.model";

export class OwnerRepository extends BaseRepository<IOwner> {
  constructor() {
    super(Owner);
  }
}

export const ownerRepository = new OwnerRepository();
