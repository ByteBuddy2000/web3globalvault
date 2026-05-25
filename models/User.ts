import mongoose, { Document, Schema, Model } from "mongoose";

// ─── User Interface ───────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  accountNumber: string;
  balance: number;
  transactionLimit: number;
  accountStatus: "Active" | "Inactive" | "Suspended";
  accountAge: number;
  assets: mongoose.Types.ObjectId[];
  kycVerified: boolean;
  role: "user" | "admin";
  cards: mongoose.Types.ObjectId[];
  transactions: mongoose.Types.ObjectId[];
  investments: mongoose.Types.ObjectId[];
  loans: mongoose.Types.ObjectId[];
  address: string;
  phone: string;
  profileImage?: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── User Schema ──────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactionLimit: { type: Number, default: 100000 },
    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    accountAge: { type: Number, default: 0 },
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
    kycVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Investment" }],
    loans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loan" }],
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;