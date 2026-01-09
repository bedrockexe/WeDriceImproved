
import express from 'express';
import Bookings from '../models/Bookings.js';
import Users from '../models/Users.js';
import Cars from '../models/Cars.js';
import Transactions from '../models/Transactions.js';
import { auth } from '../middleware/authentication.js';

const router = express.Router();

router.get('/:bookingId', auth, async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Bookings.findOne({ bookingId: bookingId });
        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        // Verify access (user can only see their own receipts)
        const user = await Users.findById(req.user.id);
        if (booking.renterId !== user.userId) {
            return res.status(403).send("Access denied");
        }

        const car = await Cars.findOne({ carId: booking.carId });
        const transaction = await Transactions.findOne({ bookingId: booking.bookingId });

        const rentalDays = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${booking.bookingId}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; background-color: #f9fafb; }
                .receipt-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
                .company-info h1 { margin: 0; color: #10b981; font-size: 28px; }
                .company-info p { margin: 5px 0; font-size: 14px; color: #6b7280; }
                .invoice-details { text-align: right; }
                .invoice-details h2 { margin: 0; font-size: 24px; color: #111; }
                .invoice-details p { margin: 5px 0; font-size: 14px; color: #6b7280; }
                
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                .info-group h3 { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
                .info-group p { margin: 0; font-weight: 500; font-size: 16px; }
                
                .table-container { margin-bottom: 40px; }
                table { wudth: 100%; width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; text-transform: uppercase; }
                td { padding: 16px 0; border-bottom: 1px solid #e5e7eb; }
                .amount-col { text-align: right; }
                
                .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
                .total-box { width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
                .total-row.final { border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 18px; color: #10b981; margin-top: 10px; padding-top: 20px; }
                
                .footer { text-align: center; margin-top: 60px; color: #9ca3af; font-size: 14px; }
                
                @media print {
                    body { background: white; padding: 0; }
                    .receipt-container { box-shadow: none; padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="company-info">
                        <h1>WeDrive</h1>
                        <p>Car Rental Services</p>
                        <p>Manila, Philippines</p>
                        <p>support@wedrive.com</p>
                    </div>
                    <div class="invoice-details">
                        <h2>RECEIPT</h2>
                        <p>#${booking.bookingId}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p style="color: ${transaction?.status === 'refunded' ? '#ef4444' : '#10b981'}; font-weight: bold; text-transform: uppercase;">
                            ${transaction?.status === 'refunded' ? 'REFUNDED' : 'PAID'}
                        </p>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-group">
                        <h3>Billed To</h3>
                        <p>${user.firstName} ${user.lastName}</p>
                        <p>${user.email}</p>
                        <p>${user.phoneNumber}</p>
                    </div>
                    <div class="info-group">
                        <h3>Rental Details</h3>
                        <p>Vehicle: ${car ? car.name : 'N/A'}</p>
                        <p>Pickup: ${new Date(booking.startDate).toLocaleDateString()}</p>
                        <p>Return: ${new Date(booking.endDate).toLocaleDateString()}</p>
                        <p>Duration: ${rentalDays} Days</p>
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="amount-col">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Vehicle Rental (${car ? car.name : 'Car'} x ${rentalDays} days)</td>
                                <td class="amount-col">₱${(car ? car.pricePerDay * rentalDays : 0).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Reservation Fee</td>
                                <td class="amount-col">₱500</td>
                            </tr>
                            <tr>
                                <td>Insurance</td>
                                <td class="amount-col">Free</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-section">
                    <div class="total-box">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>₱${((car ? car.pricePerDay * rentalDays : 0) + 500).toLocaleString()}</span>
                        </div>
                        <div class="total-row final">
                            <span>Total Paid</span>
                            <span>₱${booking.totalPrice?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for choosing WeDrive!</p>
                    <p>This is a computer-generated receipt and no signature is required.</p>
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
        `;

        res.send(html);

    } catch (error) {
        console.error("Receipt generation error:", error);
        res.status(500).send("Error generating receipt");
    }
});

export default router;
