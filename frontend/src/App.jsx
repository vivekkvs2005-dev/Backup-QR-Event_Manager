// frontend/src/App.jsx
// QR-Based Event Management System - Frontend
// Install: npm install react-router-dom

// External libraries
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

// Third-party packages
import { BrowserMultiFormatReader } from "@zxing/browser";

// Internal services
import API from "./services/api";

// Internal components
import Navbar from "./components/Navbar";

// Internal pages
import AuthPage from "./pages/AuthPage";
import CreateEventPage from "./pages/CreateEventPage";



// ════════════════════════════════════════════════════════════════
//  GLOBAL APP with Router + State
// ════════════════════════════════════════════════════════════════

export default function App() {
  // 'user' holds the logged-in organizer globally (null = not logged in)
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Auth page: Login / Register toggle */}
        <Route path="/auth" element={<AuthPage user={user} setUser={setUser} />} />

        {/* Event creation form — protected */}
        <Route
          path="/"
          element={user ? <CreateEventPage user={user} setUser={setUser} /> : <Navigate to="/auth" />}
        />

        {/* Public attendee registration page */}
        <Route path="/register/:eventId" element={<RegisterPage />} />

        {/* Organizer dashboard — protected */}
        <Route
          path="/admin"
          element={user ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/auth" />}
        />

        {/* Gatekeeper QR scan page — public */}
        <Route path="/verify/:token" element={<VerifyPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/feedback/:token" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}





// ════════════════════════════════════════════════════════════════
//  PAGE 3: PUBLIC ATTENDEE REGISTRATION
//  Route: /register/:eventId
// ════════════════════════════════════════════════════════════════

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

  if (pageError) return <div className="center-msg">❌ {pageError}</div>;
  if (!event) return <div className="center-msg">Loading event details...</div>;

  // Build UPI payment QR URL using free public API
  const upiString = `upi://pay?pa=${event.organizer_upi_id}&pn=EventPayment&am=${event.price}&cu=INR&tn=EventTicket`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="public-page">
      <div className="card register-card">
        <h2 className="card-title">🎟️ {event.title}</h2>
        <div className="event-meta">
          <span>📅 {new Date(event.event_date).toLocaleString()}</span>
          <span>📍 {event.venue}</span>
          <span>💰 ₹{event.price}</span>
          <span>📧 {event.organizer_email}</span>
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

// ════════════════════════════════════════════════════════════════
//  PAGE 4: ADMIN DASHBOARD
//  Route: /admin (protected)
// ════════════════════════════════════════════════════════════════

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
    fetch(API + "/events/organizer/" + user.id)
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
        }
      );

      const data = await res.json();

      setMessage(data.message || data.error);

      // Refresh events
      const updated = await fetch(
        API + "/events/organizer/" + user.id
      );

      const updatedEvents = await updated.json();

      setEvents(updatedEvents);

    } catch {
      setMessage("Server error.");
    }
  }

  const statusBadge = (status) => {
    const map = { under_review: "badge-warning", paid: "badge-success", failed: "badge-danger" };
    return <span className={`badge ${map[status]}`}>{status.replace("_", " ")}</span>;
  };

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
              <div key={ev.id} className={`event-card ${selectedEvent?.id === ev.id ? "selected" : ""}`}>
                <h3>{ev.title}</h3>
                <p>📅 {new Date(ev.event_date).toLocaleString()}</p>
                <p>📍 {ev.venue}</p>
                <p>💰 ₹{ev.price}</p>
                <div className="event-card-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => loadAttendees(ev)}
                  >
                    View Attendees
                  </button>

                  <a
                    href={`/register/${ev.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                  >
                    Registration Link ↗
                  </a>

                  <Link
                    to="/scanner"
                    className="btn btn-success btn-sm"
                  >
                    🎥 Scan Tickets
                  </Link>
                  <button
                    className={`btn btn-sm ${
                      ev.is_completed
                        ? "btn-disabled"
                        : "btn-danger"
                    }`}
                    disabled={ev.is_completed}
                    onClick={() => completeEvent(ev.id)}
                  >
                    {ev.is_completed
                      ? "✅ Event Completed"
                      : "Finish Event"}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => loadFeedback(ev)}
                  >
                    ⭐ View Feedback
                  </button>
                </div>
              </div>
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
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>UTR Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a, i) => (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td>{a.name}</td>
                        <td>{a.email}</td>
                        <td>{a.phone || "—"}</td>
                        <td><code>{a.upi_utr}</code></td>
                        <td>{statusBadge(a.payment_status)}</td>
                        <td>
                          {a.payment_status === "under_review" && (
                            <div className="action-btns">
                              <button
                                className="btn btn-success btn-sm"
                                disabled={loadingAction === a.id + "-approve"}
                                onClick={() => approveAttendee(a.id)}
                              >
                                {loadingAction === a.id + "-approve" ? "..." : "✅ Approve"}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={loadingAction === a.id + "-reject"}
                                onClick={() => rejectAttendee(a.id)}
                              >
                                {loadingAction === a.id + "-reject" ? "..." : "❌ Reject"}
                              </button>
                            </div>
                          )}
                          {a.payment_status === "paid" && (
                            <span className="text-muted">Ticket sent ✓</span>
                          )}
                          {a.payment_status === "failed" && (
                            <span className="text-muted">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <div key={index} className="feedback-item">

                    <div className="feedback-stars">
                      {"★".repeat(item.rating)}
                      {"☆".repeat(5 - item.rating)}
                    </div>

                    <p className="feedback-comment">
                      {item.comments || "No comment provided."}
                    </p>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Feedback Page
function FeedbackPage() {
  const { token } = useParams();

  const [data, setData] = useState(null);
  const [pageError, setPageError] = useState("");

  const [feedback, setFeedback] = useState({
    rating: 5,
    comments: "",
  });

  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    fetch(API + "/feedback/" + token)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setPageError(res.error);
        } else {
          setData(res);
        }
      })
      .catch(() => {
        setPageError("Cannot connect to server.");
      });
  }, [token]);

  async function submitFeedback(e) {
    e.preventDefault();

    const res = await fetch(API + "/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket_token: data.ticket_token,
        ...feedback,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setFeedbackMsg(result.error || "Failed to submit feedback.");
    } else {
      setFeedbackMsg(result.message);
    }
  }

  if (pageError) {
    return (
      <div className="public-page">
        <div className="card verify-card">
          <div className="verify-banner verify-invalid">
            ❌ INVALID FEEDBACK LINK
          </div>

          <p className="verify-error-text">
            {pageError}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="center-msg">
        Loading feedback page...
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="card verify-card">

        <div className="verify-header">
          <div className="verify-icon">💬</div>

          <h2>{data.event_title}</h2>

          <p>
            Thank you for attending,
            <strong> {data.name}</strong>
          </p>

          <p>
            📍 {data.venue}
          </p>
        </div>

        <div className="feedback-section">
          <h3>Leave Feedback</h3>

          <form onSubmit={submitFeedback} className="form">

            <div className="form-group">
              <label>Rating</label>

              <div className="star-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-btn ${
                      feedback.rating >= star ? "active" : ""
                    }`}
                    onClick={() =>
                      setFeedback({
                        ...feedback,
                        rating: star,
                      })
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Comments</label>

              <textarea
                rows={4}
                placeholder="Share your experience..."
                value={feedback.comments}
                onChange={(e) =>
                  setFeedback({
                    ...feedback,
                    comments: e.target.value,
                  })
                }
              />
            </div>

            {feedbackMsg && (
              <p className="msg success">
                {feedbackMsg}
              </p>
            )}

            {!feedbackMsg && (
              <button
                className="btn btn-primary"
                type="submit"
              >
                Submit Feedback
              </button>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}


function ScannerPage() {
  const navigate = useNavigate();

  const [scanError, setScanError] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("starting");

  async function handleImageUpload(event) {

    const file = event.target.files[0];

    if (!file) return;

    try {

      setScanError("");
      setScannerStatus("starting");

      const imageUrl = URL.createObjectURL(file);

      const codeReader =
        new BrowserMultiFormatReader();

      const result =
        await codeReader.decodeFromImageUrl(imageUrl);

      const decodedText = result.getText();

      const parts =
        decodedText.split("/verify/");

      const token = parts[1];

      if (token) {

        setScannerStatus("success");

        setTimeout(() => {
          navigate(`/verify/${token}`);
        }, 600);

      } else {

        setScannerStatus("error");

        setScanError(
          "Invalid QR format."
        );
      }

    } catch (error) {

      console.error(error);

      setScannerStatus("error");

      setScanError(
        "No valid QR code found in image."
      );
    }
  }

  useEffect(() => {
    let mounted = true;

    const codeReader = new BrowserMultiFormatReader();

    let controls = null;


    async function startScanner() {
      try {
        setScanError("");

        // Get available cameras
        const videoInputDevices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!videoInputDevices.length) {
          setScanError("No camera device found.");
          return;
        }

        // Prefer rear camera on phones
        const rearCamera =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];

        if (!mounted) return;

        setScannerStarted(true);
        setScannerStatus("ready");

        controls = await codeReader.decodeFromVideoDevice(
          rearCamera.deviceId,
          "reader",
          (result, err) => {

            // Successful QR detection
            if (result) {
              const decodedText = result.getText();

              try {
                const parts =
                  decodedText.split("/verify/");

                const token = parts[1];

                if (token && !hasScanned) {

                  setHasScanned(true);
                  setScannerStatus("success");

                  if (controls) {
                    controls.stop();
                  }

                  setTimeout(() => {
                    navigate(`/verify/${token}`);
                  }, 600);

                } else if (!token) {

                  setScanError("Invalid QR format.");

                } else {
                  setScanError("Invalid QR format.");
                }

              } catch {
                setScanError(
                  "Failed to process QR code."
                );
              }
            }

            // Ignore continuous frame scan errors
            if (err) {
            }
          }
        );

      } catch (error) {
        console.error(error);

        setScanError(
          "Camera permission denied or scanner failed to start."
        );
        setScannerStatus("error");
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (controls) {
        controls.stop();
      }
    };

  }, [navigate]);

  return (
    <div className="public-page">
      <div className="card scanner-card">

        <h2 className="card-title">
          🎥 Scan Event Ticket
        </h2>

        <p className="scanner-text">

          {scannerStatus === "starting" &&
            "Starting camera..."}

          {scannerStatus === "ready" &&
            "Ready to scan attendee QR ticket"}

          {scannerStatus === "success" &&
            "QR detected successfully"}

          {scannerStatus === "error" &&
            "Scanner failed to start"}

        </p>

        {scanError && (
          <p className="msg error">
            {scanError}
          </p>
        )}

        {!scannerStarted && (
          <p className="scanner-text">
            Starting camera...
          </p>
        )}

        <video
          id="reader"
          style={{
            width: "100%",
            borderRadius: "12px",
            border: "2px solid #e2e8f0",
          }}
        ></video>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <div className="upload-section">

          <label
            htmlFor="qr-upload"
            className="btn btn-outline"
          >
            Upload QR Image
          </label>

          <input
            id="qr-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          <p className="scanner-text">
            Upload screenshot or photo of QR ticket
          </p>

</div>

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PAGE 5: GATEKEEPER VERIFY / SCANNER PAGE
//  Route: /verify/:token
// ════════════════════════════════════════════════════════════════

function VerifyPage() {
  const { token } = useParams();
  const [attendee, setAttendee] = useState(null);
  const [pageError, setPageError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Load attendee info
  useEffect(() => {
    fetch(API + "/verify/" + token)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setPageError(data.error);
        else setAttendee(data);
      })
      .catch(() => setPageError("Cannot connect to server."));
  }, [token]);

  async function doAction(type) {
    setActionMsg("");
    const res = await fetch(`${API}/verify/${type}/${token}`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) {
      alert("⚠️ " + (data.error || "Already claimed!"));
    } else {
      setActionMsg("✅ " + data.message);
      // Refresh attendee data to update button states
      const r2 = await fetch(API + "/verify/" + token);
      const updated = await r2.json();
      setAttendee(updated);
    }
  }

  if (pageError) {
  return (
    <div className="public-page">
      <div className="card verify-card">

        <div className="verify-banner verify-invalid">
          ❌ INVALID OR FAKE TICKET
        </div>

        <div className="verify-header">
          <div className="verify-icon">🚫</div>

          <h2>Verification Failed</h2>

          <p className="verify-error-text">
            {pageError}
          </p>
        </div>

      </div>
    </div>
  );
}
  if (!attendee) return <div className="center-msg">🔍 Verifying ticket...</div>;

  const isValid = attendee.payment_status === "paid";
  const alreadyUsed = attendee.checked_in;

  return (
    <div className="public-page">
      <div className="card verify-card">
        {/* Ticket Status */}
        <div className="verify-header">
          <div className="verify-icon">🎟️</div>
          <h2>{attendee.name}</h2>
          <p className="verify-event">{attendee.event_title}</p>
          <p>📍 {attendee.venue} | 📅 {new Date(attendee.event_date).toLocaleString()}</p>
          <p>
            🎫 Token: <code>{attendee.ticket_token}</code>
          </p>
          <div
            className={`verify-banner ${
              !isValid
                ? "verify-invalid"
                : alreadyUsed
                ? "verify-used"
                : "verify-valid"
            }`}
          >
            {!isValid
              ? "❌ INVALID TICKET"
              : alreadyUsed
              ? "⚠️ ENTRY ALREADY USED"
              : "✅ VALID TICKET"}
          </div>
        </div>

        {attendee.payment_status === "paid" && (
          <>
            {/* Status Indicators */}
            <div className="status-row">
              <div className={`status-chip ${attendee.checked_in ? "done" : ""}`}>
                {attendee.checked_in ? "✅" : "⬜"} Entry
              </div>
              <div className={`status-chip ${attendee.lunch_served ? "done" : ""}`}>
                {attendee.lunch_served ? "✅" : "⬜"} Lunch
              </div>
              <div className={`status-chip ${attendee.kit_distributed ? "done" : ""}`}>
                {attendee.kit_distributed ? "✅" : "⬜"} Kit
              </div>
            </div>

            {actionMsg && <p className="msg success">{actionMsg}</p>}

            {/* Action Buttons */}
            <div className="verify-actions">
              <button
                disabled={attendee.checked_in}
                className={`btn ${
                  attendee.checked_in
                    ? "btn-disabled"
                    : "btn-primary"
                }`}
                onClick={() => !attendee.checked_in && doAction("checkin")}
              >
                {attendee.checked_in ? "Entry Marked ✓" : "Mark Entry"}
              </button>
              <button
                  disabled={!attendee.checked_in || attendee.lunch_served}
                  className={`btn ${
                    attendee.lunch_served
                      ? "btn-disabled"
                      : "btn-success"
                  }`}
                  onClick={() => !attendee.lunch_served && doAction("lunch")}
                >
                {attendee.lunch_served ? "Lunch Claimed ✓" : "Mark Lunch Claimed"}
              </button>
              <button
                  disabled={!attendee.checked_in || attendee.kit_distributed}
                  className={`btn ${
                    attendee.kit_distributed
                      ? "btn-disabled"
                      : "btn-outline"
                  }`}
                  onClick={() => !attendee.kit_distributed && doAction("kit")}
                >
                {attendee.kit_distributed ? "Kit Distributed ✓" : "Mark Kit Claimed"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}