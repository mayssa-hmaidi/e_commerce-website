import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminNavbar.css";

const ORDERS_API = "http://localhost:5000/api/orders";

const PRODUCTS_API = "http://localhost:5000/api/products";

const LOW_STOCK_THRESHOLD = 5;

type AdminData = {
  name?: string;
  email?: string;
};

type AdminOrder = {
  _id: string;
  status: string;
  customer?: {
    name?: string;
  };
};

type AdminProduct = {
  _id: string;
  name: string;
  stock: number;
};

type NotificationType = "order" | "low-stock" | "out-of-stock";

type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  target: string;
};

type AdminNavbarProps = {
  onMenuClick: () => void;
};

function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const navigate = useNavigate();

  const notificationRef = useRef<HTMLDivElement | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [admin, setAdmin] = useState<AdminData | null>(null);

  // =========================================
  // LOAD ADMIN
  // =========================================

  useEffect(() => {
    const adminData = localStorage.getItem("admin");

    if (!adminData) {
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);

      setAdmin(parsedAdmin);
    } catch {
      setAdmin(null);
    }
  }, []);

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setNotifications([]);
        return;
      }

      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(ORDERS_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(PRODUCTS_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!ordersResponse.ok || !productsResponse.ok) {
        throw new Error("Failed to load notifications data");
      }

      const orders: AdminOrder[] = await ordersResponse.json();

      const products: AdminProduct[] = await productsResponse.json();

      const newNotifications: AdminNotification[] = [];

      // =====================================
      // PENDING ORDERS
      // =====================================

      orders
        .filter((order) => order.status === "pending")
        .forEach((order) => {
          newNotifications.push({
            id: `pending-order-${order._id}`,

            type: "order",

            title: "New pending order",

            message: `${
              order.customer?.name || "Customer"
            } placed a new order.`,

            target: "/admin/orders",
          });
        });

      // =====================================
      // LOW STOCK
      // =====================================

      products
        .filter(
          (product) =>
            product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
        )
        .forEach((product) => {
          newNotifications.push({
            id: `low-stock-${product._id}`,

            type: "low-stock",

            title: "Low stock",

            message: `${product.name} has only ${product.stock} unit${
              product.stock === 1 ? "" : "s"
            } left.`,

            target: "/admin/stock",
          });
        });

      // =====================================
      // OUT OF STOCK
      // =====================================

      products
        .filter((product) => product.stock <= 0)
        .forEach((product) => {
          newNotifications.push({
            id: `out-of-stock-${product._id}`,

            type: "out-of-stock",

            title: "Out of stock",

            message: `${product.name} is currently unavailable.`,

            target: "/admin/stock",
          });
        });

      // =====================================
      // LIMIT
      // =====================================

      setNotifications(newNotifications.slice(0, 15));
    } catch (error) {
      console.error("Notifications error:", error);

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =========================================
  // READ NOTIFICATIONS
  // =========================================

  const getReadNotificationIds = (): string[] => {
    try {
      const stored = localStorage.getItem("adminReadNotifications");

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const readNotificationIds = useMemo(() => {
    return getReadNotificationIds();
  }, [notifications]);

  const unreadNotifications = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id),
  );

  // =========================================
  // MARK ONE AS READ
  // =========================================

  const markAsRead = (notificationId: string) => {
    const current = getReadNotificationIds();

    if (!current.includes(notificationId)) {
      current.push(notificationId);
    }

    localStorage.setItem("adminReadNotifications", JSON.stringify(current));

    setNotifications((currentNotifications) => [...currentNotifications]);
  };

  // =========================================
  // MARK ALL AS READ
  // =========================================

  const markAllAsRead = () => {
    const allIds = notifications.map((notification) => notification.id);

    localStorage.setItem("adminReadNotifications", JSON.stringify(allIds));

    setNotifications([...notifications]);
  };

  // =========================================
  // OPEN NOTIFICATION
  // =========================================

  const handleNotificationClick = (notification: AdminNotification) => {
    markAsRead(notification.id);

    setNotificationsOpen(false);

    navigate(notification.target);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    localStorage.removeItem("admin");

    localStorage.removeItem("adminReadNotifications");

    navigate("/admin/login");
  };

  // =========================================
  // PROFILE
  // =========================================

  const adminName = admin?.name || "Admin";

  const adminEmail = admin?.email || "";

  const adminInitial = adminName.charAt(0).toUpperCase();

  // =========================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =========================================
  // TOGGLE NOTIFICATIONS
  // =========================================

  const toggleNotifications = () => {
    setNotificationsOpen((current) => !current);

    setProfileOpen(false);
  };

  // =========================================
  // TOGGLE PROFILE
  // =========================================

  const toggleProfile = () => {
    setProfileOpen((current) => !current);

    setNotificationsOpen(false);
  };

  return (
    <header className="admin-navbar">
      {/* =====================================
          MOBILE MENU
      ===================================== */}

      <button
        type="button"
        className="admin-menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <i className="bi bi-list" />
      </button>

      <div className="admin-navbar-spacer" />

      <div className="admin-navbar-actions">
        {/* ===================================
            NOTIFICATIONS
        =================================== */}

        <div className="admin-navbar-dropdown-container" ref={notificationRef}>
          <button
            type="button"
            className={`admin-navbar-icon-button ${
              notificationsOpen ? "active" : ""
            }`}
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <i className="bi bi-bell" />

            {unreadNotifications.length > 0 && (
              <span className="admin-notification-badge">
                {unreadNotifications.length > 9
                  ? "9+"
                  : unreadNotifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <div>
                  <strong>Notifications</strong>

                  <span>
                    {unreadNotifications.length > 0
                      ? `${unreadNotifications.length} unread`
                      : "All caught up"}
                  </span>
                </div>

                {notifications.length > 0 && (
                  <button type="button" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="admin-notification-list">
                {loadingNotifications ? (
                  <div className="admin-notification-empty">
                    <i className="bi bi-arrow-repeat" />

                    <span>Loading...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="admin-notification-empty">
                    <i className="bi bi-bell-slash" />

                    <strong>No notifications</strong>

                    <span>Everything looks good.</span>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isUnread = !readNotificationIds.includes(
                      notification.id,
                    );

                    return (
                      <button
                        type="button"
                        key={notification.id}
                        className={`admin-notification-item ${
                          isUnread ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className={`admin-notification-icon ${notification.type}`}
                        >
                          {notification.type === "order" && (
                            <i className="bi bi-receipt" />
                          )}

                          {notification.type === "low-stock" && (
                            <i className="bi bi-exclamation-triangle" />
                          )}

                          {notification.type === "out-of-stock" && (
                            <i className="bi bi-box2" />
                          )}
                        </div>

                        <div className="admin-notification-content">
                          <strong>{notification.title}</strong>

                          <span>{notification.message}</span>
                        </div>

                        {isUnread && (
                          <span className="admin-notification-unread-dot" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  type="button"
                  className="admin-notification-footer"
                  onClick={() => {
                    setNotificationsOpen(false);

                    navigate("/admin/orders");
                  }}
                >
                  View orders
                  <i className="bi bi-arrow-right" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===================================
            PROFILE
        =================================== */}

        <div className="admin-navbar-profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`admin-navbar-profile ${profileOpen ? "active" : ""}`}
            onClick={toggleProfile}
            aria-label="Open admin profile"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <div className="admin-navbar-avatar">{adminInitial}</div>

            <div className="admin-navbar-user">
              <strong>{adminName}</strong>

              <span>Administrator</span>
            </div>

            <i
              className={`bi ${
                profileOpen ? "bi-chevron-up" : "bi-chevron-down"
              } admin-profile-chevron`}
            />
          </button>

          {profileOpen && (
            <div className="admin-profile-dropdown" role="menu">
              {/* PROFILE HEADER */}

              <div className="admin-profile-dropdown-header">
                <div className="admin-profile-large-avatar">{adminInitial}</div>

                <div>
                  <strong>{adminName}</strong>

                  <span>Administrator</span>

                  {adminEmail && <small>{adminEmail}</small>}
                </div>
              </div>

              <div className="admin-profile-divider" />

              {/* PROFILE */}

              <button
                type="button"
                className="admin-profile-menu-item"
                onClick={() => {
                  setProfileOpen(false);

                  navigate("/admin/profile");
                }}
              >
                <div className="admin-profile-menu-icon profile">
                  <i className="bi bi-person" />
                </div>

                <div>
                  <strong>Profile</strong>

                  <span>Your admin account</span>
                </div>
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                className="admin-profile-menu-item"
                onClick={() => {
                  setProfileOpen(false);

                  navigate("/admin/settings");
                }}
              >
                <div className="admin-profile-menu-icon settings">
                  <i className="bi bi-gear" />
                </div>

                <div>
                  <strong>Settings</strong>

                  <span>Store configuration</span>
                </div>
              </button>

              <div className="admin-profile-divider" />

              {/* LOGOUT */}

              <button
                type="button"
                className="admin-profile-logout"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
