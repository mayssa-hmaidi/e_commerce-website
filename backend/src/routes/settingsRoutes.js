const express = require("express");

const {
  getShopSettings,
  updateShopSettings,
} = require("../controllers/ShopSettingsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// ADMIN
// =========================================

router.get(
  "/",
  protect,
  getShopSettings,
);

router.put(
  "/",
  protect,
  updateShopSettings,
);

module.exports = router;