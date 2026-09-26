import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import {
  getOrderForTracking,
  type TrackingOrder,
} from "../../services/orderTrackingService";

import "./OrderTracking.css";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const statusSteps: {
  status: OrderStatus;
  label: string;
  icon: string;
}[] = [
  {
    status: "pending",
    label: "Pending",
    icon: "bi-clock",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: "bi-check-lg",
  },
  {
    status: "processing",
    label: "Processing",
    icon: "bi-box-seam",
  },
  {
    status: "shipped",
    label: "Shipped",
    icon: "bi-truck",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: "bi-house-check",
  },
];

const getStatusIndex = (status: OrderStatus) => {
  return statusSteps.findIndex((step) => step.status === status);
};

const formatPrice = (price: number) => {
  return `${price.toLocaleString()} DT`;
};

const getStatusMessage = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "Your order has been received and is waiting for confirmation.";

    case "confirmed":
      return "Your order has been confirmed and will be prepared soon.";

    case "processing":
      return "Your order is currently being prepared.";

    case "shipped":
      return "Your order is on its way.";

    case "delivered":
      return "Your order has been delivered successfully.";

    case "cancelled":
      return "This order has been cancelled.";

    default:
      return "";
  }
};

function OrderTracking() {
  const { id: orderId } = useParams<{
    id: string;
  }>();

  const [order, setOrder] = useState<TrackingOrder | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchOrder = async () => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const data = await getOrderForTracking(orderId);

      setOrder(data);
      setError("");
    } catch (error) {
      console.error("Tracking error:", error);

      setError("We could not load this order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [orderId]);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <div className="order-tracking-page">
        <Navbar />

        <main className="order-tracking-main">
          <div className="tracking-state">
            <div className="tracking-loading-icon">
              <i className="bi bi-arrow-repeat" />
            </div>

            <h2>Loading your order...</h2>

            <p>Please wait while we retrieve your order details.</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ================================
     ERROR
  ================================ */

  if (error || !order) {
    return (
      <div className="order-tracking-page">
        <Navbar />

        <main className="order-tracking-main">
          <div className="tracking-state">
            <div className="tracking-error-icon">
              <i className="bi bi-exclamation-lg" />
            </div>

            <h2>Order not found</h2>

            <p>{error || "We could not find this order."}</p>

            <Link to="/" className="tracking-back-button">
              BACK TO HOME
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const currentStep = getStatusIndex(order.status);

  const isCancelled = order.status === "cancelled";

  const subtotal = order.subtotal ?? order.total;

  const shipping = order.shipping ?? 0;

  return (
    <div className="order-tracking-page">
      <Navbar />

      <main className="order-tracking-main">
        {/* ================================
            BREADCRUMB
        ================================= */}

        <div className="tracking-breadcrumb">
          <Link to="/">Home</Link>

          <span>/</span>

          <span>Track Order</span>
        </div>

        {/* ================================
            ORDER HEADER
        ================================= */}

        <section className="tracking-order-header">
          <div>
            <p className="tracking-small-label">ORDER</p>

            <h1>#{order.orderNumber || order._id}</h1>
          </div>

          <div className="tracking-header-right">
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <span className={`status-pill status-${order.status}`}>
              {order.status}
            </span>
          </div>
        </section>

        {/* ================================
            PROGRESS
        ================================= */}

        <section className="tracking-progress-card">
          <div className="tracking-progress-header">
            <div>
              <h2>Order progress</h2>

              <p>{getStatusMessage(order.status)}</p>
            </div>
          </div>

          {isCancelled ? (
            <div className="cancelled-order-message">
              <i className="bi bi-x-circle" />

              <div>
                <strong>Order cancelled</strong>

                <p>
                  This order has been cancelled and will not continue through
                  delivery.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* LINE */}

              <div className="tracking-progress-line">
                <div
                  className="tracking-progress-fill"
                  style={{
                    width:
                      currentStep <= 0
                        ? "0%"
                        : `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* STEPS */}

              <div className="tracking-steps">
                {statusSteps.map((step, index) => {
                  const completed = index <= currentStep;

                  const current = index === currentStep;

                  return (
                    <div
                      key={step.status}
                      className={`tracking-step ${
                        completed ? "completed" : ""
                      } ${current ? "current" : ""}`}
                    >
                      <div className="tracking-step-icon">
                        <i className={`bi ${step.icon}`} />
                      </div>

                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ================================
            CONTENT GRID
        ================================= */}

        <div className="tracking-grid">
          {/* ================================
              ITEMS
          ================================= */}

          <section className="tracking-items-card">
            <div className="tracking-card-heading">
              <h2>Items</h2>

              <span>
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="tracking-items-list">
              {order.items.map((item, index) => (
                <div
                  className="tracking-item"
                  key={`${item.productId}-${index}`}
                >
                  <div className="tracking-item-image">
                    <i className="bi bi-bag" />
                  </div>

                  <div className="tracking-item-info">
                    <strong>{item.name}</strong>

                    <span>Color: {item.color || "—"}</span>

                    <span>Size: {item.size || "—"}</span>

                    <span>Quantity: {item.quantity}</span>
                  </div>

                  <div className="tracking-item-price">
                    <span>
                      {item.quantity} × {formatPrice(item.price)}
                    </span>

                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================================
              SUMMARY
          ================================= */}

          <aside>
            <section className="tracking-summary-card">
              <h2>Order summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>

                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>

                <strong>{formatPrice(shipping)}</strong>
              </div>

              <div className="summary-total">
                <span>Total</span>

                <strong>{formatPrice(order.total)}</strong>
              </div>
            </section>

            <section className="tracking-help-card">
              <div className="tracking-help-icon">
                <i className="bi bi-headset" />
              </div>

              <div>
                <h3>Need help?</h3>

                <p>
                  Contact us and mention your order number when asking about
                  your order.
                </p>
              </div>
            </section>
          </aside>
        </div>

        {/* ================================
            ACTIONS
        ================================= */}

        <div className="tracking-actions">
          <Link to="/tshirts" className="tracking-primary-button">
            CONTINUE SHOPPING
          </Link>

          <Link to="/" className="tracking-secondary-button">
            BACK TO HOME
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderTracking;
