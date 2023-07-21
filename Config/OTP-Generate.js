const jwt  = require('jsonwebtoken')
require("dotenv").config();

const generateOTP = () => {
  // Generate a 4-digit random number
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  return otp.toString();
};

const generateJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}


module.exports = {
  generateOTP,
  generateJwtToken
};
