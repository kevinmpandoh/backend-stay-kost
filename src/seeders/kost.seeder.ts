import { Kost } from "@/modules/kost/kost.model";
import kostData from "./data/kostData";
import { User } from "@/modules/user/user.model";
import { Facility } from "@/modules/facility/facility.model";
import { Rule } from "@/modules/rule/rule.model";
import { KostStatus } from "@/modules/kost/kost.type";

export const seedKosts = async () => {
  await Kost.deleteMany(); // Hapus data lama

  const owners = await User.find({
    role: "owner",
  }); // Ambil semua owner yang ada
  const facilities = await Facility.find({ category: "kost" });

  const rules = await Rule.find();

  if (owners.length === 0 || facilities.length === 0 || rules.length === 0) {
    console.error(
      "❌ Seeder gagal: Pastikan owner, fasilitas, dan peraturan sudah ada."
    );
    return;
  }

  for (const kost of kostData) {
    const randomOwner = owners[Math.floor(Math.random() * owners.length)];
    // const address = await Address.create(kost.alamat);

    const address = kost.address;

    // Pilih 3-5 fasilitas secara acak
    const selectedFacilities = facilities
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    const facilityIds = selectedFacilities.map(
      (facility) => facility._id
    ) as string[];

    // Pilih 2-3 peraturan secara acak
    const selectedRules = rules.sort(() => 0.5 - Math.random()).slice(0, 3);
    const peraturanIds = selectedRules.map((rule) => rule._id) as string[];

    const createdKost = await Kost.create({
      ...kost,
      address: {
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        coordinates: {
          coordinates: [address.coordinates.lng, address.coordinates.lat], // GeoJSON: lng, lat
        },
      },
      owner: randomOwner._id,
      facilities: facilityIds,
      status: KostStatus.APPROVED,
      isPublished: true,
      rules: peraturanIds,
    });
  }

  console.log("✅ Kost, Alamat, Fasilitas & Peraturan Seeded");
};
