// ════════════════════════════════════════════════════════════════
//  PAGE 5: GATEKEEPER VERIFY / SCANNER PAGE
//  Route: /verify/:token
// ════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import API from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

import VerifyStatusChip from "../components/VerifyStatusChip";

import {
  FaCheckCircle,
  FaUtensils,
  FaGift,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

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
      alert(data.error || "Already claimed!");
    } else {
      setActionMsg(data.message);
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
          <FaTimesCircle />
          INVALID OR FAKE TICKET
        </div>

        <div className="verify-header">
          <div className="verify-icon verify-error-icon">
            <FaTimesCircle />
          </div>

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
    text="Verifying ticket..."
  />

  const isValid = attendee.payment_status === "paid";
  const alreadyUsed = attendee.checked_in;

  return (
    <div className="public-page">
      <div className="card verify-card">
        {/* Ticket Status */}
        <div className="verify-header">
          <div className="verify-icon">
            <FaTicketAlt />
          </div>
          <h2>{attendee.name}</h2>
          <p className="verify-event">{attendee.event_title}</p>
          <p>
            <FaMapMarkerAlt /> {attendee.venue}
            {" | "}
            <FaCalendarAlt /> {new Date(attendee.event_date).toLocaleString()}
          </p>
          <p>
            <FaTicketAlt /> Token:{" "}
            <code>{attendee.ticket_token}</code>
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
            {
              !isValid ? (
                <>
                  <FaTimesCircle />
                  INVALID TICKET
                </>
              ) : alreadyUsed ? (
                <>
                  <FaExclamationTriangle />
                  ENTRY ALREADY USED
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  VALID TICKET
                </>
              )
            }
          </div>
        </div>

        {attendee.payment_status === "paid" && (
          <>
            {/* Status Indicators */}
            <div className="status-row">

            <VerifyStatusChip
                label="Entry"
                active={attendee.checked_in}
            />

            <VerifyStatusChip
                label="Lunch"
                active={attendee.lunch_served}
            />

            <VerifyStatusChip
                label="Kit"
                active={attendee.kit_distributed}
            />

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
                {
                    attendee.checked_in
                    ? (
                      <>
                        <FaCheckCircle />
                        Entry Marked
                      </>
                    )
                    : (
                      <>
                        <FaCheckCircle />
                        Mark Entry
                      </>
                    )
                }
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
                {
                  attendee.lunch_served
                    ? (
                      <>
                        <FaUtensils />
                        Lunch Claimed
                      </>
                    )
                    : (
                      <>
                        <FaUtensils />
                        Mark Lunch Claimed
                      </>
                    )
                }
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
                {
                  attendee.kit_distributed
                    ? (
                      <>
                        <FaGift />
                        Kit Distributed
                      </>
                    )
                    : (
                      <>
                        <FaGift />
                        Mark Kit Claimed
                      </>
                    )
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyPage;