import { BaseRepository } from "../../core/base.repository";
import { IOwner, Owner } from "../owner/owner.model";
import { ITenant, Tenant } from "./tenant.model";
import { IUser, User } from "./user.model";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Tenant
  async createTenantProfile(data: Partial<ITenant>) {
    return await Tenant.create(data);
  }
  async updateTenantProfile(userId: string, data: Partial<ITenant>) {
    return await Tenant.findOneAndUpdate({ user: userId }, data, { new: true });
  }

  async findTenantByUser(userId: string) {
    return await Tenant.findOne({ user: userId });
  }

  // Owner
  async createOwnerProfile(data: Partial<IOwner>) {
    return await Owner.create(data);
  }
  async updateOwnerProfile(userId: string, data: Partial<IOwner>) {
    return await Owner.findOneAndUpdate({ user: userId }, data, { new: true });
  }

  async findBankAccountOwner(ownerId: string) {
    return await Owner.findOne({
      user: ownerId,
    });
  }

  async findOwnerByUser(userId: string) {
    return await Owner.findOne({ user: userId });
  }
}

export const userRepository = new UserRepository();
