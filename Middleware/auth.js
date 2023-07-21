const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../Models/distributorModel");

const isAuthenticatedUser = async (req, res, next) => {
  // Get the token from the request header
  const token = req.headers['authorization'].split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    req.user = await User.findById(decodedToken.id);
    console.log(`User authenticated ${req.user}`);

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  isAuthenticatedUser,
}