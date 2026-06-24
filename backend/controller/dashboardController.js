import Bill from "../models/billModel.js";

// ======================================================
// HELPERS
// ======================================================

const getDateRange = (range) => {
  const now = new Date();

  let startDate = new Date();

  switch (range) {
    case "7days":
      startDate.setDate(now.getDate() - 7);

      break;

    case "30days":
      startDate.setDate(now.getDate() - 30);

      break;

    case "90days":
      startDate.setDate(now.getDate() - 90);

      break;

    case "1year":
      startDate.setFullYear(now.getFullYear() - 1);

      break;

    default:
      startDate.setDate(now.getDate() - 30);
  }

  return startDate;
};

// ======================================================
// ORDER ANALYTICS
// ======================================================

export const getOrderAnalytics = async (req, res) => {
  try {
    const range = req.query.range || "30days";

    const startDate = getDateRange(range);

    const analytics = await Bill.aggregate([
      {
        $match: {
          user: req.user._id,

          status: "completed",

          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            day: {
              $dayOfMonth: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          totalOrders: {
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

    // ================= FORMAT =================

    const formatted = analytics.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",

          day: "numeric",
        }),

        value: item.totalOrders,
      };
    });

    return res.status(200).json({
      range,

      analytics: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// REVENUE ANALYTICS (Production-level with payment dates)
// ======================================================

export const getRevenueAnalytics = async (req, res) => {
  try {
    const range = req.query.range || "30days";

    const startDate = getDateRange(range);

    // Unwind payments to get individual payment records with dates
    const analytics = await Bill.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        // Unwind payments array to separate each payment
        $unwind: {
          path: "$payments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "payments.paymentDate": {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dayOfMonth: "$payments.paymentDate",
            },
            month: {
              $month: "$payments.paymentDate",
            },
            year: {
              $year: "$payments.paymentDate",
            },
          },
          totalRevenue: {
            $sum: "$payments.amount",
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

    // ================= FORMAT =================

    const formatted = analytics.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",

          day: "numeric",
        }),

        value: item.totalRevenue,
      };
    });

    return res.status(200).json({
      range,

      analytics: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// DASHBOARD SUMMARY
// ======================================================

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // ================= TODAY =================

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // ==================================================
    // AGGREGATION
    // ==================================================

    const summary = await Bill.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      {
        $group: {
          _id: null,

          // ================= ORDERS =================

          totalOrders: {
            $sum: 1,
          },

          completedOrders: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "completed"],
                },

                1,

                0,
              ],
            },
          },

          workingOrders: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "working"],
                },

                1,

                0,
              ],
            },
          },

          // ================= MONEY =================

          totalRevenue: {
            $sum: "$receivedAmount",
          },

          pendingPayments: {
            $sum: "$balanceAmount",
          },

          totalBusinessAmount: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    // ==================================================
    // TODAY STATS
    // ==================================================

    const todayStats = await Bill.aggregate([
      {
        $match: {
          user: userId,

          createdAt: {
            $gte: today,
          },
        },
      },

      {
        $group: {
          _id: null,

          todayOrders: {
            $sum: 1,
          },

          todayRevenue: {
            $sum: "$receivedAmount",
          },
        },
      },
    ]);

    // ==================================================
    // RESPONSE
    // ==================================================

    const data = summary[0] || {
      totalOrders: 0,

      completedOrders: 0,

      workingOrders: 0,

      totalRevenue: 0,

      pendingPayments: 0,

      totalBusinessAmount: 0,
    };

    const todayData = todayStats[0] || {
      todayOrders: 0,

      todayRevenue: 0,
    };

    return res.status(200).json({
      overview: {
        totalOrders: data.totalOrders,

        completedOrders: data.completedOrders,

        workingOrders: data.workingOrders,

        totalRevenue: data.totalRevenue,

        pendingPayments: data.pendingPayments,

        totalBusinessAmount: data.totalBusinessAmount,
      },

      today: {
        orders: todayData.todayOrders,

        revenue: todayData.todayRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
