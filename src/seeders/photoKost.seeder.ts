import {
  PhotoCategory,
  PhotoKost,
} from "@/modules/photo-kost/photo-kost.model";
import { photoKostData } from "./data/photoKost";
import { Kost } from "@/modules/kost/kost.model";

export const seedPhotoKosts = async () => {
  await PhotoKost.deleteMany();

  const kosts = await Kost.find();
  if (kosts.length === 0) {
    console.error("❌ Seeder gagal: Tidak ada kost.");
    return;
  }

  const categories = [
    PhotoCategory.FRONT_VIEW,
    PhotoCategory.ROOM_VIEW,
    PhotoCategory.STREET_VIEW,
  ];

  for (const kost of kosts) {
    const photoIds = [];

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * photoKostData.length);
      const randomUrl = photoKostData[randomIndex];

      const urlParts = randomUrl.split("/");
      const fileName = urlParts.pop()!; // "abc123xyz.jpg"
      const folder = urlParts.slice(urlParts.indexOf("upload") + 1).join("/");

      const newPhoto = await PhotoKost.create({
        kost: kost._id,
        owner: kost.owner,
        category: categories[i], // atau bisa dirandom juga kalau mau
        url: randomUrl,
        publicId: `${folder}/${fileName.split(".")[0]}`,
      });

      photoIds.push(newPhoto._id);
    }

    await Kost.findByIdAndUpdate(kost._id, {
      $push: { photos: { $each: photoIds } },
    });
  }

  console.log(
    "✅ Foto Kost berhasil di-seed (dengan URL acak) untuk setiap Kost!"
  );
};
