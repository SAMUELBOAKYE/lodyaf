const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  // 🔍 Input validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 🔄 Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered. Please log in.",
      });
    }

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 👤 Create and save user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    await newUser.save();

    // 📦 Optional: auto-login after register
    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({
      message: "Registration failed",
      error: err.message || "Unexpected server error",
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return tokens
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 🔍 Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // 🔎 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔑 Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 📤 Respond with user info and tokens
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({
      message: "Login failed",
      error: err.message || "Unexpected server error",
    });
  }
});

module.exports = router;

