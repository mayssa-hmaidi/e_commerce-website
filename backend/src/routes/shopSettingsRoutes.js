const express = require("express");

const {
  getShopSettings,
  getPublicContactSettings,
  updateShopSettings,
} = require("../controllers/ShopSettingsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public contact information
router.get("/contact", getPublicContactSettings);

// Admin settings
router.get("/", protect, getShopSettings);

router.put("/", protect, updateShopSettings);

module.exports = router;