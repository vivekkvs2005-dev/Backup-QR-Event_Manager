// ════════════════════════════════════════════════════════════════
//  PAGE 1: AUTH — Login / Register toggle
//  Route: /auth
// ════════════════════════════════════════════════════════════════

import { useState } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import MessageAlert from "../components/MessageAlert";

function AuthPage({ user, setUser }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go home
  if (user) return <Navigate to="/" />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    try {
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        if (isLogin) {
          setUser(data); // Save organizer globally
          navigate("/");
        } else {
          setMessage("Registered! Please log in.");
          setIsLogin(true);
        }
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🎟️ EventManager</h1>
        <p className="auth-subtitle">QR-Based Event Management System</p>

        <div className="tab-toggle">
          <button
            className={`tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(true); setError(""); setMessage(""); }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(false); setError(""); setMessage(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="organizer@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          </div>

          <MessageAlert
            type="error"
            message={error}
            />
          <MessageAlert
            type="success"
            message={message}
            />

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;