import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
    carId: { type: String, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    transmission: { type: String, enum: ['manual', 'automatic'], required: true },
    fuelType: { type: String, required: true },
    seats: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    status: { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
    images: [String],
    mainImage: { type: String },
    features: [String],
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

CarSchema.pre("save", async function () {
  if (this.carId) return;
    const year = new Date().getFullYear();
    // Count existing cars for this year
    const count = await this.constructor.countDocuments({
        carId: { $regex: `^CAR-${year}-` } 
    });
    // Generate ID → e.g. CAR-2025-0001
    this.carId = `CAR-${year}-${String(count + 1).padStart(4, "0")}`;
});

export default mongoose.model("Car", CarSchema);