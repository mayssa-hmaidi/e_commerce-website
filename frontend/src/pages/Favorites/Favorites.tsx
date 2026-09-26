import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import { useWishlist } from "../../context/WishlistContext";

import type { WishlistProduct } from "../../services/wishlistService";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Favorites.css";

type FavoriteProduct = WishlistProduct & {
  variants?: {
    images?: string[];
  }[];
};

function getProductImage(product: FavoriteProduct) {
  return product.variants?.[0]?.images?.[0] || product.images?.[0] || "";
}

function Favorites() {
  const navigate = useNavigate();

  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();

  const { products, isLoading, removeFavorite } = useWishlist();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="favorites-page">
        <Navbar />

        <main className="favorites-container">
          <div className="favorites-loading">Loading favorites...</div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="favorites-page">
      <Navbar />

      <main className="favorites-container">
        <header className="favorites-header">
          <div>
            <span className="favorites-eyebrow">WISHLIST</span>

            <h1>MY FAVORITES</h1>

            <p>Products you saved for later.</p>
          </div>

          <span className="favorites-count">
            {products.length} {products.length === 1 ? "ITEM" : "ITEMS"}
          </span>
        </header>

        {products.length === 0 ? (
          <section className="favorites-empty">
            <div className="favorites-empty-icon">♡</div>

            <h2>YOUR FAVORITES ARE EMPTY</h2>

            <p>Save the pieces you love and they will appear here.</p>

            <button type="button" onClick={() => navigate("/tshirts")}>
              SHOP T-SHIRTS
            </button>
          </section>
        ) : (
          <section className="favorites-grid">
            {products.map((rawProduct) => {
              const product = rawProduct as FavoriteProduct;

              const price = Number(product.price) || 0;

              const discount = Number(product.discount || 0);

              const finalPrice =
                Math.round((price - (price * discount) / 100) * 10) / 10;

              const image = getProductImage(product);

              return (
                <article key={product._id} className="favorites-product-card">
                  <div
                    className="favorites-product-image"
                    style={{
                      backgroundImage: image ? `url(${image})` : "none",
                    }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {!image && <span>No image</span>}

                    <button
                      type="button"
                      className="favorites-heart"
                      aria-label="Remove from favorites"
                      onClick={async (event) => {
                        event.stopPropagation();

                        try {
                          await removeFavorite(product._id);
                        } catch (error) {
                          console.error("Remove favorite error:", error);
                        }
                      }}
                    >
                      ♥
                    </button>

                    <div className="favorites-product-overlay" />

                    <div className="favorites-product-bottom">
                      <div>
                        <h3>{product.name}</h3>

                        <div className="favorites-price">
                          {discount > 0 ? (
                            <>
                              <span className="favorites-price-current">
                                {finalPrice.toFixed(1)} DT
                              </span>

                              <span className="favorites-price-old">
                                {price.toFixed(1)} DT
                              </span>
                            </>
                          ) : (
                            <span className="favorites-price-current">
                              {price.toFixed(1)} DT
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="favorites-view-button"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        VIEW
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Favorites;
