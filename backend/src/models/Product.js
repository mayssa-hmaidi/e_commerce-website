const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (images) {
          return images.length === 4;
        },
        message: "Each color must have exactly 4 images",
      },
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    variants: {
      type: [productVariantSchema],
      required: true,
      validate: {
        validator: function (variants) {
          return variants.length > 0;
        },
        message: "Product must have at least one color",
      },
    },

    sizes: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);