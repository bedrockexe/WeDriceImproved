import express from "express";
import User from "../models/User.js";
import mongoose from "mongoose";
import deleteFolder from "./deletefolder.js";
import ClientNotifications from "../models/ClientNotifications.js";
import AdminNotifications from "../models/AdminNotifications.js";
import { io } from "../server.js";
import { sendBookingEmail } from "../services/emailService.js";


const router = express.Router();

const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString("en-us", options)
}

router.get("/getallusers", async (req, res) => {
  try {
    const getusers = await User.find({ verificationStatus: { $ne: "unverified" } }).select("-password");

    const users = getusers.map(user => ({
      id: user._id,
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      dateOfBirth: formatDate(user.birthdate),
      address: user.address,
      submittedDate: formatDate(user.verificationSubmittedAt),
      status: user.verificationStatus,
      documents: {
        license: user.licenseImage,
        selfie: user.licenseSelfie,
      },
      licenseDetails: {
        number: user.licenseNumber,
        expiry: user.licenseExpiry,
      },
      rejectionReason: user.rejectionReason || null,
    }));


    res.status(200).json({ users });
  } catch (error) {
    console.log("Get All Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    } else {
      user = await User.findOne({ userId: id });
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    const mappedUser = {
      id: user._id,
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      dateOfBirth: formatDate(user.birthdate),
      address: user.address,
      submittedDate: formatDate(user.verificationSubmittedAt),
      status: user.verificationStatus,
      documents: {
        license: user.licenseImage,
        selfie: user.licenseSelfie,
      },
      licenseDetails: {
        number: user.licenseNumber,
        expiry: user.licenseExpiry,
      },
      rejectionReason: user.rejectionReason || null,
    };
    res.status(200).json({ user: mappedUser });
  } catch (error) {
    console.log("Get User Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.put('/approve/:id', async (req, res) => {
  const userId = req.params.id;

  console.log('Approving user with ID:', userId);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update verification status
    user.verificationStatus = 'verified';
    user.verifiedDate = new Date();

    await user.save();

    await ClientNotifications.create({
      userId: user.userId,
      title: "Account Verified",
      message: `Your account has been verified successfully.`,
      type: "verification"
    });

    await AdminNotifications.create({
      userId: user.userId,
      title: "Account Verified",
      message: `Account has been verified successfully.`,
      type: "verification"
    });

    io.to(user.userId).emit('new-notification', {
      userId: user.userId,
      message: `Your account has been verified successfully.`,
      type: "verification"
    });

    res.status(200).json({
      message: `User ${user.firstName} ${user.lastName} verified successfully`,
      user,
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/reject/:id', async (req, res) => {
  const userId = req.params.id;
  const { rejectionReason } = req.body;
  console.log('Rejecting user with ID:', userId);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's uploaded documents from Cloudinary
    const folderPath = user.userId;
    await deleteFolder(folderPath);

    // Update verification status
    user.verificationStatus = 'rejected';
    user.rejectionReason = rejectionReason;
    await user.save();

    await ClientNotifications.create({
      userId: user.userId,
      title: "Account Rejected",
      message: `Your account verification has been rejected. Reason: ${rejectionReason}`,
      type: "verification"
    });

    io.to(user.userId).emit('new-notification', {
      userId: user.userId,
      message: `Your account verification has been rejected. Reason: ${rejectionReason}`,
      type: "verification"
    });

    res.status(200).json({
      message: `User ${user.firstName} ${user.lastName} rejected successfully`,
      user,
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

