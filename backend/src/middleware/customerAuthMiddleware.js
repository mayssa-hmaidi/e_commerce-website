const jwt = require("jsonwebtoken");
const { getAuthToken } = require("../utils/authCookies");

const customerProtect = (
  req,
  res,
  next,
) => {
  try {
    const token = getAuthToken(req, "customerToken");

    if (!token) {
      return res.status(401).json({
        message:
          "Customer authentication required.",
      });
    }

    // =====================================
    // VERIFY TOKEN
    // =====================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

    // =====================================
    // MAKE SURE THIS IS A CUSTOMER TOKEN
    // =====================================

    if (
      decoded.role !==
      "customer"
    ) {
      return res.status(403).json({
        message:
          "Customer access required.",
      });
    }

    // =====================================
    // SAVE CUSTOMER DATA
    // =====================================

    req.customer =
      decoded;

    next();
  } catch (error) {
    console.error("Customer authentication failed:", error.name);

    return res.status(401).json({
      message:
        "Unauthorized. Invalid or expired customer token.",
    });
  }
};

module.exports =
  customerProtect;