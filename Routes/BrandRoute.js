const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
} = require("../Controller/BranCtrl");
const { isAuthenticatedUser, /* isAdmin  */} = require("../Middleware/auth");
const router = express.Router();

router.post("/", isAuthenticatedUser, /* isAdmin, */ createBrand);
router.put("/:id", isAuthenticatedUser, /* isAdmin, */ updateBrand);
router.delete("/:id", isAuthenticatedUser, /* isAdmin, */ deleteBrand);
router.get("/:id", getBrand);
router.get("/", getallBrand);

module.exports = router;
