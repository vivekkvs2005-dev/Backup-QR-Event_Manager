function MessageAlert({
  type = "success",
  message,
}) {

  if (!message) return null;

  return (
    <p className={`msg ${type}`}>
      {message}
    </p>
  );
}

export default MessageAlert;