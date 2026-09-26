import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeToNewsletter } from "../../services/newsletterService";
import { getPublicContactSettings } from "../../services/contactService";
import "./Footer.css";

function Footer() {
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
  });
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    getPublicContactSettings()
      .then((settings) => {
        if (active) {
          setSocialLinks(settings.socialLinks);
        }
      })
      .catch(() => {
        if (active) {
          setSocialLinks({ instagram: "", facebook: "", tiktok: "" });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const configuredSocialLinks = [
    { label: "Instagram", icon: "bi-instagram", url: socialLinks.instagram },
    { label: "Facebook", icon: "bi-facebook", url: socialLinks.facebook },
    { label: "TikTok", icon: "bi-tiktok", url: socialLinks.tiktok },
  ].filter(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  });

  const handleSubscribe = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await subscribeToNewsletter(email);
      setEmail("");
      setFeedback({
        type: "success",
        message: response.alreadySubscribed
          ? "This email is already on the list."
          : "Thanks, you’re on the list.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to subscribe right now. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            YOUR BRAND
          </Link>

          <p className="footer-tagline">Wear your identity.</p>

          {configuredSocialLinks.length > 0 && (
            <div className="footer-socials">
              {configuredSocialLinks.map(({ label, icon, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-social-link"
                >
                  <i className={`bi ${icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="footer-column">
          <h4>SHOP</h4>

          <Link to="/tshirts">T-Shirts</Link>
          <Link to="/tshirts">New Drop</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-column">
          <h4>COMPANY</h4>

          <Link to="/about">À propos</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h4>HELP</h4>

          <Link to="/shipping">Shipping</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        <div className="footer-newsletter">
          <h4>STAY IN THE LOOP</h4>

          <p>Get updates on new drops and exclusive offers.</p>

          <form
            className="footer-newsletter-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubscribe();
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              aria-describedby="footer-newsletter-feedback"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <button
              type="submit"
              aria-label={submitting ? "Subscribing" : "Subscribe"}
              disabled={submitting}
            >
              <i
                className={`bi ${submitting ? "bi-arrow-repeat" : "bi-arrow-right"}`}
              />
            </button>
          </form>

          {feedback && (
            <p
              id="footer-newsletter-feedback"
              className={`footer-newsletter-feedback ${feedback.type}`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Your Brand. All rights reserved.</p>

        <div className="footer-legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
