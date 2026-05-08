import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentType: { type: String, required: true }, // e.g., Passport, ID Card, Driver's License
  documentNumber: { type: String, required: true },
  documentImage: { type: String }, // URL or path to uploaded image
  status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  remarks: { type: String, default: "" },
});

export default mongoose.models.KYC || mongoose.model("KYC", KYCSchema);