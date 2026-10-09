import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch as fetch } from "../../../services/apiClient";
import { uploadImage } from "../../../services/cloudinaryService";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import "./AddProduct.css";

const API_URL = "/api/products";

type ImagePosition = "front" | "back" | "right" | "left";

type ColorVariant = {
  color: string;
  images: {
    front: File | null;
    back: File | null;
    right: File | null;
    left: File | null;
  };
};

const createEmptyVariant = (): ColorVariant => ({
  color: "",
  images: {
    front: null,
    back: null,
    right: null,
    left: null,
  },
});

function AddProduct() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // BASIC INFORMATION
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");

  // COLORS + IMAGES
  const [variants, setVariants] = useState<ColorVariant[]>([
    createEmptyVariant(),
  ]);

  // OTHER DETAILS
  const [sizes, setSizes] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CHANGE COLOR NAME
  const handleColorNameChange = (variantIndex: number, value: string) => {
    setVariants((current) =>
      current.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              color: value,
            }
          : variant,
      ),
    );
  };

  // CHANGE ONE IMAGE
  const handleImageChange = (
    variantIndex: number,
    position: ImagePosition,
    file: File | null,
  ) => {
    setVariants((current) =>
      current.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              images: {
                ...variant.images,
                [position]: file,
              },
            }
          : variant,
      ),
    );
  };

  // ADD NEW COLOR
  const addColor = () => {
    setVariants((current) => [...current, createEmptyVariant()]);
  };

  // REMOVE COLOR
  const removeColor = (variantIndex: number) => {
    setVariants((current) =>
      current.filter((_, index) => index !== variantIndex),
    );
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // BASIC VALIDATION
    if (!name.trim() || !price || !description.trim() || !stock) {
      setError("Please fill in all required fields.");
      return;
    }

    // AT LEAST ONE COLOR
    if (variants.length === 0) {
      setError("Please add at least one color.");
      return;
    }

    // VALIDATE COLORS + 4 IMAGES
    for (const variant of variants) {
      if (!variant.color.trim()) {
        setError("Please enter a color name for every color.");
        return;
      }

      if (
        !variant.images.front ||
        !variant.images.back ||
        !variant.images.right ||
        !variant.images.left
      ) {
        setError(
          `Please upload all 4 images for ${variant.color || "each color"}.`,
        );
        return;
      }
    }

    try {
      setLoading(true);

      /*
        Upload all images for every color to Cloudinary.

        Example:

        Black
        -> Front
        -> Back
        -> Right
        -> Left

        White
        -> Front
        -> Back
        -> Right
        -> Left
      */

      const uploadedVariants = await Promise.all(
        variants.map(async (variant) => {
          const files = [
            variant.images.front,
            variant.images.back,
            variant.images.right,
            variant.images.left,
          ];

          const uploadedImages = await Promise.all(
            files.map((file) => {
              if (!file) {
                throw new Error(`Missing image for ${variant.color}`);
              }

              return uploadImage(file);
            }),
          );

          return {
            color: variant.color.trim(),
            images: uploadedImages,
          };
        }),
      );

      const productData = {
        name: name.trim(),
        price: Number(price),
        discount: Number(discount) || 0,
        description: description.trim(),

        variants: uploadedVariants,

        sizes: sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),

        stock: Number(stock),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product.");
      }

      alert("Product added successfully!");

      navigate("/admin/products");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create product.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-product-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-add-product-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-add-product-main">
          <section className="admin-add-product-header">
            <p>STORE MANAGEMENT</p>

            <h1>Add Product</h1>

            <span>Create a new product for your store.</span>
          </section>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            {/* ============================= */}
            {/* BASIC INFORMATION */}
            {/* ============================= */}

            <div className="admin-form-section">
              <h2>Basic Information</h2>

              <div className="admin-form-group">
                <label htmlFor="name">Product Name *</label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Oversized Identity Tee"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="price">Price (DT) *</label>

                  <input
                    id="price"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="45"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="discount">Discount (%)</label>

                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="stock">Stock *</label>

                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description *</label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Premium oversized cotton T-shirt"
                  rows={5}
                />
              </div>
            </div>

            {/* ============================= */}
            {/* PRODUCT DETAILS */}
            {/* ============================= */}

            <div className="admin-form-section">
              <h2>Product Details</h2>

              {/* ============================= */}
              {/* COLORS */}
              {/* ============================= */}

              <div className="admin-form-group">
                <div className="admin-colors-header">
                  <div>
                    <label>Colors & Images *</label>

                    <small>Each color must have exactly 4 images.</small>
                  </div>

                  <button
                    type="button"
                    className="admin-add-color-button"
                    onClick={addColor}
                  >
                    + ADD COLOR
                  </button>
                </div>

                <div className="admin-color-variants">
                  {variants.map((variant, variantIndex) => (
                    <div className="admin-color-variant" key={variantIndex}>
                      {/* COLOR HEADER */}

                      <div className="admin-color-variant-header">
                        <div className="admin-color-name">
                          <label htmlFor={`color-${variantIndex}`}>Color</label>

                          <input
                            id={`color-${variantIndex}`}
                            type="text"
                            value={variant.color}
                            onChange={(event) =>
                              handleColorNameChange(
                                variantIndex,
                                event.target.value,
                              )
                            }
                            placeholder="Black"
                          />
                        </div>

                        {variants.length > 1 && (
                          <button
                            type="button"
                            className="admin-remove-color-button"
                            onClick={() => removeColor(variantIndex)}
                          >
                            REMOVE
                          </button>
                        )}
                      </div>

                      {/* FOUR IMAGES */}

                      <div className="admin-images-grid">
                        {/* FRONT */}

                        <div className="admin-image-upload">
                          <label htmlFor={`front-image-${variantIndex}`}>
                            FRONT
                          </label>

                          <div className="admin-image-preview">
                            {variant.images.front ? (
                              <img
                                src={URL.createObjectURL(variant.images.front)}
                                alt={`${variant.color} front preview`}
                                width={400}
                                height={300}
                              />
                            ) : (
                              <span>No image selected</span>
                            )}
                          </div>

                          <input
                            id={`front-image-${variantIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleImageChange(
                                variantIndex,
                                "front",
                                event.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>

                        {/* BACK */}

                        <div className="admin-image-upload">
                          <label htmlFor={`back-image-${variantIndex}`}>
                            BACK
                          </label>

                          <div className="admin-image-preview">
                            {variant.images.back ? (
                              <img
                                src={URL.createObjectURL(variant.images.back)}
                                alt={`${variant.color} back preview`}
                                width={400}
                                height={300}
                              />
                            ) : (
                              <span>No image selected</span>
                            )}
                          </div>

                          <input
                            id={`back-image-${variantIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleImageChange(
                                variantIndex,
                                "back",
                                event.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>

                        {/* RIGHT */}

                        <div className="admin-image-upload">
                          <label htmlFor={`right-image-${variantIndex}`}>
                            RIGHT
                          </label>

                          <div className="admin-image-preview">
                            {variant.images.right ? (
                              <img
                                src={URL.createObjectURL(variant.images.right)}
                                alt={`${variant.color} right preview`}
                                width={400}
                                height={300}
                              />
                            ) : (
                              <span>No image selected</span>
                            )}
                          </div>

                          <input
                            id={`right-image-${variantIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleImageChange(
                                variantIndex,
                                "right",
                                event.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>

                        {/* LEFT */}

                        <div className="admin-image-upload">
                          <label htmlFor={`left-image-${variantIndex}`}>
                            LEFT
                          </label>

                          <div className="admin-image-preview">
                            {variant.images.left ? (
                              <img
                                src={URL.createObjectURL(variant.images.left)}
                                alt={`${variant.color} left preview`}
                                width={400}
                                height={300}
                              />
                            ) : (
                              <span>No image selected</span>
                            )}
                          </div>

                          <input
                            id={`left-image-${variantIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleImageChange(
                                variantIndex,
                                "left",
                                event.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================= */}
              {/* SIZES */}
              {/* ============================= */}

              <div className="admin-form-group">
                <label htmlFor="sizes">Sizes</label>

                <input
                  id="sizes"
                  type="text"
                  value={sizes}
                  onChange={(event) => setSizes(event.target.value)}
                  placeholder="S, M, L, XL"
                />

                <small>Separate sizes with commas.</small>
              </div>
            </div>

            {/* ERROR */}

            {error && <p className="admin-product-form-error">{error}</p>}

            {/* ACTIONS */}

            <div className="admin-product-form-actions">
              <button
                type="button"
                className="admin-cancel-button"
                onClick={() => navigate("/admin/products")}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="admin-save-product-button"
                disabled={loading}
              >
                {loading ? "UPLOADING..." : "ADD PRODUCT"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddProduct;
