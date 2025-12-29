import express from 'express';
import Cars from '../models/Cars.js';

const router = express.Router();

// Get All Cars
router.get('/', async (req, res) => {
    console.log('Fetching all cars');
    try {
        const cars = await Cars.find().select("-__v");
        return res.json({ cars });
    } catch (err) {
        console.log("Error fetching cars:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get Car by ID
router.get('/:id', async (req, res) => {
    console.log('Fetching car by ID:', req.params.id);
    try {
        const car = await Cars.findOne({carId: req.params.id})
        if (!car) return res.status(404).json({ message: "Car not found" });
        res.json({ car });
    } catch (error) {
        console.log(`Error fetching car: ${error}`)
        res.status(500).json({ message: "Server error" });
    }
});

export default router;



