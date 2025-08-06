// save as addUser.js in backend folder
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  isVerified: Boolean,
});

const User = mongoose.model("User", userSchema);

async function addUser() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

    const email = "boakyesamuel189@gmail.com";
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("sam059SAM@#$", 10);

    const user = new User({
      fullName: "Samuel Boakye",
      email: email,
      password: hashedPassword,
      isVerified: true,
    });

    await user.save();
    console.log("User added:", user.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

addUser();

