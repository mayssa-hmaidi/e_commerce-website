import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";

import "./Navbar.css";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 8 4c1.6 0 3.1.8 4 2.1A4.8 4.8 0 0 1 16 4a4.8 4.8 0 0 1 4.8 4.8Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.1 3.5-6 8-6s7.2 1.9 8 6" />
    </svg>
  );
}

function Navbar() {
  const { cart } = useCart();

  const { isAuthenticated } = useCustomerAuth();

  const { count: wishlistCount } = useWishlist();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <div className="announcement-bar">
        <span>FREE DELIVERY ON ORDERS OVER 149 DT</span>
      </div>

      <nav className="navbar">
        {/* LOGO */}
        <div className="navbar-logo">
          <Link to="/">YOUR BRAND</Link>
        </div>

        {/* MAIN NAVIGATION */}
        <div className="navbar-links">
          <Link to="/">Accueil</Link>

          <Link to="/tshirts">T-Shirts</Link>

          <Link to="/about">À propos</Link>

          <Link to="/contact">Contact</Link>
        </div>

        {/* ACTIONS */}
        <div className="navbar-actions">
          {/* FAVORITES */}
          <Link
            to={isAuthenticated ? "/favorites" : "/login"}
            className="navbar-action-link"
            aria-label={`Favorites, ${wishlistCount} items`}
          >
            <span className="navbar-icon-wrapper">
              <HeartIcon />

              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </span>

            <span className="navbar-action-text">Favorites</span>
          </Link>

          {/* ACCOUNT */}
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="navbar-action-link"
            aria-label={isAuthenticated ? "Account" : "Login"}
          >
            <UserIcon />

            <span className="navbar-action-text">
              {isAuthenticated ? "Account" : "Login"}
            </span>
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="navbar-cart-link"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <CartIcon />

            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
