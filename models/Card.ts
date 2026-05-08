import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardNumber: { type: String, required: true, unique: true },
  cardHolder: { type: String, required: true },
  cardType: { type: String, required: true },
  validThru: { type: String, required: true },
  active: { type: Boolean, default: true },
});

export default mongoose.models.Card || mongoose.model("Card", CardSchema);