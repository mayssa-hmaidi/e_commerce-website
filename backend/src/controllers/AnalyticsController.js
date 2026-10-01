const Order = require("../models/Order");

const SALES_STATUSES = [
  "confirmed",
  "shipped",
  "delivered",
];

const startOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const startOfMonth = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
};

const addDays = (date, amount) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount,
  );

  return result;
};

const addMonths = (date, amount) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
  );
};

const formatDayKey = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatMonthKey = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
  ].join("-");
};

const getAnalyticsOverview = async (
  req,
  res,
) => {
  try {
    const period =
      req.query.period || "30d";

    const now = new Date();

    let startDate;

    if (period === "7d") {
      startDate = startOfDay(
        addDays(now, -6),
      );
    } else if (period === "30d") {
      startDate = startOfDay(
        addDays(now, -29),
      );
    } else if (period === "12m") {
      startDate = startOfMonth(
        addMonths(now, -11),
      );
    } else {
      return res.status(400).json({
        message:
          "Invalid analytics period.",
      });
    }

    const salesMatch = {
      status: {
        $in: SALES_STATUSES,
      },

      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    };

    // =========================================
    // SUMMARY
    // =========================================

    const summaryResult =
      await Order.aggregate([
        {
          $match: salesMatch,
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: "$total",
            },

            totalOrders: {
              $sum: 1,
            },

            totalItemsSold: {
              $sum: {
                $sum: "$items.quantity",
              },
            },
          },
        },
      ]);

    const summary =
      summaryResult[0] || {
        totalSales: 0,
        totalOrders: 0,
        totalItemsSold: 0,
      };

    const averageOrderValue =
      summary.totalOrders > 0
        ? summary.totalSales /
          summary.totalOrders
        : 0;

    // =========================================
    // RAW TIMELINE
    // =========================================

    let rawTimeline = [];

    if (period === "12m") {
      rawTimeline =
        await Order.aggregate([
          {
            $match: salesMatch,
          },

          {
            $group: {
              _id: {
                year: {
                  $year: "$createdAt",
                },

                month: {
                  $month: "$createdAt",
                },
              },

              sales: {
                $sum: "$total",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
            },
          },
        ]);
    } else {
      rawTimeline =
        await Order.aggregate([
          {
            $match: salesMatch,
          },

          {
            $group: {
              _id: {
                year: {
                  $year: "$createdAt",
                },

                month: {
                  $month: "$createdAt",
                },

                day: {
                  $dayOfMonth:
                    "$createdAt",
                },
              },

              sales: {
                $sum: "$total",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
              "_id.day": 1,
            },
          },
        ]);
    }

    // =========================================
    // MAP EXISTING DATA
    // =========================================

    const timelineMap = new Map();

    rawTimeline.forEach((item) => {
      if (period === "12m") {
        const key =
          `${item._id.year}-` +
          `${String(
            item._id.month,
          ).padStart(2, "0")}`;

        timelineMap.set(key, {
          sales: item.sales,
          orders: item.orders,
        });
      } else {
        const key =
          `${item._id.year}-` +
          `${String(
            item._id.month,
          ).padStart(2, "0")}-` +
          `${String(
            item._id.day,
          ).padStart(2, "0")}`;

        timelineMap.set(key, {
          sales: item.sales,
          orders: item.orders,
        });
      }
    });

    // =========================================
    // COMPLETE TIMELINE
    // =========================================

    const salesTimeline = [];

    if (period === "12m") {
      const firstMonth =
        startOfMonth(
          addMonths(now, -11),
        );

      for (let i = 0; i < 12; i++) {
        const date = addMonths(
          firstMonth,
          i,
        );

        const key =
          formatMonthKey(date);

        const value =
          timelineMap.get(key) || {
            sales: 0,
            orders: 0,
          };

        salesTimeline.push({
          key,

          label:
            date.toLocaleDateString(
              "en-GB",
              {
                month: "short",
                year: "numeric",
              },
            ),

          sales: value.sales,
          orders: value.orders,
        });
      }
    } else {
      const totalDays =
        period === "7d" ? 7 : 30;

      const firstDay =
        startOfDay(
          addDays(
            now,
            -(totalDays - 1),
          ),
        );

      for (
        let i = 0;
        i < totalDays;
        i++
      ) {
        const date = addDays(
          firstDay,
          i,
        );

        const key =
          formatDayKey(date);

        const value =
          timelineMap.get(key) || {
            sales: 0,
            orders: 0,
          };

        salesTimeline.push({
          key,

          label:
            date.toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
              },
            ),

          sales: value.sales,
          orders: value.orders,
        });
      }
    }

    // =========================================
    // STATUS
    // =========================================

    const ordersByStatus =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: now,
            },
          },
        },

        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    // =========================================
    // TOP PRODUCTS
    // =========================================

    const topProducts =
      await Order.aggregate([
        {
          $match: salesMatch,
        },

        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.productId",

            name: {
              $first:
                "$items.name",
            },

            unitsSold: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum: {
                $multiply: [
                  "$items.price",
                  "$items.quantity",
                ],
              },
            },
          },
        },

        {
          $sort: {
            unitsSold: -1,
          },
        },

        {
          $limit: 5,
        },
      ]);

    // =========================================
    // RESPONSE
    // =========================================

    res.status(200).json({
      period,

      summary: {
        totalSales:
          summary.totalSales,

        totalOrders:
          summary.totalOrders,

        totalItemsSold:
          summary.totalItemsSold,

        averageOrderValue,
      },

      salesTimeline,

      ordersByStatus,

      topProducts,
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to load analytics",
    });
  }
};

module.exports = {
  getAnalyticsOverview,
};