import { useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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

import "./AdminAnalytics.css";

type Period = "7d" | "30d" | "12m";

function AdminAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [period, setPeriod] = useState<Period>("30d");

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAnalyticsOverview(period);

        setAnalytics(data);
      } catch (error) {
        console.error(error);

        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period]);

  const chartData =
    analytics?.salesTimeline.map((item) => ({
      label: item.label,
      sales: Number(item.sales ?? 0),
      orders: Number(item.orders ?? 0),
    })) ?? [];

  const statusData =
    analytics?.ordersByStatus.map((item) => ({
      status: item._id,
      orders: Number(item.count ?? 0),
    })) ?? [];

  const topProducts = analytics?.topProducts ?? [];

  return (
    <div className="admin-analytics-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-analytics-content">
        <div className="admin-analytics-main">
          {/* HEADER */}

          <div className="analytics-header">
            <div>
              <p>PERFORMANCE</p>

              <h1>Analytics</h1>

              <span>Understand your store performance and sales.</span>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="analytics-period"
            >
              <option value="7d">Last 7 Days</option>

              <option value="30d">Last 30 Days</option>

              <option value="12m">Last 12 Months</option>
            </select>
          </div>

          {error && (
            <div className="analytics-error">
              <i className="bi bi-exclamation-circle" />

              {error}
            </div>
          )}

          {/* KPI */}

          <section className="analytics-stat-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon sales">
                <i className="bi bi-currency-dollar" />
              </div>

              <span>Total Sales</span>

              <strong>
                {loading
                  ? "..."
                  : `${analytics?.summary.totalSales.toLocaleString()} DT`}
              </strong>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon orders">
                <i className="bi bi-receipt" />
              </div>

              <span>Total Orders</span>

              <strong>
                {loading ? "..." : (analytics?.summary.totalOrders ?? 0)}
              </strong>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon items">
                <i className="bi bi-box-seam" />
              </div>

              <span>Items Sold</span>

              <strong>
                {loading ? "..." : (analytics?.summary.totalItemsSold ?? 0)}
              </strong>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon average">
                <i className="bi bi-graph-up-arrow" />
              </div>

              <span>Average Order Value</span>

              <strong>
                {loading
                  ? "..."
                  : `${analytics?.summary.averageOrderValue.toLocaleString()} DT`}
              </strong>
            </div>
          </section>

          {/* SALES CHART */}

          <section className="analytics-card sales-card">
            <div className="analytics-card-header">
              <div>
                <p>REVENUE</p>

                <h2>Sales Overview</h2>
              </div>
            </div>

            <div className="analytics-chart">
              {loading ? (
                <div className="analytics-state">
                  <i className="bi bi-arrow-repeat" />
                  Loading analytics...
                </div>
              ) : chartData.length === 0 ? (
                <div className="analytics-state">
                  <i className="bi bi-bar-chart" />
                  No sales data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 0,
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
                        <stop offset="0%" stopOpacity={0.3} />

                        <stop offset="100%" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#7657d9"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* BOTTOM */}

          <section className="analytics-bottom-grid">
            {/* STATUS */}

            <div className="analytics-card">
              <div className="analytics-card-header">
                <div>
                  <p>ORDERS</p>

                  <h2>Orders by Status</h2>
                </div>
              </div>

              <div className="analytics-small-chart">
                {statusData.length === 0 ? (
                  <div className="analytics-state">No order data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="status"
                        tick={{
                          fontSize: 9,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 9,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="orders"
                        fill="#4285d4"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* TOP PRODUCTS */}

            <div className="analytics-card">
              <div className="analytics-card-header">
                <div>
                  <p>PRODUCTS</p>

                  <h2>Top Products</h2>
                </div>
              </div>

              <div className="top-products-list">
                {topProducts.length === 0 ? (
                  <div className="analytics-state">No product data.</div>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product._id} className="top-product-row">
                      <div className="top-product-number">{index + 1}</div>

                      <div className="top-product-info">
                        <strong>{product.name}</strong>

                        <span>{product.unitsSold} units sold</span>
                      </div>

                      <strong>
                        {Number(product.revenue ?? 0).toLocaleString()} DT
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminAnalytics;
