import mongoose, { Schema, Document } from 'mongoose';

interface IContribution {
  _id?: string;
  amount: number;
  frequency?: 'one-time' | 'monthly' | 'yearly';
  createdAt?: Date;
  status?: string;
}

interface IK401k extends Document {
  userId: mongoose.Types.ObjectId;
  totalBalance: number;
  target?: number;
  projected?: number;
  contributions: IContribution[];
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['one-time', 'monthly', 'yearly'],
    default: 'one-time',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'Completed',
  },
});

const K401kSchema = new Schema<IK401k>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      default: 0,
    },
    projected: {
      type: Number,
      default: 0,
    },
    contributions: [ContributionSchema],
  },
  { timestamps: true }
);

const K401k = mongoose.models.K401k || mongoose.model<IK401k>('K401k', K401kSchema);

export default K401k;
