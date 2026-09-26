const express = require("express");

const {
  createPromoCode,
  getPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  togglePromoCode,
  deletePromoCode,
  validatePromoCode,
} = require("../controllers/PromoCodeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// CUSTOMER
// =========================================

// Public promo validation
router.post("/validate", validatePromoCode);

// =========================================
// ADMIN
// =========================================

// Get all promo codes
router.get("/", protect, getPromoCodes);

// Get one promo code
router.get("/:id", protect, getPromoCodeById);

// Create promo code
router.post("/", protect, createPromoCode);

// Update promo code
router.put("/:id", protect, updatePromoCode);

// Enable / disable promo code
router.patch("/:id/toggle", protect, togglePromoCode);

// Delete promo code
router.delete("/:id", protect, deletePromoCode);

module.exports = router;