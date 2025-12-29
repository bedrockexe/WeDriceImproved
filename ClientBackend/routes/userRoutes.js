import express from 'express';
import Users from '../models/Users.js';
import { auth } from '../middleware/authentication.js';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const JWT_SECRET = 'Bedrock';

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
    const { email, password } = req.body;
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
    
        const token = jwt.sign({ id: userLogin._id }, JWT_SECRET, { expiresIn: "1h" });
    
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,         // or true if using HTTPS
          sameSite: "lax",     // or "none" if cross-site
          maxAge: 1000 * 60 * 60
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
          transactions: []
        });
    
        await newUser.save();
    
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });
    
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,         // or true if using HTTPS
          sameSite: "lax",     // or "none" if cross-site cookies
          maxAge: 1000 * 60 * 60
        });
    
        return res.status(201).json({ message: 'Registered successfully!' });
    
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
      }
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
    res.json({ message: "Verification submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;