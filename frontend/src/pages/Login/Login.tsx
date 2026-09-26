import { useState, type SubmitEvent } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  const { login, isLoading } = useCustomerAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // REDIRECT DESTINATION
  // =========================================

  const from =
    (
      location.state as {
        from?: string;
      } | null
    )?.from || "/account";

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");

      return;
    }

    try {
      setIsSubmitting(true);

      setError("");

      await login({
        email: email.trim().toLowerCase(),

        password,
      });

      navigate(from, {
        replace: true,
      });
    } catch (submitError) {
      console.error("Login error:", submitError);

      setError(
        submitError instanceof Error ? submitError.message : "Failed to login.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // SESSION LOADING
  // =========================================

  if (isLoading) {
    return null;
  }

  return (
    <div className="login-page">
      {/* =================================
          LEFT
      ================================= */}

      <section className="login-visual">
        <div className="login-visual-content">
          <span>URBAN THREADS</span>

          <h1>
            WELCOME
            <br />
            BACK.
          </h1>

          <p>Sign in to access your account, orders and favorites.</p>
        </div>
      </section>

      {/* =================================
          RIGHT
      ================================= */}

      <main className="login-content">
        <div className="login-card">
          {/* BRAND */}

          <Link to="/" className="login-brand">
            YOUR BRAND
          </Link>

          {/* HEADING */}

          <div className="login-heading">
            <p>ACCOUNT</p>

            <h1>Sign in</h1>

            <span>Welcome back. Enter your details below.</span>
          </div>

          {/* ERROR */}

          {error && <div className="login-error">{error}</div>}

          {/* FORM */}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="login-field">
              <label htmlFor="login-email">Email</label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}

            <div className="login-field">
              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Link to="/forgot-password" className="login-forgot">
              Forgot password?
            </Link>

            {/* SUBMIT */}

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {/* REGISTER */}

          <div className="login-register">
            <span>Don't have an account?</span>

            <Link to="/register">Create one</Link>
          </div>

          {/* BACK */}

          <Link to="/" className="login-back">
            ← BACK TO SHOP
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Login;
