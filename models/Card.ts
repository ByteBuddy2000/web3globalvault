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
  status: { type: String, enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"], default: "ACTIVE" },
  active: { type: Boolean, default: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Card || mongoose.model("Card", CardSchema);