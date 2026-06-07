// ════════════════════════════════════════════════════════════════
//  PAGE 4: ADMIN DASHBOARD
//  Route: /admin (protected)
// ════════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";

import { useState, useEffect, useRef } from "react";

import Navbar from "../components/Navbar";

import EventCard from "../components/EventCard";

import API from "../services/api";

import getAuthHeaders
  from "../services/authHeader";

import FeedbackCard from "../components/FeedbackCard";

import AttendeeTable from "../components/AttendeeTable";

import {
  handleUnauthorized,
} from "../services/authHeader";

import {
  MdDashboard,
  MdFeedback,
} from "react-icons/md";

import {
  FaUsers,
  FaCheckCircle,
  FaUtensils,
  FaGift,
} from "react-icons/fa";

function AdminDashboard({ user, setUser }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  const totalEvents = events.length;

  const completedEvents =
  events.filter(event => event.is_completed).length;

  const activeEvents =
  totalEvents - completedEvents;

  const registeredCount =
  attendees.length;

const checkedInCount =
  attendees.filter(
    attendee => attendee.checked_in
  ).length;

const lunchCount =
  attendees.filter(
    attendee => attendee.lunch_served
  ).length;

const kitCount =
  attendees.filter(
    attendee => attendee.kit_distributed
  ).length;

  const checkedInPercentage =
  registeredCount > 0
    ? Math.round(
        (checkedInCount / registeredCount) * 100
      )
    : 0;

const lunchPercentage =
  registeredCount > 0
    ? Math.round(
        (lunchCount / registeredCount) * 100
      )
    : 0;

const kitPercentage =
  registeredCount > 0
    ? Math.round(
        (kitCount / registeredCount) * 100
      )
    : 0;

  const attendeesRef = useRef(null);
  const feedbackRef = useRef(null);

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
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
    setAttendees(data);

    setTimeout(() => {
      attendeesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  async function approveAttendee(id) {
    setLoadingAction(id + "-approve");
    setMessage("");
    try {
      const res = await fetch(API + "/attendees/approve/" + id, { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
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
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      setFeedbackData(data.feedback || []);
      setFeedbackStats(data.stats || null);
      setFeedbackEvent(event);

      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

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
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

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
        <h2 className="page-title">
          <MdDashboard />
          Organizer Dashboard
        </h2>
        <p>Welcome back, <strong>{user.name}</strong>! Manage your events below.</p>

        <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <h3>{totalEvents}</h3>
          <p>Total Events</p>
        </div>

        <div className="dashboard-stat-card">
          <h3>{activeEvents}</h3>
          <p>Active Events</p>
        </div>

        <div className="dashboard-stat-card">
          <h3>{completedEvents}</h3>
          <p>Completed Events</p>
        </div>

      </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any events yet.</p>
            <Link to="/create" className="btn btn-primary">Create Your First Event</Link>
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
          <div
            ref={attendeesRef}
            className="card attendees-panel"
          >
            <div className="attendees-header">

              <h3 className="card-title">
                Attendees — {selectedEvent.title}
              </h3>

              <span
                className={`event-status ${
                  selectedEvent.is_completed
                    ? "status-completed"
                    : "status-active"
                }`}
              >
                {selectedEvent.is_completed
                  ? "Completed"
                  : "Active"}
              </span>

            </div>
            <div className="event-metrics">

            <div className="metric-pill">
              <FaUsers />
              {registeredCount} Registered
            </div>

            <div className="metric-pill">
              <FaCheckCircle />
              {checkedInCount} Checked In
              <span className="metric-percent">
                ({checkedInPercentage}%)
              </span>
            </div>

            <div className="metric-pill">
              <FaUtensils />
              {lunchCount} Lunch Served
              <span className="metric-percent">
                ({lunchPercentage}%)
              </span>
            </div>

            <div className="metric-pill">
              <FaGift />
              {kitCount} Kits Distributed
              <span className="metric-percent">
                ({kitPercentage}%)
              </span>
            </div>

          </div>
            {message && <p className="msg success">{message}</p>}
            {attendees.length === 0 ? (
              <div className="empty-state-small">
                <p>
                  No attendees have registered for this event yet.
                </p>

                <p className="empty-hint">
                  Share your registration link to start receiving registrations.
                </p>
              </div>
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
          <div
            ref={feedbackRef}
            className="card attendees-panel"
          >
            <h3 className="card-title">
              <MdFeedback />
              Feedback — {feedbackEvent.title}
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
              <div className="empty-state-small">
                <p>
                  No feedback has been submitted for this event yet.
                </p>

                <p className="empty-hint">
                  Feedback becomes available after attendees complete the event survey.
                </p>
              </div>
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