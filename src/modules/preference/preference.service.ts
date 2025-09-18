import { ResponseError } from "@/utils/response-error.utils";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { preferenceRepository } from "./preference.repository";
import { IFacility } from "../facility/facility.model";
import {
  getCosineSimilarity,
  getDistanceInMeters,
  getHaversineScore,
  getPriceScore,
  getTfIdfVectors,
} from "@/utils/contentBasedFiltering";
import { IRule } from "../rule/rule.model";
import { IPhotoKost } from "../photo-kost/photo-kost.model";
import { IPhotoRoom } from "../photo-room/photo-room.model";
import { RoomStatus } from "../room/room.type";

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
      kostFacilities: preference.kostFacilities.map((f: any) => f._id),
      roomFacilities: preference.roomFacilities.map((f: any) => f._id),
      kostType: preference.kostType,
      rules: preference.rules.map((k: any) => k._id),
    };
  },

  async getPreferenceKost(tenantId: string) {
    const pref = await preferenceRepository.findOne({ tenant: tenantId }, [
      {
        path: "kostFacilities",
      },
      {
        path: "roomFacilities",
      },
      {
        path: "rules",
      },
    ]);
    const roomTypes = (await roomTypeRepository.findAll(
      {
        status: "active",
      },
      {},
      [
        {
          path: "photos",
        },
        {
          path: "rooms",
        },
        {
          path: "facilities",
        },
        {
          path: "kost",
          populate: [
            {
              path: "facilities",
            },
            {
              path: "photos",
            },
            {
              path: "rules",
            },
          ],
        },
      ]
    )) as any;

    if (!pref) throw new ResponseError(404, "Preferensi tidak ada");
    const normalize = (name: string) =>
      name.trim().toLowerCase().replace(/\s+/g, "_");

    const userFacilities = [...pref.kostFacilities, ...pref.roomFacilities].map(
      (facility: any) => normalize(facility.name)
    );

    const userRules = (pref.rules || []).map((k: any) => k.name).join(" ");

    // Buat dokumen TF-IDF untuk semua kostType
    const facilityDocs: string[][] = roomTypes.map((kt: any) => {
      const kostFacilities = (kt.kost?.facilities || []).map(
        (facility: IFacility) => facility.name
      );
      const roomFacilities = (kt.facilities || []).map(
        (f: IFacility) => f.name
      );
      const all = [...kostFacilities, ...roomFacilities].map(normalize);
      return Array.from(new Set(all)); // remove duplikat
    });
    const ruleDocs = roomTypes.map((roomType: any) =>
      (roomType.kost?.rules || []).map((rule: IRule) => rule.name).join(" ")
    );

    const tfidfFacilities = getTfIdfVectors([userFacilities, ...facilityDocs]);

    const tfidfRules = getTfIdfVectors([userRules, ...ruleDocs]);

    const result = roomTypes.map((roomType: any, i: number) => {
      const kost = roomType.kost;
      const [lng, lat] = kost.address?.coordinates.coordinates || [];

      // Lokasi
      const jarak = getDistanceInMeters(
        pref.address.coordinates.lat,
        pref.address.coordinates.lng,
        lat,
        lng
      );
      const locationScore = getHaversineScore(jarak);

      // Harga
      const price = roomType.price || 0;

      const priceScore = getPriceScore(price, pref.price.min, pref.price.max);

      // Jenis Kost
      const kostTypeScore = kost.type === pref.kostType ? 1 : 0;

      const facilityScore = getCosineSimilarity(tfidfFacilities, i + 1);

      const ruleScore = getCosineSimilarity(tfidfRules, i + 1);

      // Final Score (berdasarkan bobot)
      const finalScore =
        locationScore * 0.35 +
        priceScore * 0.25 +
        facilityScore * 0.15 +
        ruleScore * 0.15 +
        kostTypeScore * 0.1;

      // Ambil fasilitas gabungan (nama)
      const kostFacilities = (kost.facilities || []).map(
        (f: IFacility) => f.name
      );
      const roomFacilities = (roomType.facilities || []).map(
        (f: IFacility) => f.name
      );

      const allFacilities = Array.from(
        new Set([...kostFacilities, ...roomFacilities])
      );

      // Ambil foto (gabung foto kost dan foto kamar)
      const kostPhotos =
        kost.photos?.map((photo: IPhotoKost) => photo.url) || [];
      const roomPhotos =
        roomType.photos?.map((photo: IPhotoRoom) => photo.url) || [];
      const photos = [...kostPhotos, ...roomPhotos];

      return {
        id: roomType._id,
        skor: finalScore,
        kostName: `${kost.name} - ${roomType.name}`,
        address: `${kost.address?.district}, ${kost.address?.city}`,
        kostType: kost.type,
        price: price,
        facilities: allFacilities,
        rooms: roomType.rooms.filter(
          (room: any) => room.status === RoomStatus.AVAILABLE
        ).length,
        photos,
      };
    });
    const res = result.sort((a: any, b: any) => b.skor - a.skor).slice(0, 10);

    return res;
  },
};
