import mongoose from "mongoose";

const FBIComplaintSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  contactEmail: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.FBIComplaint ||
  mongoose.model("FBIComplaint", FBIComplaintSchema);
