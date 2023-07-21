const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist
} = require("../Controller/productCtrl");
const { isAuthenticatedUser } = require("../Middleware/auth");

const router = express.Router();


router.post("/", createProduct);
router.get("/:id", getaProduct);
router.get("/", getAllProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id", deleteProduct);
router.put("/wislist", /* isAuthenticatedUser, */ addToWishlist);

module.exports = router;

