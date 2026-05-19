import { Link } from "react-router-dom";

function EventCard({

  event,

  selectedEvent,

  loadAttendees,

  completeEvent,

  loadFeedback,

}) {

  return (

    <div
      className={`event-card ${
        selectedEvent?.id === event.id
          ? "selected"
          : ""
      }`}
    >

      <h3>{event.title}</h3>

      <p>
        📅{" "}
        {new Date(
          event.event_date
        ).toLocaleString()}
      </p>

      <p>📍 {event.venue}</p>

      <p>💰 ₹{event.price}</p>

      <div className="event-card-actions">

        <button
          className="btn btn-outline btn-sm"
          onClick={() =>
            loadAttendees(event)
          }
        >
          View Attendees
        </button>

        <a
          href={`/register/${event.id}`}
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
            event.is_completed
              ? "btn-disabled"
              : "btn-danger"
          }`}
          disabled={event.is_completed}
          onClick={() =>
            completeEvent(event.id)
          }
        >
          {event.is_completed
            ? "✅ Event Completed"
            : "Finish Event"}
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() =>
            loadFeedback(event)
          }
        >
          ⭐ View Feedback
        </button>

      </div>

    </div>
  );
}

export default EventCard;