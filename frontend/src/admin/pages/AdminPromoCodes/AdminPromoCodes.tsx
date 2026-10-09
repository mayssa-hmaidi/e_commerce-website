import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  createAdminPromoCode,
  deleteAdminPromoCode,
  getAdminPromoCodes,
  toggleAdminPromoCode,
  updateAdminPromoCode,
  type AdminPromoCode,
  type PromoCodePayload,
  type PromoCodeType,
} from "../../services/adminPromoCodeService";

import "./AdminPromoCodes.css";

type PromoFormState = {
  code: string;
  type: PromoCodeType;
  value: string;
  minOrderAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const getDefaultForm = (): PromoFormState => {
  const now = new Date();

  return {
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "0",
    usageLimit: "",
    startsAt: now.toISOString().slice(0, 16),
    expiresAt: "",
    isActive: true,
  };
};

function AdminPromoCodes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingPromo, setEditingPromo] = useState<AdminPromoCode | null>(null);

  const [form, setForm] = useState<PromoFormState>(getDefaultForm());

  // =========================================
  // LOAD
  // =========================================

  const loadPromoCodes = useCallback(async () => {
    try {
      const data = await getAdminPromoCodes();

      setError("");
      setPromoCodes(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to load promo codes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect starts an asynchronous request and updates state when it settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPromoCodes();
  }, [loadPromoCodes]);

  // =========================================
  // OPEN CREATE
  // =========================================

  const openCreate = () => {
    setEditingPromo(null);
    setForm(getDefaultForm());
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEdit = (promo: AdminPromoCode) => {
    setEditingPromo(promo);

    setForm({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      minOrderAmount: String(promo.minOrderAmount),
      usageLimit: promo.usageLimit === null ? "" : String(promo.usageLimit),
      startsAt: promo.startsAt
        ? new Date(promo.startsAt).toISOString().slice(0, 16)
        : "",
      expiresAt: promo.expiresAt
        ? new Date(promo.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: promo.isActive,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // =========================================
  // CLOSE
  // =========================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingPromo(null);
    setForm(getDefaultForm());
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: PromoCodePayload = {
        code: form.code.trim().toUpperCase(),

        type: form.type,

        value: Number(form.value),

        minOrderAmount: Number(form.minOrderAmount || 0),

        usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,

        startsAt: form.startsAt,

        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,

        isActive: form.isActive,
      };

      if (
        !payload.code ||
        !Number.isFinite(payload.value) ||
        payload.value <= 0
      ) {
        throw new Error("Enter a valid promo code and value.");
      }

      if (payload.type === "percentage" && payload.value > 100) {
        throw new Error("Percentage cannot exceed 100%.");
      }

      if (editingPromo) {
        const updated = await updateAdminPromoCode(editingPromo._id, payload);

        setPromoCodes((current) =>
          current.map((promo) =>
            promo._id === editingPromo._id ? updated : promo,
          ),
        );

        setSuccess("Promo code updated successfully.");
      } else {
        const created = await createAdminPromoCode(payload);

        setPromoCodes((current) => [created, ...current]);

        setSuccess("Promo code created successfully.");
      }

      setModalOpen(false);
      setForm(getDefaultForm());
      setEditingPromo(null);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to save promo code.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // TOGGLE
  // =========================================

  const handleToggle = async (promo: AdminPromoCode) => {
    try {
      setError("");
      setSuccess("");

      const updated = await toggleAdminPromoCode(promo._id);

      setPromoCodes((current) =>
        current.map((item) => (item._id === promo._id ? updated : item)),
      );

      setSuccess(
        updated.isActive ? "Promo code activated." : "Promo code disabled.",
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to update promo code.",
      );
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (promo: AdminPromoCode) => {
    const confirmed = window.confirm(`Delete promo code "${promo.code}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAdminPromoCode(promo._id);

      setPromoCodes((current) =>
        current.filter((item) => item._id !== promo._id),
      );

      setSuccess("Promo code deleted successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to delete promo code.",
      );
    }
  };

  // =========================================
  // HELPERS
  // =========================================

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No expiry";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountLabel = (promo: AdminPromoCode) => {
    if (promo.type === "percentage") {
      return `${promo.value}%`;
    }

    return `${promo.value.toFixed(2)} DT`;
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="admin-promo-page">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-promo-content">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-promo-main">
          {/* HEADER */}

          <section className="admin-promo-header">
            <div>
              <p>MARKETING</p>

              <h1>Promo Codes</h1>

              <span>Create and manage discount codes.</span>
            </div>

            <button
              type="button"
              className="admin-promo-create-button"
              onClick={openCreate}
            >
              <i className="bi bi-plus-lg" />

              <span>Create Promo Code</span>
            </button>
          </section>

          {/* MESSAGES */}

          {error && (
            <div className="admin-promo-message error">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="admin-promo-message success">
              <i className="bi bi-check-circle" />
              <span>{success}</span>
            </div>
          )}

          {/* TABLE */}

          <section className="admin-promo-card">
            <div className="admin-promo-card-header">
              <div>
                <span>PROMOTIONS</span>

                <h2>All Promo Codes</h2>
              </div>

              <span className="admin-promo-count">
                {promoCodes.length} codes
              </span>
            </div>

            {loading ? (
              <div className="admin-promo-state">
                <i className="bi bi-arrow-repeat" />
                <span>Loading promo codes...</span>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="admin-promo-state">
                <i className="bi bi-tag" />

                <strong>No promo codes yet</strong>

                <span>Create your first discount code.</span>
              </div>
            ) : (
              <div className="admin-promo-table-wrapper">
                <table className="admin-promo-table">
                  <thead>
                    <tr>
                      <th>Code</th>

                      <th>Discount</th>

                      <th>Minimum</th>

                      <th>Usage</th>

                      <th>Expiry</th>

                      <th>Status</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo._id}>
                        <td>
                          <strong className="promo-code-name">
                            {promo.code}
                          </strong>
                        </td>

                        <td>
                          <strong>{getDiscountLabel(promo)}</strong>
                        </td>

                        <td>
                          {promo.minOrderAmount > 0
                            ? `${promo.minOrderAmount.toFixed(2)} DT`
                            : "None"}
                        </td>

                        <td>
                          {promo.usedCount}

                          {" / "}

                          {promo.usageLimit === null ? "∞" : promo.usageLimit}
                        </td>

                        <td>{formatDate(promo.expiresAt)}</td>

                        <td>
                          <span
                            className={`promo-status ${
                              promo.isActive ? "active" : "inactive"
                            }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="promo-actions">
                            <button
                              type="button"
                              className="promo-action edit"
                              onClick={() => openEdit(promo)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil" />
                            </button>

                            <button
                              type="button"
                              className="promo-action toggle"
                              onClick={() => handleToggle(promo)}
                              title={promo.isActive ? "Disable" : "Activate"}
                            >
                              <i
                                className={`bi ${
                                  promo.isActive
                                    ? "bi-toggle-on"
                                    : "bi-toggle-off"
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              className="promo-action delete"
                              onClick={() => handleDelete(promo)}
                              title="Delete"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </div>
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

      {/* MODAL */}

      {modalOpen && (
        <div className="admin-promo-modal-backdrop">
          <div className="admin-promo-modal">
            <div className="admin-promo-modal-header">
              <div>
                <span>MARKETING</span>

                <h2>
                  {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-promo-modal-close"
                onClick={closeModal}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form className="admin-promo-form" onSubmit={handleSubmit}>
              <label>
                <span>Promo Code</span>

                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SUMMER20"
                  required
                />
              </label>

              <div className="admin-promo-form-grid">
                <label>
                  <span>Type</span>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as PromoCodeType,
                      }))
                    }
                  >
                    <option value="percentage">Percentage</option>

                    <option value="fixed">Fixed amount</option>
                  </select>
                </label>

                <label>
                  <span>Discount Value</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.value}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        value: event.target.value,
                      }))
                    }
                    placeholder={form.type === "percentage" ? "10" : "15"}
                    required
                  />
                </label>
              </div>

              <div className="admin-promo-form-grid">
                <label>
                  <span>Minimum Order</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        minOrderAmount: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>Usage Limit</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        usageLimit: event.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                  />
                </label>
              </div>

              <div className="admin-promo-form-grid">
                <label>
                  <span>Starts At</span>

                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startsAt: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  <span>Expires At</span>

                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        expiresAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="admin-promo-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />

                <span>Promo code is active</span>
              </label>

              <div className="admin-promo-form-actions">
                <button
                  type="button"
                  className="admin-promo-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-promo-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="bi bi-arrow-repeat" />

                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />

                      <span>
                        {editingPromo ? "Save Changes" : "Create Promo Code"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromoCodes;
