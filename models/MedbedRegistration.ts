import mongoose from "mongoose";

const MedbedRegistrationSchema = new mongoose.Schema({
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
    enum: ["pending_payment", "paid", "cancelled"],
    default: "pending_payment",
  },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
});

export default mongoose.models.MedbedRegistration ||
  mongoose.model("MedbedRegistration", MedbedRegistrationSchema);
