import express from "express";
import User from "../models/User.js";
import mongoose from "mongoose";
import deleteFolder from "./deletefolder.js";


const router = express.Router();

router.get("/getallusers", async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: { $ne: "unverified" } }).select("-password");

    res.status(200).json({ users });
  } catch (error) {
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
    res.status(200).json({ user });
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

