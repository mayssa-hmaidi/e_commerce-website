import { useEffect, useState } from "react";

import {
  getCustomerOrders,
  type CustomerOrder,
} from "../../services/orderService";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./MyOrders.css";

const MyOrders = () => {
  const {
    customer,
    isAuthenticated,
    isLoading: authLoading,
  } = useCustomerAuth();

  const navigate = useNavigate();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerOrders();

        setOrders(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load orders.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authLoading, isAuthenticated, navigate]);

  // =====================================
  // LOADING
  // =====================================

  if (authLoading || loading) {
    return (
      <div className="my-orders-page">
        <Navbar />

        <main className="my-orders-container">
          <div className="my-orders-loading">Loading your orders...</div>
        </main>

        <Footer />
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="my-orders-page">
        <Navbar />

        <main className="my-orders-container">
          <div className="my-orders-header">
            <div>
              <h1>MY ORDERS</h1>

              {customer && <p>Welcome, {customer.name}</p>}
            </div>
          </div>

          <div className="my-orders-error">{error}</div>

          <button
            className="my-orders-button"
            onClick={() => window.location.reload()}
          >
            TRY AGAIN
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  // =====================================
  // EMPTY
  // =====================================

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <Navbar />

        <main className="my-orders-container">
          <div className="my-orders-header">
            <div>
              <h1>MY ORDERS</h1>

              {customer && <p>Welcome, {customer.name}</p>}
            </div>
          </div>

          <div className="my-orders-empty">
            <h2>YOU DON'T HAVE ANY ORDERS YET</h2>

            <p>Your orders will appear here after you complete a purchase.</p>

            <button className="my-orders-button" onClick={() => navigate("/")}>
              CONTINUE SHOPPING
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =====================================
  // ORDERS
  // =====================================

  return (
    <div className="my-orders-page">
      <Navbar />

      <main className="my-orders-container">
        <div className="my-orders-header">
          <div>
            <h1>MY ORDERS</h1>

            {customer && <p>Welcome, {customer.name}</p>}
          </div>

          <span className="orders-count">
            {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
          </span>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-top">
                <div>
                  <span className="order-label">ORDER NUMBER</span>

                  <h2>{order.orderNumber}</h2>
                </div>

                <div className="order-status-wrapper">
                  <span className="order-label">STATUS</span>

                  <span className={`order-status status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-card-info">
                <div>
                  <span className="order-label">DATE</span>

                  <p>{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                </div>

                <div>
                  <span className="order-label">ITEMS</span>

                  <p>
                    {order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </p>
                </div>

                <div>
                  <span className="order-label">TOTAL</span>

                  <p>{order.total.toFixed(2)} DT</p>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="order-item-preview"
                  >
                    <span>{item.name}</span>

                    <span>× {item.quantity}</span>
                  </div>
                ))}

                {order.items.length > 3 && (
                  <div className="more-items">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>

              <div className="order-card-bottom">
                <span>
                  {order.delivery?.city || ""}
                  {order.delivery?.governorate
                    ? `, ${order.delivery.governorate}`
                    : ""}
                </span>

                <button
                  className="track-order-button"
                  onClick={() => navigate(`/order-tracking/${order._id}`)}
                >
                  TRACK ORDER
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
