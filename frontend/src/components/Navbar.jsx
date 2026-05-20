import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setUser(null);
    navigate("/auth");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">🎟️ EventManager</div>

      <div className="navbar-links">
        <Link to="/">Create Event</Link>
        <Link to="/admin">Dashboard</Link>
        <span className="navbar-user">👤 {user.name}</span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Create Event</Link>
        <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <span className="navbar-mobile-user">👤 {user.name}</span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;