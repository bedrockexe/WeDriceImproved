import express from 'express';
import Users from '../models/Users.js';
import { auth } from '../middleware/authentication.js';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import ClientNotifications from '../models/ClientNotifications.js';
import AdminNotifications from '../models/AdminNotifications.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { io } from '../index.js';
import Bookings from '../models/Bookings.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const JWT_SECRET = 'Bedrock';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "joshuabalba@gmail.com",
    pass: "ghle cwzc ywuh hukc",
  },
});

// Helper function to upload to Cloudinary
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

router.post('/test', (req, res) => {
  io.emit("new-notification", {
    userId: "testuser",
    message: `New user created: testuser`,
    bookingId: null,
    type: "user"
  });
}); 

// Get Current User
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Users.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.log('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Log in User
router.post('/login', async (req, res) => {
    console.log('User login attempt');
    const { email, password, rememberMe } = req.body;
    console.log(`Received Login Credentials: Email/Password: ${email} / ${password}`);

    try {
        const userLogin = await Users.findOne({
          $or: [{ email }, { username: email }]
        });
    
        if (!userLogin) {
          console.log('User not found with provided email/username');
          return res.status(401).json({ message: 'Wrong Email/Username or Password' });
        } 
    
        const isMatch = await bcrypt.compare(password, userLogin.password);

        if (!isMatch) {
          console.log('Password mismatch for user:', email);
          return res.status(401).json({ message: "Wrong Email/Username or Password" });
        }

        if (!userLogin.isEmailVerified) {
          return res.status(403).json({
            message: "Please verify your email before logging in"
          });
        }
    
        const token = jwt.sign({ id: userLogin._id }, JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1d" });
    
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, 
          sameSite: "lax", 
          maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24
        });
    
        res.json({ message: "Logged in!" });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
      }


});

// Register User
router.post('/register', async (req, res) => {
    console.log('User registration attempt');
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
        const emailToken = crypto.randomBytes(32).toString("hex");
    
        const newUser = new Users({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phone,
          password: hashedPassword,
          username: username,
          address: "",
          licenseNumber: "",
          licenseImage: "",
          licenseSelfie: "",
          birthdate: "",
          bookings: [],
          transactions: [],
          emailVerificationToken: emailToken,
          emailVerificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
    
        await newUser.save();
    
        // const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });
    
        // res.cookie("token", token, {
        //   httpOnly: true,
        //   secure: false,
        //   sameSite: "lax", 
        //   maxAge: 1000 * 60 * 60
        // });

        const resetUrl = `http://localhost:5173/verify-email?token=${emailToken}`;

        await transporter.sendMail({
          to: newUser.email,
          subject: "Verify your Car Rental account",
          html: `
            <h2>Verify your email</h2>
            <p>Click the link below to activate your account:</p>
            <a href="${resetUrl}">Verify Email</a>
          `
        });
    
        return res.status(201).json({ message: 'Registered successfully!' });
    
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
      }
});

// Verify Email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  const user = await Users.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;

  await user.save();

  res.json({ message: "Email verified successfully" });
});


// Update User
router.put('/me', auth, async (req, res) => {
    console.log('Updating user data');
    try {
        const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
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
    } catch (error) {
        console.log('Error updating user:', error);
        return res.status(500).json({ success: false, message: "Server error" });
    }

});

// Update User Password
router.patch('/me', auth, async (req, res) => {
    console.log('Updating user password');
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
    
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        const user = await Users.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });
    
        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
    
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
});

// Log out User
router.post('/logout', auth, (req, res) => {
    console.log('User logout attempt');
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,         // REQUIRED for HTTPS
        sameSite: "none"      // REQUIRED for cross-site cookies
    });
    res.json({ message: 'Logged out successfully' });
});

// Verify User Authentication
router.post('/verify', auth, upload.fields([{ name: 'licenseImage', maxCount: 1 }, { name: 'licenseSelfie', maxCount: 1 }]), async (req, res) => {
  console.log('User verification attempt');
  console.log(`Current user ID: ${req.user.id}`);
  try {
    const { address, licenseNumber, birthdate, licenseExpiry } = req.body;
    const userId = req.user.id;
    if (!req.files || !req.files['licenseImage'] || !req.files['licenseSelfie']) {
      return res.status(400).json({ message: "Please upload both license image and selfie" });
    }
    const user = await Users.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    const foldername = `${user.userId}/verification`;
    const imageFile = req.files['licenseImage'][0];
    const selfieFile = req.files['licenseSelfie'][0];

    const [licenseUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(imageFile.buffer, foldername),
        uploadToCloudinary(selfieFile.buffer, foldername)
    ]);

    user.address = address || user.address;
    user.licenseNumber = licenseNumber || user.licenseNumber;
    user.birthdate = birthdate || user.birthdate;
    user.licenseExpiry = licenseExpiry || user.licenseExpiry;
    user.licenseImage = licenseUrl || user.licenseImage;
    user.licenseSelfie = selfieUrl || user.licenseSelfie;
    user.verificationSubmittedAt = new Date();
    user.verificationStatus = 'pending';
    user.rejectionReason = '';
    await user.save();

    io.emit("new-notification", {
      userId: user.userId,
      message: `New user created: ${user.userId}`,
      bookingId: null,
      type: "user"
    });

    const adminNotification = new AdminNotifications({
        title: "New User Verification",
        message: `User ${user.firstName} ${user.lastName} has submitted verification documents.`,
        userId: user.userId,
        type: "verification"
    });

    await adminNotification.save();

    const clientNotification = new ClientNotifications({
        title: "Verification Submitted",
        message: "Your verification documents have been submitted and are pending review.",
        userId: user.userId,
        type: "verification"
    });

    await clientNotification.save();


    res.json({ message: "Verification submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      // Security: do NOT reveal if email exists
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // 1️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3️⃣ Save to DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 4️⃣ Reset link
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 5️⃣ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "joshuabalba@gmail.com",
        pass: "ghle cwzc ywuh hukc",
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <a href="${resetUrl}">Click here to reset your password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user
    const user = await Users.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Notification Routes
router.get('/notifications', auth, async (req, res) => {
  try {
    console.log("Fetching notifications for user");
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = await ClientNotifications.find({ userId: user.userId, isTrashed: false }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      isTrashed: notification.isTrashed,
      bookingId: notification.bookingId,
      createdAt: notification.createdAt,
      timeAgo: timeAgo(notification.createdAt)
    }));
    
    res.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = await Users.findById(req.user.id).then(user => user.userId);

    const notification = await ClientNotifications.findOne({ _id: notificationId, userId: userId, isTrashed: false });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch('/notifications/:id/unread', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = await Users.findById(req.user.id).then(user => user.userId);

    const notification = await ClientNotifications.findOne({ _id: notificationId, userId: userId, isTrashed: false });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = false;
    await notification.save();

    res.json({ message: "Notification marked as unread" });
  } catch (error) {
    console.error("Error marking notification as unread:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch('/notifications/:id/trash', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = await Users.findById(req.user.id).then(user => user.userId);

    const notification = await ClientNotifications.findOne({ _id: notificationId, userId: userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isTrashed = true;
    await notification.save();

    res.json({ message: "Notification moved to trash" });
  } catch (error) {
    console.error("Error trashing notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put('/notifications/mark-all-read', auth, async (req, res) => {
  try {
    const userId = await Users.findById(req.user.id).then(user => user.userId);

    await ClientNotifications.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put('/notifications/mark-all-unread', auth, async (req, res) => {
  try {
    const userId = await Users.findById(req.user.id).then(user => user.userId);

    await ClientNotifications.updateMany(
      { userId: userId, isRead: true },
      { $set: { isRead: false } }
    );

    res.json({ message: "All notifications marked as unread" });
  } catch (error) {
    console.error("Error marking all notifications as unread:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete the user soft delete
router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    console.log(`Account deletion request for user ID: ${userId}`);

    // 1. Find user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Confirm password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 3. Check active rentals
    const activeBooking = await Bookings.findOne({
      renterId: user.userId,
      status: { $in: ['pending', 'active', 'ongoing'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        message: "You cannot delete your account while you have active rentals."
      });
    }

    // 4. Delete user
    await Users.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
    

export default router;