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
        durations: [
          {
            duration: 0,
            price: 0,
          },
        ],
        features: ["Maksimal 1 Kost", "Maksimal 1 Kamar"],
        maxKost: 1,
        maxRoom: 1,
        prioritySupport: false,
        isActive: true,
      },
      {
        name: "Pro",
        description:
          "Paket menengah untuk pemilik kost dengan lebih banyak kamar",
        durations: [
          { duration: 1, price: 49000 },
          { duration: 3, price: 132000, discount: "10%", oldPrice: 147000 },
          { duration: 6, price: 249000, discount: "15%", oldPrice: 294000 },
          { duration: 12, price: 470000, discount: "20%", oldPrice: 588000 },
        ],
        features: ["Maksimal 5 Kost", "Maksimal 50 Kamar", "Prioritas Support"],
        maxKost: 2,
        maxRoom: 10,
        prioritySupport: true,
        isActive: true,
      },
      {
        name: "Premium",
        description: "Paket premium untuk pemilik kost skala besar",
        durations: [
          { duration: 1, price: 99000 },
          { duration: 3, price: 270000, discount: "10%", oldPrice: 297000 },
          { duration: 6, price: 480000, discount: "15%", oldPrice: 594000 },
          { duration: 12, price: 900000, discount: "20%", oldPrice: 1188000 },
        ],
        features: [
          "Unlimited Kost",
          "Unlimited Kamar",
          "Prioritas Support",
          "Fitur tambahan khusus",
        ],
        maxKost: null, // null = unlimited
        maxRoom: null,
        prioritySupport: true,
        isActive: true,
      },
    ];

    await Package.insertMany(packages);
    console.log("Packages seeded successfully!");
  } catch (error) {
    console.error("Error seeding packages:", error);
  }
};
