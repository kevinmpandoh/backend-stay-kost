import { packageRepository } from "./package.repository";

class PackageService {
  async getActivePackages() {
    return packageRepository.findAll({
      isActive: true,
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
