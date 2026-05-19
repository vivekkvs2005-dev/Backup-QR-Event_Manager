import StatusBadge from "./StatusBadge";

function AttendeeTable({

  attendees,

  loadingAction,

  approveAttendee,

  rejectAttendee,

}) {

  return (

    <div className="table-wrapper">

      <table className="table">

        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>UTR Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {attendees.map((a, i) => (

            <tr key={a.id}>

              <td>{i + 1}</td>

              <td>{a.name}</td>

              <td>{a.email}</td>

              <td>{a.phone || "—"}</td>

              <td>
                <code>{a.upi_utr}</code>
              </td>

              <td>
                <StatusBadge
                  status={a.payment_status}
                />
              </td>

              <td>

                {a.payment_status ===
                  "under_review" && (

                  <div className="action-btns">

                    <button
                      className="btn btn-success btn-sm"
                      disabled={
                        loadingAction ===
                        a.id + "-approve"
                      }
                      onClick={() =>
                        approveAttendee(a.id)
                      }
                    >
                      {loadingAction ===
                      a.id + "-approve"
                        ? "..."
                        : "✅ Approve"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      disabled={
                        loadingAction ===
                        a.id + "-reject"
                      }
                      onClick={() =>
                        rejectAttendee(a.id)
                      }
                    >
                      {loadingAction ===
                      a.id + "-reject"
                        ? "..."
                        : "❌ Reject"}
                    </button>

                  </div>
                )}

                {a.payment_status ===
                  "paid" && (
                  <span className="text-muted">
                    Ticket sent ✓
                  </span>
                )}

                {a.payment_status ===
                  "failed" && (
                  <span className="text-muted">
                    Rejected
                  </span>
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AttendeeTable;