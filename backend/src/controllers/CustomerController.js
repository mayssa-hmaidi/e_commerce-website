const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Order = require("../models/Order");

// =========================================
// GET ALL CUSTOMERS - ADMIN
// =========================================

const getCustomers = async (
  req,
  res
) => {
  try {
    // =====================================
    // LOAD CUSTOMERS
    // =====================================

    const customers =
      await Customer.find()
        .select(
          "_id name email phone createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    // =====================================
    // NO CUSTOMERS
    // =====================================

    if (customers.length === 0) {
      return res.status(200).json([]);
    }

    // =====================================
    // GET ORDER STATISTICS
    // =====================================

    const customerIds =
      customers.map(
        (customer) =>
          customer._id
      );

    const orderStats =
      await Order.aggregate([
        {
          $match: {
            customerId: {
              $in: customerIds,
            },
          },
        },

        {
          $group: {
            _id: "$customerId",

            orders: {
              $sum: 1,
            },

            spent: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      "$status",
                      "cancelled",
                    ],
                  },
                  "$total",
                  0,
                ],
              },
            },

            lastOrder: {
              $max: "$createdAt",
            },
          },
        },
      ]);

    // =====================================
    // CONVERT STATS TO MAP
    // =====================================

    const statsMap =
      new Map();

    for (
      const stat of orderStats
    ) {
      if (!stat._id) {
        continue;
      }

      statsMap.set(
        String(stat._id),
        {
          orders:
            Number(
              stat.orders || 0
            ),

          spent:
            Number(
              stat.spent || 0
            ),

          lastOrder:
            stat.lastOrder ||
            null,
        }
      );
    }

    // =====================================
    // BUILD RESPONSE
    // =====================================

    const result =
      customers.map(
        (customer) => {
          const stats =
            statsMap.get(
              String(
                customer._id
              )
            ) || {
              orders: 0,
              spent: 0,
              lastOrder: null,
            };

          return {
            _id:
              customer._id,

            name:
              customer.name,

            email:
              customer.email,

            phone:
              customer.phone,

            orders:
              stats.orders,

            spent:
              Math.round(
                stats.spent * 100
              ) / 100,

            lastOrder:
              stats.lastOrder,
          };
        }
      );

    return res.status(200).json(
      result
    );
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load customers.",
    });
  }
};

// =========================================
// GET CUSTOMER BY ID - ADMIN
// =========================================

const getCustomerById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid customer ID.",
      });
    }

    const customer =
      await Customer.findById(id)
        .select(
          "_id name email phone createdAt"
        )
        .lean();

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found.",
      });
    }

    const orders =
      await Order.find({
        customerId:
          customer._id,
      })
        .select(
          "_id orderNumber total status createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    const spent =
      orders
        .filter(
          (order) =>
            order.status !==
            "cancelled"
        )
        .reduce(
          (
            total,
            order
          ) =>
            total +
            Number(
              order.total || 0
            ),
          0
        );

    return res.status(200).json({
      ...customer,

      orders:
        orders.length,

      spent:
        Math.round(
          spent * 100
        ) / 100,

      lastOrder:
        orders[0]?.createdAt ||
        null,

      orderHistory:
        orders,
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load customer.",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
};