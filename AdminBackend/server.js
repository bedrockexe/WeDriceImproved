import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import carRoutes from "./routes/carRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import adminAuth from "./middleware/authentication.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  })
);

mongoose
  .connect('mongodb://localhost:27017/WeDrive')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/cars", adminAuth, carRoutes);
app.use("/api/users", adminAuth, userRoutes);
app.use("/api/bookings", adminAuth, bookingRoutes);
app.use("/api/payments", adminAuth, paymentRoutes);
app.use("/api/admin", adminRoutes);
app.listen(5001, () => console.log("Server running on port 5001"));
