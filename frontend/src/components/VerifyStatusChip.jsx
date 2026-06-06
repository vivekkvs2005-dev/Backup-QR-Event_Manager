import {
  FaCheckCircle,
  FaUtensils,
  FaGift,
} from "react-icons/fa";

function VerifyStatusChip({
  label,
  active,
}) {

  let Icon = FaCheckCircle;

  if (label === "Lunch") {
    Icon = FaUtensils;
  }

  if (label === "Kit") {
    Icon = FaGift;
  }

  return (
    <div
      className={`status-chip ${
        active ? "done" : ""
      }`}
    >
      <Icon />
      {label}
    </div>
  );
}

export default VerifyStatusChip;