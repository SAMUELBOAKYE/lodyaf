const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { name, date } = req.body;
  if (!name || !date) {
    return res.status(400).json({ error: "Name and date are required" });
  }

  res
    .status(200)
    .json({ message: "Booking received", booking: { name, date } });
});

module.exports = router;

