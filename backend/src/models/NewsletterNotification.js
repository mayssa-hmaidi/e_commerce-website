const mongoose = require("mongoose");

const newsletterNotificationSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["product", "promotion"],
    },
    status: {
      type: String,
      required: true,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "NewsletterNotification",
  newsletterNotificationSchema,
);
