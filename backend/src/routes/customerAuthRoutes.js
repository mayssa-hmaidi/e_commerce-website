const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentCustomer,
} = require("../controllers/CustomerAuthController");
const {
  requestCustomerPasswordReset,
  resetCustomerPassword,
} = require("../controllers/PasswordResetController");

const customerProtect = require(
  "../middleware/customerAuthMiddleware",
);
const authRateLimit = require("../middleware/authRateLimit");

const router = express.Router();

// =========================================
// PUBLIC
// =========================================

router.post(
  "/register",
  authRateLimit,
  registerCustomer,
);

router.post(
  "/login",
  authRateLimit,
  loginCustomer,
);

router.post("/logout", logoutCustomer);

router.post(
  "/forgot-password",
  authRateLimit,
  requestCustomerPasswordReset,
);

router.post(
  "/reset-password",
  authRateLimit,
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