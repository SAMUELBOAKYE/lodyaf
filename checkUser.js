require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yafafaDB";

// Define User schema matching your user model fields
const userSchema = new mongoose.Schema({
  fullName: String, // or 'name' if your DB uses that field instead
  email: String,
  password: String, // hashed password
  // add other fields if needed
});

const User = mongoose.model("User", userSchema);

async function checkUser({ name, email, password }) {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Build query preferring email; fallback to name
    const query = email ? { email } : { fullName: name };
    const user = await User.findOne(query);

    if (!user) {
      console.log("❌ User not found.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("🔍 User found:");
    console.log({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      // Do NOT print password for security reasons
    });

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log("✅ Password matches!");
      } else {
        console.log("❌ Password does NOT match.");
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    if (users.length === 0) {
      console.log("ℹ️ No users found in the database.");
    } else {
      console.log("👥 Users in DB:");
      users.forEach((user) =>
        console.log({
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          // don't print password
        })
      );
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Parse command-line args like: email=someone@example.com password=yourPassword list=true
const args = process.argv.slice(2);
const params = {};
args.forEach((arg) => {
  const [key, ...rest] = arg.split("=");
  params[key] = rest.join("=");
});

// If user passes "list=true", call listUsers, else checkUser
if (params.list === "true") {
  listUsers();
} else {
  checkUser(params);
}

