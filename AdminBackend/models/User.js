import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
{
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    birthdate: { type: Date },
    licenseNumber: { type: String },
    licenseExpiry: { type: String },
    licenseImage: { type: String },
    licenseSelfie: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'unverified'], default: 'unverified' },
    verificationSubmittedAt: { type: Date },
    verifiedDate: { type: Date },
    rejectionReason: { type: String },
    totalSpent: { type: Number, default: 0 },
    bookings: [String],
    transactions: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true }
);

export default mongoose.model("User", UserSchema);

