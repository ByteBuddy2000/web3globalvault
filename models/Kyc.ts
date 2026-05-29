import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    documentType: { type: String, required: true }, // e.g., Passport, ID Card, Driver's License
    documentNumber: { type: String, required: true },
    documentImage: { type: String }, // URL or path to uploaded image
    selfieImage: { type: String }, // Selfie with document
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.KYC || mongoose.model("KYC", KYCSchema);