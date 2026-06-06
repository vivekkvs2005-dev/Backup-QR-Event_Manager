import {
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function MessageAlert({
  type = "success",
  message,
}) {

  if (!message) return null;

  return (
    <p className={`msg ${type}`}>

      {type === "success" && (
        <FaCheckCircle />
      )}

      {type === "error" && (
        <FaTimesCircle />
      )}

      {message}

    </p>
  );
}

export default MessageAlert;