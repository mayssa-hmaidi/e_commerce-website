const jwt = require("jsonwebtoken");

const protect = (
  req,
  res,
  next,
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // =====================================
    // CHECK TOKEN
    // =====================================

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer ",
      )
    ) {
      return res.status(401).json({
        message:
          "Unauthorized. No token provided.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
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
    // BLOCK CUSTOMER TOKENS
    // =====================================

    if (
      decoded.role ===
      "customer"
    ) {
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
    console.error(
      "Auth middleware error:",
      error,
    );

    return res.status(401).json({
      message:
        "Unauthorized. Invalid or expired token.",
    });
  }
};

module.exports =
  protect;