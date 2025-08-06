const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Protected route example
 * @access  Private (requires valid token)
 */
router.get("/", authenticateToken, (req, res) => {
  res.json({
    message: `Welcome to the protected dashboard, user ${req.user.userId}`,
    user: req.user,
  });
});

module.exports = router;

