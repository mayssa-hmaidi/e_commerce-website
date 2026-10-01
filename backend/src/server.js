const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const productRoutes =
  require("./routes/productRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const analyticsRoutes =
  require("./routes/analyticsRoutes");

const customerRoutes =
  require("./routes/customerRoutes");

const promoCodeRoutes =
  require("./routes/promoCodeRoutes");

const customerAuthRoutes =
  require("./routes/customerAuthRoutes");

const errorHandler =
  require("./middleware/errorMiddleware");

const wishlistRoutes = require("./routes/wishlistRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const shopSettingsRoutes = require("./routes/shopSettingsRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");


const app = express();

const PORT =
  process.env.PORT || 5000;

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, "")),
);

// =========================================
// GLOBAL MIDDLEWARE
// =========================================

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({
      message: "Request origin is not allowed.",
    });
  }

  return next();
});

app.use(
  express.json(),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(async (req, res, next) => {
  if (
    req.method === "POST" &&
    ["/api/admin/logout", "/api/customer-auth/logout"].includes(req.path)
  ) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// =========================================
// ROUTES
// =========================================

app.use(
  "/api/products",
  productRoutes,
);

app.use(
  "/api/orders",
  orderRoutes,
);

app.use(
  "/api/admin",
  adminRoutes,
);

app.use(
  "/api/analytics",
  analyticsRoutes,
);

app.use(
  "/api/customers",
  customerRoutes,
);

app.use(
  "/api/promo-codes",
  promoCodeRoutes,
);

app.use(
  "/api/customer-auth",
  customerAuthRoutes,
);
app.use(
  "/api/wishlist",
  wishlistRoutes,
);
app.use(
  "/api/contact-messages",
  contactMessageRoutes
);
app.use("/api/settings", shopSettingsRoutes);
app.use("/api/newsletter", newsletterRoutes);
// =========================================
// ROOT
// =========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "Backend is running!",
    });
  },
);

// =========================================
// ERROR HANDLER
// =========================================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use(
  errorHandler,
);

// =========================================
// START SERVER
// =========================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;