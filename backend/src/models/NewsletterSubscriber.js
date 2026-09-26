const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema,
);
