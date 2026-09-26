const express = require("express");

const {
  getAnalyticsOverview,
} = require("../controllers/AnalyticsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/overview",
  protect,
  getAnalyticsOverview,
);

module.exports = router;