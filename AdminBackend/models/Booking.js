import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    renterId: { type: String, required: true },
    carId: { type: String, required: true },
    carName: { type: String, required: true },
    customerName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pickupLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    unread: { type: Boolean, default: true },
    trashed: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'declined', 'completed', 'canceled', 'ongoing'], default: 'pending' },
    declineReason: { type: String },
    modifiedCount: { type: Number, default: 0 },
    history: [
        {
            changedAt: { type: Date, default: Date.now },
            previous: Object,
            updated: Object
        }
    ],
    transactions: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);