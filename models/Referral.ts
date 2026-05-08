import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who sent the referral
  referredEmail: { type: String, required: true }, // Email of the referred person
  referredName: { type: String, default: "" }, // Name if provided
  status: { type: String, enum: ['Pending', 'Active', 'Completed', 'Rejected'], default: 'Pending' },
  reward: { type: Number, default: 0 }, // Reward amount in dollars
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }, // When referral was completed
  notes: { type: String, default: "" }, // Any additional notes
});

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);