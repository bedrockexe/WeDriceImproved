import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true },
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
    status: { type: String, enum: ['pending', 'approved', 'declined', 'completed', 'cancelled', 'ongoing'], default: 'pending' },
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

BookingSchema.pre("save", async function () {
  if (this.bookingId) return;

  const year = new Date().getFullYear();

  // Atomically increment the counter
  const counter = await Counter.findByIdAndUpdate(
    `booking-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // creates document if it doesn't exist
  );

  this.bookingId = `BKG-${year}-${String(counter.seq).padStart(4, "0")}`;
});


export default mongoose.model("Booking", BookingSchema);