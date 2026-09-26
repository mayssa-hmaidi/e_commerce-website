const PromoCode = require("../models/PromoCode");
const { notifyPromotion } = require("../services/newsletterNotificationService");

const schedulePromotionNotification = (promoCode) => {
  setImmediate(() => {
    void notifyPromotion(promoCode).catch((error) => {
      console.error("Newsletter email failed:", error.message);
    });
  });
};

// =========================================
// HELPERS
// =========================================

const normalizeCode = (code) => {
  return String(code || "")
    .trim()
    .toUpperCase();
};

const isPromoStarted = (promoCode) => {
  if (!promoCode.startsAt) {
    return true;
  }

  return new Date() >= new Date(promoCode.startsAt);
};

const isPromoExpired = (promoCode) => {
  if (!promoCode.expiresAt) {
    return false;
  }

  return new Date() > new Date(promoCode.expiresAt);
};

const hasUsageAvailable = (promoCode) => {
  if (promoCode.usageLimit === null) {
    return true;
  }

  return (
    Number(promoCode.usedCount || 0) <
    Number(promoCode.usageLimit)
  );
};

const calculateDiscount = (
  promoCode,
  subtotal,
) => {
  const safeSubtotal = Math.max(
    Number(subtotal) || 0,
    0,
  );

  if (promoCode.type === "percentage") {
    const percentage = Math.min(
      Math.max(Number(promoCode.value), 0),
      100,
    );

    return Math.min(
      safeSubtotal,
      safeSubtotal * (percentage / 100),
    );
  }

  return Math.min(
    safeSubtotal,
    Math.max(Number(promoCode.value), 0),
  );
};

// =========================================
// CREATE
// =========================================

const createPromoCode = async (
  req,
  res,
) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    const normalizedCode =
      normalizeCode(code);

    if (!normalizedCode) {
      return res.status(400).json({
        message: "Promo code is required.",
      });
    }

    if (
      !["percentage", "fixed"].includes(
        type,
      )
    ) {
      return res.status(400).json({
        message:
          "Promo type must be percentage or fixed.",
      });
    }

    const numericValue = Number(value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue <= 0
    ) {
      return res.status(400).json({
        message:
          "Promo value must be greater than 0.",
      });
    }

    if (
      type === "percentage" &&
      numericValue > 100
    ) {
      return res.status(400).json({
        message:
          "Percentage discount cannot exceed 100%.",
      });
    }

    const numericMinOrderAmount =
      Number(minOrderAmount || 0);

    if (
      !Number.isFinite(
        numericMinOrderAmount,
      ) ||
      numericMinOrderAmount < 0
    ) {
      return res.status(400).json({
        message:
          "Minimum order amount must be 0 or greater.",
      });
    }

    let numericUsageLimit = null;

    if (
      usageLimit !== null &&
      usageLimit !== undefined &&
      usageLimit !== ""
    ) {
      numericUsageLimit =
        Number(usageLimit);

      if (
        !Number.isFinite(
          numericUsageLimit,
        ) ||
        numericUsageLimit < 1
      ) {
        return res.status(400).json({
          message:
            "Usage limit must be at least 1.",
        });
      }
    }

    const existingPromo =
      await PromoCode.findOne({
        code: normalizedCode,
      });

    if (existingPromo) {
      return res.status(400).json({
        message:
          "A promo code with this code already exists.",
      });
    }

    const startDate = startsAt
      ? new Date(startsAt)
      : new Date();

    const endDate = expiresAt
      ? new Date(expiresAt)
      : null;

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date.",
      });
    }

    if (
      endDate &&
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid expiration date.",
      });
    }

    if (
      endDate &&
      endDate <= startDate
    ) {
      return res.status(400).json({
        message:
          "Expiration date must be after the start date.",
      });
    }

    const promoCode =
      await PromoCode.create({
        code: normalizedCode,
        type,
        value: numericValue,
        minOrderAmount:
          numericMinOrderAmount,
        usageLimit: numericUsageLimit,
        usedCount: 0,
        startsAt: startDate,
        expiresAt: endDate,
        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      });

    if (promoCode.isActive) {
      schedulePromotionNotification(promoCode);
    }

    return res.status(201).json(
      promoCode,
    );
  } catch (error) {
    console.error(
      "Create promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to create promo code.",
    });
  }
};

// =========================================
// GET ALL
// =========================================

const getPromoCodes = async (
  req,
  res,
) => {
  try {
    const promoCodes =
      await PromoCode.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json(
      promoCodes,
    );
  } catch (error) {
    console.error(
      "Get promo codes error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load promo codes.",
    });
  }
};

// =========================================
// GET ONE
// =========================================

const getPromoCodeById = async (
  req,
  res,
) => {
  try {
    const promoCode =
      await PromoCode.findById(
        req.params.id,
      ).lean();

    if (!promoCode) {
      return res.status(404).json({
        message:
          "Promo code not found.",
      });
    }

    return res.status(200).json(
      promoCode,
    );
  } catch (error) {
    console.error(
      "Get promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load promo code.",
    });
  }
};

// =========================================
// UPDATE
// =========================================

const updatePromoCode = async (
  req,
  res,
) => {
  try {
    const promoCode =
      await PromoCode.findById(
        req.params.id,
      );

    if (!promoCode) {
      return res.status(404).json({
        message:
          "Promo code not found.",
      });
    }

    const wasActive = promoCode.isActive;

    const {
      code,
      type,
      value,
      minOrderAmount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    const normalizedCode =
      normalizeCode(
        code ?? promoCode.code,
      );

    if (!normalizedCode) {
      return res.status(400).json({
        message: "Promo code is required.",
      });
    }

    if (
      !["percentage", "fixed"].includes(
        type ?? promoCode.type,
      )
    ) {
      return res.status(400).json({
        message:
          "Promo type must be percentage or fixed.",
      });
    }

    const nextType =
      type ?? promoCode.type;

    const nextValue =
      Number(value ?? promoCode.value);

    if (
      !Number.isFinite(nextValue) ||
      nextValue <= 0
    ) {
      return res.status(400).json({
        message:
          "Promo value must be greater than 0.",
      });
    }

    if (
      nextType === "percentage" &&
      nextValue > 100
    ) {
      return res.status(400).json({
        message:
          "Percentage discount cannot exceed 100%.",
      });
    }

    const nextMinOrderAmount =
      Number(
        minOrderAmount ??
          promoCode.minOrderAmount ??
          0,
      );

    if (
      !Number.isFinite(
        nextMinOrderAmount,
      ) ||
      nextMinOrderAmount < 0
    ) {
      return res.status(400).json({
        message:
          "Minimum order amount must be 0 or greater.",
      });
    }

    let nextUsageLimit =
      promoCode.usageLimit;

    if (
      usageLimit === null ||
      usageLimit === ""
    ) {
      nextUsageLimit = null;
    } else if (
      usageLimit !== undefined
    ) {
      nextUsageLimit =
        Number(usageLimit);

      if (
        !Number.isFinite(
          nextUsageLimit,
        ) ||
        nextUsageLimit < 1
      ) {
        return res.status(400).json({
          message:
            "Usage limit must be at least 1.",
        });
      }

      if (
        nextUsageLimit <
        promoCode.usedCount
      ) {
        return res.status(400).json({
          message:
            "Usage limit cannot be lower than the current used count.",
        });
      }
    }

    const existingPromo =
      await PromoCode.findOne({
        code: normalizedCode,
        _id: {
          $ne: promoCode._id,
        },
      });

    if (existingPromo) {
      return res.status(400).json({
        message:
          "A promo code with this code already exists.",
      });
    }

    const nextStartDate =
      startsAt !== undefined
        ? new Date(startsAt)
        : promoCode.startsAt;

    const nextEndDate =
      expiresAt === undefined
        ? promoCode.expiresAt
        : expiresAt === null ||
            expiresAt === ""
          ? null
          : new Date(expiresAt);

    if (
      Number.isNaN(
        nextStartDate.getTime(),
      )
    ) {
      return res.status(400).json({
        message: "Invalid start date.",
      });
    }

    if (
      nextEndDate &&
      Number.isNaN(
        nextEndDate.getTime(),
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid expiration date.",
      });
    }

    if (
      nextEndDate &&
      nextEndDate <=
        nextStartDate
    ) {
      return res.status(400).json({
        message:
          "Expiration date must be after the start date.",
      });
    }

    promoCode.code =
      normalizedCode;

    promoCode.type =
      nextType;

    promoCode.value =
      nextValue;

    promoCode.minOrderAmount =
      nextMinOrderAmount;

    promoCode.usageLimit =
      nextUsageLimit;

    promoCode.startsAt =
      nextStartDate;

    promoCode.expiresAt =
      nextEndDate;

    if (isActive !== undefined) {
      promoCode.isActive =
        Boolean(isActive);
    }

    await promoCode.save();

    if (!wasActive && promoCode.isActive) {
      schedulePromotionNotification(promoCode);
    }

    return res.status(200).json(
      promoCode,
    );
  } catch (error) {
    console.error(
      "Update promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to update promo code.",
    });
  }
};

// =========================================
// TOGGLE
// =========================================

const togglePromoCode = async (
  req,
  res,
) => {
  try {
    const promoCode =
      await PromoCode.findById(
        req.params.id,
      );

    if (!promoCode) {
      return res.status(404).json({
        message:
          "Promo code not found.",
      });
    }

    const wasActive = promoCode.isActive;
    promoCode.isActive =
      !promoCode.isActive;

    await promoCode.save();

    if (!wasActive && promoCode.isActive) {
      schedulePromotionNotification(promoCode);
    }

    return res.status(200).json(
      promoCode,
    );
  } catch (error) {
    console.error(
      "Toggle promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to update promo code status.",
    });
  }
};

// =========================================
// DELETE
// =========================================

const deletePromoCode = async (
  req,
  res,
) => {
  try {
    const promoCode =
      await PromoCode.findByIdAndDelete(
        req.params.id,
      );

    if (!promoCode) {
      return res.status(404).json({
        message:
          "Promo code not found.",
      });
    }

    return res.status(200).json({
      message:
        "Promo code deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to delete promo code.",
    });
  }
};

// =========================================
// VALIDATE CUSTOMER PROMO
// =========================================

const validatePromoCode = async (
  req,
  res,
) => {
  try {
    const {
      code,
      subtotal,
    } = req.body;

    const normalizedCode =
      normalizeCode(code);

    const numericSubtotal =
      Number(subtotal);

    if (!normalizedCode) {
      return res.status(400).json({
        message:
          "Promo code is required.",
      });
    }

    if (
      !Number.isFinite(
        numericSubtotal,
      ) ||
      numericSubtotal < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid subtotal.",
      });
    }

    const promoCode =
      await PromoCode.findOne({
        code: normalizedCode,
      });

    if (!promoCode) {
      return res.status(404).json({
        message:
          "Promo code not found.",
      });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({
        message:
          "This promo code is inactive.",
      });
    }

    if (!isPromoStarted(promoCode)) {
      return res.status(400).json({
        message:
          "This promo code is not active yet.",
      });
    }

    if (isPromoExpired(promoCode)) {
      return res.status(400).json({
        message:
          "This promo code has expired.",
      });
    }

    if (!hasUsageAvailable(promoCode)) {
      return res.status(400).json({
        message:
          "This promo code has reached its usage limit.",
      });
    }

    if (
      numericSubtotal <
      Number(
        promoCode.minOrderAmount || 0,
      )
    ) {
      return res.status(400).json({
        message:
          `Minimum order amount is ${Number(
            promoCode.minOrderAmount || 0,
          ).toFixed(2)} DT.`,
      });
    }

    const discountAmount =
      calculateDiscount(
        promoCode,
        numericSubtotal,
      );

    const subtotalAfterDiscount =
      Math.max(
        numericSubtotal -
          discountAmount,
        0,
      );

    return res.status(200).json({
      valid: true,

      code: promoCode.code,

      type: promoCode.type,

      value: promoCode.value,

      discountAmount,

      subtotalAfterDiscount,
    });
  } catch (error) {
    console.error(
      "Validate promo code error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to validate promo code.",
    });
  }
};

module.exports = {
  createPromoCode,
  getPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  togglePromoCode,
  deletePromoCode,
  validatePromoCode,
  calculateDiscount,
  normalizeCode,
  isPromoStarted,
  isPromoExpired,
  hasUsageAvailable,
};