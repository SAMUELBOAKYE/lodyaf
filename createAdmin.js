// backend/createAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// âœ… Load MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI;

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("âœ… Connected to MongoDB");

    const email = "admin@example.com";
    const password = "admin123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("âš ï¸ Admin user already exists:", email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name: "Super Admin",
      email,
      password: hashedPassword,
      isVerified: true,
      role: "admin",
    });

    await newAdmin.save();
    console.log("âœ… Admin user created successfully!");
    console.log("ðŸ” Email:", email);
    console.log("ðŸ” Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("âŒ Failed to create admin:", error.message);
    process.exit(1);
  }
}

createAdminUser();

