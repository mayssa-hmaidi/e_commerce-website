import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import type { CartItem } from "../../types/cart";
import { getPublicContactSettings } from "../../services/contactService";
import {
  validatePromoCode,
  type PromoValidationResult,
} from "../../services/promoCodeService";

import "./CartSummary.css";

type CartSummaryProps = {
  cart: CartItem[];
};

function CartSummary({ cart }: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] =
    useState<PromoValidationResult | null>(null);

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

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

  const discount = appliedPromo?.discountAmount ?? 0;

  const total = Math.max(0, subtotal + delivery - discount);

  const handleApplyPromo = async () => {
    const code = promoCode.trim();

    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    try {
      setIsApplyingPromo(true);
      setPromoError("");

      const result = await validatePromoCode(code, subtotal);

      setAppliedPromo(result);

      localStorage.setItem("appliedPromo", JSON.stringify(result));

      setPromoCode("");
    } catch (error) {
      setAppliedPromo(null);

      localStorage.removeItem("appliedPromo");

      setPromoError(
        error instanceof Error ? error.message : "Invalid promo code.",
      );
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoCode("");

    localStorage.removeItem("appliedPromo");
  };

  return (
    <aside className="cart-summary">
      {/* =================================
          PROMO CODE
      ================================= */}

      <div className="cart-promo">
        {!appliedPromo ? (
          <>
            <div className="cart-promo-row">
              <input
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (!isApplyingPromo) {
                      handleApplyPromo();
                    }
                  }
                }}
                placeholder="Enter promo code"
                aria-label="Promo code"
                disabled={isApplyingPromo}
              />

              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo}
              >
                {isApplyingPromo ? "..." : "APPLY"}
              </button>
            </div>

            {promoError && <p className="cart-promo-error">{promoError}</p>}
          </>
        ) : (
          <div className="cart-promo-applied">
            <div>
              <span className="cart-promo-label">PROMO APPLIED</span>

              <strong>{appliedPromo.code}</strong>
            </div>

            <button type="button" onClick={handleRemovePromo}>
              REMOVE
            </button>
          </div>
        )}
      </div>

      {/* =================================
          TOTAL BOX
      ================================= */}

      <div className="cart-summary-box">
        <div className="cart-summary-line">
          <span>SUBTOTAL</span>

          <span>{subtotal.toFixed(1)} DT</span>
        </div>

        <div className="cart-summary-line">
          <span>SHIPPING</span>

          <span>{delivery.toFixed(1)} DT</span>
        </div>

        {discount > 0 && (
          <div className="cart-summary-line cart-summary-discount">
            <span>DISCOUNT</span>

            <span>-{discount.toFixed(1)} DT</span>
          </div>
        )}

        <div className="cart-summary-total">
          <span>TOTAL</span>

          <span>{total.toFixed(1)} DT</span>
        </div>

        <p className="cart-summary-tax">Taxes included.</p>
      </div>

      {/* =================================
          CHECKOUT
      ================================= */}

      <Link to="/checkout" className="checkout-button">
        <i className="bi bi-lock" />
        CHECKOUT
      </Link>
    </aside>
  );
}

export default CartSummary;
