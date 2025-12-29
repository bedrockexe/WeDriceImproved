import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  model: String,
  year: String,
  transmission: String,
  fueltype: String,
  seatnumber: String,
  pricePerDay: String,
  imageUrl: [String],
  mainImage: String,
  features: [String],
  description: String,
  availability: String
}, { timestamps: true });

export default mongoose.model("Car", carSchema);
