import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getAdminProducts,
  deleteAdminProduct,
  type AdminProduct,
} from "../../services/adminProductService";

import "./AdminProducts.css";

function AdminProducts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError("");

        const data = await getAdminProducts();

        setProducts(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load products.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteAdminProduct(id);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== id),
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-products-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-products-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-products-main">
          <section className="admin-products-header">
            <div>
              <p className="admin-products-label">STORE MANAGEMENT</p>

              <h1>Products</h1>

              <p>Manage the products available in your store.</p>
            </div>

            <Link to="/admin/products/add" className="admin-add-product-button">
              + ADD PRODUCT
            </Link>
          </section>

          {loading && (
            <p className="admin-products-message">Loading products...</p>
          )}

          {error && <p className="admin-products-error">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="admin-products-empty">
              <h2>No products yet</h2>

              <p>Add your first product to start building your store.</p>

              <Link
                to="/admin/products/add"
                className="admin-add-product-button"
              >
                ADD PRODUCT
              </Link>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <section className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-product-info">
                          <div className="admin-product-image">
                            {product.variants[0]?.images[0] ? (
                              <img
                                src={product.variants[0].images[0]}
                                alt={product.name}
                                width={64}
                                height={64}
                              />
                            ) : (
                              <span>No Image</span>
                            )}
                          </div>

                          <div>
                            <strong>{product.name}</strong>

                            <p>{product.description}</p>
                          </div>
                        </div>
                      </td>

                      <td>{product.price} DT</td>

                      <td>
                        {product.discount > 0 ? `-${product.discount}%` : "—"}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        <div className="admin-product-actions">
                          <Link to={`/admin/products/edit/${product._id}`}>
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                          >
                            {deletingId === product._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminProducts;
