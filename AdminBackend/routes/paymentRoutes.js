import express from "express";
import Transaction from "../models/Payment.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const payments = await Transaction.find().sort({ createdAt: -1 });
        res.json({ payments });
    } catch (error) {
        res.status(500).json({ message: error });
    }  
}); 

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let payment;
        if (mongoose.Types.ObjectId.isValid(id)) {
            payment = await Transaction.findById(id);
        } else {
            payment = await Transaction.findOne({ transactionId: id });
        }

        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.json({ payment });
    } catch (error) {
        console.log("Get Payment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;