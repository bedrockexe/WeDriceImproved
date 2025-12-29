import express from "express";
import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/authentication.js";
import upload from "../config/multer.js";

const router = express.Router();

const JWT_SECRET = "bedrock";

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);

  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  return past.toLocaleDateString();
}

router.post("/create", adminAuth, async (req, res) => {
  try {
    const { adminid, name, email, password, role } = req.body;
    const newAdmin = new Admin({ adminid, name, email, password, role });
    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  } 
});

router.get("/me", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({
      authenticated: true,
      admin: admin,
    });
  } catch (error) {
    console.log("Error in /me route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }   

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax", //"strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successful", admin });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
});

router.post("/logout", (req, res) => {
  console.log("Logging out admin");
  res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.json({ message: "Logged out" });
});

router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const now = new Date();

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      bookingsLastMonthCount,
      bookingsThisMonthCount,
      pendingBookingsCount,
      ongoingBookingsCount,
      totalBookings,
      totalRevenueLastMonthAgg,
      totalRevenueThisMonthAgg,
    ] = await Promise.all([
      Booking.countDocuments({
        status: { $in: ["completed", "approved"] },
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),

      Booking.countDocuments({
        status: { $in: ["completed", "approved", "ongoing"] },
        createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth },
      }),

      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "ongoing" }),
      Booking.countDocuments(),

      Booking.aggregate([
        { $match: { status: { $in: ["completed", "approved"] }, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
      ]),

      Booking.aggregate([
        { $match: { status: { $in: ["completed", "approved"] }, createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const lastMonthRevenue = totalRevenueLastMonthAgg[0]?.totalRevenue || 0;
    const thisMonthRevenue = totalRevenueThisMonthAgg[0]?.totalRevenue || 0;

    const percentageChangeRevenue =
      lastMonthRevenue === 0
        ? thisMonthRevenue > 0 ? 100 : 0
        : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const formattedPercentage = `${percentageChangeRevenue.toFixed(1)}%`;

    const difference = bookingsThisMonthCount - bookingsLastMonthCount;

    return res.json({
      bookings: {
        value: totalBookings,
        change: difference >= 0 ? `+${difference} from last month` : `${difference} from last month`,
        verdict: difference >= 0 ? "positive" : "negative",
      },
      pendingBookings: {
        value: pendingBookingsCount,
        change: pendingBookingsCount > 0
          ? `${pendingBookingsCount} pending bookings`
          : "No pending bookings",
        verdict: pendingBookingsCount > 0 ? "negative" : "positive",
      },
      ongoingBookings: {
        value: ongoingBookingsCount,
        change: `${ongoingBookingsCount} ongoing bookings`,
        verdict: "neutral",
      },
      revenue: {
        value: thisMonthRevenue,
        change:
          percentageChangeRevenue >= 0
            ? `+${formattedPercentage} from last month`
            : `${formattedPercentage} from last month`,
        verdict: percentageChangeRevenue >= 0 ? "positive" : "negative",
      },
    });
  } catch (error) {
    console.error("[DASHBOARD_ERROR]", error);
    res.status(500).json({
      message: "Failed to load dashboard data",
      code: "DASHBOARD_FETCH_ERROR",
    });
  }
});

router.put("/profile", adminAuth, upload.none(), async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Update name
      if (req.body.name) {
        admin.name = req.body.name;
      }

      await admin.save();

      res.status(200).json({
        message: "Profile updated",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

router.put("/change-password", adminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const isMatch = currentPassword === admin.password;

      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      admin.password = newPassword;

      await admin.save();

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to change password" });
    }
  }
);

router.get("/notifications", adminAuth, async (req, res) => {
  try {
    console.log("Fetching notifications for admin");
    const notificationList = ["New booking received", "Booking Completed", "Booking Ongoing" ];
    const allowedStatuses = ["pending", "ongoing", "completed"];
    const bookings = await Booking.find({status: { $in: allowedStatuses }, trashed: false}).sort({ createdAt: -1 });
    const notifications = bookings.map(booking => {
      let action = "";
      let notificationText = "";
      let bookingId = booking.bookingId;
      if (booking.status === "pending") {
        action = "New booking received";
        notificationText = `${booking.customerName} requested a ${booking.carName} booking (BOOKING ID: ${bookingId})`;
      } else if (booking.status === "ongoing") {
        action = "Booking Ongoing";
        notificationText = `${booking.customerName}'s booking is now ongoing (BOOKING ID: ${bookingId})`;
      } else if (booking.status === "completed") {
        action = "Booking Completed";
        notificationText = `${booking.customerName}'s booking has been completed (BOOKING ID: ${bookingId})`;
      } else {
        action = "Booking Updated";
        notificationText = `Booking (BOOKING ID: ${bookingId}) status updated to ${booking.status}`;
      }
      return {
        action,
        notificationText,
        bookingId,
        unread: booking.unread,
        timeAgo: timeAgo(booking.updatedAt),
      };
    });

    res.status(200).json({ notifications });
  } catch (error) {
    
  }
});

router.get("/notifications/unread-count", adminAuth, async (req, res) => {
  try {
    const unreadCount = await Booking.countDocuments({ unread: true, trashed: false });
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch unread notifications count" });
  }
});

router.put("/notifications/mark-read/:bookingId", adminAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId: bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.unread = false;
    await booking.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

router.put("/notifications/mark-all-read", adminAuth, async (req, res) => {
  try {
    await Booking.updateMany({ unread: true }, { $set: { unread: false } });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
});

router.put("/notifications/mark-all-unread", adminAuth, async (req, res) => {
  try {
    await Booking.updateMany({ unread: false }, { $set: { unread: true } });
    res.status(200).json({ message: "All notifications marked as unread" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark all notifications as unread" });
  }
});

router.patch("/notifications/toggle-unread/:bookingId", adminAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId: bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.unread = !booking.unread;
    await booking.save();
    res.status(200).json({ message: "Notification unread status toggled", unread: booking.unread });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle notification unread status" });
  }
});

router.patch("/notifications/delete/:bookingId", adminAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId: bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.trashed = true;
    await booking.save();
    res.status(200).json({ message: "Booking moved to trash" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to move booking to trash" });
  }
});

export default router;