const express = require("express");
const {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  deleteaUser,
  UpdateUser,
  UserCart,
  getUserCart,
  emptyCart,
  addTeammateDistributor,
  applyCoupon,
  getTeamMembers,
  AddTeamMemberByDistributor,
  getTeamMembersCount,
  verifyOtp,
  ForgetPassword,
  resetPasswordOTP,
  resendOtp
} = require("../Controller/distributorCtrl");
const { isAuthenticatedUser } = require("../Middleware/auth");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/otp/verify/:id", /* isAuthenticatedUser, */ verifyOtp);
router.post("/forget", /* isAuthenticatedUser, */ ForgetPassword);
router.post("/reset", isAuthenticatedUser, resetPasswordOTP);
router.get("/resend/otp/:id", resendOtp);
router.get("/all-users", getallUser);
router.get("/:id", isAuthenticatedUser, getaUser);
router.put("/update", isAuthenticatedUser, UpdateUser);
router.delete("/:id", isAuthenticatedUser, deleteaUser);
router.post("/cart", isAuthenticatedUser, UserCart);
router.get("/getcart/user", isAuthenticatedUser, getUserCart);
router.get("/empty-cart/user", isAuthenticatedUser, emptyCart);
router.post("/add/teammembers", addTeammateDistributor);
router.get("/teammembers/:parentId", getTeamMembers);
router.post("/cart/applycoupon", isAuthenticatedUser, applyCoupon);
router.post("/:id/teammember", AddTeamMemberByDistributor);
router.get("/:id/teammember", getTeamMembersCount);

module.exports = router;