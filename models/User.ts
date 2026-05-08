import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactionLimit: { type: Number, default: 100000 },
  accountStatus: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  accountAge: { type: Number, default: 0 }, // in years
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
  kycVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // Reference to cards, transactions, and investments
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  investments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Investment" }],
  loans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loan" }],

  // Optional: profile image and other info
  address: { type: String, default: "" },
  phone: { type: String, default: "" },

  // Password reset fields
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);