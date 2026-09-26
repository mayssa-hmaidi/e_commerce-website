import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import { useWishlist } from "../../context/WishlistContext";

import {
  getCustomerOrders,
  type CustomerOrder,
} from "../../services/orderService";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Account.css";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.1 3.5-6 8-6s7.2 1.9 8 6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 8 4c1.6 0 3.1.8 4 2.1A4.8 4.8 0 0 1 16 4a4.8 4.8 0 0 1 4.8 4.8Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function Account() {
  const navigate = useNavigate();

  const {
    customer,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useCustomerAuth();

  const { count: favoritesCount } = useWishlist();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);

        const data = await getCustomerOrders();

        setOrders(data);
      } catch (error) {
        console.error("Account orders error:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated || !customer) {
    return (
      <div className="account-page">
        <Navbar />

        <div className="account-loading">Loading account...</div>

        <Footer />
      </div>
    );
  }

  const latestOrder = orders[0] || null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="account-page">
      <Navbar />

      <div className="account-container">
        {/* =================================
            HEADER
        ================================= */}

        <header className="account-header">
          <div>
            <span className="account-eyebrow">MY ACCOUNT</span>

            <h1>Hello, {customer.name}</h1>

            <p>Manage your profile, orders and favorites.</p>
          </div>

          <button
            type="button"
            className="account-logout-top"
            onClick={handleLogout}
          >
            <LogoutIcon />
            LOGOUT
          </button>
        </header>

        {/* =================================
            PROFILE
        ================================= */}

        <section className="account-profile-card">
          <div className="account-section-heading">
            <div>
              <span>PROFILE</span>

              <h2>Personal Information</h2>
            </div>

            <div className="account-section-icon">
              <UserIcon />
            </div>
          </div>

          <div className="account-profile-grid">
            <div>
              <span>FULL NAME</span>

              <strong>{customer.name}</strong>
            </div>

            <div>
              <span>EMAIL</span>

              <strong>{customer.email}</strong>
            </div>

            <div>
              <span>PHONE</span>

              <strong>{customer.phone}</strong>
            </div>
          </div>
        </section>

        {/* =================================
            QUICK ACCESS
        ================================= */}

        <section className="account-grid">
          <Link to="/my-orders" className="account-action-card">
            <div className="account-action-icon">
              <OrdersIcon />
            </div>

            <div className="account-action-content">
              <span>ORDERS</span>

              <h2>My Orders</h2>

              <p>
                {orders.length} {orders.length === 1 ? "order" : "orders"} in
                your history.
              </p>
            </div>

            <span className="account-arrow">→</span>
          </Link>

          <Link to="/favorites" className="account-action-card">
            <div className="account-action-icon">
              <HeartIcon />
            </div>

            <div className="account-action-content">
              <span>WISHLIST</span>

              <h2>Favorites</h2>

              <p>
                {favoritesCount}{" "}
                {favoritesCount === 1 ? "saved item" : "saved items"}.
              </p>
            </div>

            <span className="account-arrow">→</span>
          </Link>
        </section>

        {/* =================================
            RECENT ORDER
        ================================= */}

        <section className="account-recent-section">
          <div className="account-section-heading account-section-heading-simple">
            <div>
              <span>ACTIVITY</span>

              <h2>Recent Order</h2>
            </div>

            <Link to="/my-orders">VIEW ALL</Link>
          </div>

          {ordersLoading ? (
            <div className="account-recent-empty">Loading...</div>
          ) : latestOrder ? (
            <div className="account-recent-order">
              <div>
                <span>ORDER</span>

                <strong>{latestOrder.orderNumber}</strong>
              </div>

              <div>
                <span>DATE</span>

                <strong>
                  {new Date(latestOrder.createdAt).toLocaleDateString("en-GB")}
                </strong>
              </div>

              <div>
                <span>STATUS</span>

                <strong
                  className={`account-order-status status-${latestOrder.status}`}
                >
                  {latestOrder.status}
                </strong>
              </div>

              <div>
                <span>TOTAL</span>

                <strong>{latestOrder.total.toFixed(1)} DT</strong>
              </div>
            </div>
          ) : (
            <div className="account-recent-empty">
              <p>You haven't placed an order yet.</p>

              <Link to="/tshirts">START SHOPPING</Link>
            </div>
          )}
        </section>

        {/* =================================
            ACCOUNT SECURITY
        ================================= */}

        <section className="account-security">
          <div>
            <span>ACCOUNT</span>

            <h2>Account & Security</h2>

            <p>Your account is protected by your login credentials.</p>
          </div>

          <button type="button" onClick={handleLogout}>
            <LogoutIcon />
            LOG OUT
          </button>
        </section>

        {/* =================================
            CONTINUE SHOPPING
        ================================= */}

        <div className="account-shopping-link">
          <Link to="/">← CONTINUE SHOPPING</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Account;
