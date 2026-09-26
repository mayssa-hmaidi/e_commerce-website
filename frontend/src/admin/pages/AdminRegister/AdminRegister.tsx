import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./AdminRegister.css";

const API_URL = "http://localhost:5000/api/admin";

function AdminRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Admin account created successfully.");

      setTimeout(() => {
        navigate("/admin/login");
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-page">
      <div className="admin-register-card">
        <p className="admin-register-label">ADMIN PANEL</p>

        <h1>Create Admin</h1>

        <p className="admin-register-description">
          Create the administrator account for your store.
        </p>

        <form onSubmit={handleRegister}>
          <div className="admin-form-group">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Admin"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          {error && <p className="admin-register-error">{error}</p>}

          {success && <p className="admin-register-success">{success}</p>}

          <button
            type="submit"
            className="admin-register-button"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE ADMIN"}
          </button>
        </form>

        <p className="admin-register-login">
          Already have an account? <Link to="/admin/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegister;
