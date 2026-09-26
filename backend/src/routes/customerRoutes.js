const express = require("express");

const {
  getCustomers,
  getCustomerById,
} = require("../controllers/CustomerController");

const protect = require("../middleware/authMiddleware");

const router =
  express.Router();

// =========================================
// ADMIN CUSTOMERS
// =========================================

router.get(
  "/",
  protect,
  getCustomers
);

router.get(
  "/:id",
  protect,
  getCustomerById
);

module.exports = router;