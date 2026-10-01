const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const ShopSettings = require("../models/ShopSettings");
const PromoCode = require("../models/PromoCode");

const {
  calculateDiscount,
  normalizeCode,
  isPromoStarted,
  isPromoExpired,
  hasUsageAvailable,
} = require("./PromoCodeController");

const createOrderValidationError = (message) =>
  Object.assign(new Error(message), { statusCode: 400 });

// =========================================
// GENERATE ORDER NUMBER
// =========================================

const generateOrderNumber = async () => {
  let orderNumber;

  while (true) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    orderNumber = `PS-${randomNumber}`;

    const existingOrder = await Order.findOne({
      orderNumber,
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }
};

// =========================================
// CREATE ORDER - CUSTOMER
// =========================================

const createOrder = async (req, res) => {
  const updatedStockItems = [];

  let createdOrder = null;

  try {
    // =====================================
    // GET LOGGED-IN CUSTOMER ID
    // =====================================

    const customerId =
      req.customer?.id ||
      req.customer?.customerId;

    if (!customerId) {
      return res.status(401).json({
        message: "Customer authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(401).json({
        message: "Invalid customer authentication.",
      });
    }

    // =====================================
    // GET REQUEST DATA
    // =====================================

    const {
      customer,
      delivery,
      items,
      promoCode,
    } = req.body;

    // =====================================
    // BASIC VALIDATION
    // =====================================

    if (
      !customer ||
      !customer.name ||
      !customer.phone
    ) {
      return res.status(400).json({
        message:
          "Customer name and phone are required.",
      });
    }

    if (
      !delivery ||
      !delivery.governorate ||
      !delivery.city ||
      !delivery.address
    ) {
      return res.status(400).json({
        message:
          "Delivery information is incomplete.",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must contain at least one item.",
      });
    }

    // =====================================
    // SETTINGS
    // =====================================

    const settings =
      await ShopSettings.findOne();

    const shippingCost = Number(
      settings?.shippingCost ?? 5
    );

    // =====================================
    // BUILD ORDER ITEMS
    // =====================================

    const orderItems = [];

    let subtotal = 0;

    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(
          Number(item.quantity)
        ) ||
        Number(item.quantity) < 1
      ) {
        throw createOrderValidationError(
          "Invalid order item."
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        throw createOrderValidationError(
          "Invalid product ID."
        );
      }

      const product =
        await Product.findById(
          item.productId
        );

      if (!product) {
        throw createOrderValidationError(
          `Product "${
            item.name || "Unknown"
          }" no longer exists.`
        );
      }

      const quantity =
        Number(item.quantity);

      if (product.stock < quantity) {
        throw createOrderValidationError(
          `${product.name} does not have enough stock.`
        );
      }

      const originalPrice =
        Number(product.price) || 0;

      const discount =
        Number(product.discount) || 0;

      const finalPrice =
        Math.round(
          originalPrice *
            (1 - discount / 100) *
            100
        ) / 100;

      const itemSubtotal =
        finalPrice * quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: finalPrice,
        color: item.color || "",
        size: item.size || "",
        quantity,
      });
    }

    subtotal =
      Math.round(
        subtotal * 100
      ) / 100;

    // =====================================
    // VALIDATE PROMO
    // =====================================

    let appliedPromo = null;
    let discountAmount = 0;

    if (
      promoCode &&
      String(promoCode).trim()
    ) {
      const normalizedPromoCode =
        normalizeCode(promoCode);

      appliedPromo =
        await PromoCode.findOne({
          code: normalizedPromoCode,
        });

      if (!appliedPromo) {
        throw createOrderValidationError(
          "Promo code not found."
        );
      }

      if (!appliedPromo.isActive) {
        throw createOrderValidationError(
          "This promo code is inactive."
        );
      }

      if (
        !isPromoStarted(
          appliedPromo
        )
      ) {
        throw createOrderValidationError(
          "This promo code is not active yet."
        );
      }

      if (
        isPromoExpired(
          appliedPromo
        )
      ) {
        throw createOrderValidationError(
          "This promo code has expired."
        );
      }

      if (
        !hasUsageAvailable(
          appliedPromo
        )
      ) {
        throw createOrderValidationError(
          "This promo code has reached its usage limit."
        );
      }

      if (
        subtotal <
        Number(
          appliedPromo.minOrderAmount || 0
        )
      ) {
        throw createOrderValidationError(
          `Minimum order amount is ${Number(
            appliedPromo.minOrderAmount || 0
          ).toFixed(2)} DT.`
        );
      }

      discountAmount =
        calculateDiscount(
          appliedPromo,
          subtotal
        );
    }

    discountAmount =
      Math.round(
        discountAmount * 100
      ) / 100;

    const total = Math.max(
      Math.round(
        (
          subtotal -
          discountAmount +
          shippingCost
        ) * 100
      ) / 100,
      0
    );

    // =====================================
    // REDUCE STOCK
    // =====================================

    for (const item of orderItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        throw createOrderValidationError(
          `Stock changed for ${item.name}. Please try again.`
        );
      }

      updatedStockItems.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // =====================================
    // CREATE ORDER
    // =====================================

    const orderNumber =
      await generateOrderNumber();

    createdOrder =
      await Order.create({
        // IMPORTANT:
        // This links the order to the
        // logged-in Customer account.
        customerId,

        customer: {
          name: customer.name.trim(),

          phone: customer.phone.trim(),

          email: customer.email
            ? customer.email
                .trim()
                .toLowerCase()
            : "",
        },

        orderNumber,

        delivery: {
          governorate:
            delivery.governorate,

          city: delivery.city,

          address:
            delivery.address,

          additionalDetails:
            delivery.additionalDetails ||
            "",
        },

        items: orderItems,

        subtotal,

        shipping:
          shippingCost,

        promoCode:
          appliedPromo
            ? appliedPromo.code
            : null,

        discountAmount,

        total,

        status: "pending",
      });

    // =====================================
    // CONSUME PROMO USAGE
    // =====================================

    if (appliedPromo) {
      const promoUpdate =
        await PromoCode.findOneAndUpdate(
          {
            _id:
              appliedPromo._id,

            isActive: true,

            $or: [
              {
                usageLimit: null,
              },
              {
                $expr: {
                  $lt: [
                    "$usedCount",
                    "$usageLimit",
                  ],
                },
              },
            ],
          },
          {
            $inc: {
              usedCount: 1,
            },
          },
          {
            new: true,
          }
        );

      if (!promoUpdate) {
        throw new Error(
          "Promo code is no longer available. Please try again."
        );
      }
    }

    // =====================================
    // SUCCESS
    // =====================================

    return res.status(201).json({
      message:
        "Order created successfully.",

      order: createdOrder,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    // =====================================
    // ROLLBACK STOCK
    // =====================================

    for (
      const item of
      updatedStockItems
    ) {
      try {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Stock rollback error:",
          rollbackError
        );
      }
    }

    // =====================================
    // DELETE CREATED ORDER ON FAILURE
    // =====================================

    if (createdOrder?._id) {
      try {
        await Order.findByIdAndDelete(
          createdOrder._id
        );
      } catch (deleteError) {
        console.error(
          "Order rollback error:",
          deleteError
        );
      }
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: statusCode === 400
        ? error.message
        : "Failed to create order.",
    });
  }
};

// =========================================
// GET ALL ORDERS - ADMIN
// =========================================

const getOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json(
      orders
    );
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load orders.",
    });
  }
};

// =========================================
// GET CUSTOMER ORDERS - LOGGED-IN CUSTOMER
// =========================================

const getCustomerOrders =
  async (
    req,
    res
  ) => {
    try {
      // =====================================
      // GET CUSTOMER ID FROM JWT
      // =====================================

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

      // =====================================
      // FIND CUSTOMER ORDERS
      // =====================================

      const orders =
        await Order.find({
          customerId,
        })
          .select(
            "_id orderNumber items subtotal shipping promoCode discountAmount total status delivery createdAt updatedAt"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json(
        orders
      );
    } catch (error) {
      console.error(
        "Get customer orders error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load customer orders.",
      });
    }
  };

// =========================================
// GET ORDER BY ID - ADMIN
// =========================================

const getOrderById = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found.",
      });
    }

    return res.status(200).json(
      order
    );
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load order.",
    });
  }
};

// =========================================
// PUBLIC ORDER TRACKING
// =========================================

const getOrderForTracking =
  async (
    req,
    res
  ) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order ID.",
        });
      }

      const order =
        await Order.findById(
          req.params.id
        ).select(
          "_id orderNumber status items subtotal shipping promoCode discountAmount total createdAt updatedAt"
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      return res.status(200).json(
        order
      );
    } catch (error) {
      console.error(
        "Track order error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load order tracking.",
      });
    }
  };

// =========================================
// UPDATE STATUS - ADMIN
// =========================================

const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order ID.",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        message:
          "Order status updated successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update order status.",
      });
    }
  };

module.exports = {
  createOrder,
  getOrders,
  getCustomerOrders,
  getOrderById,
  getOrderForTracking,
  updateOrderStatus,
};