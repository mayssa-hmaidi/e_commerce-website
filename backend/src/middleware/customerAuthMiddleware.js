const jwt = require("jsonwebtoken");

const customerProtect = (
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
          "Customer authentication required.",
      });
    }

    const token =
      authHeader.split(" ")[1];

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
    console.error(
      "Customer auth middleware error:",
      error,
    );

    return res.status(401).json({
      message:
        "Unauthorized. Invalid or expired customer token.",
    });
  }
};

module.exports =
  customerProtect;