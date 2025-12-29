import express from "express";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import deleteFolder from "./deletefolder.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  } 
});

router.put('/approve/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status.toLowerCase() !== 'pending') {
      return res.status(400).json({
        message: 'Only pending bookings can be approved',
      });
    }

    const transaction = await Payment.findOne({ bookingId: booking.bookingId, status: 'pending' });

    if (!transaction) {
      return res.status(404).json({ message: 'Associated payment transaction not found' });
    }

    booking.status = 'approved';

    await booking.save();

    transaction.status = 'completed';

    await transaction.save();

    res.status(200).json({
      message: 'Booking approved successfully',
      booking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/decline/:id', async (req, res) => {
  try {
    const { declineReason } = req.body;

    if (!declineReason || declineReason.trim() === '') {
      return res.status(400).json({
        message: 'Decline reason is required',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status.toLowerCase() !== 'pending') {
      return res.status(400).json({
        message: 'Only pending bookings can be declined',
      });
    }

    booking.status = 'declined';
    booking.declineReason = declineReason;

    await booking.save();

    res.status(200).json({
      message: 'Booking declined successfully',
      booking,
    });
  } catch (error) {
    console.error('Decline booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
    