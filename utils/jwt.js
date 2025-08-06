const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "default_jwt_secret";

const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};

