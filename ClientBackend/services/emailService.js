
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "joshuabalba@gmail.com",
    pass: "ghle cwzc ywuh hukc",
  },
});

const getEmailTemplate = (title, message, statusColor, bookingDetails, actionUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: #18181b; padding: 40px 0; text-align: center; background-image: linear-gradient(to right, #18181b, #27272a); }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
    .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: 600; font-size: 14px; color: white; background-color: ${statusColor}; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
    .details-box { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
    .details-row { margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px; }
    .details-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
    .details-label { color: #64748b; font-size: 14px; font-weight: 500; }
    .details-value { color: #0f172a; font-weight: 600; font-size: 14px; text-align: left; }
    .btn { display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px; text-align: center; width: auto; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    .btn:hover { background-color: #1d4ed8; }
    .footer { background-color: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WeDrive</h1>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <div class="status-badge">${title}</div>
      </div>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">${message}</p>

      ${bookingDetails ? `
      <div class="details-box">
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #1e293b; font-size: 16px;">Trip Details</h3>
        <div class="details-row">
            <p class="details-label">Booking ID</p>
            <p class="details-value">#${bookingDetails.bookingId}</p>
        </div>
        <div class="details-row">
            <p class="details-label">Car Vehicle</p>
            <p class="details-value">${bookingDetails.carName}</p>
        </div>
        <div class="details-row">
            <p class="details-label">Pickup Date</p>
            <p class="details-value">${new Date(bookingDetails.startDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        <div class="details-row">
            <p class="details-label">Return Date</p>
            <p class="details-value">${new Date(bookingDetails.endDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        <div class="details-row">
            <p class="details-label">Total Amount</p>
            <p class="details-value" style="color: #2563eb;">₱${bookingDetails.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
        <a style="color: white;" href="${actionUrl || `http://localhost:5173/dashboard/bookingdetails/${bookingDetails?.bookingId || ''}`}" class="btn">View Booking Details</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #71717a;">Safe travels,<br>The WeDrive Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} WeDrive Car Rental. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendBookingEmail = async (to, bookingId, status, extraMessage = "", bookingDetails = null) => {
  let subject = `Booking Update: ${status}`;
  let color = "#3b82f6"; // blue default
  let messageBody = "";

  switch (status.toLowerCase()) {
    case "pending":
      subject = "Booking Received - Pending Approval";
      color = "#f59e0b"; // amber
      messageBody = `Your booking has been successfully received. It is currently under review by our team. We will notify you as soon as an admin approves your request.`;
      break;
    case "approved":
      subject = "Booking Approved! 🎉";
      color = "#22c55e"; // green
      messageBody = `Great news! Your booking has been <strong>APPROVED</strong>. You are all set for your upcoming trip. Please check the details below.`;
      break;
    case "declined":
      subject = "Booking Update - Declined";
      color = "#ef4444"; // red
      messageBody = `We regret to inform you that your booking request has been <strong>DECLINED</strong>.${extraMessage ? `<br><br><strong>Reason:</strong> ${extraMessage}` : ""}`;
      break;
    case "ongoing":
      subject = "Your Trip Has Started! 🚗";
      color = "#3b82f6"; // blue
      messageBody = `Your booking is now officially <strong>ONGOING</strong>. We hope you have a safe and enjoyable journey! If you need assistance, please contact support.`;
      break;
    case "cancelled":
      subject = "Booking Cancelled";
      color = "#71717a"; // gray
      messageBody = `Your booking has been successfully <strong>CANCELLED</strong>. If a refund is applicable, it will be processed according to our policy.`;
      break;
    case "completed":
      subject = "Trip Completed - Thank You!";
      color = "#10b981"; // emerald
      messageBody = `Your trip has been marked as <strong>COMPLETED</strong>. Thank you for choosing WeDrive! We hope to see you again soon.`;
      break;
    default:
      messageBody = `Your booking status has been updated to <strong>${status}</strong>. ${extraMessage}`;
  }

  const html = getEmailTemplate(status.replace('-', ' ').toUpperCase(), messageBody, color, bookingDetails);

  try {
    await transporter.sendMail({
      from: '"WeDrive Alerts" <joshuabalba@gmail.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} for booking ${bookingId} (${status})`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
