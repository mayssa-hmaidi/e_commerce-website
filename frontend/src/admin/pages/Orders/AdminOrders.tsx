import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "../../services/adminOrderService";

import "./AdminOrders.css";

function AdminOrders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");

        const data = await getAdminOrders();

        setOrders(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    status: AdminOrder["status"],
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const updatedOrder = await updateAdminOrderStatus(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update order status.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getShortOrderId = (id: string) => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  return (
    <div className="admin-orders-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-orders-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-orders-main">
          {/* =========================
              HEADER
          ========================= */}

          <section className="admin-orders-header">
            <div>
              <p className="admin-orders-label">STORE MANAGEMENT</p>

              <h1>Orders</h1>

              <p>View and manage customer orders.</p>
            </div>
          </section>

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div className="admin-orders-message">Loading orders...</div>
          )}

          {/* =========================
              ERROR
          ========================= */}

          {error && <div className="admin-orders-error">{error}</div>}

          {/* =========================
              EMPTY
          ========================= */}

          {!loading && !error && orders.length === 0 && (
            <div className="admin-orders-empty">
              <h2>No orders yet</h2>

              <p>Customer orders will appear here.</p>
            </div>
          )}

          {/* =========================
              ORDERS TABLE
          ========================= */}

          {!loading && !error && orders.length > 0 && (
            <section className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Delivery</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    /*
                        Support both:
                        - old orders
                        - new orders

                        Old order may not have:
                        subtotal / shipping
                      */

                    const subtotal = order.subtotal ?? order.total ?? 0;

                    const shipping = order.shipping ?? 0;

                    const total = order.total ?? subtotal + shipping;

                    return (
                      <tr key={order._id}>
                        {/* =========================
                              ORDER
                          ========================= */}

                        <td>
                          <strong>{getShortOrderId(order._id)}</strong>
                        </td>

                        {/* =========================
                              CUSTOMER
                          ========================= */}

                        <td>
                          <div className="admin-order-customer">
                            <strong>{order.customer?.name || "N/A"}</strong>

                            <span>{order.customer?.phone || "N/A"}</span>

                            {order.customer?.email && (
                              <span>{order.customer.email}</span>
                            )}
                          </div>
                        </td>

                        {/* =========================
                              DELIVERY
                          ========================= */}

                        <td>
                          <div className="admin-order-delivery">
                            {order.delivery?.governorate && (
                              <strong>{order.delivery.governorate}</strong>
                            )}

                            <span>{order.delivery?.city || "N/A"}</span>

                            <span>{order.delivery?.address || "N/A"}</span>

                            {order.delivery?.additionalDetails && (
                              <span>{order.delivery.additionalDetails}</span>
                            )}
                          </div>
                        </td>

                        {/* =========================
                              PRODUCTS
                          ========================= */}

                        <td>
                          <div className="admin-order-items">
                            {order.items.map((item, index) => (
                              <div key={`${order._id}-${index}`}>
                                <strong>{item.name}</strong>

                                <span>
                                  {item.color} / {item.size} × {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* =========================
                              TOTAL
                          ========================= */}

                        <td>
                          <div className="admin-order-total">
                            <strong>{total.toFixed(1)} DT</strong>

                            <span>Subtotal: {subtotal.toFixed(1)} DT</span>

                            <span>Shipping: {shipping.toFixed(1)} DT</span>
                          </div>
                        </td>

                        {/* =========================
                              DATE
                          ========================= */}

                        <td>{formatDate(order.createdAt)}</td>

                        {/* =========================
                              STATUS
                          ========================= */}

                        <td>
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order._id}
                            onChange={(event) =>
                              handleStatusChange(
                                order._id,
                                event.target.value as AdminOrder["status"],
                              )
                            }
                          >
                            <option value="pending">Pending</option>

                            <option value="confirmed">Confirmed</option>

                            <option value="shipped">Shipped</option>

                            <option value="delivered">Delivered</option>

                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminOrders;
