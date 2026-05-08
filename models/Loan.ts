import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  term: { type: Number, required: true }, // in months
  interestRate: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'paid'], default: 'pending' },
  monthlyPayment: { type: Number, required: true },
  totalPayment: { type: Number, required: true },
  remainingBalance: { type: Number, required: true },
  approvedDate: { type: Date },
  nextPaymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);