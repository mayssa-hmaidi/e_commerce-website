const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("../controllers/WishlistController");

const customerProtect = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// Customer wishlist
router.get(
  "/",
  customerProtect,
  getWishlist
);

router.post(
  "/",
  customerProtect,
  addToWishlist
);

router.delete(
  "/:productId",
  customerProtect,
  removeFromWishlist
);

router.get(
  "/check/:productId",
  customerProtect,
  checkWishlist
);

module.exports = router;