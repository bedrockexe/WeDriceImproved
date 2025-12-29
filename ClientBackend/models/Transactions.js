import mongoose from 'mongoose';
import { Counter } from './Counter.js';

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true },
    userId: { type: String, required: true },
    bookingId: { type: String, required: true },
    carId: { type: String, required: true },
    carName: { type: String, required: true },
    customerName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    transactionType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, required: true },
    paymentProof: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

TransactionSchema.pre("save", async function () {
  if (this.transactionId) return;

  const year = new Date().getFullYear();

  // Atomically increment the counter
  const counter = await Counter.findByIdAndUpdate(
    `transaction-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // creates document if it doesn't exist
  );

  this.transactionId = `TXN-${year}-${String(counter.seq).padStart(4, "0")}`;
});

export default mongoose.model("Transaction", TransactionSchema);