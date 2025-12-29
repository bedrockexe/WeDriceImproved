import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { auth } from './middleware.js';
import Car from './cars.js';
import Users from './Users.js';
import Booking from './booking.js';
import Payment from './payment.js';
import cloudinary from './config/cloudinary.js';
import multer from "multer";
import bcrypt from 'bcryptjs';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/WeDrive';
const JWT_SECRET = process.env.JWT_SECRET || 'Bedrock';

app.use(cors({
  origin: ["http://localhost:5173", "https://we-drive-frontend.vercel.app"],
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Functions
// Format Date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
// Generate random booking ID
function generateBookingID() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BK-${y}${m}${d}-${random}`;
}

// Upload to Cloudinary
const uploadToCloudinary = (fileBuffer, foldername) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: foldername },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
// Connect to MongoDB

// Routes Under Users
// Get current logged in user
app.get("/api/currentuser", auth, async (req, res) => {
  console.log("Current User Endpoint Invoked");
  try {
    // console.log("Fetching user with ID:", req.user.userId);
    const user = await Users.findById(req.user.userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.log("Error fetching current user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  const { username, firstName, lastName, email, phone, password } = req.body;

  try {
    if (email) {
      const existing = await Users.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
    }

    if (username) {
      const existing = await Users.findOne({ username });
      if (existing) return res.status(400).json({ message: 'Username already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed Password: ${hashedPassword}`);

    const newUser = new Users({
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      username: username,
      address: "",
      licenseNumber: "",
      licenseImage: "",
      verificationStatus: "unverified",
      refreshToken: "",
      lastLogin: "",
      totalSpent: "0",
      rentals: []
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    });

    return res.status(201).json({ message: 'Registered successfully!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userLogin = await Users.findOne({
      $or: [{ email }, { username: email }]
    });

    console.log(`User Login: ${userLogin}`);
    console.log(`Received Email or Username: ${email}`)


    if (!userLogin) return res.status(401).json({ message: 'Wrong Email/Username or Password' });

    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong Email/Username or Password" });

    const token = jwt.sign({ userId: userLogin._id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,         // REQUIRED for HTTPS
      sameSite: "none",     // REQUIRED for cross-site cookies
      maxAge: 1000 * 60 * 60
    });

    res.json({ message: "Logged in!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }

});

// Update User Profile
app.post("/api/update", auth, async (req, res) => {
  try {
    // Update the user
    const updatedUser = await Users.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Change User Password
app.put("/api/user/changepassword", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    console.log(`Change Passord Invoked with user id:${userId}`)

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(`Matched?: ${isMatch}`)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Prevent same password reuse
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({ message: "New password must be different from old password" });
    }
      

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
})

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Routes Under Cars
// Get all cars
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await Car.find().select("-__v");

    return res.json({
      cars
    });
  } catch (err) {
    console.error("Error fetching cars:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get car by ID
app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json({ car });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Routes Under Bookings
// Add Booking
app.post("/api/book", async (req, res) => {
  try {
    const { renter, carid, startDate, endDate, pickupLocation, returnLocation } = req.body;
    console.log("Booking request received:", req.body);

    if (!renter || !carid || !startDate || !endDate || !pickupLocation || !returnLocation) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await Users.findById(renter);
    if (!user) return res.status(404).json({ message: "User not found" });

    const car = await Car.findById(carid);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Calculate days
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (eDate <= sDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const days = Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24));
    const totalPrice = (days * car.pricePerDay).toString();

    // ✔ Generate custom booking ID
    const bookingid = generateBookingID();

    // Create booking
    const newBooking = new Booking({
      bookingid,
      renter,
      carid,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      totalPrice,
      status: "Pending",
    });

    await newBooking.save();

    // ✔ Save REAL booking _id into user's rentals
    user.rentals.push(newBooking._id.toString());
    await user.save();


    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get booking by id
app.get("/api/booking/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    res.json({ booking });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all bookings of a car
app.get("/api/car/bookings/:carId", auth, async (req, res) => {
  const { carId } = req.params;
  try {
    const bookings = await Booking.find({ carid: carId }).sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching car bookings:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all the bookings of a car other than the one being modified
app.get("/api/car/modifybookings/:bookingId", auth, async (req, res) => {
  console.log("Modify Booking Endpoint Called")
  const { bookingId } = req.params;
  console.log(`Booking ID Received: ${bookingId}`)
  try {
    const currentBooking = await Booking.findById(bookingId)

    if (!currentBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const allBookings = await Booking.find({ carid: currentBooking.carid, bookingid: { $ne: currentBooking.bookingid }}).sort({ createdAt: -1 });
    return res.status(200).json({ allBookings });
  } catch (err) {
    console.error("Error fetching car bookings:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Modify the current booking
app.put("/api/booking/modify/:bookingId", auth, upload.array("proofOfPayment", 1), async (req, res) => 
  {
    console.log("Modify Booking Endpoint Invoked");

    try {
      const {
        startDate,
        endDate,
        pickupLocation,
        returnLocation,
        amount,
        paymentMethod
      } = req.body;

      const { bookingId } = req.params;
      const files = req.files || [];

      /* =========================
         1. LOAD USER & BOOKING
      ========================== */
      const user = await Users.findById(req.user.userId).select("-password -__v");
      const booking = await Booking.findById(bookingId);

      console.log(`Current User Fetched: ${user}`)

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // if (booking.user !== user._id) {
      //   return res.status(403).json({ message: "Unauthorized" });
      // }

      /* =========================
         2. BUSINESS RULES
      ========================== */

      // Cannot modify after pickup date
      if (new Date() >= new Date(booking.startDate)) {
        return res.status(400).json({
          message: "Booking can no longer be modified after pickup date"
        });
      }

      // Limit modifications
      if (booking.modifiedCount >= 3) {
        return res.status(400).json({
          message: "Maximum modification limit reached"
        });
      }

      // Validate dates
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      if (newStart >= newEnd) {
        return res.status(400).json({ message: "Invalid rental dates" });
      }

      /* =========================
         3. CHECK AVAILABILITY
      ========================== */
      const conflictingBookings = await Booking.find({
        carid: booking.carid,
        _id: { $ne: bookingId },
        status: { $in: ["Pending", "Confirmed", "Modified"] }
      });

      for (const b of conflictingBookings) {
        const overlap =
          newStart < new Date(b.endDate) &&
          newEnd > new Date(b.startDate);

        if (overlap) {
          return res.status(400).json({
            message: "Selected dates conflict with another booking"
          });
        }
      }

      /* =========================
         4. SAVE PREVIOUS STATE
      ========================== */
      const previous = {
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocation: booking.pickupLocation,
        returnLocation: booking.returnLocation,
        totalPrice: booking.totalPrice
      };

      /* =========================
         5. OPTIONAL PAYMENT
      ========================== */
      let paymentRecord = null;

      if (files.length > 0) {
        const folder = `${user._id}/payment_proofs`;

        const uploaded = await Promise.all(
          files.map(file => uploadToCloudinary(file.buffer, folder))
        );

        paymentRecord = new Payment({
          user: user._id,
          car: booking.carid,
          booking: bookingId,
          amount: Number(amount),
          paymentMethod,
          paymentProof: uploaded[0],
          status: "Pending",
          date: new Date()
        });

        await paymentRecord.save();

        // Update user payment history
        await Users.findByIdAndUpdate(user._id, {
          $inc: { totalSpent: Number(amount) },
          $push: { paymentHistory: paymentRecord._id }
        });
      }

      /* =========================
         6. UPDATE BOOKING (ONCE)
      ========================== */
      booking.startDate = startDate;
      booking.endDate = endDate;
      booking.pickupLocation = pickupLocation;
      booking.returnLocation = returnLocation;
      booking.totalPrice = amount;
      booking.status = "Pending";
      booking.modifiedCount += 1;
      booking.updatedAt = new Date();

      booking.history.push({
        previous,
        updated: {
          startDate,
          endDate,
          pickupLocation,
          returnLocation,
          totalPrice: amount
        },
        changedAt: new Date()
      });

      if (paymentRecord) {
        booking.transactions.push(paymentRecord._id);
      }

      await booking.save();

      return res.json({
        message: "Booking modified successfully",
        booking
      });

    } catch (err) {
      console.error("Modify booking error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Routes Under Transactions

// Create Payment
app.post("/api/payments/create", auth, upload.array("proofOfPayment", 1), async (req, res) => {
  try {
    const { userId, carId, bookingId, amount, paymentMethod, status } = req.body;
    const user = await Users.findById(req.user.userId).select("-password -__v");
    const proofOfPayment = req.files || [];
    const foldername = `${user._id}/payment_proofs`;
    const uploadedImages = await Promise.all(
      proofOfPayment.map(file =>
        uploadToCloudinary(file.buffer, foldername)
      )
    );

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create payment record
    const newPayment = new Payment({
      user: userId,
      car: carId,
      booking: bookingId,
      amount: amount,
      date: new Date().toISOString(),
      paymentMethod: paymentMethod,
      paymentProof: uploadedImages[0] || "",
      status: status || "Completed"
    });

    await newPayment.save();

    await Users.findByIdAndUpdate(userId, {
      $inc: { totalSpent: Number(amount) }
    });

    await Users.findByIdAndUpdate(userId, {
      $push: { paymentHistory: newPayment._id }
    });

    booking.transactions.push(newPayment._id)
    await booking.save();

    return res.status(201).json({
      message: "Payment saved successfully",
      payment: newPayment
    });

  } catch (err) {
    console.error("Payment create error:", err);
    return res.status(500).json({ message: err.message });
  }
});
// Get Payments by User ID
app.get("/api/payments/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all payments for user (sorted newest first)
    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

    let counter = 1; // auto-generate id from 1

    const formatted = [];

    // Process each payment
    for (const p of payments) {
      
      // Get car brand & model
      const car = await Car.findById(p.car);
      const carName = car ? `${car.brand} ${car.model}` : "Unknown Car";

      // Get booking
      const booking = await Booking.findById(p.booking);
      const bookingId = booking ? booking.bookingid || booking._id : "Unknown Booking";

      formatted.push({
        id: counter++, // Auto increment
        bookingId: bookingId,
        carName: carName,
        date: formatDate(p.date),
        amount: Number(p.amount),
        status: p.status,
        paymentMethod: p.paymentMethod,
        transactionId: p.paymentId // The TXN-2025-0001 style ID
      });
    }

    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Get user payments error:", err);
    return res.status(500).json({ message: err.message });
  }
});

app.get("/api/payments/:bookingId", auth, async (req, res) => {
  try {
    console.log(`Received booking id: ${req.params.bookingId}`)
    const payment = await Payment.findOne({booking: req.params.bookingId})
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    return res.json({payment});

  } catch (err) {
    console.error("Payment lookup error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Upload License Image
app.post(
  "/api/verify/:id",
  auth,
  upload.array("images", 2),
  async (req, res) => {
    try {
      const { address, licenseNumber, birthdate, licenseExpiry } = req.body;
      const userId = req.params.id;

      const imageFiles = req.files || [];
      if (imageFiles.length !== 2) {
        return res.status(400).json({ message: "Please upload 2 images" });
      }

      const user = await Users.findById(userId).select("-password -__v");
      if (!user) return res.status(404).json({ message: "User not found" });

      const foldername = `${user._id}/verification`;

      const uploadedImages = await Promise.all(
        imageFiles.map(file =>
          uploadToCloudinary(file.buffer, foldername)
        )
      );

      user.address = address || user.address;
      user.licenseNumber = licenseNumber || user.licenseNumber;
      user.licenseImages = user.licenseImages || [];
      user.licenseImages.push(...uploadedImages);
      user.birthdate = birthdate || user.birthdate;
      user.licenseExpiry = licenseExpiry || user.licenseExpiry;
      user.verificationSubmitted = new Date().toISOString();
      user.verificationStatus = "pending";

      await user.save();

      return res
        .status(200)
        .json({ message: "Verification documents uploaded successfully!" });
    } catch (err) {
      console.error("Verification upload error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);





app.listen(PORT, () => {
  console.log(`Server running...`);
});
