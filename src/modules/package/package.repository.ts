import { BaseRepository } from "../../core/base.repository";
import { IPackage, Package } from "./package.model";

export class PackagenRepository extends BaseRepository<IPackage> {
  constructor() {
    super(Package);
  }
}

export const packageRepository = new PackagenRepository();
