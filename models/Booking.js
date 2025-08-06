const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Guest & Booking Info
    guestName: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },

    // ✅ Contact Info
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    // ✅ Payment Info
    network: {
      type: String,
      required: [true, "Payment network is required"],
      enum: ["MTN", "Vodafone", "AirtelTigo", "Other"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than zero"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    reference: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },

    // ✅ Optional
    additionalInfo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Optional console log in dev mode
if (process.env.NODE_ENV !== "production") {
  console.log("✅ Booking model loaded");
}

module.exports = mongoose.model("Booking", bookingSchema);

