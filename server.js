// 🌍 Load environment variables
require("dotenv").config();

// 📦 Core dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// 🛠 Custom modules
const connectDB = require("./config/db");
const authenticateToken = require("./middleware/authMiddleware");

// 📦 Route modules
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");

// ⚙️ Initialize Express app
const app = express();

// 🌐 Allowed frontend origins (Netlify, local dev)
const allowedOrigins = [
  "http://localhost:5173", // Vite local dev
  "https://lodyaf.netlify.app", // ✅ Your frontend on Netlify
];

// 🔐 CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check route
app.get("/", (req, res) => {
  res.status(200).send("✅ Quest API is live");
});

// ✅ Public auth routes
app.use("/api/auth", authRoutes);

// ✅ Protected booking & dashboard routes
app.use("/api/bookings", authenticateToken, bookingRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);

// ❌ 404 Not Found
app.use("*", (req, res) => {
  res.status(404).json({ message: "🚫 API route not found" });
});

// ❌ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 1000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
