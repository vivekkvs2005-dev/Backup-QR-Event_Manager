// ════════════════════════════════════════════════════════════════
//  PAGE 4: ADMIN DASHBOARD
//  Route: /admin (protected)
// ════════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";

import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";

import EventCard from "../components/EventCard";

import API from "../services/api";

import getAuthHeaders
  from "../services/authHeader";

import FeedbackCard from "../components/FeedbackCard";

import AttendeeTable from "../components/AttendeeTable";

function AdminDashboard({ user, setUser }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  // Load organizer's events on mount
  useEffect(() => {

    fetch(
      API + "/events/organizer/" + user.id,

      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    )
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});

  }, [user.id]);

  async function loadAttendees(event) {
    setSelectedEvent(event);
    setMessage("");
    const res = await fetch(API + "/attendees/event/" + event.id);
    const data = await res.json();
    setAttendees(data);
  }

  async function approveAttendee(id) {
    setLoadingAction(id + "-approve");
    setMessage("");
    try {
      const res = await fetch(API + "/attendees/approve/" + id, { method: "POST" });
      const data = await res.json();
      setMessage(data.message || data.error);
      loadAttendees(selectedEvent); // Refresh list
    } catch {
      setMessage("Server error.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function rejectAttendee(id) {
    setLoadingAction(id + "-reject");
    setMessage("");
    try {
      const res = await fetch(API + "/attendees/reject/" + id, { method: "POST" });
      const data = await res.json();
      setMessage(data.message || data.error);
      loadAttendees(selectedEvent);
    } catch {
      setMessage("Server error.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function loadFeedback(event) {
    setMessage("");

    try {
      const res = await fetch(
        API + "/feedback/event/" + event.id
      );

      const data = await res.json();

      setFeedbackData(data.feedback || []);
      setFeedbackStats(data.stats || null);
      setFeedbackEvent(event);

    } catch {
      setMessage("Failed to load feedback.");
    }
  }

  async function completeEvent(eventId) {
    try {
      const res = await fetch(
        API + "/events/complete/" + eventId,

        {
          method: "PATCH",

          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      const data = await res.json();

      setMessage(data.message || data.error);

      // Refresh events
      const updated = await fetch(
        API + "/events/organizer/" + user.id,

        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      const updatedEvents = await updated.json();

      setEvents(updatedEvents);

    } catch {
      setMessage("Server error.");
    }
  }

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <div className="page-container">
        <h2 className="page-title">📋 Organizer Dashboard</h2>
        <p>Welcome back, <strong>{user.name}</strong>! Manage your events below.</p>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any events yet.</p>
            <Link to="/" className="btn btn-primary">Create Your First Event</Link>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((ev) => (

            <EventCard
                key={ev.id}
                event={ev}
                selectedEvent={selectedEvent}
                loadAttendees={loadAttendees}
                completeEvent={completeEvent}
                loadFeedback={loadFeedback}
            />

            ))}
          </div>
        )}

        {/* Attendees Panel */}
        {selectedEvent && (
          <div className="card attendees-panel">
            <h3 className="card-title">Attendees — {selectedEvent.title}</h3>
            {message && <p className="msg success">{message}</p>}
            {attendees.length === 0 ? (
              <p>No registrations yet for this event.</p>
            ) : (
              <AttendeeTable
            attendees={attendees}
            loadingAction={loadingAction}
            approveAttendee={approveAttendee}
            rejectAttendee={rejectAttendee}
            />
            )}
          </div>
        )}
        {/* Feedback Panel */}
        {feedbackEvent && (
          <div className="card attendees-panel">
            <h3 className="card-title">
              ⭐ Feedback — {feedbackEvent.title}
            </h3>

            {feedbackStats && (
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Average Rating:</strong>{" "}
                  {Number(feedbackStats.average_rating).toFixed(1)} / 5
                </p>

                <p>
                  <strong>Total Reviews:</strong>{" "}
                  {feedbackStats.total_feedback}
                </p>
              </div>
            )}

            {feedbackData.length === 0 ? (
              <p>No feedback submitted yet.</p>
            ) : (
              <div className="feedback-list">
                {feedbackData.map((item, index) => (
                <FeedbackCard
                    key={index}
                    item={item}
                />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;