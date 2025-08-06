require("dotenv").config();
const mongoose = require("mongoose");

// Define User schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String, // hashed password
  isVerified: Boolean,
});

// Create User model
const User = mongoose.model("User", userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("âœ… Connected to MongoDB");

    const users = await User.find({}, { password: 0, __v: 0 }); // exclude password and version

    if (!users.length) {
      console.log("âš ï¸  No users found in the database.");
    } else {
      console.log("\nâœ… Registered Users:\n");
      users.forEach((user, index) => {
        console.log(`ðŸ§‘â€ðŸ’» User #${index + 1}`);
        console.log(`   Full Name : ${user.fullName}`);
        console.log(`   Email     : ${user.email}`);
        console.log(`   Verified  : ${user.isVerified ? "Yes" : "No"}`);
        console.log("--------------------------------------------------");
      });
    }
  } catch (error) {
    console.error("âŒ Error listing users:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();

