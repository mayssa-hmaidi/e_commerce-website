const Product = require("../models/Product");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (typeof searchQuery !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid search query.",
      });
    }

    const query = searchQuery.trim();

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        count: 0,
        products: [],
      });
    }

    if (query.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Search query is too long.",
      });
    }

    const searchRegex = new RegExp(escapeRegex(query), "i");
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { "variants.color": searchRegex },
      ],
    })
      .select("name price discount description variants sizes stock")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Product Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to search products.",
    });
  }
};

module.exports = {
  searchProducts,
};
