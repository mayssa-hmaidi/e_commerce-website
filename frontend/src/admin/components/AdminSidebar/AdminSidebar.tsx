import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../services/adminService";

import "./AdminSidebar.css";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "bi-grid-1x2",
  },

  {
    label: "Products",
    path: "/admin/products",
    icon: "bi-box-seam",
  },

  {
    label: "Orders",
    path: "/admin/orders",
    icon: "bi-receipt",
  },

  {
    label: "Messages",
    path: "/admin/messages",
    icon: "bi-chat-left-text",
  },

  {
    label: "Newsletter",
    path: "/admin/newsletter",
    icon: "bi-envelope",
  },

  {
    label: "Stock",
    path: "/admin/stock",
    icon: "bi-stack",
  },

  {
    label: "Customers",
    path: "/admin/customers",
    icon: "bi-people",
  },

  {
    label: "Promo Codes",
    path: "/admin/promo-codes",
    icon: "bi-tag",
  },

  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: "bi-bar-chart",
  },

  {
    label: "Settings",
    path: "/admin/settings",
    icon: "bi-gear",
  },
];

function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    localStorage.removeItem("adminReadNotifications");

    navigate("/admin/login");
  };

  return (
    <>
      {isOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}>
        {/* =================================
            BRAND
        ================================= */}

        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">U</div>

          <div className="admin-sidebar-brand-text">
            <strong>URBAN THREADS</strong>

            <span>ADMIN</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* =================================
            NAVIGATION
        ================================= */}

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <p className="admin-sidebar-section-title">MENU</p>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* =================================
            FOOTER
        ================================= */}

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left" aria-hidden="true" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
