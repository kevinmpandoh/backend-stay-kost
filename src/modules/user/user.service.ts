import bcrypt from "bcryptjs";
import { UserRepository, userRepository } from "./user.repository";
import { ResponseError } from "@/utils/response-error.utils";
import { uploadToCloudinary } from "@/utils/upload.utils";
import cloudinary from "@/config/cloudinary";
import { payoutCreator } from "@/config/midtrans";
import { formatAliasName } from "@/utils/generateAliasName";
import dayjs from "dayjs";
import { mapMidtransValidationError } from "@/utils/mapMidtransValidatorErrors";

const getCurrent = async (userId: string, role: string) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found");

  // let profile = null;
  // if (role === "tenant") {
  //   profile = await userRepository.findTenantByUser(userId);
  // } else if (role === "owner") {
  //   profile = await userRepository.findOwnerByUser(userId);
  // }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    photo: user.avatarUrl,
    gender: user.tenantProfile?.gender,
    birthDate: dayjs(user.tenantProfile?.birthDate).format("YYYY-MM-DD"),
    job: user.tenantProfile?.job,
    otherJob: user.tenantProfile?.otherJob,
    emergencyContact: user.tenantProfile?.emergencyContact,
    hometown: user.tenantProfile?.hometown,
    bank: user.bank,
  };
};

const changePassword = async (
  userId: string,
  payload: { password: string; newPassword: string }
) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new ResponseError(404, "user tidak ditemukan");
  const isMatch = await bcrypt.compare(payload.password, user.password);

  if (!isMatch) {
    throw new ResponseError(400, "Passwod lama tidak sesuai");
  }

  user.password = payload.newPassword;
  return user.save();
};

const updateProfile = async (userId: any, payload: any) => {
  const user = await userRepository.findById(userId);

  if (!user) throw new ResponseError(404, "User tidak ditemukan");

  const userUpdate: any = {};
  if (payload.name) userUpdate.name = payload.name;
  if (payload.phone) userUpdate.phone = payload.phone;

  if (user.role === "tenant") {
    userUpdate.tenantProfile = {
      ...user.tenantProfile, // merge biar ga overwrite kosong
      gender: payload.gender ?? user.tenantProfile?.gender,
      job: payload.job ?? user.tenantProfile?.job,
      otherJob: payload.otherJob ?? user.tenantProfile?.otherJob,
      hometown: payload.hometown ?? user.tenantProfile?.hometown,
      emergencyContact:
        payload.emergencyContact ?? user.tenantProfile?.emergencyContact,
      birthDate: payload.birthDate
        ? new Date(payload.birthDate) // simpan sebagai Date
        : user.tenantProfile?.birthDate,
    };
  }

  const newUser = await userRepository.updateById(user.id, userUpdate);
  if (!newUser) throw new ResponseError(404, "User tidak ditemukan");

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    photo: newUser.avatarUrl,
    gender: newUser.tenantProfile?.gender,
    birthDate: newUser.tenantProfile?.birthDate
      ? dayjs(newUser.tenantProfile.birthDate).format("D MMMM YYYY")
      : null,
    job: newUser.tenantProfile?.job,
    otherJob: newUser.tenantProfile?.otherJob,
    emergencyContact: newUser.tenantProfile?.emergencyContact,
    hometown: newUser.tenantProfile?.hometown,
    bank: newUser.bank,
  };
};

const updateProfilePhoto = async (userId: string, photoUrl: string) => {
  return await userRepository.updateById(userId, { profilePhoto: photoUrl });
};

const getOwnerBankAccount = async (userId: string) => {
  const owner = await userRepository.findOwnerByUser(userId);
  if (!owner) throw new Error("Owner profile not found");

  return {
    bankAccount: owner.bankAccount,
    bankName: owner.bankName,
  };
};

const updateOwnerBankAccount = async (userId: string, payload: any) => {
  const owner = await userRepository.updateOwnerProfile(userId, {
    bankAccount: payload.bankAccount,
    bankName: payload.bankName,
  });

  return {
    message: "Bank account updated successfully",
    bankAccount: owner?.bankAccount,
    bankName: owner?.bankName,
  };
};

const getAllTenants = async () => {
  return userRepository.findAll({ role: "tenant" });
};

const getTenantById = async (id: string) => {
  return userRepository.findTenantByUser(id);
};

const getAllOwners = async () => {
  return userRepository.findAll({ role: "owner" });
};

const getOwnerById = async (id: string) => {
  return userRepository.findOwnerByUser(id);
};

const uploadProfile = async (userId: string, file: Express.Multer.File) => {
  // Cari user dulu
  const user = await userRepository.findById(userId);
  if (!user) throw new ResponseError(404, "User tidak ditemukan");

  // Kalau ada foto lama, hapus di Cloudinary
  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }

  // Upload foto baru ke Cloudinary
  const uploadRes = await uploadToCloudinary(file.buffer, "photo_profile");

  // Update user dengan foto baru
  const updatedUser = await userRepository.updateById(userId, {
    avatarUrl: uploadRes.secure_url,
    avatarPublicId: uploadRes.public_id, // simpan public_id untuk keperluan hapus nanti
  });

  return {
    url: updatedUser?.avatarUrl,
  };
};

const getAvailableBanks = async () => {
  const banks = await payoutCreator.getBeneficiaryBanks();

  // daftar bank yang mau ditampilkan
  const allowedBanks = [
    "bni",
    "bri",
    "mandiri",
    "bca",
    "permata",
    "cimb",
    "ovo",
    "gopay",
  ];

  return banks.beneficiary_banks.filter((bank: { code: string }) =>
    allowedBanks.includes(bank.code.toLowerCase())
  );
};

export const addBankAccount = async (ownerId: string, dto: BankAccountDTO) => {
  const owner = await userRepository.findById(ownerId);
  if (!owner) throw new ResponseError(404, "Owner not found");
  if (owner.role !== "owner")
    throw new ResponseError(400, "User is not an owner");

  // Step 0: Validasi khusus GoPay / OVO
  if (dto.bank === "gopay" && !dto.account.startsWith("62")) {
    throw new ResponseError(400, "Nomor GoPay harus diawali 62");
  }

  if (dto.bank === "ovo" && !dto.account.startsWith("8066")) {
    dto.account = "8066" + dto.account;
  }

  let validation;
  try {
    // Step 1: Validasi nomor rekening ke Midtrans
    validation = await payoutCreator.validateBankAccount({
      bank: dto.bank,
      account: dto.account,
    });

    if (validation?.error_message) {
      throw mapMidtransValidationError(validation);
    }
  } catch (error: any) {
    // jika error dari Midtrans axios-like
    if (error.ApiResponse) {
      throw mapMidtransValidationError(error.ApiResponse);
    }

    // fallback server error
    throw new ResponseError(
      500,
      error.message || "Terjadi kesalahan saat validasi rekening",
      {}
    );
  }

  const accountName = validation.account_name;
  const aliasName = formatAliasName(ownerId.toString(), dto.bank);

  // Step 2: Jika belum ada beneficiary → create
  if (!owner.bank?.aliasName) {
    try {
      const result = await payoutCreator.createBeneficiaries({
        name: accountName,
        account: dto.account,
        bank: dto.bank,
        alias_name: aliasName,
        email: owner.email,
      });

      owner.bank = {
        bankCode: dto.bank,
        accountNumber: dto.account,
        accountName,
        aliasName,
      };
    } catch (error: any) {
      throw new ResponseError(
        error.httpStatusCode || 400,
        error.ApiResponse?.error_message || "Gagal membuat beneficiary",
        error.ApiResponse?.errors || {}
      );
    }
  } else {
    // Step 3: Jika sudah ada beneficiary → update
    try {
      await payoutCreator.updateBeneficiaries(owner.bank.aliasName, {
        name: accountName,
        account: dto.account,
        bank: dto.bank,
        alias_name: owner.bank.aliasName,
      });

      owner.bank = {
        ...owner.bank,
        bankCode: dto.bank,
        accountNumber: dto.account,
        accountName,
      };
    } catch (error: any) {
      throw new ResponseError(
        error.httpStatusCode || 400,
        error.ApiResponse?.error_message || "Gagal update beneficiary",
        error.ApiResponse?.errors || {}
      );
    }
  }

  await owner.save();
  return owner.bank;
};

export default {
  changePassword,
  getCurrent,
  updateProfile,
  getAllOwners,
  getAllTenants,
  getOwnerById,
  getTenantById,
  uploadProfile,
  getAvailableBanks,
  addBankAccount,
};
