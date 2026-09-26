const express = require("express");

const {
  createContactMessage,
  getContactMessages,
  markContactMessageAsRead,
  deleteContactMessage,
} = require("../controllers/ContactMessageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createContactMessage);

router.get("/admin", protect, getContactMessages);

router.put(
  "/admin/:id/read",
  protect,
  markContactMessageAsRead,
);

router.delete(
  "/admin/:id",
  protect,
  deleteContactMessage,
);

module.exports = router;