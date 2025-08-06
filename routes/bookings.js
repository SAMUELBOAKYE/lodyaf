const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

// ✅ Middleware: Authenticate JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token not found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Middleware: Check Admin (based on email)
const isAdmin = (req, res, next) => {
  const adminEmails = ["boakyesamuel189@gmail.com"]; // Add more if needed
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// ✅ Send Booking Confirmation Email
const sendBookingEmail = async (booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Quest Booking" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: "📅 Booking Confirmation",
      html: `
        <h2>✅ Booking Confirmed</h2>
        <p><strong>Guest:</strong> ${booking.guestName}</p>
        <p><strong>Room:</strong> ${booking.room}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Network:</strong> ${booking.network}</p>
        <p><strong>Amount:</strong> GHS ${booking.amount}</p>
        <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
        <hr />
        <p>Thanks for booking with Quest!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", booking.customerEmail);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};

// ✅ POST /api/bookings - Create a new booking
router.post("/", authenticate, async (req, res) => {
  const {
    guestName,
    room,
    date,
    time,
    phone,
    customerEmail,
    network,
    amount,
    transactionId,
    reference,
    status,
  } = req.body;

  if (
    !guestName ||
    !room ||
    !date ||
    !time ||
    !phone ||
    !customerEmail ||
    !network ||
    !amount ||
    !transactionId
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  try {
    const booking = new Booking({
      userId: req.user.userId,
      guestName,
      room,
      date,
      time,
      phone,
      customerEmail,
      network,
      amount,
      transactionId,
      reference,
      status: status || "pending",
    });

    await booking.save();
    await sendBookingEmail(booking);

    res.status(201).json({
      message: "✅ Booking created successfully",
      booking,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to create booking", error: err.message });
  }
});

// ✅ GET /api/bookings - Get bookings for logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to fetch bookings", error: err.message });
  }
});

// ✅ GET /api/bookings/all - Admin only
router.get("/all", authenticate, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to fetch all bookings", error: err.message });
  }
});

// ✅ PUT /api/bookings/:id - Update booking (Admin)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const bookingId = req.params.id;
  const updates = req.body;

  try {
    const booking = await Booking.findByIdAndUpdate(bookingId, updates, {
      new: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "✅ Booking updated", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to update booking", error: err.message });
  }
});

// ✅ DELETE /api/bookings/:id - Only Owner or Admin
router.delete("/:id", authenticate, async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.userId.toString() === req.user.userId;
    const isAdminUser = ["boakyesamuel189@gmail.com"].includes(req.user.email);

    if (!isOwner && !isAdminUser) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this booking" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "🗑️ Booking deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Failed to delete booking", error: err.message });
  }
});

module.exports = router;

