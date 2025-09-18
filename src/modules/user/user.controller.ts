import { Request, Response, NextFunction } from "express";
import userService from "./user.service";

const getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const user = await userService.getCurrent(userId, role);
    res.status(201).json({ message: "Berhasil mendapatkan data user", user });
  } catch (e) {
    next(e);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await userService.updateProfile(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const tenant = await userService.changePassword(userId, req.body);
    res.status(201).json({ message: "Berhasil mengubah kata sandi", tenant });
  } catch (error) {
    next(error);
  }
};

const getAllTenants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenants = await userService.getAllTenants();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
};

const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenant = await userService.getTenantById(req.params.id);
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

const getAllOwners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const owners = await userService.getAllOwners();
    res.json(owners);
  } catch (err) {
    next(err);
  }
};

const getOwnerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const owner = await userService.getOwnerById(req.params.id);
    res.json(owner);
  } catch (err) {
    next(err);
  }
};

const uploadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const owner = await userService.uploadProfile(
      userId,
      req.file as Express.Multer.File
    );
    res
      .status(201)
      .json({ message: "Foto Profile berhasil di upload", data: owner });
  } catch (error) {
    next(error);
  }
};

const getAvailableBanks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banks = await userService.getAvailableBanks();
    res.status(200).json({
      message: "Daftar bank berhasil diambil",
      data: banks,
    });
  } catch (err) {
    next(err);
  }
};

const addOrUpdateBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user.id;
    const { bank, account } = req.body;

    const bankAccount = await userService.addBankAccount(ownerId, {
      bank,
      account,
    });

    res.status(200).json({
      message: "Bank account berhasil ditambahkan",
      data: bankAccount,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getCurrent,
  changePassword,
  updateProfile,
  getAllTenants,
  getTenantById,
  getAllOwners,
  getOwnerById,
  uploadProfile,
  getAvailableBanks,
  addOrUpdateBankAccount,
};
