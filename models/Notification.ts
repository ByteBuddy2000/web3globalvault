import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // 🔥 NEW: link to transaction
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },

    // optional categorization
    category: {
  type: String,
  enum: [
    "transaction",
    "investment",
    "withdrawal",
    "deposit",
    "kyc",
    "medbed",
    "card",
    "security",
    "system",
  ],
  default: "system",
},
    
    // 🔥 Link to card (for card-related notifications)
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);