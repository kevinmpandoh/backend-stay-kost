import { packageRepository } from "./package.repository";

class PackageService {
  async getAll() {
    return packageRepository.findAll();
  }
  async getAvailablePackages() {
    return packageRepository.findAll({
      isActive: true,
      type: { $ne: "free" },
    });
  }

  async getPackageById(id: string) {
    return packageRepository.findById(id);
  }

  async createPackage(data: any) {
    return packageRepository.create(data);
  }

  async updatePackage(id: string, data: any) {
    return packageRepository.updateById(id, data);
  }

  async deletePackage(id: string) {
    return packageRepository.deleteById(id);
  }
}

export default new PackageService();
