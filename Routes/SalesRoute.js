  const express = require("express");

const { isAuthenticatedUser } = require("../Middleware/auth");
const { CreateSales } = require("../Controller/SalesCtrl");

const router = express.Router();


router.post("/", CreateSales);

module.exports = router;
