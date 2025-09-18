// seeders/userSeeder.ts

import { User } from "@/modules/user/user.model";
import bcrypt from "bcryptjs";

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
        email: "sashi@test.com",
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
        email: "mesiasi@test.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "tenant",
        isVerified: true,
      },
    ]);

    // Menambahkan data user baru ke database

    console.log("Tenant seeder completed successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

export default userSeeder;
