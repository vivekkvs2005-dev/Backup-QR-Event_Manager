// ════════════════════════════════════════════════════════════════
//  PAGE 3: PUBLIC ATTENDEE REGISTRATION
//  Route: /register/:eventId
// ════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import API from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

import {
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaEnvelope,
  FaTimesCircle,
} from "react-icons/fa";

function RegisterPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", upi_utr: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  // Fetch event details on load
  useEffect(() => {
    fetch(API + "/events/" + eventId)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setPageError(data.error);
        else setEvent(data);
      })
      .catch(() => setPageError("Cannot connect to server."));
  }, [eventId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(API + "/attendees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event_id: eventId }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Registration failed.");
      else setMessage(data.message);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  if (pageError)
    return (
      <div className="center-msg">
        <FaTimesCircle />
        {" "}
        {pageError}
      </div>
    );
  if (!event)
  return (
    <LoadingSpinner
      text="Loading event details..."
    />
  );

  // Build UPI payment QR URL using free public API
  const upiString = `upi://pay?pa=${event.organizer_upi_id}&pn=EventPayment&am=${event.price}&cu=INR&tn=EventTicket`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="public-page">
      <div className="card register-card">
        <h2 className="card-title">
          <FaTicketAlt />
          {event.title}
        </h2>
        <div className="event-meta">
          <span>
            <FaCalendarAlt />
            {new Date(event.event_date).toLocaleString()}
          </span>
          <span>
            <FaMapMarkerAlt />
            {event.venue}
          </span>
          <span>
            <FaRupeeSign />
            {event.price}
          </span>
          <span>
            <FaEnvelope />
            {event.organizer_email}
          </span>
        </div>
        <p className="event-desc">{event.description}</p>

        {/* UPI Payment Section */}
        {event.price > 0 && (
          <div className="payment-section">
            <h3>Step 1: Pay via UPI</h3>
            <p>Scan this QR code or pay to <strong>{event.organizer_upi_id}</strong></p>
            <img src={qrUrl} alt="UPI Payment QR Code" className="upi-qr" />
            <p className="hint">After payment, note your 12-digit UTR number and fill the form below.</p>
          </div>
        )}

        {/* Registration Form */}
        <h3>Step 2: Fill Registration Form</h3>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="john@email.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" type="tel" placeholder="9876543210" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>UPI UTR Number (12 digits)</label>
              <input name="upi_utr" type="text" placeholder="123456789012" value={form.upi_utr} onChange={handleChange} required maxLength={12} />
            </div>
          </div>

          {error && <p className="msg error">{error}</p>}
          {message && <p className="msg success">{message} The organizer will verify and email your ticket.</p>}

          {!message && (
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;