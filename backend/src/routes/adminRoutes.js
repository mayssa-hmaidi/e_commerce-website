const express = require("express");

const {
  createAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/AdminController");
const {
  requestAdminPasswordReset,
  resetAdminPassword,
} = require("../controllers/PasswordResetController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// AUTH
// =========================================

router.post(
  "/register",
  createAdmin,
);

router.post(
  "/login",
  loginAdmin,
);

router.post(
  "/forgot-password",
  requestAdminPasswordReset,
);

router.post(
  "/reset-password",
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