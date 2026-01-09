import express from 'express';
import Bookings from '../models/Bookings.js';
import Users from '../models/Users.js';
import Cars from '../models/Cars.js';
import Transactions from '../models/Transactions.js';
import ClientNotifications from '../models/ClientNotifications.js';
import AdminNotifications from '../models/AdminNotifications.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { auth } from '../middleware/authentication.js';
import { io } from '../index.js';
import { sendBookingEmail } from '../services/emailService.js';


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// Create a new booking
router.post('/create', auth, upload.array("proofOfPayment", 1), async (req, res) => {
    console.log("Received booking creation request:", req.body);
    try {
        const user = await Users.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { renter, carid, startDate, endDate, pickupLocation, returnLocation, paymentMethod } = req.body;
        if (!renter || !carid || !startDate || !endDate || !pickupLocation || !returnLocation) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const car = await Cars.findOne({ carId: carid });
        if (!car) return res.status(404).json({ message: "Car not found" });

        if (car.status !== 'available') {
            return res.status(400).json({ message: "Car is not available for booking" });
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);

        if (eDate <= sDate) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        const days = Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24));
        const totalPrice = (days * car.pricePerDay) + 500;
        const carname = car.name;
        const customername = `${user.firstName} ${user.lastName}`;
        const proofOfPayment = req.files || [];
        const folder = `${user.userId}/payments`;
        let uploadedFiles = [];

        if (proofOfPayment.length > 0) {
            uploadedFiles = await Promise.all(
                proofOfPayment.map(file => uploadToCloudinary(file.buffer, folder))
            );
        } else {
            return res.status(400).json({ message: "Proof of payment is required" });
        }

        const newBooking = new Bookings({
            renterId: user.userId,
            carId: car.carId,
            carName: carname,
            customerName: customername,
            startDate: sDate,
            endDate: eDate,
            pickupLocation: pickupLocation,
            returnLocation: returnLocation,
            totalPrice: totalPrice
        });

        await newBooking.save();

        const transaction = new Transactions({
            userId: user.userId,
            bookingId: newBooking.bookingId,
            carId: car.carId,
            carName: carname,
            customerName: customername,
            totalAmount: totalPrice,
            paymentMethod: paymentMethod,
            transactionType: 'Standard Booking',
            paymentProof: uploadedFiles[0]
        });

        await transaction.save();
        newBooking.transactions.push(transaction.transactionId);
        await newBooking.save();
        user.bookings.push(newBooking.bookingId);
        user.totalSpent += totalPrice;
        user.transactions.push(transaction.transactionId);
        await user.save();

        io.emit("new-notification", {
            userId: user.userId,
            message: `New booking created: ${newBooking.bookingId}`,
            bookingId: newBooking.bookingId,
            type: "booking"
        });

        const clientNotification = new ClientNotifications({
            userId: user.userId,
            title: "Booking Created",
            message: `Your booking ${newBooking.bookingId} has been created successfully.`,
            bookingId: newBooking.bookingId,
            type: "booking"
        });

        await clientNotification.save();

        const adminNotification = new AdminNotifications({
            userId: user.userId,
            title: "New Booking Created",
            message: `New booking ${newBooking.bookingId} created by user ${user.userId}.`,
            bookingId: newBooking.bookingId,
            type: "booking"
        });

        await adminNotification.save();

        // Send Pending Email
        if (user.email) {
            await sendBookingEmail(user.email, newBooking.bookingId, "pending", "", newBooking);
        }

        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get booking by ID
router.get('/:bookingId', auth, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Bookings.findOne({ bookingId: bookingId });
        const user = await Users.findById(req.user.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.renterId !== user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        console.log("Found booking:", booking);
        res.status(200).json({ booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Modify check
router.get('/modify-check/:bookingId', auth, async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Bookings.findOne({ bookingId: bookingId });
        const user = await Users.findById(req.user.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.renterId !== user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        // Check if modification is allowed
        if (["completed", "ongoing", "cancelled"].includes(booking.status)) {
            return res.status(400).json({
                message: `Booking cannot be modified when status is ${booking.status}`
            });
        }
        res.status(200).json({ message: "Booking can be modified", booking });
    } catch (error) {
        console.error("Error checking booking modification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get bookings of a user
router.get('/user/me', auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const bookings = await Bookings.find({ renterId: user.userId }).sort({ createdAt: -1 });
        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all bookings of a car (approved, pending, ongoing only)
router.get('/car/:carId', auth, async (req, res) => {
    const { carId } = req.params;

    try {
        const bookings = await Bookings.find({
            carId: carId,
            status: { $in: ["approved", "pending", "ongoing"] }
        }).sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings for car:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all the bookings of a car other than the one being modified
router.get('/car/:carId/exclude/:bookingId', auth, async (req, res) => {
    const { carId, bookingId } = req.params;

    try {
        const bookings = await Bookings.find({
            carId: carId,
            bookingId: { $ne: bookingId },
            status: { $in: ["approved", "pending", "ongoing"] }
        }).sort({ createdAt: -1 });

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({ bookings: [] });
        }

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings for car excluding one:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Modify a booking
router.put('/modify/:bookingId', auth, upload.array("proofOfPayment", 1), async (req, res) => {
    console.log("Received booking modification request:", req.body);
    try {
        // Implementation for modifying a booking will go here
        // Step 1: Get booking details from req.body and req.params
        const { startDate, endDate, pickupLocation, returnLocation, amountPaid, paymentMethod } = req.body;
        const { bookingId } = req.params;
        const files = req.files;

        // Step 2: Find the booking by bookingId
        const booking = await Bookings.findOne({ bookingId: bookingId });
        const user = await Users.findById(req.user.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 3: Error handling
        // Cannot modify after pickup date
        if (new Date() >= new Date(booking.startDate)) {
            return res.status(400).json({
                message: "Booking can no longer be modified after pickup date"
            });
        }
        // Limit modifications
        if (booking.modifiedCount >= 3) {
            return res.status(400).json({
                message: "Maximum modification limit reached"
            });
        }
        // Validate dates
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        if (newStart >= newEnd) {
            return res.status(400).json({ message: "Invalid rental dates" });
        }

        // Step 4: Check Availability
        const overlappingBookings = await Bookings.find({
            carId: booking.carId,
            bookingId: { $ne: booking.bookingId },
            status: { $in: ["approved", "pending", "ongoing"] }
        });
        for (let ob of overlappingBookings) {
            if (
                (newStart >= ob.startDate && newStart < ob.endDate) ||
                (newEnd > ob.startDate && newEnd <= ob.endDate) ||
                (newStart <= ob.startDate && newEnd >= ob.endDate)
            ) {
                return res.status(400).json({
                    message: "The car is not available for the selected dates"
                });
            }
        }

        // Step 5: Save Previous State
        const previousState = {
            startDate: booking.startDate,
            endDate: booking.endDate,
            pickupLocation: booking.pickupLocation,
            returnLocation: booking.returnLocation,
            totalPrice: booking.totalPrice
        }

        // Step 6: Add transaction if extending rental period
        let transaction = null;

        if (files && files.length > 0) {
            const folder = `${user.userId}/payments`;

            const uploadedFiles = await Promise.all(
                files.map(file => uploadToCloudinary(file.buffer, folder))
            );

            transaction = new Transactions({
                userId: user.userId,
                bookingId: booking.bookingId,
                carId: booking.carId,
                carName: booking.carName,
                customerName: booking.customerName,
                totalAmount: (amountPaid - booking.totalPrice),
                paymentMethod: paymentMethod,
                transactionType: 'Booking Modification',
                paymentProof: uploadedFiles[0]
            });

            await transaction.save();


            await Users.findByIdAndUpdate(user._id, {
                $inc: { totalSpent: Number(amountPaid - booking.totalPrice) },
                $push: { transactions: transaction.transactionId }
            });
        }

        // Calculate new total price
        const days = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24));
        const car = await Cars.findOne({ carId: booking.carId });
        const newTotalPrice = (days * car.pricePerDay) + 500;


        // Step 7: Update Booking
        booking.startDate = newStart;
        booking.endDate = newEnd;
        booking.pickupLocation = pickupLocation;
        booking.returnLocation = returnLocation;
        booking.totalPrice = newTotalPrice;
        booking.status = 'pending';
        booking.modifiedCount += 1;
        booking.history.push({
            changedAt: new Date(),
            previous: previousState,
            updated: {
                startDate: newStart,
                endDate: newEnd,
                pickupLocation: pickupLocation,
                returnLocation: returnLocation,
                totalPrice: newTotalPrice
            }
        });

        if (transaction) {
            booking.transactions.push(transaction.transactionId);
        }

        await booking.save();

        const clientNotification = new ClientNotifications({
            title: "Booking Modification Pending",
            userId: user.userId,
            message: `Your booking ${booking.bookingId} is pending modification.`,
            bookingId: booking.bookingId,
            type: "booking"
        });

        await clientNotification.save();

        const adminNotification = new AdminNotifications({
            title: "Booking Modified",
            userId: user.userId,
            message: `Booking ${booking.bookingId} modified by user ${user.userId}.`,
            bookingId: booking.bookingId,
            type: "booking"
        });

        await adminNotification.save();

        io.emit("new-notification", {
            userId: user.userId,
            message: `Booking modified: ${booking.bookingId}`,
            bookingId: booking.bookingId,
            type: "booking"
        });


        res.status(200).json({ message: "Booking modified successfully", booking: booking });
    } catch (error) {
        console.error("Error modifying booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Cancel a booking
router.put("/:id/cancel", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = await Users.findById(req.user.id).then(user => user.userId);
        const booking = await Bookings.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Ownership check
        if (booking.renterId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Status validation
        if (["cancelled", "completed"].includes(booking.status)) {
            return res.status(400).json({
                message: `Cannot cancel a ${booking.status.toLowerCase()} booking`
            });
        }

        if (booking.status === "ongoing") {
            return res.status(400).json({
                message: "Booking already started and cannot be cancelled"
            });
        }

        // Refund logic
        const now = new Date();
        let refundAmount = booking.totalPrice - 500; // Deduct fixed fee

        // const hoursBeforePickup =
        //     (booking.startDate - now) / (1000 * 60 * 60);

        // if (hoursBeforePickup >= 24) {
        //     refundAmount = booking.totalPrice;
        // } else if (hoursBeforePickup >= 1) {
        //     refundAmount = booking.totalPrice * 0.5;
        // }

        // Update booking
        booking.status = "cancelled";
        booking.cancelledAt = now;
        booking.cancellationReason = reason;
        booking.refundedAmount = refundAmount;

        await booking.save();

        const transaction = await Transactions.findOne({ bookingId: booking.bookingId });
        if (transaction) {
            transaction.status = "refunded";
            await transaction.save();
        }

        // Update user totalSpent
        const user = await Users.findById(req.user.id);
        user.totalSpent -= refundAmount;
        await user.save();

        // Notifications
        const clientNotification = new ClientNotifications({
            userId: user.userId,
            title: "Booking Cancelled",
            message: `Your booking ${booking.bookingId} has been cancelled.`,
            bookingId: booking.bookingId,
            type: "booking"
        });

        await clientNotification.save();

        const adminNotification = new AdminNotifications({
            userId: user.userId,
            title: "Booking Cancelled",
            message: `Booking ${booking.bookingId} cancelled by user ${user.userId}.`,
            bookingId: booking.bookingId,
            type: "booking"
        });

        await adminNotification.save();

        io.emit("new-notification", {
            userId: user.userId,
            message: `Booking cancelled: ${booking.bookingId}`,
            bookingId: booking.bookingId,
            type: "booking"
        });

        // Send Cancelled Email
        if (user.email) {
            await sendBookingEmail(user.email, booking.bookingId, "cancelled", reason, booking);
        }


        res.status(200).json({
            message: "Booking cancelled successfully",
            refundAmount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error while cancelling booking"
        });
    }
});


export default router;
