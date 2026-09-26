import { useEffect, useMemo, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import {
  deleteAdminNewsletterSubscriber,
  getAdminNewsletterSubscribers,
  unsubscribeAdminNewsletterSubscriber,
  type AdminNewsletterSubscriber,
} from "../../services/adminNewsletterService";

import "./AdminNewsletter.css";

function AdminNewsletter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<AdminNewsletterSubscriber[]>(
    [],
  );
  const [activeCount, setActiveCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminNewsletterSubscribers()
      .then((data) => {
        if (!cancelled) {
          setSubscribers(data.subscribers);
          setActiveCount(data.activeCount);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load newsletter subscribers.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reloadSubscribers = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? subscribers.filter((subscriber) => subscriber.email.includes(term))
      : subscribers;
  }, [search, subscribers]);

  const handleUnsubscribe = async (subscriber: AdminNewsletterSubscriber) => {
    if (!window.confirm(`Unsubscribe ${subscriber.email}?`)) {
      return;
    }

    setPendingId(subscriber._id);
    setError("");

    try {
      await unsubscribeAdminNewsletterSubscriber(subscriber._id);
      setSubscribers((current) =>
        current.map((item) =>
          item._id === subscriber._id
            ? {
                ...item,
                subscribed: false,
                unsubscribedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setActiveCount((count) => Math.max(0, count - 1));
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to unsubscribe this address.",
      );
    } finally {
      setPendingId("");
    }
  };

  const handleDelete = async (subscriber: AdminNewsletterSubscriber) => {
    if (!window.confirm(`Permanently delete ${subscriber.email}?`)) {
      return;
    }

    setPendingId(subscriber._id);
    setError("");

    try {
      await deleteAdminNewsletterSubscriber(subscriber._id);
      setSubscribers((current) =>
        current.filter((item) => item._id !== subscriber._id),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to delete this address.",
      );
    } finally {
      setPendingId("");
    }
  };

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="admin-newsletter-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-newsletter-content">
        <header className="admin-newsletter-header">
          <div>
            <p>COMMUNICATION</p>
            <h1>Newsletter</h1>
            <span>Manage people who opted in to store updates.</span>
          </div>
          <div className="admin-newsletter-stat">
            <span>Active subscribers</span>
            <strong>{loading ? "..." : activeCount}</strong>
          </div>
        </header>

        {error && (
          <div className="admin-newsletter-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={reloadSubscribers}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-newsletter-list">
          <div className="admin-newsletter-toolbar">
            <label className="admin-newsletter-search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email"
                aria-label="Search subscribers by email"
              />
            </label>
            <span>{filteredSubscribers.length} addresses</span>
          </div>

          {loading ? (
            <div className="admin-newsletter-empty">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="admin-newsletter-empty">
              {search
                ? "No matching subscribers."
                : "No newsletter subscribers yet."}
            </div>
          ) : (
            <div className="admin-newsletter-table-wrap">
              <table className="admin-newsletter-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Subscribed</th>
                    <th>Unsubscribed</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber._id}>
                      <td>{subscriber.email}</td>
                      <td>
                        <span
                          className={`admin-newsletter-status ${subscriber.subscribed ? "active" : "inactive"}`}
                        >
                          {subscriber.subscribed ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td>{formatDate(subscriber.subscribedAt)}</td>
                      <td>{formatDate(subscriber.unsubscribedAt)}</td>
                      <td className="admin-newsletter-actions">
                        {subscriber.subscribed ? (
                          <button
                            type="button"
                            onClick={() => void handleUnsubscribe(subscriber)}
                            disabled={pendingId === subscriber._id}
                          >
                            Unsubscribe
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="delete"
                            onClick={() => void handleDelete(subscriber)}
                            disabled={pendingId === subscriber._id}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminNewsletter;
