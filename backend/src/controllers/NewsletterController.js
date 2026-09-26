const crypto = require("crypto");
const mongoose = require("mongoose");

const NewsletterSubscriber = require("../models/NewsletterSubscriber");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUnsubscribeToken = () =>
  crypto.randomBytes(32).toString("hex");

const subscribe = async (req, res) => {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "";

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({
      message: "Enter a valid email address.",
    });
  }

  try {
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });

    if (existingSubscriber?.subscribed) {
      return res.status(200).json({
        message: "This email is already subscribed.",
        alreadySubscribed: true,
        subscribed: true,
      });
    }

    if (existingSubscriber) {
      existingSubscriber.subscribed = true;
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = null;
      await existingSubscriber.save();

      return res.status(200).json({
        message: "You are subscribed to our updates again.",
        alreadySubscribed: false,
        subscribed: true,
      });
    }

    await NewsletterSubscriber.create({
      email,
      subscribed: true,
      subscribedAt: new Date(),
      unsubscribeToken: createUnsubscribeToken(),
    });

    return res.status(201).json({
      message: "Thanks for subscribing.",
      alreadySubscribed: false,
      subscribed: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: "This email is already subscribed.",
        alreadySubscribed: true,
        subscribed: true,
      });
    }

    console.error("Newsletter subscription failed:", error.message);
    return res.status(500).json({
      message: "Unable to subscribe right now. Please try again later.",
    });
  }
};

const unsubscribe = async (req, res) => {
  const token = req.params.token;

  if (!/^[a-f0-9]{64}$/i.test(token || "")) {
    return res.status(404).json({ message: "Unsubscribe link is invalid or expired." });
  }

  try {
    const subscriber = await NewsletterSubscriber.findOne({
      unsubscribeToken: token,
    }).select("+unsubscribeToken");

    if (!subscriber) {
      return res.status(404).json({
        message: "Unsubscribe link is invalid or expired.",
      });
    }

    if (subscriber.subscribed) {
      subscriber.subscribed = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();
    }

    return res.status(200).json({
      message: "You have been unsubscribed successfully.",
      subscribed: false,
    });
  } catch (error) {
    console.error("Newsletter unsubscribe failed:", error.message);
    return res.status(500).json({
      message: "Unable to unsubscribe right now. Please try again later.",
    });
  }
};

const getSubscribers = async (_req, res) => {
  try {
    const [subscribers, activeCount] = await Promise.all([
      NewsletterSubscriber.find()
        .select("email subscribed subscribedAt unsubscribedAt createdAt")
        .sort({ subscribedAt: -1, createdAt: -1 })
        .lean(),
      NewsletterSubscriber.countDocuments({ subscribed: true }),
    ]);

    return res.status(200).json({ activeCount, subscribers });
  } catch (error) {
    console.error("Newsletter subscriber list failed:", error.message);
    return res.status(500).json({
      message: "Unable to load newsletter subscribers.",
    });
  }
};

const unsubscribeSubscriber = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid subscriber." });
  }

  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return res.status(200).json({
      message: "Subscriber has been unsubscribed.",
      subscriber: {
        _id: subscriber._id,
        email: subscriber.email,
        subscribed: subscriber.subscribed,
        subscribedAt: subscriber.subscribedAt,
        unsubscribedAt: subscriber.unsubscribedAt,
      },
    });
  } catch (error) {
    console.error("Admin unsubscribe failed:", error.message);
    return res.status(500).json({
      message: "Unable to update this subscriber.",
    });
  }
};

const deleteSubscriber = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid subscriber." });
  }

  try {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    return res.status(200).json({ message: "Subscriber deleted." });
  } catch (error) {
    console.error("Newsletter subscriber delete failed:", error.message);
    return res.status(500).json({
      message: "Unable to delete this subscriber.",
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  unsubscribeSubscriber,
  deleteSubscriber,
};
