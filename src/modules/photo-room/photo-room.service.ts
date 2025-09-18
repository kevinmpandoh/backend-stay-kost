import { ResponseError } from "@/utils/response-error.utils";
import { PhotoRoomCategory } from "./photo-room.model";

import { photoRoomRepository } from "./photo-room.repository";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { uploadToCloudinary } from "@/utils/upload.utils";
import cloudinary from "@/config/cloudinary";

export const photoRoomService = {
  async getPhotoByRoomType(roomTypeId: string) {
    return await photoRoomRepository.findAll({
      roomType: roomTypeId,
    });
  },
  async uploadPhoto(
    roomTypeId: string,
    file: Express.Multer.File,
    category: PhotoRoomCategory,
    ownerId: string
  ) {
    // if (!req.file) throw new ResponseError(400, "Foto belum di upload");

    // Validasi data foto
    const roomType = await roomTypeRepository.findById(roomTypeId);
    if (!roomType) throw new ResponseError(404, "Tipe Kamar tidak ditemukan");

    // Upload ke Cloudinary
    const uploadRes = await uploadToCloudinary(file.buffer, "room_photos");

    // Simpan foto kost
    const photo = await photoRoomRepository.create({
      roomType: roomTypeId,
      category,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      owner: ownerId,
    });

    // 🚀 Tambahkan foto ke dalam array `photos` di Kost
    await roomTypeRepository.updateById(roomTypeId, {
      $push: { photos: photo._id },
    });

    return photo;
  },

  async deletePhoto(photoId: string) {
    const photo = await photoRoomRepository.findById(photoId);
    if (!photo || !photo.roomType)
      throw new ResponseError(404, "Foto tidak ditemukan");

    const { result } = await cloudinary.uploader.destroy(photo.publicId); // Hapus dari Cloudinary

    if (result !== "ok")
      throw new ResponseError(500, "Gagal menghapus foto dari Cloudinary");

    await roomTypeRepository.updateById(photo.roomType, {
      $pull: { photos: photo._id },
    });
    await photoRoomRepository.deleteById(photoId);

    return { message: "Foto berhasil dihapus" };
  },
  async replacePhoto(
    photoId: string,
    file: Express.Multer.File,
    category?: PhotoRoomCategory
  ) {
    const oldPhoto = await photoRoomRepository.findById(photoId);
    if (!oldPhoto) throw new ResponseError(404, "Foto tidak ditemukan");

    if (!file) throw new ResponseError(400, "Foto baru belum di upload");

    // Hapus foto lama di Cloudinary
    await cloudinary.uploader.destroy(oldPhoto.publicId);
    // Upload baru
    const uploadRes = await uploadToCloudinary(file.buffer, "room_photos");

    const updatedPhoto = await photoRoomRepository.updateById(photoId, {
      category: category || oldPhoto.category,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });

    return updatedPhoto;
  },

  //   async getPhoto(req: any) {
  //     return await photoRoomRepository.getPhotosById(req.params.photoId);
  //   },
  //   async getAllPhotos(req: any) {
  //     return await photoKostRepository.getPhotosByKostId(req.params.kostId);
  //   },
  //   async validateAndUpdateProgressStep(kostId: string) {
  //     const kost = await Kost.findById(kostId);
  //     if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  //     // 🚀 Cek jumlah foto per kategori
  //     const categories = ["Tampak Depan", "Dalam Bangunan", "Dari Jalan"];
  //     const photoCounts = await Promise.all(
  //       categories.map(async (category) => {
  //         return {
  //           category,
  //           count: await photoKostRepository.countPhotoByCategory(
  //             kostId,
  //             category
  //           ),
  //         };
  //       })
  //     );

  //     // 🚨 Jika ada kategori yang kurang, beri error
  //     const missingCategories = photoCounts.filter((p) => p.count < 1);
  //     if (missingCategories.length > 0) {
  //       const errorDetails: Record<string, string> = {};
  //       missingCategories.forEach((m) => {
  //         errorDetails[
  //           m.category
  //         ] = `Minimal 1 foto untuk kategori '${m.category}' diperlukan`;
  //       });
  //       throw new ResponseError(
  //         400,
  //         "Beberapa kategori foto belum lengkap",
  //         errorDetails
  //       );
  //     }
  //     if (kost.status === "Aktif" || kost.status === "Ditolak") {
  //       await KostRepository.update(kostId, {
  //         status: "Menunggu Verifikasi",
  //         alasan_penolakan: null,
  //       });
  //     }

  //     // ✅ Jika lolos validasi, update progress_step ke langkah berikutnya
  //     kost.progress_step = 5; // Misal langkah berikutnya adalah 3
  //     await kost.save();

  //     return {
  //       kostId,
  //       progress_step: kost.progress_step,
  //     };
  //   },
};
