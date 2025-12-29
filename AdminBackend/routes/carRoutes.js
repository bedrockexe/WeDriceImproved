import express from "express";
import Car from "../models/Car.js";
import upload from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper to upload buffer → Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "wedrive_cars" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

/**
 * ----------------------------------------------------
 *  ADD CAR (WITH MULTIPLE IMAGES)
 * ----------------------------------------------------
 */
router.post("/add", upload.array("images", 10), async (req, res) => {
  try {
    const imageFiles = req.files || [];
    const uploadedImages = [];

    // Upload to Cloudinary
    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file.buffer);
      uploadedImages.push(url);
    }

    // MAIN IMAGE LOGIC
    const mainIndex = Number(req.body.mainImageIndex) || 0;
    const mainImage = uploadedImages[mainIndex]; // <= THIS IS THE MAIN IMAGE

    // Create the car
    const newCar = new Car({
      ...req.body,
      features: JSON.parse(req.body.features),
      images: uploadedImages,
      mainImage: mainImage,   // <= SAVE THE MAIN IMAGE URL
    });

    await newCar.save();

    res.status(201).json({ message: "Car successfully added!", car: newCar });

  } catch (error) {
    console.error("Add Car Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * ----------------------------------------------------
 *  GET ALL CARS
 * ----------------------------------------------------
 */
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ cars });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ----------------------------------------------------
 *  GET SINGLE CAR
 * ----------------------------------------------------
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let car;
    if (mongoose.Types.ObjectId.isValid(id)) {
        car = await Car.findById(id);
    } else {
        car = await Car.findOne({ carId: id });
    }
    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json({ car });
  } catch (error) {
    console.log("Get Car Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ----------------------------------------------------
 *  DELETE CAR
 * ----------------------------------------------------
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Car.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Car not found" });

    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * UPDATE CAR
 */
router.put("/update/:id", upload.array("images", 5), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log("RAW req.body:", req.body);

    // Handle images
    let uploadedImages = car.images;

    if (req.files && req.files.length > 0) {
      uploadedImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        uploadedImages.push(url);
      }
    }

    const mainIndex = Number(req.body.mainImageIndex) || 0;
    const mainImage = uploadedImages[mainIndex]; // <= THIS IS THE MAIN IMAGE

    // ✅ FIX FEATURES
    let features = car.features;
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features); // convert string → array
      } catch (err) {
        features = [];
      }
    }

    // Build updates object safely
    const updates = {
      name: req.body.name,
      brand: req.body.brand,
      model: req.body.model,
      year: Number(req.body.year),
      category: req.body.category,
      transmission: req.body.transmission.toLowerCase(),
      seats: Number(req.body.seats),
      fuelType: req.body.fuelType,
      pricePerDay: Number(req.body.pricePerDay),
      description: req.body.description,
      mainImage: mainImage,
      features,          
      images: uploadedImages,
      updatedAt: Date.now()
    };

    await Car.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({ message: "Car updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate input
    const allowedStatuses = ["available", "rented", "maintenance", "inactive"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    car.status = status;
    await car.save();

    res.json({
      message: "Car status updated successfully",
      car,
    });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/set-main/:id", async (req, res) => {
  try {
    const { image } = req.body; // selected image URL

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { mainImage: image },
      { new: true }
    );

    res.json({ message: "Main image updated!", car: updatedCar });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
