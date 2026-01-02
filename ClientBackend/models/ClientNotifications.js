import mongoose from "mongoose";

const ClientNotificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: String, required: true },
    bookingId: { type: String },
    isRead: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("ClientNotification", ClientNotificationSchema);