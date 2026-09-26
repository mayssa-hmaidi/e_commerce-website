import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginAdmin } from "../../services/adminService";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginAdmin({
        email: email.trim(),
        password,
      });

      localStorage.setItem("adminToken", data.token);

      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* =================================
          LEFT BRAND PANEL
      ================================= */}

      <section className="admin-login-brand">
        <div className="admin-login-brand-overlay" />

        <div className="admin-login-brand-content">
          <div className="admin-login-brand-footer">
            <div className="admin-login-shirt-icon">
              <i className="bi bi-tshirt"></i>
            </div>

            <p>
              BUILT FOR THE CULTURE.
              <br />
              MADE TO INSPIRE.
            </p>
          </div>
        </div>
      </section>

      {/* =================================
          RIGHT LOGIN AREA
      ================================= */}

      <section className="admin-login-main">
        <div className="admin-login-card">
          {/* ICON */}

          <div className="admin-login-icon">
            <i className="bi bi-lock"></i>
          </div>

          {/* HEADER */}

          <div className="admin-login-card-header">
            <p className="admin-login-label">ADMIN ACCESS</p>

            <h2>ADMIN LOGIN</h2>

            <p>Sign in to access your dashboard</p>
          </div>

          {/* FORM */}

          <form className="admin-login-form" onSubmit={handleLogin}>
            {/* EMAIL */}

            <div className="admin-login-field">
              <label htmlFor="email">Email</label>

              <div className="admin-login-input-wrapper">
                <i className="bi bi-envelope"></i>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@urbanthreads.tn"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="admin-login-field">
              <label htmlFor="password">Password</label>

              <div className="admin-login-input-wrapper">
                <i className="bi bi-lock"></i>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                  ></i>
                </button>
              </div>
            </div>

            {/* OPTIONS */}

            <div className="admin-login-options">
              <label className="admin-remember">
                <input type="checkbox" defaultChecked={false} />

                <span>Remember me</span>
              </label>

              <Link to="/admin/forgot-password" className="admin-forgot">
                Forgot password?
              </Link>
            </div>

            {/* ERROR */}

            {error && <p className="admin-login-error">{error}</p>}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="admin-login-divider">
            <span></span>
            <p>OR</p>
            <span></span>
          </div>

          {/* BACK */}

          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/")}
          >
            <span>Back to website</span>

            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
