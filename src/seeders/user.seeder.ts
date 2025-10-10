// seeders/userSeeder.ts

import { User } from "@/modules/user/user.model";
import bcrypt from "bcryptjs";

import { Package } from "@/modules/package/package.model";

import { Subscription } from "@/modules/subscription/subscription.model";

const userSeeder = async () => {
  try {
    const deleteResult = await User.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} user(s)`);

    await User.insertMany([
      {
        name: "Admin",
        email: "admin@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10), // pastikan dihash beneran
        role: "admin",
        isVerified: true,
      },
      {
        name: "Kevin Pandoh",
        email: "owner@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "owner",
        isVerified: true,
      },
      {
        name: "Mesiasi Supit",
        email: "sashi@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "owner",
        isVerified: true,
      },
    ]);

    await User.insertMany([
      {
        name: "Kevin",
        email: "tenant@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "tenant",
        isVerified: true,
      },
      {
        name: "Sashi",
        email: "mesiasi@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "tenant",
        isVerified: true,
      },
    ]);

    // Menambahkan data user baru ke database
    const freePackage = await Package.findOne({ type: "free" });

    if (!freePackage) {
      throw new Error("Free package not found, seed packages first!");
    }

    const owners = await User.find({ role: "owner" });

    const subscriptions = owners.map((owner) => ({
      owner: owner._id,

      package: freePackage._id,

      status: "active",

      duration: 0,

      startDate: new Date(),

      endDate: null,
    }));

    console.log("Tenant seeder completed successfully");

    await Subscription.insertMany(subscriptions);

    console.log("Free subscriptions assigned to all owners!");

    console.log("Tenant seeder completed successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

export default userSeeder;
