import { ResponseError } from "@/utils/response-error.utils";
import { facilityRepository } from "./facility.repository";

export const FacilityService = {
  async getAll() {
    return await facilityRepository.findAll();
  },

  async createFacility(payload: { name: string }) {
    return await facilityRepository.create(payload);
  },

  async updateFacility(facilityId: string, payload: any) {
    const newFacility = await facilityRepository.updateById(
      facilityId,
      payload
    );
    if (!newFacility) throw new ResponseError(404, "Facility not found");
    return newFacility;
  },
  async deleteFacility(facilityId: string) {
    return await facilityRepository.deleteById(facilityId);
  },
};
