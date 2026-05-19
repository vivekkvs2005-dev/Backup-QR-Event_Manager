function VerifyStatusChip({

  label,

  active,

}) {

  return (

    <div
      className={`status-chip ${
        active ? "done" : ""
      }`}
    >

      {active ? "✅" : "⬜"} {label}

    </div>
  );
}

export default VerifyStatusChip;