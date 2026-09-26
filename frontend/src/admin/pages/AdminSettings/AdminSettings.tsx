import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  getShopSettings,
  updateShopSettings,
  type ShopSettings,
} from "../../services/adminSettingsService";

import "./AdminSettings.css";

const DEFAULT_SETTINGS: ShopSettings = {
  storeName: "Urban Threads",
  currency: "DT",
  shippingCost: 5,
  lowStockThreshold: 5,
  supportEmail: "",
  phone: "",
  whatsapp: "",
  address: "",
  supportHours: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
};

function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================
  // LOAD SETTINGS
  // =========================================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getShopSettings();

        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
        });
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error ? error.message : "Unable to load settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleChange = (field: keyof ShopSettings, value: string | number) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSocialLinkChange = (
    platform: keyof ShopSettings["socialLinks"],
    value: string,
  ) => {
    setSettings((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [platform]: value,
      },
    }));

    setSuccess("");
    setError("");
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await updateShopSettings(settings);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });

      setSuccess("Settings saved successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-settings-page">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="admin-settings-content">
          <div className="admin-settings-state">
            <i className="bi bi-arrow-repeat" />
            Loading settings...
          </div>
        </main>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="admin-settings-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-settings-content">
        <div className="admin-settings-main">
          {/* HEADER */}

          <div className="settings-header">
            <div>
              <p>CONFIGURATION</p>

              <h1>Settings</h1>

              <span>
                Manage your store configuration and contact information.
              </span>
            </div>
          </div>

          {/* MESSAGES */}

          {error && (
            <div className="settings-message error">
              <i className="bi bi-exclamation-circle" />

              {error}
            </div>
          )}

          {success && (
            <div className="settings-message success">
              <i className="bi bi-check-circle" />

              {success}
            </div>
          )}

          <form className="settings-form" onSubmit={handleSubmit}>
            {/* =================================
                STORE INFORMATION
            ================================= */}

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-section-icon purple">
                  <i className="bi bi-shop" />
                </div>

                <div>
                  <h2>Store Information</h2>

                  <p>Basic information about your store.</p>
                </div>
              </div>

              <div className="settings-fields">
                <label>
                  <span>Store Name</span>

                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(event) =>
                      handleChange("storeName", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Currency</span>

                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(event) =>
                      handleChange("currency", event.target.value)
                    }
                  />
                </label>

                <label className="settings-full">
                  <span>Support Email</span>

                  <input
                    type="email"
                    value={settings.supportEmail}
                    placeholder="support@example.com"
                    onChange={(event) =>
                      handleChange("supportEmail", event.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-section-icon blue">
                  <i className="bi bi-share" />
                </div>

                <div>
                  <h2>Social Media</h2>

                  <p>Optional links shown in the customer footer.</p>
                </div>
              </div>

              <div className="settings-fields">
                <label>
                  <span>Instagram</span>

                  <input
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={(event) =>
                      handleSocialLinkChange("instagram", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Facebook</span>

                  <input
                    type="url"
                    value={settings.socialLinks.facebook}
                    onChange={(event) =>
                      handleSocialLinkChange("facebook", event.target.value)
                    }
                  />
                </label>

                <label className="settings-full">
                  <span>TikTok</span>

                  <input
                    type="url"
                    value={settings.socialLinks.tiktok}
                    onChange={(event) =>
                      handleSocialLinkChange("tiktok", event.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            {/* =================================
                CONTACT INFORMATION
            ================================= */}

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-section-icon green">
                  <i className="bi bi-headset" />
                </div>

                <div>
                  <h2>Contact Information</h2>

                  <p>Information displayed on the customer Contact page.</p>
                </div>
              </div>

              <div className="settings-fields">
                <label>
                  <span>Phone</span>

                  <input
                    type="tel"
                    value={settings.phone}
                    placeholder="20 000 000"
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>WhatsApp</span>

                  <input
                    type="tel"
                    value={settings.whatsapp}
                    placeholder="21620000000"
                    onChange={(event) =>
                      handleChange("whatsapp", event.target.value)
                    }
                  />
                </label>

                <label className="settings-full">
                  <span>Address</span>

                  <input
                    type="text"
                    value={settings.address}
                    placeholder="Tunis, Tunisia"
                    onChange={(event) =>
                      handleChange("address", event.target.value)
                    }
                  />
                </label>

                <label className="settings-full">
                  <span>Support Hours</span>

                  <input
                    type="text"
                    value={settings.supportHours}
                    placeholder="Monday - Saturday, 09:00 - 18:00"
                    onChange={(event) =>
                      handleChange("supportHours", event.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            {/* =================================
                ORDERS & DELIVERY
            ================================= */}

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-section-icon blue">
                  <i className="bi bi-truck" />
                </div>

                <div>
                  <h2>Orders & Delivery</h2>

                  <p>Configure delivery-related values.</p>
                </div>
              </div>

              <div className="settings-fields">
                <label>
                  <span>Shipping Cost</span>

                  <div className="settings-input-with-suffix">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings.shippingCost}
                      onChange={(event) =>
                        handleChange("shippingCost", Number(event.target.value))
                      }
                    />

                    <span>{settings.currency}</span>
                  </div>
                </label>

                <label>
                  <span>Low Stock Threshold</span>

                  <div className="settings-input-with-suffix">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.lowStockThreshold}
                      onChange={(event) =>
                        handleChange(
                          "lowStockThreshold",
                          Number(event.target.value),
                        )
                      }
                    />

                    <span>units</span>
                  </div>
                </label>
              </div>
            </section>

            {/* =================================
                SAVE
            ================================= */}

            <div className="settings-actions">
              <button
                type="submit"
                disabled={saving}
                className="settings-save-button"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-repeat" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminSettings;
