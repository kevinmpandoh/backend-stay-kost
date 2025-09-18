// seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

import { seedKosts } from "./kost.seeder";
import { seedRoomTypes } from "./RoomType.seeder";
import { seedFacilities } from "./facilities.seeder";
import { seedRules } from "./rules.seeder";
import { seedKostTypeFacilities } from "./kostTypeFacilities.seeder";
import { seedRooms } from "./room.seeder";
import { seedPhotoKosts } from "./photoKost.seeder";
import { seedPhotoRooms } from "./photoRoom.seeder";
import { seedFinishedBookingsPerKostType } from "./booking.seeder";
import { seedReviews } from "./review.seeder";
import userSeeder from "./user.seeder";
import { env } from "@/config/env";
import { seedPackages } from "./package.seeder";
dotenv.config();

export const main = async () => {
  try {
    // Koneksi ke database
    await mongoose.connect(
      env.MONGO_URI || "mongodb://localhost:27017/kost_db"
    );
    console.log("Connected to MongoDB");

    // Jalankan seeder setelah koneksi berhasil
    await seedPackages();
    await userSeeder();
    await seedFacilities(); // Seed fasilitas
    await seedRules(); // Seed peraturan
    await seedKosts();
    await seedRoomTypes();
    await seedPhotoKosts(); // Seed foto kost
    await seedPhotoRooms(); // Seed foto tipe kost
    await seedKostTypeFacilities();
    await seedRooms();
    await seedFinishedBookingsPerKostType();
    await seedReviews();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Tutup koneksi setelah operasi selesai
    mongoose.connection.close();
  }
};

main().catch((err) => console.error("Error in main function:", err));
