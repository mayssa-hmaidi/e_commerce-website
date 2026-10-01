const Product = require("../models/Product");
const { isDeepStrictEqual } = require("util");
const {
  notifyNewProduct,
  notifyProductUpdated,
  notifyProductRemoved,
} = require("../services/newsletterNotificationService");

const PRODUCT_CATALOG_FIELDS = [
  "name",
  "price",
  "discount",
  "description",
  "variants",
  "sizes",
  "stock",
];

const getProductChanges = (before, after) => {
  const previous = before.toObject();
  const current = after.toObject();

  return PRODUCT_CATALOG_FIELDS.reduce((changes, field) => {
    if (!isDeepStrictEqual(previous[field], current[field])) {
      changes[field] = {
        before: previous[field],
        after: current[field],
      };
    }

    return changes;
  }, {});
};

const sendProductNotification = async (notify) => {
  try {
    await notify();
  } catch (error) {
    console.error("Newsletter email failed:", error.message);
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    await sendProductNotification(() => notifyNewProduct(product));

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const previousProduct = await Product.findById(req.params.id);

    if (!previousProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    const changes = getProductChanges(previousProduct, product);

    if (Object.keys(changes).length > 0) {
      const eventKey = `product:update:${product._id}:${product.updatedAt.toISOString()}`;
      await sendProductNotification(() =>
        notifyProductUpdated(product, changes, eventKey),
      );
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const eventKey = `product:delete:${product._id}:${new Date().toISOString()}`;
    await sendProductNotification(() => notifyProductRemoved(product, eventKey));

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};