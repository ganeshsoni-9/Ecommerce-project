const jwt = require("jsonwebtoken");
module.exports = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);
