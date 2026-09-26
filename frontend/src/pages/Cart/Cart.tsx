import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";

import Navbar from "../../components/Navbar/Navbar";
import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import Footer from "../../components/Footer/Footer";

import "./Cart.css";

function Cart() {
  const { cart } = useCart();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="cart-page">
      <Navbar />

      <main>
        {/* =============================== */}
        {/* BREADCRUMB */}
        {/* =============================== */}

        <div className="cart-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Panier</span>
        </div>

        {/* =============================== */}
        {/* HEADER */}
        {/* =============================== */}

        <section className="cart-header">
          <h1>YOUR CART</h1>

          {cart.length > 0 && <span className="cart-count">({cartCount})</span>}
        </section>

        {/* =============================== */}
        {/* EMPTY CART */}
        {/* =============================== */}

        {cart.length === 0 ? (
          <section className="cart-empty">
            <h2>Your cart is empty</h2>

            <p>You haven't added any products yet.</p>

            <Link to="/tshirts" className="shop-button">
              SHOP T-SHIRTS
            </Link>
          </section>
        ) : (
          <>
            {/* =============================== */}
            {/* CART CONTENT */}
            {/* =============================== */}

            <section className="cart-container">
              {/* ITEMS */}

              <div className="cart-items-section">
                <div className="cart-table-header">
                  <span>PRODUCT</span>
                  <span>PRICE</span>
                  <span>QUANTITY</span>
                  <span>TOTAL</span>
                </div>

                <div className="cart-items">
                  {cart.map((item) => (
                    <CartItem
                      key={`${item.productId}-${item.color}-${item.size}`}
                      item={item}
                    />
                  ))}
                </div>
              </div>

              {/* SUMMARY */}

              <CartSummary cart={cart} />
            </section>

            {/* =============================== */}
            {/* BENEFITS */}
            {/* =============================== */}

            <section className="cart-benefits">
              <div className="cart-benefit">
                <i className="bi bi-box-seam"></i>

                <div>
                  <strong>LIVRAISON RAPIDE</strong>
                  <span>1–3 jours ouvrables</span>
                </div>
              </div>

              <div className="cart-benefit">
                <i className="bi bi-arrow-repeat"></i>

                <div>
                  <strong>RETOURS FACILES</strong>
                  <span>Sous 7 jours</span>
                </div>
              </div>

              <div className="cart-benefit">
                <i className="bi bi-lock"></i>

                <div>
                  <strong>PAIEMENT SÉCURISÉ</strong>
                  <span>100% sécurisé</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
