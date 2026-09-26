import { useState, type SubmitEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const { register, isLoading } = useCustomerAuth();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");

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

      setError("");

      await register({
        name: name.trim(),

        email: email.trim().toLowerCase(),

        phone: phone.trim(),

        password,
      });

      navigate("/account", {
        replace: true,
      });
    } catch (submitError) {
      console.error("Register error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create account.",
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
    <div className="register-page">
      {/* =================================
          LEFT
      ================================= */}

      <section className="register-visual">
        <div className="register-visual-content">
          <span>URBAN THREADS</span>

          <h1>
            JOIN
            <br />
            US.
          </h1>

          <p>
            Create your account and keep your orders and favorites in one place.
          </p>
        </div>
      </section>

      {/* =================================
          RIGHT
      ================================= */}

      <main className="register-content">
        <div className="register-card">
          {/* BRAND */}

          <Link to="/" className="register-brand">
            YOUR BRAND
          </Link>

          {/* HEADING */}

          <div className="register-heading">
            <p>ACCOUNT</p>

            <h1>Create account</h1>

            <span>Enter your details to get started.</span>
          </div>

          {/* ERROR */}

          {error && <div className="register-error">{error}</div>}

          {/* FORM */}

          <form className="register-form" onSubmit={handleSubmit}>
            {/* NAME */}

            <div className="register-field">
              <label htmlFor="register-name">Full Name</label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            {/* EMAIL */}

            <div className="register-field">
              <label htmlFor="register-email">Email</label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* PHONE */}

            <div className="register-field">
              <label htmlFor="register-phone">Phone</label>

              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+216 ..."
                autoComplete="tel"
              />
            </div>

            {/* PASSWORD */}

            <div className="register-field">
              <label htmlFor="register-password">Password</label>

              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="register-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* LOGIN */}

          <div className="register-login">
            <span>Already have an account?</span>

            <Link to="/login">Sign in</Link>
          </div>

          {/* BACK */}

          <Link to="/" className="register-back">
            ← BACK TO SHOP
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Register;
