const ShopSettings = require("../models/ShopSettings");

const DEFAULT_SETTINGS = {
  storeName: "Urban Threads",
  currency: "DT",
  shippingCost: 5,
  lowStockThreshold: 5,
  supportEmail: "support@urbanthreads.com",
  whatsapp: "+216 00 000 000",
  phone: "",
  address: "",
  supportHours: "Monday – Saturday, 09:00 – 18:00",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
};

const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok"];

const isValidSocialUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const getShopSettings = async (req, res) => {
  try {
    let settings = await ShopSettings.findOne();

    if (!settings) {
      settings = await ShopSettings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Get shop settings error:", error);

    return res.status(500).json({
      message: "Failed to load shop settings.",
    });
  }
};

const getPublicContactSettings = async (req, res) => {
  try {
    let settings = await ShopSettings.findOne();

    if (!settings) {
      settings = await ShopSettings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({
      supportEmail: settings.supportEmail,
      whatsapp: settings.whatsapp,
      phone: settings.phone,
      storeName: settings.storeName,
      currency: settings.currency,
      shippingCost: settings.shippingCost,
      address: settings.address,
      supportHours: settings.supportHours,
      socialLinks: {
        instagram: settings.socialLinks?.instagram || "",
        facebook: settings.socialLinks?.facebook || "",
        tiktok: settings.socialLinks?.tiktok || "",
      },
    });
  } catch (error) {
    console.error("Get public contact settings error:", error);

    return res.status(500).json({
      message: "Failed to load contact settings.",
    });
  }
};

const updateShopSettings = async (req, res) => {
  try {
    const {
      storeName,
      currency,
      shippingCost,
      lowStockThreshold,
      supportEmail,
      whatsapp,
      phone,
      address,
      supportHours,
      socialLinks,
    } = req.body;

    if (
      socialLinks !== undefined &&
      (!socialLinks || typeof socialLinks !== "object" || Array.isArray(socialLinks))
    ) {
      return res.status(400).json({
        message: "Social links must be an object.",
      });
    }

    if (socialLinks !== undefined) {
      for (const platform of SOCIAL_PLATFORMS) {
        const value = socialLinks[platform];

        if (
          value !== undefined &&
          (typeof value !== "string" ||
            !isValidSocialUrl(value.trim()))
        ) {
          return res.status(400).json({
            message: `${platform} URL must start with http:// or https://.`,
          });
        }
      }
    }

    if (
      supportEmail !== undefined &&
      String(supportEmail).trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(supportEmail).trim(),
      )
    ) {
      return res.status(400).json({
        message: "Please enter a valid support email.",
      });
    }

    const parsedShippingCost = Number(shippingCost);
    const parsedLowStockThreshold = Number(lowStockThreshold);

    if (
      shippingCost !== undefined &&
      (!Number.isFinite(parsedShippingCost) ||
        parsedShippingCost < 0)
    ) {
      return res.status(400).json({
        message: "Shipping cost must be a valid positive number.",
      });
    }

    if (
      lowStockThreshold !== undefined &&
      (!Number.isFinite(parsedLowStockThreshold) ||
        parsedLowStockThreshold < 0)
    ) {
      return res.status(400).json({
        message: "Low stock threshold must be a valid number.",
      });
    }

    let settings = await ShopSettings.findOne();

    if (!settings) {
      settings = new ShopSettings(DEFAULT_SETTINGS);
    }

    if (storeName !== undefined) {
      settings.storeName = String(storeName).trim();
    }

    if (currency !== undefined) {
      settings.currency = String(currency).trim();
    }

    if (shippingCost !== undefined) {
      settings.shippingCost = parsedShippingCost;
    }

    if (lowStockThreshold !== undefined) {
      settings.lowStockThreshold = parsedLowStockThreshold;
    }

    if (supportEmail !== undefined) {
      settings.supportEmail = String(supportEmail)
        .trim()
        .toLowerCase();
    }

    if (whatsapp !== undefined) {
      settings.whatsapp = String(whatsapp).trim();
    }

    if (phone !== undefined) {
      settings.phone = String(phone).trim();
    }

    if (address !== undefined) {
      settings.address = String(address).trim();
    }

    if (supportHours !== undefined) {
      settings.supportHours = String(supportHours).trim();
    }

    if (socialLinks !== undefined) {
      const currentSocialLinks = settings.socialLinks || {};
      settings.socialLinks = Object.fromEntries(
        SOCIAL_PLATFORMS.map((platform) => [
          platform,
          socialLinks[platform] === undefined
            ? currentSocialLinks[platform] || ""
            : socialLinks[platform].trim(),
        ]),
      );
    }

    await settings.save();

    return res.status(200).json({
      message: "Shop settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update shop settings error:", error);

    return res.status(500).json({
      message: "Failed to update shop settings.",
    });
  }
};

module.exports = {
  getShopSettings,
  getPublicContactSettings,
  updateShopSettings,
};