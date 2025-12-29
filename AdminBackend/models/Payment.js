import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
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

export default mongoose.model("Transaction", TransactionSchema);