import { useEffect, useState } from "react";

import type { CartItem } from "../../types/cart";
import { getPublicContactSettings } from "../../services/contactService";

import "./OrderSummary.css";

type OrderSummaryProps = {
  cart: CartItem[];
};

function OrderSummary({ cart }: OrderSummaryProps) {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const [delivery, setDelivery] = useState(5);

  useEffect(() => {
    let active = true;

    getPublicContactSettings()
      .then((settings) => {
        const shippingCost = Number(settings.shippingCost);
        if (active && Number.isFinite(shippingCost) && shippingCost >= 0) {
          setDelivery(shippingCost);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);
  const total = subtotal + delivery;

  return (
    <section className="order-summary">
      {/* HEADER */}

      <div className="order-summary-heading">
        <div>
          <p className="order-summary-label">ORDER SUMMARY</p>

          <h2>Your Order</h2>
        </div>
      </div>

      {/* PRODUCTS */}

      <div className="order-summary-products">
        {cart.map((item) => {
          const itemTotal = item.price * item.quantity;

          return (
            <div
              className="order-summary-product"
              key={`${item.productId}-${item.color}-${item.size}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="order-summary-product-image"
              />

              <div className="order-summary-product-info">
                <h3>{item.name}</h3>

                <p>
                  {item.color} / {item.size}
                </p>

                <span>Qty: {item.quantity}</span>
              </div>

              <strong>{itemTotal.toFixed(1)} DT</strong>
            </div>
          );
        })}
      </div>

      {/* TOTALS */}

      <div className="order-summary-totals">
        <div className="order-summary-line">
          <span>SUBTOTAL</span>

          <span>{subtotal.toFixed(1)} DT</span>
        </div>

        <div className="order-summary-line">
          <span>SHIPPING</span>

          <span>{delivery.toFixed(1)} DT</span>
        </div>

        <div className="order-summary-divider" />

        <div className="order-summary-total">
          <div>
            <span>TOTAL</span>

            <small>Taxes included.</small>
          </div>

          <strong>{total.toFixed(1)} DT</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderSummary;
