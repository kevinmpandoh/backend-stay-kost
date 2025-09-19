// package.seeder.ts

import { Package } from "@/modules/package/package.model";

export const seedPackages = async () => {
  try {
    const count = await Package.countDocuments();
    if (count > 0) {
      console.log("Packages already seeded, skipping...");
      return;
    }

    const packages = [
      {
        name: "Free",
        description: "Paket gratis dengan fitur dasar",
        type: "free",
        durations: [
          {
            duration: 0,
            price: 0,
          },
        ],
        features: [
          "Maksimal 1 Kost",
          "Maksimal 2 Tipe Kamar per kost",
          "Maksimal 4 Kamar per tipe kost",
        ],
        maxKost: 1,
        maxRoomType: 2,
        maxRoom: 4,
        isActive: true,
      },
      {
        name: "Pro",
        type: "pro",
        description:
          "Paket menengah untuk pemilik kost dengan lebih banyak kamar",
        durations: [
          { duration: 1, price: 49000 },
          { duration: 3, price: 132000, discount: "10%", oldPrice: 147000 },
          { duration: 6, price: 249000, discount: "15%", oldPrice: 294000 },
          { duration: 12, price: 470000, discount: "20%", oldPrice: 588000 },
        ],
        features: [
          "Maksimal 5 Kost",
          "Maksimal 3 Tipe Kamar per kost",
          "Maksimal 10 Kamar per tipe kost",
          "Prioritas Support",
        ],
        maxKost: 2,
        maxRoomType: 4,
        maxRoom: 10,
        isActive: true,
      },
      {
        name: "Premium",
        type: "premium",
        description: "Paket premium untuk pemilik kost skala besar",
        durations: [
          { duration: 1, price: 99000 },
          { duration: 3, price: 270000, discount: "10%", oldPrice: 297000 },
          { duration: 6, price: 480000, discount: "15%", oldPrice: 594000 },
          { duration: 12, price: 900000, discount: "20%", oldPrice: 1188000 },
        ],
        features: [
          "Unlimited Kost",
          "Unlimited Kamar Tipe Kamar",
          "Unlimited Kamar",
          "Fitur tambahan khusus",
        ],
        maxKost: null, // null = unlimited
        maxRoomType: null,
        maxRoom: null,
        isActive: true,
      },
    ];

    await Package.insertMany(packages);
    console.log("Packages seeded successfully!");
  } catch (error) {
    console.error("Error seeding packages:", error);
  }
};
