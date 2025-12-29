import express from 'express';
import mongoose from 'mongoose';
import carRoutes from './routes/carRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import Booking from './models/Bookings.js';
import Cars from './models/Cars.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/WeDrive';

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


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
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Check and update booking statuses every hour
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    console.log('Running booking status update check at', now);

    // 1️⃣ Approved → Ongoing
    await Booking.updateMany(
      {
        status: 'approved',
        startDate: { $lte: now },
        endDate: { $gt: now }
      },
      { $set: { status: 'ongoing' } }
    );

    // 2️⃣ Ongoing → Completed
    await Booking.updateMany(
      {
        status: 'ongoing',
        endDate: { $lt: now }
      },
      { $set: { status: 'completed' } }
    );

    // 3️⃣ Get cars with ongoing bookings
    const rentedCarIds = await Booking.distinct("carId", {
      status: "ongoing"
    });

    // 4️⃣ Set rented cars
    await Cars.updateMany(
      { carId: { $in: rentedCarIds } },
      { $set: { status: "rented" } }
    );

    // 5️⃣ Set available cars (no ongoing bookings)
    await Cars.updateMany(
      {
        carId: { $nin: rentedCarIds },
        status: "rented"
      },
      { $set: { status: "available" } }
    );

    console.log("Car statuses synced successfully");
  } catch (err) {
    console.error('Booking auto-update failed:', err);
  }
});

app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };