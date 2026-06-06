import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTicketAlt,
  FaRegUserCircle,
  FaCalendarPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setUser(null);
    navigate("/auth");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaTicketAlt />
        <span>EventManager</span>
      </div>

      <div className="navbar-links">
        <Link to="/">
          <FaCalendarPlus />
          Create Event
        </Link>
        <Link to="/admin">
          <MdDashboard />
          Dashboard
        </Link>
        <span className="navbar-user">
          <FaRegUserCircle />
          {user.name}
        </span>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
        >
          <FiLogOut />
          Logout
        </button>
      </div>

      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <FaCalendarPlus />
          Create Event
        </Link>
        <Link to="/admin" onClick={() => setMenuOpen(false)}>
          <MdDashboard />
          Dashboard
        </Link>
        <span className="navbar-mobile-user">
          <FaRegUserCircle />
          {user.name}
        </span>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;