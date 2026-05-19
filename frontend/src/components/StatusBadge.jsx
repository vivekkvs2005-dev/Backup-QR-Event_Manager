function StatusBadge({ status }) {

  const map = {
    under_review: "badge-warning",
    paid: "badge-success",
    failed: "badge-danger",
  };

  return (
    <span className={`badge ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default StatusBadge;