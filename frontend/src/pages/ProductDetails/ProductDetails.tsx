import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../../services/productService";
import { useCart } from "../../context/CartContext";

import Navbar from "../../components/Navbar/Navbar";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector";
import Footer from "../../components/Footer/Footer";

import type { Product } from "../../types/product";

import "./ProductDetails.css";

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? "heart-filled" : ""}
    >
      <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 8 4c1.6 0 3.1.8 4 2.1A4.8 4.8 0 0 1 16 4a4.8 4.8 0 0 1 4.8 4.8Z" />
    </svg>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isFavorite, setIsFavorite] = useState(false);

  const [openSection, setOpenSection] = useState<
    "description" | "material" | "delivery" | null
  >("description");

  // =========================================
  // FETCH PRODUCT
  // =========================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          setError("Product not found.");
          return;
        }

        setLoading(true);
        setError("");

        const data = await getProductById(id);

        setProduct(data);

        // Select first available color
        setSelectedColor(data.variants[0]?.color || "");

        // Select first available size
        setSelectedSize(data.sizes[0] || "");

        setQuantity(1);
      } catch (error) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="product-details-loading">
          <p>Loading product...</p>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================
  // NOT FOUND
  // =========================================

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="product-not-found">
          <h1>Product not found</h1>

          <button type="button" onClick={() => navigate("/tshirts")}>
            BACK TO T-SHIRTS
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================================
  // CURRENT COLOR VARIANT
  // =========================================

  const selectedVariant =
    product.variants.find((variant) => variant.color === selectedColor) ||
    product.variants[0];

  const selectedImages = selectedVariant?.images || [];

  // =========================================
  // PRICE
  // =========================================

  const finalPrice = product.price - (product.price * product.discount) / 100;

  // =========================================
  // ACCORDION
  // =========================================

  const toggleSection = (section: "description" | "material" | "delivery") => {
    setOpenSection((current) => (current === section ? null : section));
  };

  // =========================================
  // QUANTITY
  // =========================================

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (!selectedVariant) {
      alert("Selected color is unavailable.");
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: finalPrice,

      // First image of the selected color
      image: selectedImages[0] || "",

      color: selectedColor,
      size: selectedSize,
      quantity,
    });

    alert("Product added to cart!");
  };

  return (
    <div className="product-details-page">
      <Navbar />

      <main>
        {/* ================================= */}
        {/* BREADCRUMB */}
        {/* ================================= */}

        <div className="product-breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            Accueil
          </button>

          <span>/</span>

          <button type="button" onClick={() => navigate("/tshirts")}>
            T-Shirts
          </button>

          <span>/</span>

          <span>{product.name}</span>
        </div>

        {/* ================================= */}
        {/* MAIN PRODUCT */}
        {/* ================================= */}

        <section className="product-details-main">
          <div className="product-details-container">
            {/* GALLERY */}

            <ProductGallery
              images={selectedImages}
              productName={product.name}
            />

            {/* PRODUCT INFO */}

            <section className="product-details-info">
              <p className="product-details-category">NEW DROP</p>

              <h1>{product.name}</h1>

              {/* PRICE */}

              <div className="product-price-row">
                <div className="product-details-price">
                  <span className="product-price-current">
                    {finalPrice.toFixed(1)} DT
                  </span>

                  {product.discount > 0 && (
                    <span className="product-price-old">
                      {product.price.toFixed(1)} DT
                    </span>
                  )}
                </div>

                {product.discount > 0 && (
                  <span className="product-details-discount">
                    -{product.discount}%
                  </span>
                )}
              </div>

              <p className="product-tax-note">Taxes included.</p>

              {/* ================================= */}
              {/* COLOR */}
              {/* ================================= */}

              <div className="product-option">
                <div className="product-option-title">
                  <h3>Color</h3>

                  <span>{selectedColor}</span>
                </div>

                <div className="product-color-list">
                  {product.variants.map((variant) => (
                    <button
                      type="button"
                      key={variant.color}
                      aria-label={`Select ${variant.color}`}
                      className={`product-color-button ${
                        selectedColor === variant.color ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedColor(variant.color);
                      }}
                      style={{
                        backgroundColor: getColorValue(variant.color),
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ================================= */}
              {/* SIZE */}
              {/* ================================= */}

              <div className="product-option">
                <div className="product-option-title">
                  <h3>Size</h3>

                  <button
                    type="button"
                    className="size-guide"
                    onClick={() => alert("Size guide coming soon.")}
                  >
                    Size Guide
                  </button>
                </div>

                <div className="product-size-list">
                  {product.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={selectedSize === size ? "selected" : ""}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* ================================= */}
              {/* STOCK */}
              {/* ================================= */}

              <div className="product-details-stock">
                {product.stock > 0
                  ? `${product.stock} items available`
                  : "Out of stock"}
              </div>

              {/* ================================= */}
              {/* QUANTITY */}
              {/* ================================= */}

              <div className="product-quantity-section">
                <h3>Quantity</h3>

                <QuantitySelector
                  quantity={quantity}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                />
              </div>

              {/* ================================= */}
              {/* ACTIONS */}
              {/* ================================= */}

              <div className="product-details-actions">
                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                </button>

                <button
                  type="button"
                  className={`product-details-favorite ${
                    isFavorite ? "active" : ""
                  }`}
                  onClick={() => setIsFavorite((current) => !current)}
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <HeartIcon filled={isFavorite} />
                </button>
              </div>
            </section>
          </div>
        </section>

        {/* ================================= */}
        {/* ACCORDION */}
        {/* ================================= */}

        <section className="product-info-sections">
          {/* DESCRIPTION */}

          <div className="product-info-section">
            <button
              type="button"
              className="product-info-toggle"
              onClick={() => toggleSection("description")}
            >
              <span>DESCRIPTION</span>

              <span className="product-info-arrow">
                {openSection === "description" ? "⌃" : "⌄"}
              </span>
            </button>

            {openSection === "description" && (
              <div className="product-info-content">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          {/* MATERIAL */}

          <div className="product-info-section">
            <button
              type="button"
              className="product-info-toggle"
              onClick={() => toggleSection("material")}
            >
              <span>MATERIAL & CARE</span>

              <span className="product-info-arrow">
                {openSection === "material" ? "⌃" : "⌄"}
              </span>
            </button>

            {openSection === "material" && (
              <div className="product-info-content">
                <p>
                  Premium cotton fabric designed for comfort and everyday wear.
                </p>

                <p>
                  Machine wash cold and follow the garment care instructions.
                </p>
              </div>
            )}
          </div>

          {/* DELIVERY */}

          <div className="product-info-section">
            <button
              type="button"
              className="product-info-toggle"
              onClick={() => toggleSection("delivery")}
            >
              <span>DELIVERY & RETURNS</span>

              <span className="product-info-arrow">
                {openSection === "delivery" ? "⌃" : "⌄"}
              </span>
            </button>

            {openSection === "delivery" && (
              <div className="product-info-content">
                <p>Delivery across Tunisia.</p>

                <p>Easy returns according to our return policy.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getColorValue(color: string) {
  const normalized = color.toLowerCase().trim();

  const colors: Record<string, string> = {
    black: "#111111",
    white: "#ffffff",
    beige: "#d7c4a5",
    red: "#b33a3a",
    green: "#637b67",
    gray: "#9b9b9b",
    grey: "#9b9b9b",
    blue: "#4d6d91",
    navy: "#28364f",
    brown: "#79604b",
    pink: "#d9a4ad",
    yellow: "#d7b74a",
    orange: "#c9783f",
  };

  return colors[normalized] || "#dddddd";
}

export default ProductDetails;
