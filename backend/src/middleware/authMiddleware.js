const jwt = require("jsonwebtoken");
const { getAuthToken } = require("../utils/authCookies");

const protect = (
  req,
  res,
  next,
) => {
  try {
    const token = getAuthToken(req, "adminToken");

    if (!token) {
      const customerToken = getAuthToken(req, "customerToken");

      if (customerToken) {
        try {
          const customer = jwt.verify(
            customerToken,
            process.env.JWT_SECRET,
          );

          if (customer.role === "customer") {
            return res.status(403).json({
              message: "Admin access required.",
            });
          }
        } catch {
          return res.status(401).json({
            message: "Unauthorized. Invalid or expired token.",
          });
        }
      }

      return res.status(401).json({
        message:
          "Unauthorized. No token provided.",
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
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message:
          "Admin access required.",
      });
    }

    // =====================================
    // SAVE ADMIN DATA
    // =====================================

    req.user =
      decoded;

    next();
  } catch (error) {
    console.error("Admin authentication failed:", error.name);

    return res.status(401).json({
      message:
        "Unauthorized. Invalid or expired token.",
    });
  }
};

module.exports =
  protect;