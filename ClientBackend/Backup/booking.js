import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    bookingid: String,
    renter: String,
    carid: String,
    startDate: String,
    endDate: String,
    pickupLocation: String,
    returnLocation: String,
    totalPrice: String,
    status: String,
    modifiedCount: { type: Number, default: 0 },
    history: [
        {
            changedAt: { type: Date, default: Date.now },
            previous: Object,
            updated: Object
        }
    ],
    transactions: [String]

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
