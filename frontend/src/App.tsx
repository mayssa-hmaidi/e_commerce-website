import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

// =========================================
// CONTEXTS
// =========================================

import { CartProvider } from "./context/CartContext";

// =========================================
// CUSTOMER PROTECTED ROUTE
// =========================================

import CustomerProtectedRoute from "./components/CustomerProtectedRoute/CustomerProtectedRoute";

// =========================================
// CUSTOMER PAGES
// =========================================

import Home from "./pages/Home/Home";
import TShirts from "./pages/TShirts/TShirts";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking/OrderTracking";
import MyOrders from "./pages/MyOrders/MyOrders";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Account from "./pages/Account/Account";
import About from "./pages/About/About";
import Favorites from "./pages/Favorites/Favorites";
import Contact from "./pages/Contact/Contact";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe/NewsletterUnsubscribe";
import StoreInfo from "./pages/StoreInfo/StoreInfo";
import PasswordRecovery from "./pages/PasswordRecovery/PasswordRecovery";
// =========================================
// ADMIN PAGES
// =========================================

import AdminLogin from "./admin/pages/AdminLogin/AdminLogin";
import Dashboard from "./admin/pages/Dashboard/Dashboard";
import AdminProducts from "./admin/pages/Products/AdminProducts";
import AddProduct from "./admin/pages/AddProduct/AddProduct";
import EditProduct from "./admin/pages/EditProduct/EditProduct";
import AdminOrders from "./admin/pages/Orders/AdminOrders";
import AdminStock from "./admin/pages/AdminStock/AdminStock";
import AdminCustomers from "./admin/pages/AdminCustomers/AdminCustomers";
import AdminAnalytics from "./admin/pages/AdminAnalytics/AdminAnalytics";
import AdminSettings from "./admin/pages/AdminSettings/AdminSettings";
import AdminProfile from "./admin/pages/AdminProfile/AdminProfile";
import AdminPromoCodes from "./admin/pages/AdminPromoCodes/AdminPromoCodes";
import AdminMessages from "./admin/pages/AdminMessages/AdminMessages";
import AdminNewsletter from "./admin/pages/AdminNewsletter/AdminNewsletter";
// =========================================
// ADMIN PROTECTED ROUTE
// =========================================

import AdminProtectedRoute from "./admin/components/AdminProtectedRoute/AdminProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* =================================
              CUSTOMER PUBLIC PAGES
          ================================= */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<TShirts />} />

          <Route path="/tshirts" element={<TShirts />} />

          <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/about" element={<About />} />

          <Route path="/shipping" element={<StoreInfo page="shipping" />} />

          <Route path="/returns" element={<StoreInfo page="returns" />} />

          <Route path="/faq" element={<StoreInfo page="faq" />} />

          <Route path="/privacy" element={<StoreInfo page="privacy" />} />

          <Route path="/terms" element={<StoreInfo page="terms" />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/forgot-password"
            element={<PasswordRecovery accountType="customer" mode="forgot" />}
          />

          <Route
            path="/reset-password"
            element={<PasswordRecovery accountType="customer" mode="reset" />}
          />

          <Route path="/register" element={<Register />} />

          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/newsletter/unsubscribe/:token"
            element={<NewsletterUnsubscribe />}
          />

          {/* =================================
              CUSTOMER PROTECTED PAGES
          ================================= */}

          <Route
            path="/checkout"
            element={
              <CustomerProtectedRoute>
                <Checkout />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <CustomerProtectedRoute>
                <Account />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <CustomerProtectedRoute>
                <Account />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <CustomerProtectedRoute>
                <MyOrders />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <CustomerProtectedRoute>
                <MyOrders />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <CustomerProtectedRoute>
                <Favorites />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/order-tracking/:id"
            element={
              <CustomerProtectedRoute>
                <OrderTracking />
              </CustomerProtectedRoute>
            }
          />

          {/* =================================
              ADMIN
          ================================= */}

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="/admin/forgot-password"
            element={<PasswordRecovery accountType="admin" mode="forgot" />}
          />

          <Route
            path="/admin/reset-password"
            element={<PasswordRecovery accountType="admin" mode="reset" />}
          />

          <Route
            path="/admin/register"
            element={<Navigate to="/admin/login" replace />}
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProducts />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products/add"
            element={
              <AdminProtectedRoute>
                <AddProduct />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminProtectedRoute>
                <EditProduct />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/stock"
            element={
              <AdminProtectedRoute>
                <AdminStock />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <AdminProtectedRoute>
                <AdminCustomers />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/promo-codes"
            element={
              <AdminProtectedRoute>
                <AdminPromoCodes />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/promotions"
            element={
              <AdminProtectedRoute>
                <AdminPromoCodes />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute>
                <AdminSettings />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <AdminProtectedRoute>
                <AdminMessages />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/newsletter"
            element={
              <AdminProtectedRoute>
                <AdminNewsletter />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
