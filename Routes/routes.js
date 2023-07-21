const express = require("express");
const router = express.Router();

router.use("/user", require("./distributorRoute"));
router.use("/product", require("./productRoute"));
router.use("/category", require("./productCategoryRoute"));
router.use("/order", require("./orderRoute"));
router.use("/sales", require("./SalesRoute"));
router.use("/coupon", require("./CouponRoute"));
router.use("/brand", require("./BrandRoute"));

module.exports = router;