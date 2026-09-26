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

const settingsRoutes =
  require("./routes/settingsRoutes");

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

// =========================================
// DATABASE
// =========================================

connectDB();

// =========================================
// GLOBAL MIDDLEWARE
// =========================================

app.use(cors());

app.use(
  express.json(),
);

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
  "/api/settings",
  settingsRoutes,
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

app.use(
  errorHandler,
);

// =========================================
// START SERVER
// =========================================

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`,
    );
  },
);