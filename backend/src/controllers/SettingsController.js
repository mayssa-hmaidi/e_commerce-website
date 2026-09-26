const ShopSettings = require("../models/ShopSettings");

// =========================================
// GET SETTINGS
// ADMIN ONLY
// =========================================

const getSettings = async (
  req,
  res
) => {
  try {
    let settings =
      await ShopSettings.findOne();

    if (!settings) {
      settings =
        await ShopSettings.create({});
    }

    return res.status(200).json(
      settings
    );
  } catch (error) {
    console.error(
      "Get settings error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get settings",
      error: error.message,
    });
  }
};

// =========================================
// UPDATE SETTINGS
// ADMIN ONLY
// =========================================

const updateSettings = async (
  req,
  res
) => {
  try {
    const {
      storeName,
      currency,
      shippingCost,
      lowStockThreshold,
      supportEmail,
    } = req.body;

    if (
      shippingCost !== undefined &&
      Number(shippingCost) < 0
    ) {
      return res.status(400).json({
        message:
          "Shipping cost cannot be negative.",
      });
    }

    if (
      lowStockThreshold !==
        undefined &&
      Number(lowStockThreshold) < 0
    ) {
      return res.status(400).json({
        message:
          "Low stock threshold cannot be negative.",
      });
    }

    const settings =
      await ShopSettings.findOneAndUpdate(
        {},
        {
          storeName,
          currency,
          shippingCost:
            Number(shippingCost),
          lowStockThreshold:
            Number(
              lowStockThreshold
            ),
          supportEmail:
            supportEmail
              ?.toLowerCase()
              .trim() || "",
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    return res.status(200).json(
      settings
    );
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};