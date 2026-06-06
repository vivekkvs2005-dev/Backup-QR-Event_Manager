import { Link } from "react-router-dom";

import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

import { MdFeedback } from "react-icons/md";

import { BsQrCodeScan } from "react-icons/bs";

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
        <FaCalendarAlt />{" "}
        {new Date(
          event.event_date
        ).toLocaleString()}
      </p>

      <p>
        <FaMapMarkerAlt /> {event.venue}
      </p>

      <p>
        <FaRupeeSign /> {event.price}
      </p>

      <div className="event-card-actions">

        <button
          className="btn btn-outline btn-sm"
          onClick={() =>
            loadAttendees(event)
          }
        >
          <FaUsers />
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
          <BsQrCodeScan />
          Scan Tickets
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
          {
            event.is_completed
              ? (
                <>
                  <FaCheckCircle />
                  Event Completed
                </>
              )
              : "Finish Event"
          }
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() =>
            loadFeedback(event)
          }
        >
          <MdFeedback />
          View Feedback
        </button>

      </div>

    </div>
  );
}

export default EventCard;