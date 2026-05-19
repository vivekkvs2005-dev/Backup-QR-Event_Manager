// ════════════════════════════════════════════════════════════════
//  PAGE 5: GATEKEEPER VERIFY / SCANNER PAGE
//  Route: /verify/:token
// ════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import API from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

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
  if (!attendee) return <LoadingSpinner
    text="🔍 Verifying ticket..."
    />;

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

export default VerifyPage;