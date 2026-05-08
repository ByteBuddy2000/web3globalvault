import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Plan info
  planName: { type: String, required: true },
  amount: { type: Number, required: true },

  // Asset used to invest
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  assetSymbol: { type: String },

  // Shares deducted at buy time
  sharesDeducted: { type: Number, default: 0 },
  assetPriceAtPurchase: { type: Number, default: 0 },

  // Investment timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  
  // Returns data
  expectedAnnualReturn: { type: Number, default: 0 },
  projectedReturns: { type: Number, default: 0 },

  // Withdrawal data
  status: { 
    type: String, 
    enum: ["Active", "Completed", "Cancelled", "Withdrawn"], 
    default: "Active" 
  },
  withdrawalDate: { type: Date },
  withdrawalPrice: { type: Number },
  currentValue: { type: Number },
  gains: { type: Number },
  gainPercentage: { type: Number },

  // Reference ID
  reference: { type: String },
  
}, { timestamps: true });

export default mongoose.models.Investment ||
  mongoose.model("Investment", InvestmentSchema);
