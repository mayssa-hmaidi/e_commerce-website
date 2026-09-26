import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  requestCustomerPasswordReset,
  resetCustomerPassword,
} from "../../services/customerAuthService";
import {
  requestAdminPasswordReset,
  resetAdminPassword,
} from "../../admin/services/adminService";

import "./PasswordRecovery.css";

type AccountType = "customer" | "admin";
type RecoveryMode = "forgot" | "reset";

type PasswordRecoveryProps = {
  accountType: AccountType;
  mode: RecoveryMode;
};

const GENERIC_REQUEST_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

function PasswordRecovery({ accountType, mode }: PasswordRecoveryProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const loginPath = accountType === "admin" ? "/admin/login" : "/login";
  const isAdmin = accountType === "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (mode !== "reset" || !resetComplete) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(loginPath, { replace: true });
    }, 1600);

    return () => window.clearTimeout(redirectTimer);
  }, [loginPath, mode, navigate, resetComplete]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Enter your email address.");
        return;
      }

      try {
        setIsSubmitting(true);
        if (isAdmin) {
          await requestAdminPasswordReset(email.trim().toLowerCase());
        } else {
          await requestCustomerPasswordReset(email.trim().toLowerCase());
        }
        setSuccess(GENERIC_REQUEST_MESSAGE);
      } catch {
        setSuccess(GENERIC_REQUEST_MESSAGE);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!token) {
      setError("This reset link is invalid or expired. Request a new link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = isAdmin
        ? await resetAdminPassword(token, password)
        : await resetCustomerPassword(token, password);
      setSuccess(response.message);
      setResetComplete(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset your password. Request a new reset link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "forgot" ? "Forgot password" : "Reset password";
  const description =
    mode === "forgot"
      ? "Enter the email address associated with your account."
      : "Choose a new password for your account.";

  if (isAdmin) {
    return (
      <div className="admin-login-page password-recovery-admin">
        <section className="admin-login-brand">
          <div className="admin-login-brand-overlay" />
          <div className="admin-login-brand-content">
            <div className="admin-login-brand-footer">
              <div className="admin-login-shirt-icon">
                <i className="bi bi-tshirt" />
              </div>
              <p>
                BUILT FOR THE CULTURE.
                <br />
                MADE TO INSPIRE.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-login-main">
          <div className="admin-login-card">
            <div className="admin-login-icon">
              <i className="bi bi-shield-lock" />
            </div>
            <div className="admin-login-card-header">
              <p className="admin-login-label">ADMIN ACCESS</p>
              <h2>{title.toUpperCase()}</h2>
              <p>{description}</p>
            </div>

            {error && (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="password-recovery-success" role="status">
                {success}
              </p>
            )}

            {!resetComplete && (
              <form className="admin-login-form" onSubmit={handleSubmit}>
                {mode === "forgot" ? (
                  <div className="admin-login-field">
                    <label htmlFor="admin-reset-email">Email</label>
                    <div className="admin-login-input-wrapper">
                      <i className="bi bi-envelope" />
                      <input
                        id="admin-reset-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="admin-login-field">
                      <label htmlFor="admin-new-password">New Password</label>
                      <div className="admin-login-input-wrapper">
                        <i className="bi bi-lock" />
                        <input
                          id="admin-new-password"
                          type="password"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-login-field">
                      <label htmlFor="admin-confirm-password">
                        Confirm Password
                      </label>
                      <div className="admin-login-input-wrapper">
                        <i className="bi bi-lock" />
                        <input
                          id="admin-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  className="admin-login-button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "PLEASE WAIT..."
                    : mode === "forgot"
                      ? "SEND RESET LINK"
                      : "RESET PASSWORD"}
                </button>
              </form>
            )}

            <Link
              to={loginPath}
              className="admin-back-button password-recovery-back"
            >
              <span>Back to admin login</span>
              <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="login-page password-recovery-customer">
      <section className="login-visual">
        <div className="login-visual-content">
          <span>URBAN THREADS</span>
          <h1>
            ACCOUNT
            <br />
            ACCESS.
          </h1>
          <p>Get back to your orders and favorites.</p>
        </div>
      </section>

      <main className="login-content">
        <div className="login-card">
          <Link to="/" className="login-brand">
            YOUR BRAND
          </Link>
          <div className="login-heading">
            <p>ACCOUNT</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="password-recovery-success" role="status">
              {success}
            </div>
          )}

          {!resetComplete && (
            <form className="login-form" onSubmit={handleSubmit}>
              {mode === "forgot" ? (
                <div className="login-field">
                  <label htmlFor="customer-reset-email">Email</label>
                  <input
                    id="customer-reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="login-field">
                    <label htmlFor="customer-new-password">New Password</label>
                    <input
                      id="customer-new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="login-field">
                    <label htmlFor="customer-confirm-password">
                      Confirm Password
                    </label>
                    <input
                      id="customer-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "PLEASE WAIT..."
                  : mode === "forgot"
                    ? "SEND RESET LINK"
                    : "RESET PASSWORD"}
              </button>
            </form>
          )}

          <Link to={loginPath} className="login-back">
            ← BACK TO SIGN IN
          </Link>
        </div>
      </main>
    </div>
  );
}

export default PasswordRecovery;
