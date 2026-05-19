function FeedbackCard({ item }) {

  return (

    <div className="feedback-item">

      <div className="feedback-stars">

        {"★".repeat(item.rating)}

        {"☆".repeat(5 - item.rating)}

      </div>

      <p className="feedback-comment">

        {item.comments ||
          "No comment provided."}

      </p>

    </div>
  );
}

export default FeedbackCard;