import { BaseRepository } from "../../core/base.repository";
import { Facility, IFacility } from "./facility.model";

export class FacilityRepository extends BaseRepository<IFacility> {
  constructor() {
    super(Facility);
  }
}

export const facilityRepository = new FacilityRepository();
