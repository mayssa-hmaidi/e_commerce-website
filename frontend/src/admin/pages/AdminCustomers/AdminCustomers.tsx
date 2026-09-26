import { useEffect, useMemo, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getAdminCustomers,
  type AdminCustomer,
} from "../../services/adminCustomerService";

import "./AdminCustomers.css";

function AdminCustomers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // LOAD CUSTOMERS
  // =========================================

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminCustomers();

        setCustomers(data);
      } catch (error) {
        console.error("Customers loading error:", error);

        setError(
          error instanceof Error ? error.message : "Unable to load customers.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // =========================================
  // SEARCH
  // =========================================

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term),
    );
  }, [customers, search]);

  // =========================================
  // STATS
  // =========================================

  const stats = useMemo(() => {
    const totalCustomers = customers.length;

    const totalOrders = customers.reduce(
      (sum, customer) => sum + customer.orders,
      0,
    );

    const totalSpent = customers.reduce(
      (sum, customer) => sum + customer.spent,
      0,
    );

    return {
      totalCustomers,

      totalOrders,

      averageOrders:
        totalCustomers === 0
          ? "0.0"
          : (totalOrders / totalCustomers).toFixed(1),

      averageSpent:
        totalCustomers === 0 ? 0 : Math.round(totalSpent / totalCustomers),
    };
  }, [customers]);

  return (
    <div className="admin-customers-page">
      {/* =================================
          TOPBAR
      ================================= */}

      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      {/* =================================
          SIDEBAR
      ================================= */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* =================================
          CONTENT
      ================================= */}

      <main className="admin-customers-content">
        <div className="admin-customers-main">
          {/* HEADER */}

          <div className="admin-customers-header">
            <div>
              <p>MANAGEMENT</p>

              <h1>Customers</h1>

              <span>Understand your customer base and order activity.</span>
            </div>
          </div>

          {/* =================================
              STATS
          ================================= */}

          <section className="customers-stat-grid">
            <div className="customers-stat-card">
              <div className="customers-stat-icon purple">
                <i className="bi bi-people" />
              </div>

              <div>
                <span>Total Customers</span>

                <strong>{loading ? "..." : stats.totalCustomers}</strong>
              </div>
            </div>

            <div className="customers-stat-card">
              <div className="customers-stat-icon blue">
                <i className="bi bi-bag-check" />
              </div>

              <div>
                <span>Total Orders</span>

                <strong>{loading ? "..." : stats.totalOrders}</strong>
              </div>
            </div>

            <div className="customers-stat-card">
              <div className="customers-stat-icon green">
                <i className="bi bi-graph-up" />
              </div>

              <div>
                <span>Avg. Orders / Customer</span>

                <strong>{loading ? "..." : stats.averageOrders}</strong>
              </div>
            </div>

            <div className="customers-stat-card">
              <div className="customers-stat-icon orange">
                <i className="bi bi-wallet2" />
              </div>

              <div>
                <span>Avg. Customer Spend</span>

                <strong>{loading ? "..." : `${stats.averageSpent} DT`}</strong>
              </div>
            </div>
          </section>

          {/* =================================
              CUSTOMERS CARD
          ================================= */}

          <section className="customers-card">
            <div className="customers-toolbar">
              <div className="customers-search">
                <i className="bi bi-search" />

                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <span className="customers-result-count">
                {filteredCustomers.length}{" "}
                {filteredCustomers.length === 1 ? "customer" : "customers"}
              </span>
            </div>

            {/* ERROR */}

            {error && (
              <div className="customers-error">
                <i className="bi bi-exclamation-circle" />

                <div>
                  <strong>Unable to load customers</strong>

                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="customers-state">
                <i className="bi bi-arrow-repeat" />

                <span>Loading customers...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="customers-state">
                <i className="bi bi-people" />

                <strong>No customers found</strong>

                <span>
                  {search
                    ? "Try another search."
                    : "Customers will appear here after they create an account."}
                </span>
              </div>
            ) : (
              <div className="customers-table-wrapper">
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Customer</th>

                      <th>Email</th>

                      <th>Phone</th>

                      <th>Orders</th>

                      <th>Total Spent</th>

                      <th>Last Order</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="customer-name">
                            <div className="customer-avatar">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>

                            <strong>{customer.name}</strong>
                          </div>
                        </td>

                        <td>{customer.email}</td>

                        <td>{customer.phone}</td>

                        <td>{customer.orders}</td>

                        <td>
                          {customer.spent.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{" "}
                          DT
                        </td>

                        <td>
                          {customer.lastOrder
                            ? new Date(customer.lastOrder).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "No orders"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminCustomers;
