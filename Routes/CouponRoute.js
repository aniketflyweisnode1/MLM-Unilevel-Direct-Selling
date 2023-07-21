const express = require("express");
const { isAuthenticatedUser } = require("../Middleware/auth");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon
  
} = require("../Controller/CouponCtrl");
const router = express.Router();

router.post("/", isAuthenticatedUser, /* isAdmin, */ createCoupon);
router.get("/", isAuthenticatedUser, /* isAdmin, */ getAllCoupons);
router.get("/:id", isAuthenticatedUser, /* isAdmin, */ getCoupon);
router.put("/:id", isAuthenticatedUser, /* isAdmin, */ updateCoupon);
router.delete("/:id", isAuthenticatedUser, /* isAdmin, */ deleteCoupon);

module.exports = router;


