import express from 'express';
import Transaction from '../models/Transactions.js';
import Users from '../models/Users.js';
import { auth } from '../middleware/authentication.js';

const router = express.Router();

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Get all transactions of a user
router.get('/user/me', auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password -__v");
        const transactions = await Transaction.find({ userId: user.userId }).sort({ createdAt: -1 });
        
        let counter = 1;

        const formatted = [];

        for (const tx of transactions) {
            formatted.push({
                id: counter,
                bookingId: tx.bookingId,
                carName: tx.carName,
                amount: tx.totalAmount,
                date: formatDate(tx.createdAt),
                status: tx.status,
                paymentMethod: tx.paymentMethod,
                transactionId: tx.transactionId,
                paymentProof: tx.paymentProof
            });
            counter++;
        }

        res.json({ transactions: formatted });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Get all transactions of a booking
router.get('/booking/:bookingId', auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password -__v");
        const transactions = await Transaction.find({ bookingId: req.params.bookingId, userId: user.userId }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
            console.log('No transactions found for booking ID:', req.params.bookingId);
            return res.status(404).json({ msg: 'No transactions found for this booking' });
        }

        return res.json({ transactions });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

export default router;