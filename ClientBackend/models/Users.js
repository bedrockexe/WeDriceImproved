import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Counter } from "./Counter.js";

const UserSchema = new mongoose.Schema(
{
    userId: { type: String, unique: true },
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

UserSchema.pre("save", async function () {
  // Hash password if modified
  if (!this.isModified("password")) return;

  // Only generate userId if it doesn't exist
  if (!this.userId) {
    const year = new Date().getFullYear();

    const counter = await Counter.findByIdAndUpdate(
      `user-${year}`,
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // creates the document if it doesn't exist
    );

    this.userId = `USR-${year}-${String(counter.seq).padStart(4, "0")}`;
    this.password = bcrypt.hash(this.password, 10);
  }
});

export default mongoose.model("User", UserSchema);

