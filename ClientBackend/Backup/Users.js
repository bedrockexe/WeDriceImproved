import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    email: { type: String, unique: true, sparse: true },
    phone: String,
    password: String,
    address: String,
    birthdate: String,
    licenseNumber: String,
    licenseImages: [String],
    licenseExpiry: String,
    verificationStatus: String,
    verificationSubmitted: String,
    verifiedDate: String,
    reasonForRejection: String,
    totalSpent: {
        type: Number,
        default: 0
    },
    rentals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        }
    ],
    paymentHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment"  
        }
    ]
}, { timestamps: true });

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
