import { ResponseError } from "@/utils/response-error.utils";
import { PhotoCategory } from "./photo-kost.model";
import { kostRepository } from "../kost/kost.repository";
import cloudinary from "@/config/cloudinary";
import {
  photoKostRepository,
  PhotoKostRepository,
} from "./photo-kost.repository";
import { uploadToCloudinary } from "@/utils/upload.utils";

export const photoKostService = {
  async uploadPhoto(
    kostId: string,
    file: Express.Multer.File,
    category: PhotoCategory,
    ownerId: string
  ) {
    // if (!req.file) throw new ResponseError(400, "Foto belum di upload");

    // Validasi data foto
    const kost = await kostRepository.findById(kostId);
    if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

    // Upload ke Cloudinary
    const uploadRes = await uploadToCloudinary(file.buffer, "kost_photos");

    // Simpan foto kost
    const photo = await photoKostRepository.create({
      kost: kostId,
      category,
      owner: ownerId,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });

    // 🚀 Tambahkan foto ke dalam array `photos` di Kost
    await kostRepository.updateById(kostId, { $push: { photos: photo._id } });

    return photo;
  },

  async getAllPhotos(kostId: string) {
    return await photoKostRepository.findAll({
      kost: kostId,
    });
  },

  async deletePhoto(photoId: string) {
    const photo = await photoKostRepository.findById(photoId);
    if (!photo || !photo.kost)
      throw new ResponseError(404, "Foto tidak ditemukan");

    const { result } = await cloudinary.uploader.destroy(photo.publicId); // Hapus dari Cloudinary

    if (result !== "ok")
      throw new ResponseError(500, "Gagal menghapus foto dari Cloudinary");

    await kostRepository.updateById(photo.kost, {
      $pull: { photos: photo._id },
    });
    await photoKostRepository.deleteById(photoId);

    return { message: "Foto berhasil dihapus" };
  },
  async replacePhoto(
    photoId: string,
    file: Express.Multer.File,
    category?: PhotoCategory
  ) {
    const oldPhoto = await photoKostRepository.findById(photoId);
    if (!oldPhoto) throw new ResponseError(404, "Foto tidak ditemukan");

    await cloudinary.uploader.destroy(oldPhoto.publicId);

    const uploadRes = await uploadToCloudinary(file.buffer, "kost_photos");

    // Update photo di DB
    const updatedPhoto = await photoKostRepository.updateById(photoId, {
      category: category || oldPhoto.category,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });

    return updatedPhoto;
  },
};
