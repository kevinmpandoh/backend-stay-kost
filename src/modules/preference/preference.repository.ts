import { BaseRepository } from "../../core/base.repository";
import { IPreference, Preference } from "./preference.model";

export class PreferenceRepository extends BaseRepository<IPreference> {
  constructor() {
    super(Preference);
  }

  async createOrUpdatePreference(tenantId: string, data: Partial<IPreference>) {
    return await Preference.findOneAndUpdate(
      { tenant: tenantId },
      {
        ...data,
        tenant: tenantId,
      },

      {
        upsert: true,
        new: true,
      }
    );
  }
}

export const preferenceRepository = new PreferenceRepository();
