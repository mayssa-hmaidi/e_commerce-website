import { useEffect, useState, type SubmitEvent } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  getPublicContactSettings,
  sendContactMessage,
} from "../../services/contactService";

import "./Contact.css";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactSettings = {
  supportEmail: string;
  whatsapp: string;
  phone: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    supportEmail: "",
    whatsapp: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContactSettings = async () => {
      try {
        const data = await getPublicContactSettings();

        setContactSettings({
          supportEmail: data.supportEmail || "",
          whatsapp: data.whatsapp || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    void loadContactSettings();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSuccess(
        "Your message has been sent successfully. We will get back to you soon.",
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send your message.",
      );
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = contactSettings.whatsapp.replace(/[^0-9]/g, "");

  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";

  return (
    <div className="contact-page-container">
      <Navbar />
      <main className="contact-page">
        <section className="contact-header">
          <h1>Contact Us</h1>

          <p>
            Have a question about an order, delivery or a product? Send us a
            message and we'll get back to you as soon as possible.
          </p>
        </section>

        <section className="contact-content">
          {/* LEFT — FORM */}

          <div className="contact-form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <label>
                  <span>Full Name</span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label>
                  <span>Email</span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <div className="contact-form-row">
                <label>
                  <span>Phone (optional)</span>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01xxxxxxxxx"
                  />
                </label>

                <label>
                  <span>Subject (optional)</span>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Order / shipping / product"
                  />
                </label>
              </div>

              <label className="contact-message-field">
                <span>Message</span>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  rows={6}
                  required
                />
              </label>

              {success && (
                <div className="contact-alert contact-alert-success">
                  <i className="bi bi-check-circle" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="contact-alert contact-alert-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="contact-submit-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* RIGHT — CONTACT DETAILS */}

          <aside className="contact-sidebar">
            <div className="contact-details-card">
              <h2>Contact Details</h2>

              <div className="contact-detail-item">
                <i className="bi bi-telephone-fill" />

                {settingsLoading ? (
                  <span>Loading...</span>
                ) : contactSettings.phone ? (
                  <a
                    href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, "")}`}
                  >
                    {contactSettings.phone}
                  </a>
                ) : (
                  <span>Phone support is not configured.</span>
                )}
              </div>

              <div className="contact-detail-item">
                <i className="bi bi-envelope-fill" />

                {settingsLoading ? (
                  <span>Loading...</span>
                ) : contactSettings.supportEmail ? (
                  <a href={`mailto:${contactSettings.supportEmail}`}>
                    {contactSettings.supportEmail}
                  </a>
                ) : (
                  <span>Use the contact form to reach us.</span>
                )}
              </div>
            </div>

            <div className="contact-direct-card">
              <h2>Prefer to reach us directly?</h2>

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-whatsapp-button"
                >
                  <i className="bi bi-whatsapp" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {contactSettings.supportEmail && (
                <a
                  href={`mailto:${contactSettings.supportEmail}`}
                  className="contact-email-button"
                >
                  <i className="bi bi-envelope-fill" />
                  <span>Email us directly</span>
                </a>
              )}
            </div>

            <div className="contact-help-card">
              <h2>Need help with an order?</h2>

              <p>
                For questions about an existing order, mention your order number
                in the message so we can help you faster.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
