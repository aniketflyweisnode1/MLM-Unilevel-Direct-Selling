const express = require("express");
const { isAuthenticatedUser } = require("../Middleware/auth");
const { createOrder, getOrder, /* PurchaseProductByDistributor */ } = require("../Controller/orderCtrl");
const router = express.Router();

router.post("/cash-order", isAuthenticatedUser, createOrder);
router.get("/get", isAuthenticatedUser, getOrder);
// router.post("/purchase", isAuthenticatedUser, PurchaseProductByDistributor);
// router.post("/login", loginUser);
// router.get("/all-users", getallUser);
// router.get("/:id", isAuthenticatedUser, getaUser);
// router.put("/update", isAuthenticatedUser, UpdateUser);
// router.delete("/:id", isAuthenticatedUser, deleteaUser);
// router.post("/cart", isAuthenticatedUser, UserCart);
// router.get("/getcart/user", isAuthenticatedUser, getUserCart);
// router.get("/empty-cart/user", isAuthenticatedUser, emptyCart);



module.exports = router;
