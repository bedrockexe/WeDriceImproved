import express from "express";
import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/authentication.js";
import upload from "../config/multer.js";
import User from "../models/User.js";
import AdminNotification from "../models/AdminNotifications.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
    const { email, password, rememberMe } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "1d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax", //"strict",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
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

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin with this email does not exist" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await admin.save();

    const resetUrl = `http://localhost:8080/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "joshuabalba@gmail.com",
        pass: "ghle cwzc ywuh hukc",
      },
    });

    await transporter.sendMail({
      to: admin.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <a href="${resetUrl}">Click here to reset your password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });
    res.status(200).json({ message: "Password reset email sent" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }

});

router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    if (!password) {
      return res.status(400).json({
        message: "Password must be provided",
      });
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    // const salt = await bcrypt.genSalt(10);
    // admin.password = await bcrypt.hash(password, salt);
    admin.password = password;

    // Clear reset fields
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    res.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
    const notifications = await AdminNotification.find({ isTrashed: false }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      bookingId: notification.bookingId,
      userId: notification.userId,
      timeAgo: timeAgo(notification.createdAt),
    }));

    res.status(200).json({ notifications: formattedNotifications });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

router.get("/notifications/unread-count", adminAuth, async (req, res) => {
  try {
    const unreadCount = await AdminNotification.countDocuments({ isRead: false, isTrashed: false });
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch unread notifications count" });
  }
});

router.put("/notifications/mark-read/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

router.put("/notifications/mark-all-read", adminAuth, async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
});

router.put("/notifications/mark-all-unread", adminAuth, async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: true }, { $set: { isRead: false } });
    res.status(200).json({ message: "All notifications marked as unread" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark all notifications as unread" });
  }
});

router.patch("/notifications/toggle-unread/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = !notification.isRead;
    await notification.save();
    res.status(200).json({ message: "Notification unread status toggled", unread: notification.isRead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle notification unread status" });
  }
});

router.patch("/notifications/delete/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isTrashed = true;
    await notification.save();
    res.status(200).json({ message: "Notification moved to trash" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to move notification to trash" });
  }
});

export default router;