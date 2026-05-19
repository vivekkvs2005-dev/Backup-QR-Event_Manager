// Feedback Page

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import API from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

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
      <LoadingSpinner
        text="Loading feedback page..."
      />
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

export default FeedbackPage;