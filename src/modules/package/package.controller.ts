import { Request, Response } from "express";
import PackageService from "./package.service";

class PackageController {
  async getAll(req: Request, res: Response) {
    const packages = await PackageService.getAll();
    res.json({ data: packages });
  }
  async getAvailablePackages(req: Request, res: Response) {
    const packages = await PackageService.getAvailablePackages();
    res.json({ data: packages });
  }

  async getPackageById(req: Request, res: Response) {
    const pkg = await PackageService.getPackageById(req.params.id);
    res.json({ data: pkg });
  }

  async createPackage(req: Request, res: Response) {
    try {
      const pkg = await PackageService.createPackage(req.body);
      res.status(201).json({ message: "Package created", data: pkg });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async updatePackage(req: Request, res: Response) {
    try {
      const pkg = await PackageService.updatePackage(req.params.id, req.body);
      res.json({ message: "Package updated", data: pkg });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async deletePackage(req: Request, res: Response) {
    try {
      await PackageService.deletePackage(req.params.id);
      res.json({ message: "Package deleted" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default new PackageController();
