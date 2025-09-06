// seeders/userSeeder.ts

import { User } from "@/modules/user/user.model";
import bcrypt from "bcryptjs";

const userSeeder = async () => {
  try {
    const deleteResult = await User.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} user(s)`);

    // Data user baru untuk diinsert
    await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      phone: "08123467123",
      password: await bcrypt.hash("password", 10), // pastikan dihash beneran
      role: "admin",
      isVerified: true,
    });

    await User.insertMany([
      {
        name: "Owner 1",
        email: "owner@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "owner",
        isVerified: true,
      },
      {
        name: "Owner 2",
        email: "owner2@test.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "owner",
        isVerified: true,
      },
    ]);

    await User.insertMany([
      {
        name: "Tenant 1",
        email: "tenant@gmail.com",
        phone: "08123467123",
        password: await bcrypt.hash("password", 10),
        role: "tenant",
        isVerified: true,
      },
      {
        name: "Tenant 2",
        email: "tenant2@test.com",
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
