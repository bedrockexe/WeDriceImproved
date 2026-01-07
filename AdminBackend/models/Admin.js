import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    adminid: String,
    name: String,
    email: String,
    password: String,
    role: String,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);