// ════════════════════════════════════════════════════════════════
//  NAVBAR (shared across protected pages)
// ════════════════════════════════════════════════════════════════

import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

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
    </nav>
  );
}

export default Navbar;