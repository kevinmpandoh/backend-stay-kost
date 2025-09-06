import { preferenceRepository } from "./preference.repository";

export const PreferenceService = {
  async setPreference(tenantId: string, payload: any) {
    return await preferenceRepository.createOrUpdatePreference(
      tenantId,
      payload
    );
  },

  async getPreference(tenantId: string) {
    const preference = await preferenceRepository.findOne(
      {
        tenant: tenantId,
      },
      [
        {
          path: "rules",
        },
        {
          path: "roomFacilities",
        },
        {
          path: "kostFacilities",
        },
      ]
    );

    if (!preference) return null;

    return {
      location: preference.address,
      price: preference.price,
      kostFacilities: preference.kostFacilities.map((f: any) => f.name),
      roomFacilities: preference.roomFacilities.map((f: any) => f.name),
      kostType: preference.kostType,
      rules: preference.rules.map((k: any) => k.name),
    };
  },
};
