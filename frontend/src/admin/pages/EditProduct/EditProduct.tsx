import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminProductById,
  updateAdminProduct,
} from "../../services/adminProductService";

import { uploadImage } from "../../../services/cloudinaryService";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import "./EditProduct.css";

type ImagePosition = "front" | "back" | "right" | "left";

type EditImage = string | File | null;

type EditVariant = {
  color: string;
  images: {
    front: EditImage;
    back: EditImage;
    right: EditImage;
    left: EditImage;
  };
};

const createEmptyVariant = (): EditVariant => ({
  color: "",
  images: {
    front: null,
    back: null,
    right: null,
    left: null,
  },
});

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // BASIC INFORMATION
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("");
  const [stock, setStock] = useState("");

  // COLORS + IMAGES
  const [variants, setVariants] = useState<EditVariant[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // LOAD PRODUCT
  // =========================================

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const product = await getAdminProductById(id);

        setName(product.name);
        setPrice(String(product.price));
        setDiscount(String(product.discount));
        setDescription(product.description);
        setSizes(product.sizes.join(", "));
        setStock(String(product.stock));

        setVariants(
          product.variants.map((variant) => ({
            color: variant.color,
            images: {
              front: variant.images[0] || null,
              back: variant.images[1] || null,
              right: variant.images[2] || null,
              left: variant.images[3] || null,
            },
          })),
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load product.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // =========================================
  // CHANGE COLOR NAME
  // =========================================

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

  // =========================================
  // CHANGE IMAGE
  // =========================================

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

  // =========================================
  // ADD COLOR
  // =========================================

  const addColor = () => {
    setVariants((current) => [...current, createEmptyVariant()]);
  };

  // =========================================
  // REMOVE COLOR
  // =========================================

  const removeColor = (variantIndex: number) => {
    setVariants((current) =>
      current.filter((_, index) => index !== variantIndex),
    );
  };

  // =========================================
  // GET IMAGE PREVIEW
  // =========================================

  const getImagePreview = (image: EditImage) => {
    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return image;
    }

    return URL.createObjectURL(image);
  };

  // =========================================
  // SAVE PRODUCT
  // =========================================

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!id) {
      setError("Product ID is missing.");
      return;
    }

    if (!name.trim() || !price || !description.trim() || !stock) {
      setError("Please fill in all required fields.");
      return;
    }

    if (variants.length === 0) {
      setError("Please add at least one color.");
      return;
    }

    // =======================================
    // VALIDATE COLORS
    // =======================================

    const colorNames = variants.map((variant) =>
      variant.color.trim().toLowerCase(),
    );

    const hasDuplicateColors = new Set(colorNames).size !== colorNames.length;

    if (hasDuplicateColors) {
      setError("Each color must be unique.");
      return;
    }

    // =======================================
    // VALIDATE IMAGES
    // =======================================

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
        setError(`Please provide all 4 images for ${variant.color}.`);
        return;
      }
    }

    try {
      setSaving(true);

      /*
        For each color:

        Existing Cloudinary URL
        → keep it

        New File
        → upload to Cloudinary
        → use the returned URL
      */

      const updatedVariants = await Promise.all(
        variants.map(async (variant) => {
          const images: EditImage[] = [
            variant.images.front,
            variant.images.back,
            variant.images.right,
            variant.images.left,
          ];

          const uploadedImages = await Promise.all(
            images.map(async (image) => {
              if (!image) {
                throw new Error(`Missing image for ${variant.color}`);
              }

              // Existing Cloudinary image
              if (typeof image === "string") {
                return image;
              }

              // New image
              return await uploadImage(image);
            }),
          );

          return {
            color: variant.color.trim(),
            images: uploadedImages,
          };
        }),
      );

      // =======================================
      // UPDATE PRODUCT
      // =======================================

      await updateAdminProduct(id, {
        name: name.trim(),
        price: Number(price),
        discount: Number(discount) || 0,
        description: description.trim(),

        variants: updatedVariants,

        sizes: sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),

        stock: Number(stock),
      });

      alert("Product updated successfully!");

      navigate("/admin/products");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-edit-product-page">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="admin-edit-product-content">
          <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="admin-edit-product-main">
            <div className="admin-product-loading">Loading product...</div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="admin-edit-product-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-edit-product-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-edit-product-main">
          <section className="admin-edit-product-header">
            <p>STORE MANAGEMENT</p>

            <h1>Edit Product</h1>

            <span>Update your product information and images.</span>
          </section>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            {/* ================================= */}
            {/* BASIC INFORMATION */}
            {/* ================================= */}

            <div className="admin-form-section">
              <h2>Basic Information</h2>

              <div className="admin-form-group">
                <label htmlFor="name">Product Name *</label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
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
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description *</label>

                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>

            {/* ================================= */}
            {/* COLORS + IMAGES */}
            {/* ================================= */}

            <div className="admin-form-section">
              <div className="admin-colors-header">
                <div>
                  <h2>Colors & Images</h2>

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
                    {/* COLOR NAME */}

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
                          REMOVE COLOR
                        </button>
                      )}
                    </div>

                    {/* FOUR IMAGES */}

                    <div className="admin-images-grid">
                      {/* FRONT */}

                      <div className="admin-image-upload">
                        <label htmlFor={`front-${variantIndex}`}>FRONT</label>

                        <div className="admin-image-preview">
                          {variant.images.front ? (
                            <img
                              src={getImagePreview(variant.images.front) || ""}
                              alt={`${variant.color} front`}
                            />
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>

                        <input
                          id={`front-${variantIndex}`}
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
                        <label htmlFor={`back-${variantIndex}`}>BACK</label>

                        <div className="admin-image-preview">
                          {variant.images.back ? (
                            <img
                              src={getImagePreview(variant.images.back) || ""}
                              alt={`${variant.color} back`}
                            />
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>

                        <input
                          id={`back-${variantIndex}`}
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
                        <label htmlFor={`right-${variantIndex}`}>RIGHT</label>

                        <div className="admin-image-preview">
                          {variant.images.right ? (
                            <img
                              src={getImagePreview(variant.images.right) || ""}
                              alt={`${variant.color} right`}
                            />
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>

                        <input
                          id={`right-${variantIndex}`}
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
                        <label htmlFor={`left-${variantIndex}`}>LEFT</label>

                        <div className="admin-image-preview">
                          {variant.images.left ? (
                            <img
                              src={getImagePreview(variant.images.left) || ""}
                              alt={`${variant.color} left`}
                            />
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>

                        <input
                          id={`left-${variantIndex}`}
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

                    <small>
                      Select a new file only when you want to replace an
                      existing image.
                    </small>
                  </div>
                ))}
              </div>
            </div>

            {/* ================================= */}
            {/* SIZES */}
            {/* ================================= */}

            <div className="admin-form-section">
              <h2>Sizes</h2>

              <div className="admin-form-group">
                <label htmlFor="sizes">Available Sizes</label>

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
                disabled={saving}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="admin-save-product-button"
                disabled={saving}
              >
                {saving ? "UPDATING..." : "UPDATE PRODUCT"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditProduct;
