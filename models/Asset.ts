import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  symbol: { type: String },
  name: { type: String },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },           // current market price (updated live)
  purchasePrice: { type: Number, default: 0 },   // price at time of purchase (locked in)
  pendingWithdrawal: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);