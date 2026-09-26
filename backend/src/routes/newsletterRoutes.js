const express = require("express");

const {
  subscribe,
  unsubscribe,
  getSubscribers,
  unsubscribeSubscriber,
  deleteSubscriber,
} = require("../controllers/NewsletterController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/subscribe", subscribe);
router.get("/unsubscribe/:token", unsubscribe);
router.get("/admin", protect, getSubscribers);
router.patch("/admin/:id/unsubscribe", protect, unsubscribeSubscriber);
router.delete("/admin/:id", protect, deleteSubscriber);

module.exports = router;
