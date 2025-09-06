import bcrypt from "bcryptjs";
import { UserRepository, userRepository } from "./user.repository";
import { ResponseError } from "@/utils/response-error.utils";
import { uploadToCloudinary } from "@/utils/upload.utils";
import cloudinary from "@/config/cloudinary";
import { payoutCreator } from "@/config/midtrans";
import { formatAliasName } from "@/utils/generateAliasName";

const getCurrent = async (userId: string, role: string) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found");

  let profile = null;
  if (role === "tenant") {
    profile = await userRepository.findTenantByUser(userId);
  } else if (role === "owner") {
    profile = await userRepository.findOwnerByUser(userId);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile,
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

const updateProfile = async (userId: string, role: string, payload: any) => {
  const userUpdate: any = {};
  if (payload.name) userUpdate.name = payload.name;
  if (payload.phone) userUpdate.phone = payload.phone;

  await userRepository.updateById(userId, userUpdate);

  if (role === "tenant") {
    await userRepository.updateTenantProfile(userId, {
      gender: payload.gender,
      kotaAsal: payload.kotaAsal,
      emergencyContact: payload.emergencyContact,
      pekerjaan: payload.pekerjaan,
      fotoKTP: payload.fotoKTP,
    });
  } else if (role === "owner") {
    await userRepository.updateOwnerProfile(userId, {
      bankAccount: payload.bankAccount,
      bankName: payload.bankName,
    });
  }

  return getCurrent(userId, role);
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
  return userRepository.findAll();
};

const getTenantById = async (id: string) => {
  return userRepository.findTenantByUser(id);
};

const getAllOwners = async () => {
  return userRepository.findAll();
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
  return banks.beneficiary_banks;
};

const addBankAccount = async (ownerId: string, dto: BankAccountDTO) => {
  const owner = await userRepository.findById(ownerId);
  if (!owner) throw new ResponseError(404, "Owner not found");
  if (owner.role !== "owner")
    throw new ResponseError(404, "User is not an owner");

  if (dto.bank === "gopay") {
    // account harus nomor hp diawali 62
    if (!dto.account.startsWith("62")) {
      throw new ResponseError(400, "Nomor GoPay harus diawali 62");
    }
  }

  if (dto.bank === "ovo") {
    // untuk OVO harus ditambah prefix 8066
    if (!dto.account.startsWith("8066")) {
      dto.account = "8066" + dto.account;
    }
  }

  // Step 1: Validasi nomor rekening
  const validation = await payoutCreator.validateBankAccount({
    bank: dto.bank,
    account: dto.account,
  });

  console.log(validation, "VALIDASI");

  if (!validation || validation.error_message) {
    throw new ResponseError(
      400,
      validation?.error_message || "Bank account validation failed"
    );
  }

  const accountName = validation.account_name;
  // const aliasName = validation.id;
  const aliasName = formatAliasName(ownerId.toString(), dto.bank);

  console.log(owner, "OWNERNYA");

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
      console.log(result);

      owner.bank = {
        bankCode: dto.bank,
        accountNumber: dto.account,
        accountName,
        aliasName,
      };
    } catch (error: any) {
      throw new ResponseError(
        error.httpStatusCode || 400,
        error.ApiResponse.error_message,
        error.ApiResponse.errors
      );
    }
  }
  // Step 3: Jika sudah ada beneficiary → update
  else {
    await payoutCreator.updateBeneficiaries(owner.bank.aliasName, {
      name: accountName,
      account: dto.account,
      bank: dto.bank,
      alias_name: owner.bank?.aliasName,
    });

    owner.bank = {
      ...owner.bank,
      bankCode: dto.bank,
      accountNumber: dto.account,
      accountName,
    };
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
