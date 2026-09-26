const mongoose = require("mongoose");

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// =========================================
// GET CUSTOMER WISHLIST
// =========================================

const getWishlist = async (req, res) => {
  try {
    const customerId =
      req.customer?.id ||
      req.customer?.customerId;

    if (!customerId) {
      return res.status(401).json({
        message:
          "Customer authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        customerId
      )
    ) {
      return res.status(401).json({
        message:
          "Invalid customer authentication.",
      });
    }

    let wishlist =
      await Wishlist.findOne({
        customerId,
      }).populate("products");

    // Create an empty wishlist
    // when the customer does not
    // have one yet.
    if (!wishlist) {
      wishlist = await Wishlist.create({
        customerId,
        products: [],
      });

      wishlist = await Wishlist.findById(
        wishlist._id
      ).populate("products");
    }

    return res.status(200).json({
      wishlistId: wishlist._id,
      customerId: wishlist.customerId,
      products: wishlist.products,
    });
  } catch (error) {
    console.error(
      "Get wishlist error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load wishlist.",
    });
  }
};

// =========================================
// ADD PRODUCT TO WISHLIST
// =========================================

const addToWishlist = async (
  req,
  res
) => {
  try {
    const customerId =
      req.customer?.id ||
      req.customer?.customerId;

    const { productId } = req.body;

    if (!customerId) {
      return res.status(401).json({
        message:
          "Customer authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        customerId
      )
    ) {
      return res.status(401).json({
        message:
          "Invalid customer authentication.",
      });
    }

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        message:
          "Valid product ID is required.",
      });
    }

    // Check that product exists
    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found.",
      });
    }

    // Create wishlist if necessary
    let wishlist =
      await Wishlist.findOneAndUpdate(
        {
          customerId,
        },
        {
          $addToSet: {
            products: productId,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    wishlist =
      await Wishlist.findById(
        wishlist._id
      ).populate("products");

    return res.status(200).json({
      message:
        "Product added to wishlist.",
      wishlistId: wishlist._id,
      customerId: wishlist.customerId,
      products: wishlist.products,
    });
  } catch (error) {
    console.error(
      "Add wishlist error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add product to wishlist.",
    });
  }
};

// =========================================
// REMOVE PRODUCT FROM WISHLIST
// =========================================

const removeFromWishlist = async (
  req,
  res
) => {
  try {
    const customerId =
      req.customer?.id ||
      req.customer?.customerId;

    const { productId } = req.params;

    if (!customerId) {
      return res.status(401).json({
        message:
          "Customer authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        customerId
      )
    ) {
      return res.status(401).json({
        message:
          "Invalid customer authentication.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid product ID.",
      });
    }

    const wishlist =
      await Wishlist.findOneAndUpdate(
        {
          customerId,
        },
        {
          $pull: {
            products: productId,
          },
        },
        {
          new: true,
        }
      );

    if (!wishlist) {
      return res.status(404).json({
        message:
          "Wishlist not found.",
      });
    }

    const updatedWishlist =
      await Wishlist.findById(
        wishlist._id
      ).populate("products");

    return res.status(200).json({
      message:
        "Product removed from wishlist.",
      wishlistId:
        updatedWishlist._id,
      customerId:
        updatedWishlist.customerId,
      products:
        updatedWishlist.products,
    });
  } catch (error) {
    console.error(
      "Remove wishlist error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to remove product from wishlist.",
    });
  }
};

// =========================================
// CHECK IF PRODUCT IS IN WISHLIST
// =========================================

const checkWishlist = async (
  req,
  res
) => {
  try {
    const customerId =
      req.customer?.id ||
      req.customer?.customerId;

    const { productId } = req.params;

    if (!customerId) {
      return res.status(401).json({
        message:
          "Customer authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        customerId
      )
    ) {
      return res.status(401).json({
        message:
          "Invalid customer authentication.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid product ID.",
      });
    }

    const wishlist =
      await Wishlist.findOne({
        customerId,
        products: productId,
      });

    return res.status(200).json({
      isFavorite: Boolean(wishlist),
    });
  } catch (error) {
    console.error(
      "Check wishlist error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to check wishlist.",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};