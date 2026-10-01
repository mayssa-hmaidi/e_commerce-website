import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch as fetch } from "../../../services/apiClient";

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getAnalyticsOverview,
  type AnalyticsOverview,
} from "../../services/adminAnalyticsService";

import "./Dashboard.css";

const PRODUCTS_API = "/api/products";
const ORDERS_API = "/api/orders";

type Product = {
  _id: string;
  stock: number;
};

type Order = {
  _id: string;
  status: string;
  total: number;
  createdAt: string;

  customer?: {
    name?: string;
  };
};

type Period = "7d" | "30d" | "12m";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =================================
  // BASIC DASHBOARD DATA
  // =================================

  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  // =================================
  // ANALYTICS
  // =================================

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d");

  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  // =================================
  // FETCH PRODUCTS + ORDERS
  // =================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsResponse, ordersResponse] = await Promise.all([
          fetch(PRODUCTS_API),
          fetch(ORDERS_API),
        ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders");
        }

        const products: Product[] = await productsResponse.json();

        const orders: Order[] = await ordersResponse.json();

        // =================================
        // PRODUCTS
        // =================================

        setProductsCount(products.length);

        const totalStock = products.reduce(
          (total, product) => total + (product.stock || 0),
          0,
        );

        setStockCount(totalStock);

        // =================================
        // ORDERS
        // =================================

        setOrdersCount(orders.length);

        const pendingOrders = orders.filter(
          (order) => order.status === "pending",
        );

        setPendingOrdersCount(pendingOrders.length);

        // =================================
        // RECENT ORDERS
        // =================================

        const latestOrders = [...orders]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setRecentOrders(latestOrders);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =================================
  // FETCH ANALYTICS
  // =================================

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);

        const data = await getAnalyticsOverview(selectedPeriod);

        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);

        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  // =================================
  // TOTAL SALES
  // =================================

  const totalSales = analytics?.summary.totalSales ?? 0;

  // =================================
  // PERIOD LABEL
  // =================================

  const periodLabel =
    selectedPeriod === "7d"
      ? "Last 7 Days"
      : selectedPeriod === "12m"
        ? "Last 12 Months"
        : "Last 30 Days";

  // =================================
  // CHART DATA
  // =================================
  //
  // IMPORTANT:
  // The backend now returns:
  //
  // {
  //   label: "Sep 2026",
  //   sales: 3116,
  //   orders: 5
  // }
  //
  // So DO NOT use:
  // item._id.year
  // item._id.month
  // item._id.day
  // =================================

  const chartData =
    analytics?.salesTimeline.map((item) => ({
      label: item.label,
      sales: Number(item.sales ?? 0),
      orders: Number(item.orders ?? 0),
    })) ?? [];

  // =================================
  // DATE
  // =================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =================================
  // ORDER ID
  // =================================

  const getShortOrderId = (id: string) => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  // =================================
  // STATUS
  // =================================

  const getStatusClass = (status: string) => {
    return `dashboard-order-status ${status}`;
  };

  // =================================
  // CHANGE PERIOD
  // =================================

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    setPeriodMenuOpen(false);
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* CONTENT */}

      <div className="admin-dashboard-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-dashboard-main">
          {/* HEADER */}

          <section className="admin-dashboard-header">
            <div>
              <p className="admin-dashboard-label">OVERVIEW</p>

              <h1>Dashboard</h1>

              <p>Overview of your store performance.</p>
            </div>

            <div className="admin-dashboard-date">
              <i className="bi bi-calendar3"></i>

              <span>
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </section>

          {/* STATS */}

          <section className="admin-stats-grid">
            {/* PRODUCTS */}

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-icon products">
                  <i className="bi bi-bag"></i>
                </div>

                <span>Products</span>
              </div>

              <strong>{loading ? "..." : productsCount}</strong>

              <p>Total products</p>
            </div>

            {/* ORDERS */}

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-icon orders">
                  <i className="bi bi-receipt"></i>
                </div>

                <span>Orders</span>
              </div>

              <strong>{loading ? "..." : ordersCount}</strong>

              <p>Total orders</p>
            </div>

            {/* STOCK */}

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-icon stock">
                  <i className="bi bi-box-seam"></i>
                </div>

                <span>Stock</span>
              </div>

              <strong>{loading ? "..." : stockCount}</strong>

              <p>Units in stock</p>
            </div>

            {/* SALES */}

            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-icon sales">
                  <i className="bi bi-currency-dollar"></i>
                </div>

                <span>Sales</span>
              </div>

              <strong>
                {analyticsLoading ? "..." : `${totalSales.toFixed(1)} DT`}
              </strong>

              <p>Total sales</p>
            </div>
          </section>

          {/* MAIN GRID */}

          <section className="admin-dashboard-grid">
            {/* SALES OVERVIEW */}

            <div className="admin-dashboard-card sales-overview">
              <div className="admin-card-header">
                <div>
                  <p>PERFORMANCE</p>

                  <h2>Sales Overview</h2>
                </div>

                <div className="admin-period-wrapper">
                  <button
                    type="button"
                    className="admin-period-button"
                    onClick={() => setPeriodMenuOpen((current) => !current)}
                  >
                    {periodLabel}

                    <i className="bi bi-chevron-down"></i>
                  </button>

                  {periodMenuOpen && (
                    <div className="admin-period-menu">
                      <button
                        type="button"
                        className={selectedPeriod === "7d" ? "active" : ""}
                        onClick={() => handlePeriodChange("7d")}
                      >
                        Last 7 Days
                      </button>

                      <button
                        type="button"
                        className={selectedPeriod === "30d" ? "active" : ""}
                        onClick={() => handlePeriodChange("30d")}
                      >
                        Last 30 Days
                      </button>

                      <button
                        type="button"
                        className={selectedPeriod === "12m" ? "active" : ""}
                        onClick={() => handlePeriodChange("12m")}
                      >
                        Last 12 Months
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CHART */}

              <div className="admin-chart-container">
                {analyticsLoading ? (
                  <div className="admin-chart-state">
                    <i className="bi bi-arrow-repeat"></i>

                    <span>Loading analytics...</span>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="admin-chart-state">
                    <i className="bi bi-bar-chart"></i>

                    <span>No sales data for this period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 15,
                        right: 18,
                        left: 8,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="salesGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7657d9"
                            stopOpacity={0.22}
                          />

                          <stop
                            offset="100%"
                            stopColor="#7657d9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#eeeeee"
                        strokeDasharray="4 4"
                      />

                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#888",
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#888",
                        }}
                        tickFormatter={(value) => `${value} DT`}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        }}
                        formatter={(value) => [
                          `${Number(value).toFixed(1)} DT`,
                          "Sales",
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="none"
                        fill="url(#salesGradient)"
                      />

                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#7657d9"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#7657d9",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: "#7657d9",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* SALES SUMMARY */}

              <div className="admin-sales-summary">
                <div>
                  <span>Total Sales</span>

                  <strong>
                    {analyticsLoading ? "..." : `${totalSales.toFixed(1)} DT`}
                  </strong>
                </div>

                <span className="admin-sales-note">
                  Confirmed, shipped and delivered orders
                </span>
              </div>
            </div>

            {/* RECENT ORDERS */}

            <div className="admin-dashboard-card recent-orders">
              <div className="admin-card-header">
                <div>
                  <p>ORDERS</p>

                  <h2>Recent Orders</h2>
                </div>

                <Link to="/admin/orders">View all</Link>
              </div>

              <div className="admin-recent-orders-list">
                {recentOrders.length === 0 ? (
                  <div className="admin-recent-empty">No orders yet.</div>
                ) : (
                  recentOrders.map((order) => (
                    <div className="admin-recent-order" key={order._id}>
                      <div className="admin-recent-order-info">
                        <strong>{getShortOrderId(order._id)}</strong>

                        <span>{order.customer?.name || "Customer"}</span>

                        <small>{formatDate(order.createdAt)}</small>
                      </div>

                      <div className="admin-recent-order-right">
                        <strong>{(order.total || 0).toFixed(1)} DT</strong>

                        <span className={getStatusClass(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* BOTTOM */}

          <section className="admin-dashboard-bottom">
            {/* PENDING */}

            <div className="admin-dashboard-card dashboard-alert-card">
              <div className="admin-card-header">
                <div>
                  <p>ATTENTION</p>

                  <h2>Order Status</h2>
                </div>

                <div className="dashboard-alert-icon">
                  <i className="bi bi-bell"></i>
                </div>
              </div>

              <div className="dashboard-alert-content">
                <strong>{loading ? "..." : pendingOrdersCount}</strong>

                <span>pending orders need attention</span>
              </div>

              <Link to="/admin/orders">
                MANAGE ORDERS
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {/* QUICK ACTIONS */}

            <div className="admin-dashboard-card quick-actions">
              <div className="admin-card-header">
                <div>
                  <p>SHORTCUTS</p>

                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="admin-action-grid">
                <Link to="/admin/products/add" className="admin-action-card">
                  <div className="admin-action-icon add-product">
                    <i className="bi bi-plus-lg"></i>
                  </div>

                  <strong>Add Product</strong>

                  <span>Create a new product</span>
                </Link>

                <Link to="/admin/orders" className="admin-action-card">
                  <div className="admin-action-icon view-orders">
                    <i className="bi bi-receipt"></i>
                  </div>

                  <strong>View Orders</strong>

                  <span>Manage customer orders</span>
                </Link>

                <Link to="/admin/products" className="admin-action-card">
                  <div className="admin-action-icon manage-stock">
                    <i className="bi bi-box-seam"></i>
                  </div>

                  <strong>Manage Stock</strong>

                  <span>Monitor inventory</span>
                </Link>

                <Link to="/admin/customers" className="admin-action-card">
                  <div className="admin-action-icon customers">
                    <i className="bi bi-people"></i>
                  </div>

                  <strong>Customers</strong>

                  <span>View customer data</span>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
