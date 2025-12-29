import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true
    },
    user: String,
    car: String,
    booking: String,
    amount: String,
    date: String,
    status: String,
    paymentMethod: String,
    paymentProof: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });


paymentSchema.pre("save", async function (next) {
  if (this.paymentId) return next();

  const year = new Date().getFullYear();

  // Count existing payments for this year
  const count = await this.constructor.countDocuments({
    paymentId: { $regex: `^TXN-${year}-` }
  });

  // Generate ID → e.g. TXN-2025-0001
  this.paymentId = `TXN-${year}-${String(count + 1).padStart(4, "0")}`;

  next();
});


export default mongoose.model("Payment", paymentSchema);
