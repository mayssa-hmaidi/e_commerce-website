import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import type { PromoValidationResult } from "../../services/promoCodeService";

import Navbar from "../../components/Navbar/Navbar";
import CustomerForm from "../../components/CustomerForm/CustomerForm";
import DeliveryForm from "../../components/DeliveryForm/DeliveryForm";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import Footer from "../../components/Footer/Footer";

import "./Checkout.css";

function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  // =========================================
  // CUSTOMER
  // =========================================

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // =========================================
  // DELIVERY
  // =========================================

  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // =========================================
  // ORDER
  // =========================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // APPLIED PROMO
  // =========================================

  const [appliedPromo] = useState<PromoValidationResult | null>(() => {
    const savedPromo = localStorage.getItem("appliedPromo");

    if (!savedPromo) {
      return null;
    }

    try {
      return JSON.parse(savedPromo) as PromoValidationResult;
    } catch {
      localStorage.removeItem("appliedPromo");

      return null;
    }
  });

  // =========================================
  // EMPTY CART
  // =========================================

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />

        <main className="checkout-empty">
          <div className="checkout-empty-icon">
            <i className="bi bi-bag"></i>
          </div>

          <p className="checkout-empty-label">CHECKOUT</p>

          <h1>Your cart is empty</h1>

          <p>Add a product before continuing to checkout.</p>

          <Link to="/tshirts" className="checkout-shop-button">
            SHOP T-SHIRTS
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================
  // PLACE ORDER
  // =========================================

  const handlePlaceOrder = async () => {
    // -----------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !governorate.trim() ||
      !city.trim() ||
      !address.trim()
    ) {
      alert("Please fill in all required fields.");

      return;
    }

    try {
      setIsSubmitting(true);

      // -----------------------------------------
      // BUILD ORDER DATA
      // -----------------------------------------

      const orderData = {
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },

        delivery: {
          governorate: governorate.trim(),

          city: city.trim(),

          address: address.trim(),

          additionalDetails: additionalDetails.trim(),
        },

        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        })),

        // Only the promo code is sent.
        // Backend validates it again and calculates
        // the real discount.
        promoCode: appliedPromo?.code || undefined,
      };

      // -----------------------------------------
      // CREATE ORDER
      // -----------------------------------------

      const order = await createOrder(orderData);

      console.log("Order created:", order);

      // -----------------------------------------
      // SAVE CUSTOMER LOOKUP
      // -----------------------------------------
      // This allows the customer to return later
      // and load all orders using the same
      // email + phone.

      localStorage.setItem(
        "customerOrderLookup",
        JSON.stringify({
          email: email.trim().toLowerCase(),

          phone: phone.trim(),
        }),
      );

      // -----------------------------------------
      // CLEAR APPLIED PROMO
      // -----------------------------------------
      // Only clear it after successful order
      // creation.

      localStorage.removeItem("appliedPromo");

      // -----------------------------------------
      // GO TO ORDER CONFIRMATION
      // -----------------------------------------

      navigate("/order-confirmation", {
        state: {
          orderId: order._id,

          orderNumber: order.orderNumber,
        },
      });
    } catch (error) {
      console.error("Place order error:", error);

      alert(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-main">
        {/* =================================
            BREADCRUMB
        ================================= */}

        <div className="checkout-breadcrumb">
          <Link to="/">Accueil</Link>

          <span>/</span>

          <Link to="/cart">Panier</Link>

          <span>/</span>

          <span>Checkout</span>
        </div>

        {/* =================================
            HEADER
        ================================= */}

        <section className="checkout-header">
          <div>
            <p className="checkout-label">SECURE CHECKOUT</p>

            <h1>Checkout</h1>

            <p className="checkout-description">
              Complete your details to place your order.
            </p>
          </div>

          <div className="checkout-security">
            <i className="bi bi-shield-check"></i>

            <span>Secure checkout</span>
          </div>
        </section>

        {/* =================================
            MAIN CHECKOUT GRID
        ================================= */}

        <div className="checkout-container">
          {/* =================================
              LEFT SIDE
          ================================= */}

          <div className="checkout-forms">
            {/* =================================
                CUSTOMER
            ================================= */}

            <section className="checkout-section">
              <div className="checkout-section-heading">
                <div className="checkout-step">01</div>

                <div>
                  <h2>Contact Information</h2>

                  <p>Tell us how we can contact you.</p>
                </div>
              </div>

              <div className="checkout-section-content">
                <CustomerForm
                  fullName={fullName}
                  phone={phone}
                  email={email}
                  onFullNameChange={setFullName}
                  onPhoneChange={setPhone}
                  onEmailChange={setEmail}
                />
              </div>
            </section>

            {/* =================================
                DELIVERY
            ================================= */}

            <section className="checkout-section">
              <div className="checkout-section-heading">
                <div className="checkout-step">02</div>

                <div>
                  <h2>Shipping Information</h2>

                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              <div className="checkout-section-content">
                <DeliveryForm
                  governorate={governorate}
                  city={city}
                  address={address}
                  additionalDetails={additionalDetails}
                  onGovernorateChange={setGovernorate}
                  onCityChange={setCity}
                  onAddressChange={setAddress}
                  onAdditionalDetailsChange={setAdditionalDetails}
                />
              </div>
            </section>

            {/* =================================
                PAYMENT
            ================================= */}

            <section className="checkout-section checkout-payment-section">
              <div className="checkout-section-heading">
                <div className="checkout-step">03</div>

                <div>
                  <h2>Payment Method</h2>

                  <p>Simple and secure payment.</p>
                </div>
              </div>

              <div className="checkout-payment-box">
                <div className="checkout-payment-icon">
                  <i className="bi bi-cash-coin"></i>
                </div>

                <div className="checkout-payment-info">
                  <strong>Cash on Delivery</strong>

                  <span>Pay when your order arrives.</span>
                </div>

                <div className="checkout-payment-selected">
                  <i className="bi bi-check2"></i>
                </div>
              </div>
            </section>
          </div>

          {/* =================================
              RIGHT SIDE
          ================================= */}

          <aside className="checkout-side">
            {/* =================================
                SUMMARY HEADER
            ================================= */}

            <div className="checkout-summary-header">
              <div>
                <p>YOUR ORDER</p>

                <h2>Order Summary</h2>
              </div>

              <Link to="/cart">Edit cart</Link>
            </div>

            {/* =================================
                SUMMARY CARD
            ================================= */}

            <div className="checkout-summary-card">
              <OrderSummary cart={cart} />

              {/* =================================
                  PROMO
              ================================= */}

              {appliedPromo && (
                <div className="checkout-applied-promo">
                  <div className="checkout-applied-promo-info">
                    <span className="checkout-applied-promo-label">
                      PROMO CODE
                    </span>

                    <strong className="checkout-applied-promo-code">
                      {appliedPromo.code}
                    </strong>
                  </div>

                  <span className="checkout-applied-promo-discount">
                    -{appliedPromo.discountAmount.toFixed(1)} DT
                  </span>
                </div>
              )}

              {/* =================================
                  TRUST
              ================================= */}

              <div className="checkout-trust">
                <div>
                  <i className="bi bi-shield-check"></i>

                  <span>Secure order</span>
                </div>

                <div>
                  <i className="bi bi-box-seam"></i>

                  <span>Fast delivery</span>
                </div>
              </div>

              {/* =================================
                  CONFIRM ORDER
              ================================= */}

              <button
                type="button"
                className="place-order-button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                <i className="bi bi-lock"></i>

                <span>
                  {isSubmitting ? "PLACING ORDER..." : "CONFIRM ORDER"}
                </span>
              </button>

              <p className="checkout-payment-note">
                Payment on delivery (Cash on Delivery)
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
