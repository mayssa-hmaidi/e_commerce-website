const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
} = require("../controllers/CustomerAuthController");
const {
  requestCustomerPasswordReset,
  resetCustomerPassword,
} = require("../controllers/PasswordResetController");

const customerProtect = require(
  "../middleware/customerAuthMiddleware",
);

const router = express.Router();

// =========================================
// PUBLIC
// =========================================

router.post(
  "/register",
  registerCustomer,
);

router.post(
  "/login",
  loginCustomer,
);

router.post(
  "/forgot-password",
  requestCustomerPasswordReset,
);

router.post(
  "/reset-password",
  resetCustomerPassword,
);

// =========================================
// PROTECTED
// =========================================

router.get(
  "/me",
  customerProtect,
  getCurrentCustomer,
);

module.exports = router;