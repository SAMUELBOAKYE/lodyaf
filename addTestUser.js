require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  isVerified: Boolean,
});

const User = mongoose.model("User", userSchema);

async function addTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const email = "boakyesamuel189@gmail.com";
    const fullName = "Samuel Boakye";
    const plainPassword = "sam059SAM@#$";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("ℹ️ User already exists.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: true, // You can adjust this as needed
    });

    await user.save();
    console.log("✅ Test user added successfully!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addTestUser();

