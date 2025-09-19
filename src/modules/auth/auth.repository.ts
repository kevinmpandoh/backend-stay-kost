import { User, IUser } from "../user/user.model";

export class AuthRepository {
  findByEmail(email: string) {
    return User.findOne({ email });
  }
  findByEmailAndRole(email: string, role: string) {
    return User.findOne({ email, role });
  }
  createUser(data: Partial<IUser>) {
    return User.create(data);
  }
  async addRefreshToken(userId: string, token: string) {
    await User.findByIdAndUpdate(userId, { $push: { refreshTokens: token } });
  }
  async removeRefreshToken(userId: string, token: string) {
    await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } });
  }
}

export const authRepository = new AuthRepository();
