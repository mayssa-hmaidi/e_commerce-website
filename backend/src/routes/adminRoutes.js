const express = require("express");

const {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/AdminController");
const {
  requestAdminPasswordReset,
  resetAdminPassword,
} = require("../controllers/PasswordResetController");

const protect = require("../middleware/authMiddleware");
const authRateLimit = require("../middleware/authRateLimit");

const router = express.Router();

// =========================================
// AUTH
// =========================================

router.post(
  "/login",
  authRateLimit,
  loginAdmin,
);

router.post("/logout", logoutAdmin);

router.post(
  "/forgot-password",
  authRateLimit,
  requestAdminPasswordReset,
);

router.post(
  "/reset-password",
  authRateLimit,
  resetAdminPassword,
);

// =========================================
// PROFILE
// =========================================

router.get(
  "/profile",
  protect,
  getAdminProfile,
);

router.put(
  "/profile",
  protect,
  updateAdminProfile,
);

router.put(
  "/change-password",
  protect,
  changeAdminPassword,
);

module.exports = router;