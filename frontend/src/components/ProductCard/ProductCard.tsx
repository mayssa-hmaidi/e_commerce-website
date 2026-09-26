import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { Product } from "../../types/product";

import { useWishlist } from "../../context/WishlistContext";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import "./ProductCard.css";

type ProductCardProps = {
  product: Product;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 8 4c1.6 0 3.1.8 4 2.1A4.8 4.8 0 0 1 16 4a4.8 4.8 0 0 1 4.8 4.8Z"
        className={filled ? "heart-filled" : ""}
      />
    </svg>
  );
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const { isAuthenticated } = useCustomerAuth();

  const { toggleFavorite, isFavorite } = useWishlist();

  const [isUpdating, setIsUpdating] = useState(false);

  const [toast, setToast] = useState("");

  const discount = Number(product.discount) || 0;

  const price = Number(product.price) || 0;

  const finalPrice = price - (price * discount) / 100;

  const productWithImages = product as Product & {
    images?: string[];
  };

  const cardImage =
    product.variants?.[0]?.images?.[0] || productWithImages.images?.[0] || "";

  const favorite = isFavorite(product._id);

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);

      const wasFavorite = favorite;

      await toggleFavorite(product._id);

      showToast(wasFavorite ? "Removed from wishlist" : "Added to wishlist");
    } catch (error) {
      console.error("Wishlist error:", error);

      showToast("Could not update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <article className="product-card">
        <div
          className="product-card-image"
          style={{
            backgroundImage: cardImage ? `url(${cardImage})` : "none",
          }}
        >
          <div className="product-card-overlay" />

          <button
            type="button"
            className={`product-favorite ${favorite ? "active" : ""} ${
              isUpdating ? "updating" : ""
            }`}
            onClick={handleFavorite}
            disabled={isUpdating}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorite}
          >
            <HeartIcon filled={favorite} />
          </button>

          <div className="product-card-content">
            <div>
              <h3>{product.name}</h3>

              <div className="product-card-price">
                {discount > 0 ? (
                  <>
                    <span className="product-card-price-current">
                      {finalPrice.toFixed(1)} DT
                    </span>

                    <span className="product-card-price-old">
                      {price.toFixed(1)} DT
                    </span>
                  </>
                ) : (
                  <span className="product-card-price-current">
                    {price.toFixed(1)} DT
                  </span>
                )}
              </div>
            </div>

            <Link
              to={`/products/${product._id}`}
              className="product-view-button"
            >
              VIEW
            </Link>
          </div>
        </div>
      </article>

      {toast && (
        <div className="wishlist-toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

export default ProductCard;
