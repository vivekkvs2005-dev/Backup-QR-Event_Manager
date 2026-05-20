// ════════════════════════════════════════════════════════════════
//  PAGE 2: CREATE EVENT
//  Route: / (protected)
// ════════════════════════════════════════════════════════════════

import { useState } from "react";

import Navbar from "../components/Navbar";

import API from "../services/api";

import getAuthHeaders
  from "../services/authHeader";

function CreateEventPage({ user, setUser }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    venue: "",
    price: "",
    organizer_upi_id: "",
    organizer_email: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setCreatedLink("");
    setLoading(true);

    try {
      const res = await fetch(API + "/events", {
        method: "POST",
       headers: {
        "Content-Type": "application/json",

        ...getAuthHeaders(),
      },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create event.");
      } else {
        setMessage("Event created successfully!");
        const link = `${window.location.origin}/register/${data.id}`;
        setCreatedLink(link);
        setForm({ title: "", description: "", event_date: "", venue: "", price: "", organizer_upi_id: "", organizer_email: "" });
      }
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <div className="page-container">
        <div className="card">
          <h2 className="card-title">📅 Create New Event</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Event Title</label>
              <input name="title" type="text" placeholder="Annual Tech Fest 2025" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="About the event..." value={form.description} onChange={handleChange} rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time</label>
                <input name="event_date" type="datetime-local" value={form.event_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input name="venue" type="text" placeholder="Main Auditorium" value={form.venue} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ticket Price (₹)</label>
                <input name="price" type="number" placeholder="500" value={form.price} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label>Your UPI ID</label>
                <input name="organizer_upi_id" type="text" placeholder="yourname@upi" value={form.organizer_upi_id} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Support Email (shown to attendees)</label>
              <input name="organizer_email" type="email" placeholder="support@email.com" value={form.organizer_email} onChange={handleChange} required />
            </div>

            {error && <p className="msg error">{error}</p>}
            {message && <p className="msg success">{message}</p>}
            {createdLink && (
              <div className="link-box">
                <strong>📎 Share this registration link:</strong>
                <a href={createdLink} target="_blank" rel="noreferrer">{createdLink}</a>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;