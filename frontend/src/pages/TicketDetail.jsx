import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTicket, updateTicket } from "../api/tickets";

function TicketDetail() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadTicket() {
    try {
      setLoading(true);
      setError("");

      const data = await getTicket(ticketId);
      setTicket(data);
      setStatus(data.status);
    } catch (err) {
      setError("Could not load ticket details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateTicket(ticketId, {
        status,
        notes: note,
      });

      setNote("");
      await loadTicket();
    } catch (err) {
      setError("Could not update ticket.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="page">
        <p className="message">Loading ticket...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="page">
        <p className="error-message">{error}</p>

        <Link className="secondary-button" to="/">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{ticket.subject}</h1>

          <p>
            {ticket.ticket_id} · {ticket.customer_name}
          </p>
        </div>

        <Link className="secondary-button" to="/">
          Back
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Customer</h2>

          <p>
            <strong>Name:</strong> {ticket.customer_name}
          </p>

          <p>
            <strong>Email:</strong> {ticket.customer_email}
          </p>
        </section>

        <section className="detail-card">
          <h2>Ticket Info</h2>

          <p>
            <strong>Status:</strong> {ticket.status}
          </p>

          <p>
            <strong>Created:</strong> {formatDate(ticket.created_at)}
          </p>

          <p>
            <strong>Updated:</strong> {formatDate(ticket.updated_at)}
          </p>
        </section>
      </div>

      <section className="detail-card">
        <h2>Description</h2>

        <p>{ticket.description}</p>
      </section>

      <section className="detail-card">
        <h2>Update Ticket</h2>

        <form onSubmit={handleUpdate}>
          <label>
            Status

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </label>

          <label>
            Add Note

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows="4"
              placeholder="Add an internal note or update..."
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Update"}
          </button>
        </form>
      </section>

      <section className="detail-card">
        <h2>Notes</h2>

        {ticket.notes.length === 0 && (
          <p>No notes yet.</p>
        )}

        {ticket.notes.length > 0 && (
          <div className="notes-list">
            {ticket.notes.map((item) => (
              <div className="note" key={item.id}>
                <p>{item.note_text}</p>

                <small>{formatDate(item.created_at)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TicketDetail;