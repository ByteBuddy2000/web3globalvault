import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardNumber: { type: String, required: true, unique: true },
  cardHolder: { type: String, required: true },
  cardType: { type: String, required: true, enum: ["VIRTUAL", "PHYSICAL"], default: "VIRTUAL" },
  validThru: { type: String, required: true },
  cvv: { type: String, required: true },
  tierLevel: { type: String, enum: ["BASIC", "SILVER", "GOLD", "PLATINUM"], default: "BASIC" },
  balance: { type: Number, default: 0 },
  dailyLimit: { type: Number, default: 5000 },
  monthlyLimit: { type: Number, default: 50000 },
  dailySpent: { type: Number, default: 0 },
  monthlySpent: { type: Number, default: 0 },
  status: { type: String, enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"], default: "PENDING" },
  
  /* ─── Payment & Verification Flow ─── */
  requestStatus: { type: String, enum: ["DRAFT", "PAYMENT_PENDING", "PAYMENT_RECEIVED", "ADMIN_APPROVED", "ADMIN_REJECTED"], default: "DRAFT" },
  paymentVerificationStatus: { type: String, enum: ["PENDING_APPROVAL", "APPROVED", "REJECTED"], default: "PENDING_APPROVAL" },
  
  /* ─── Payment Details ─── */
  paymentAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "USDT" },
  paymentCurrency: { type: String, default: "USDT", enum: ["USDT", "BNB", "ETH"] },
  usdtAddress: { type: String, default: "" }, // USDT wallet address for payment
  transactionHash: { type: String, default: "" }, // TX hash after payment
  transactionHashVerified: { type: Boolean, default: false },
  transactionVerifiedAt: { type: Date },
  
  /* ─── Admin Verification ─── */
  verificationNotes: { type: String, default: "" },
  rejectionReason: { type: String, default: "" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verificationDate: { type: Date },
  
  active: { type: Boolean, default: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Card || mongoose.model("Card", CardSchema);