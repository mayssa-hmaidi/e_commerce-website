import { Link, useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./OrderConfirmation.css";

type OrderConfirmationState = {
  orderId?: string;
  orderNumber?: string;
};

function OrderConfirmation() {
  const location = useLocation();

  const state = location.state as OrderConfirmationState | null;

  return (
    <div className="order-confirmation-page">
      <Navbar />

      <main className="order-confirmation-main">
        <div className="order-confirmation-card">
          {/* SUCCESS ICON */}
          <div className="order-confirmation-icon">
            <i className="bi bi-check-lg" />
          </div>

          {/* LABEL */}
          <p className="order-confirmation-label">ORDER RECEIVED</p>

          {/* TITLE */}
          <h1>Thank You!</h1>

          {/* TEXT */}
          <p className="order-confirmation-text">
            Your order has been successfully placed. We have received your
            request and will contact you soon to confirm the details.
          </p>

          {/* ORDER NUMBER */}
          {(state?.orderNumber || state?.orderId) && (
            <div className="order-confirmation-number">
              <span>Order Number</span>

              <strong>{state.orderNumber || state.orderId}</strong>
            </div>
          )}

          {/* ACTIONS */}
          <div className="order-confirmation-actions">
            {state?.orderId && (
              <Link
                to={`/order-tracking/${state.orderId}`}
                className="track-order-button"
              >
                <i className="bi bi-truck" />
                TRACK YOUR ORDER
              </Link>
            )}

            <Link to="/tshirts" className="continue-shopping-button">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderConfirmation;
