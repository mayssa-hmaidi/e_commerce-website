import { useCallback, useEffect, useMemo, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  deleteAdminContactMessage,
  getAdminContactMessages,
  markAdminContactMessageRead,
  type AdminContactMessage,
} from "../../services/adminContactMessageService";

import "./AdminMessages.css";

type MessageFilter = "all" | "unread" | "read";

function AdminMessages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<AdminContactMessage[]>([]);

  const [selectedMessage, setSelectedMessage] =
    useState<AdminContactMessage | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<MessageFilter>("all");

  const loadMessages = useCallback(async () => {
    try {
      const data = await getAdminContactMessages();

      setError("");
      setMessages(data);

      setSelectedMessage((currentMessage) => {
        if (!currentMessage) {
          return data[0] || null;
        }

        const existingMessage = data.find(
          (messageItem) => messageItem._id === currentMessage._id,
        );

        return existingMessage || data[0] || null;
      });
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect starts an asynchronous request and updates state when it settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages();
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesFilter = filter === "all" || message.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        message.name,
        message.email,
        message.phone,
        message.subject,
        message.message,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [messages, search, filter]);

  const handleSelectMessage = async (message: AdminContactMessage) => {
    setSelectedMessage(message);

    if (message.status !== "unread") {
      return;
    }

    try {
      const updatedMessage = await markAdminContactMessageRead(message._id);

      setMessages((currentMessages) =>
        currentMessages.map((messageItem) =>
          messageItem._id === updatedMessage._id ? updatedMessage : messageItem,
        ),
      );

      setSelectedMessage(updatedMessage);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to mark message as read.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAdminContactMessage(id);

      setMessages((currentMessages) =>
        currentMessages.filter((messageItem) => messageItem._id !== id),
      );

      setSelectedMessage((currentMessage) =>
        currentMessage?._id === id ? null : currentMessage,
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to delete message.",
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter(
    (message) => message.status === "unread",
  ).length;

  return (
    <div className="admin-messages-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-messages-content">
        <header className="admin-messages-header">
          <div>
            <p className="admin-messages-label">COMMUNICATION</p>

            <h1>Messages</h1>

            <p>Manage messages received from your customers.</p>
          </div>

          <div className="admin-messages-header-stat">
            <span>Unread</span>

            <strong>{unreadCount}</strong>
          </div>
        </header>

        {error && (
          <div className="admin-messages-error">
            <div className="admin-messages-error-content">
              <i className="bi bi-exclamation-circle" />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadMessages();
              }}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-messages-toolbar">
          <div className="admin-messages-search">
            <i className="bi bi-search" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages..."
            />
          </div>

          <div className="admin-messages-filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              type="button"
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread
            </button>

            <button
              type="button"
              className={filter === "read" ? "active" : ""}
              onClick={() => setFilter("read")}
            >
              Read
            </button>
          </div>

          <button
            type="button"
            className="admin-messages-refresh"
            onClick={() => void loadMessages()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise" />

            <span>Refresh</span>
          </button>
        </section>

        <section className="admin-messages-layout">
          <div className="admin-message-list">
            {loading ? (
              <div className="admin-message-state">
                <i className="bi bi-arrow-repeat admin-message-loading-icon" />

                <span>Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="admin-message-state">
                <div className="admin-message-empty-icon">
                  <i className="bi bi-envelope-open" />
                </div>

                <strong>No messages found</strong>

                <span>Customer messages will appear here.</span>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  type="button"
                  key={message._id}
                  className={`admin-message-list-item ${
                    selectedMessage?._id === message._id ? "selected" : ""
                  } ${message.status === "unread" ? "unread" : ""}`}
                  onClick={() => void handleSelectMessage(message)}
                >
                  <div className="admin-message-avatar">
                    {message.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="admin-message-list-info">
                    <div className="admin-message-list-top">
                      <strong>{message.name}</strong>

                      <span>{formatDate(message.createdAt)}</span>
                    </div>

                    <strong className="admin-message-subject">
                      {message.subject}
                    </strong>

                    <p>{message.message}</p>

                    {message.status === "unread" && (
                      <span className="admin-unread-dot">Unread</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="admin-message-details">
            {!selectedMessage ? (
              <div className="admin-message-details-empty">
                <div>
                  <i className="bi bi-chat-left-text" />
                </div>

                <h2>Select a message</h2>

                <p>
                  Choose a customer message from the list to view its details.
                </p>
              </div>
            ) : (
              <>
                <div className="admin-message-details-header">
                  <div>
                    <p>MESSAGE</p>

                    <h2>{selectedMessage.subject}</h2>

                    <span>
                      Received {formatDate(selectedMessage.createdAt)}
                      {" at "}
                      {formatTime(selectedMessage.createdAt)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-message-delete"
                    onClick={() => void handleDelete(selectedMessage._id)}
                    title="Delete message"
                  >
                    <i className="bi bi-trash3" />
                  </button>
                </div>

                <div className="admin-message-customer">
                  <div className="admin-message-avatar large">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{selectedMessage.name}</strong>

                    <a href={`mailto:${selectedMessage.email}`}>
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="admin-message-actions">
                  <a
                    href={`mailto:${
                      selectedMessage.email
                    }?subject=Re%3A%20${encodeURIComponent(
                      selectedMessage.subject,
                    )}`}
                    className="admin-message-action primary"
                  >
                    <i className="bi bi-envelope" />

                    <span>Reply by Email</span>
                  </a>

                  {selectedMessage.phone && (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="admin-message-action"
                    >
                      <i className="bi bi-telephone" />

                      <span>Call Customer</span>
                    </a>
                  )}
                </div>

                <div className="admin-message-meta">
                  <div>
                    <span>Email</span>

                    <strong>{selectedMessage.email}</strong>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <span>Phone</span>

                      <strong>{selectedMessage.phone}</strong>
                    </div>
                  )}
                </div>

                <div className="admin-message-body">
                  <span>CUSTOMER MESSAGE</span>

                  <p>{selectedMessage.message}</p>
                </div>

                <div className="admin-message-status">
                  <span>Status</span>

                  <strong className={selectedMessage.status}>
                    <i
                      className={
                        selectedMessage.status === "read"
                          ? "bi bi-check-circle"
                          : "bi bi-circle"
                      }
                    />

                    {selectedMessage.status === "read" ? "Read" : "Unread"}
                  </strong>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminMessages;
