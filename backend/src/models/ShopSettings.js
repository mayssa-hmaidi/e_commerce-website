const mongoose = require("mongoose");

const shopSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Urban Threads",
      trim: true,
    },

    currency: {
      type: String,
      default: "DT",
      trim: true,
    },

    shippingCost: {
      type: Number,
      default: 5,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    supportEmail: {
      type: String,
      default: "support@urbanthreads.com",
      trim: true,
      lowercase: true,
    },

    whatsapp: {
      type: String,
      default: "+216 00 000 000",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    supportHours: {
      type: String,
      default: "Monday – Saturday, 09:00 – 18:00",
      trim: true,
    },

    socialLinks: {
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      tiktok: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ShopSettings", shopSettingsSchema);