import mongoose from "mongoose";

const MedbedRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  color: { type: String, required: true },
  registrationId: { type: String, required: true, unique: true },
  amountXrp: { type: Number, required: true },
  receiverAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending_payment", "paid", "confirmed", "verified", "rejected"],
    default: "pending_payment",
  },
  paymentStatus: {
    type: String,
    enum: ["awaiting", "received", "confirmed"],
    default: "awaiting",
  },
  txHash: { type: String },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  verificationNotes: { type: String, default: "" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  verifiedAt: { type: Date },
});

export default mongoose.models.MedbedRegistration ||
  mongoose.model("MedbedRegistration", MedbedRegistrationSchema);
