// Transaction.ts
import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Deposit", "Withdraw", "Investment", "Dividend"], required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  feeLabel: { type: String, default: "" },
  youReceive: { type: Number },
  feePaid: { type: Boolean, default: false },
  status: { type: String, enum: ["Pending", "Approved", "Declined", "Completed", "Failed"], default: "Pending" },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  details: { type: String, default: "" },
  // Withdrawal-specific fields
  coin: { type: String },
  network: { type: String },
  walletAddress: { type: String },
  // Bank transfer-specific fields
  bankName: { type: String },
  accountNumber: { type: String },
});
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);