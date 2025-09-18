import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "admin" | "owner" | "tenant";

export interface TenantProfile {
  gender?: "male" | "female" | "other";
  job?: string;
  otherJob?: string;
  birthDate?: Date;
  hometown?: string;
  emergencyContact?: string;
}
export interface OwnerProfile {
  bankAccountNumber?: string;
  bankName?: string;
  accountHolderName?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  role: Role;
  isVerified: boolean;
  refreshTokens: string[];
  googleId: string | null;
  tenantProfile?: TenantProfile;
  bank?: {
    bankCode: string; // contoh: "bni", "bca", "mandiri"
    accountNumber: string;
    accountName: string;
    aliasName: string; // ID dari Midtrans setelah createBeneficiaries
  };
  comparePassword(plain: string): Promise<boolean>;
}

const TenantSchema = new Schema<TenantProfile>(
  {
    gender: { type: String, enum: ["male", "female", "other"] },
    job: String,
    otherJob: String,
    birthDate: Date,
    hometown: String,
    emergencyContact: String,
  },

  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    role: {
      type: String,
      enum: ["admin", "owner", "tenant"],
      default: "tenant",
    },
    googleId: { type: String, unique: true, sparse: true }, // Tambahkan Google ID
    isVerified: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [] },
    tenantProfile: { type: TenantSchema },
    bank: {
      bankCode: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
      beneficiaryId: { type: String },
      aliasName: { type: String },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
