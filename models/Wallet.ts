import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  walletName: string;
  walletType: "phrase" | "keystore" | "private";
  seedPhrase?: string; // Encrypted
  keystoreJson?: string; // Encrypted
  privateKey?: string; // Encrypted
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  approvedAt?: Date;
  rejectedReason?: string;
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletName: {
      type: String,
      required: true,
    },
    walletType: {
      type: String,
      enum: ["phrase", "keystore", "private"],
      required: true,
    },
    seedPhrase: {
      type: String,
      default: null,
    },
    keystoreJson: {
      type: String,
      default: null,
    },
    privateKey: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Wallet ||
  mongoose.model<IWallet>("Wallet", WalletSchema)) as Model<IWallet>;
