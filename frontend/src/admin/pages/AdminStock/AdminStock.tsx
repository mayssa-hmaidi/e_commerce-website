import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getAdminStockProducts,
  type StockProduct,
} from "../../services/adminStockService";

import "./AdminStock.css";

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const LOW_STOCK_THRESHOLD = 5;

const getStockStatus = (stock: number) => {
  if (stock <= 0) {
    return "out-of-stock";
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return "low-stock";
  }

  return "in-stock";
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in-stock":
      return "In Stock";

    case "low-stock":
      return "Low Stock";

    case "out-of-stock":
      return "Out of Stock";

    default:
      return status;
  }
};

const formatUpdatedDate = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function AdminStock() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState<StockProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [productFilter, setProductFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState<StockFilter>("all");

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  // =========================================
  // LOAD PRODUCTS
  // =========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminStockProducts();

        setProducts(data);
      } catch (err) {
        console.error("Stock loading error:", err);

        setError("Unable to load stock information.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // =========================================
  // KPI DATA
  // =========================================

  const stockStats = useMemo(() => {
    const totalProducts = products.length;

    const inStock = products.filter(
      (product) => getStockStatus(product.stock) === "in-stock",
    ).length;

    const lowStock = products.filter(
      (product) => getStockStatus(product.stock) === "low-stock",
    ).length;

    const outOfStock = products.filter(
      (product) => getStockStatus(product.stock) === "out-of-stock",
    ).length;

    const totalUnits = products.reduce(
      (total, product) => total + Math.max(product.stock || 0, 0),
      0,
    );

    return {
      totalProducts,
      totalUnits,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // =========================================
  // PRODUCT FILTER OPTIONS
  // =========================================

  const productOptions = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.name).filter(Boolean)),
    ).sort();
  }, [products]);

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch);

      const matchesProduct =
        productFilter === "all" || product.name === productFilter;

      const status = getStockStatus(product.stock);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [products, search, productFilter, statusFilter]);

  // =========================================
  // PAGINATION
  // =========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleProductFilter = (value: string) => {
    setProductFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: StockFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // =========================================
  // EXPORT CSV
  // =========================================

  const handleExport = () => {
    const headers = [
      "Product",
      "Colors",
      "Sizes",
      "Stock",
      "Status",
      "Last Updated",
    ];

    const rows = filteredProducts.map((product) => [
      product.name,
      product.colors?.join(" / ") || "",
      product.sizes?.join(" / ") || "",
      product.stock,
      getStatusLabel(getStockStatus(product.stock)),
      formatUpdatedDate(product.updatedAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "stock-report.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="admin-stock-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-stock-content">
        <div className="admin-stock-main">
          {/* ==================================
              PAGE HEADER
          ================================== */}

          <div className="admin-stock-header">
            <div>
              <h1>Stock</h1>

              <p>Manage your product stock and inventory levels.</p>
            </div>

            <button
              className="stock-export-button"
              onClick={handleExport}
              disabled={filteredProducts.length === 0}
            >
              <i className="bi bi-download" />
              Export
            </button>
          </div>

          {/* ==================================
              KPI CARDS
          ================================== */}

          <section className="stock-stat-grid">
            <div className="stock-stat-card">
              <div className="stock-stat-icon stock-stat-icon-purple">
                <i className="bi bi-box-seam" />
              </div>

              <div className="stock-stat-content">
                <span>Total Products</span>

                <strong>{stockStats.totalProducts}</strong>

                <small>{stockStats.totalUnits} total units</small>
              </div>
            </div>

            <div className="stock-stat-card">
              <div className="stock-stat-icon stock-stat-icon-green">
                <i className="bi bi-check-circle" />
              </div>

              <div className="stock-stat-content">
                <span>In Stock</span>

                <strong>{stockStats.inStock}</strong>

                <small>Products available</small>
              </div>
            </div>

            <div className="stock-stat-card">
              <div className="stock-stat-icon stock-stat-icon-orange">
                <i className="bi bi-exclamation-triangle" />
              </div>

              <div className="stock-stat-content">
                <span>Low Stock</span>

                <strong>{stockStats.lowStock}</strong>

                <small>{LOW_STOCK_THRESHOLD} units or less</small>
              </div>
            </div>

            <div className="stock-stat-card">
              <div className="stock-stat-icon stock-stat-icon-red">
                <i className="bi bi-box2" />
              </div>

              <div className="stock-stat-content">
                <span>Out of Stock</span>

                <strong>{stockStats.outOfStock}</strong>

                <small>Products unavailable</small>
              </div>
            </div>
          </section>

          {/* ==================================
              MAIN TABLE CARD
          ================================== */}

          <section className="admin-stock-card">
            {/* FILTER BAR */}

            <div className="stock-filter-bar">
              <div className="stock-search">
                <i className="bi bi-search" />

                <input
                  type="text"
                  placeholder="Search by product..."
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>

              <div className="stock-filter-select">
                <select
                  value={productFilter}
                  onChange={(event) => handleProductFilter(event.target.value)}
                >
                  <option value="all">All Products</option>

                  {productOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stock-filter-select">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusFilter(event.target.value as StockFilter)
                  }
                >
                  <option value="all">All Status</option>

                  <option value="in-stock">In Stock</option>

                  <option value="low-stock">Low Stock</option>

                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="stock-error">
                <i className="bi bi-exclamation-circle" />

                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="stock-loading">
                <div className="stock-spinner" />

                <p>Loading stock...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="stock-empty">
                <i className="bi bi-box-seam" />

                <h3>No products found</h3>

                <p>Try changing your search or filters.</p>
              </div>
            ) : (
              <>
                {/* TABLE */}

                <div className="stock-table-wrapper">
                  <table className="stock-table">
                    <thead>
                      <tr>
                        <th>Product</th>

                        <th>Colors</th>

                        <th>Sizes</th>

                        <th>Stock</th>

                        <th>Status</th>

                        <th>Last Updated</th>

                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProducts.map((product) => {
                        const status = getStockStatus(product.stock);

                        return (
                          <tr key={product._id}>
                            {/* PRODUCT */}

                            <td>
                              <div className="stock-product-cell">
                                <div className="stock-product-image">
                                  {product.images?.length ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      width={38}
                                      height={46}
                                    />
                                  ) : (
                                    <i className="bi bi-image" />
                                  )}
                                </div>

                                <div>
                                  <strong>{product.name}</strong>

                                  <span>{product.category || "Product"}</span>
                                </div>
                              </div>
                            </td>

                            {/* COLORS */}

                            <td>
                              <div className="stock-options">
                                {product.colors?.length ? (
                                  product.colors.slice(0, 3).map((color) => (
                                    <span
                                      className="stock-color-item"
                                      key={color}
                                    >
                                      <span
                                        className={`stock-color-dot color-${color
                                          .toLowerCase()
                                          .replace(/\s+/g, "-")}`}
                                      />

                                      {color}
                                    </span>
                                  ))
                                ) : (
                                  <span className="stock-muted">—</span>
                                )}
                              </div>
                            </td>

                            {/* SIZES */}

                            <td>
                              <div className="stock-size-list">
                                {product.sizes?.length
                                  ? product.sizes
                                      .slice(0, 4)
                                      .map((size) => (
                                        <span key={size}>{size}</span>
                                      ))
                                  : "—"}
                              </div>
                            </td>

                            {/* STOCK */}

                            <td>
                              <span className="stock-quantity">
                                {product.stock}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={`stock-status-badge stock-status-${status}`}
                              >
                                <span />

                                {getStatusLabel(status)}
                              </span>
                            </td>

                            {/* DATE */}

                            <td>
                              <div className="stock-date">
                                <strong>
                                  {formatUpdatedDate(product.updatedAt)}
                                </strong>

                                <span>
                                  {product.updatedAt
                                    ? new Date(
                                        product.updatedAt,
                                      ).toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </td>

                            {/* ACTION */}

                            <td>
                              <Link
                                to={`/admin/products?edit=${product._id}`}
                                className="stock-action-button"
                                title="Edit product stock"
                              >
                                <i className="bi bi-pencil" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* FOOTER */}

                <div className="stock-table-footer">
                  <span>
                    Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}{" "}
                    to{" "}
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredProducts.length,
                    )}{" "}
                    of {filteredProducts.length} products
                  </span>

                  <div className="stock-pagination">
                    <button
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                    >
                      <i className="bi bi-chevron-left" />
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => index + 1,
                    )
                      .slice(0, 5)
                      .map((page) => (
                        <button
                          key={page}
                          className={safeCurrentPage === page ? "active" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                    >
                      <i className="bi bi-chevron-right" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminStock;
