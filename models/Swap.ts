import mongoose from "mongoose";

const SwapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔁 Assets
    fromAsset: {
      type: String,
      required: true, // BTC, ETH, AAPL
    },
    toAsset: {
      type: String,
      required: true, // AAPL, TSLA, BTC
    },

    // 🧠 Asset types
    fromType: {
      type: String,
      enum: ["Crypto", "Stock"],
      required: true,
    },
    toType: {
      type: String,
      enum: ["Crypto", "Stock"],
      required: true,
    },

    // 💱 Amounts
    fromAmount: {
      type: Number,
      required: true,
    },
    toAmount: {
      type: Number,
      required: true,
    },

    // 💵 Price snapshots (USD)
    fromPriceUSD: {
      type: Number,
      required: true,
    },
    toPriceUSD: {
      type: Number,
      required: true,
    },

    // 📊 Valuation
    usdValue: {
      type: Number,
      required: true,
    },
    feeUSD: {
      type: Number,
      default: 0,
    },

    // 📌 Status
    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },

    // 🔐 Metadata (optional but powerful)
    metadata: {
      ip: String,
      userAgent: String,
      note: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.models.Swap ||
  mongoose.model("Swap", SwapSchema);
