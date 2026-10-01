const express = require("express");

const {
  createOrder,
  getOrders,
  getCustomerOrders,
  getOrderById,
  getOrderForTracking,
  updateOrderStatus,
} = require("../controllers/OrderController");

const protect = require("../middleware/authMiddleware");
const customerProtect = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// Customer
router.post("/", customerProtect, createOrder);
router.get("/my-orders", customerProtect, getCustomerOrders);

// Public tracking
router.get("/track/:id", customerProtect, getOrderForTracking);

// Admin
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;