import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTicket, updateTicket } from "../api/tickets";

function TicketDetail() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

const [editForm, setEditForm] = useState({
  customer_name: "",
  customer_email: "", 
  subject: "",
  description: "",
});

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

setEditForm({
  customer_name: data.customer_name || "",
  customer_email: data.customer_email || "",
  subject: data.subject || "",
  description: data.description || "",
});
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

  async function handleEditSubmit(event) {
  event.preventDefault();

  try {
    setSaving(true);
    setError("");

    await updateTicket(ticketId, editForm);

    setIsEditing(false);

    await loadTicket();
  } catch (err) {
    setError(
      err.message || "Could not update ticket."
    );
  } finally {
    setSaving(false);
  }
}

function handleEditChange(event) {
  const { name, value } = event.target;

  setEditForm((previous) => ({
    ...previous,
    [name]: value,
  }));
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

  <div className="ticket-actions">
    {!isEditing && (
      <button
        className="secondary-button"
        type="button"
        onClick={() => setIsEditing(true)}
      >
        Edit Ticket
      </button>
    )}

    <Link className="secondary-button" to="/">
      Back
    </Link>
  </div>
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

      {isEditing && (
  <section className="detail-card">
    <h2>Edit Ticket</h2>

    <form onSubmit={handleEditSubmit}>

      <label>
        Customer Name

        <input
          type="text"
          name="customer_name"
          value={editForm.customer_name}
          onChange={handleEditChange}
          required
        />
      </label>

      <label>
        Customer Email

        <input
          type="email"
          name="customer_email"
          value={editForm.customer_email}
          onChange={handleEditChange}
          required
        />
      </label>

      <label>
        Subject

        <input
          type="text"
          name="subject"
          value={editForm.subject}
          onChange={handleEditChange}
          required
        />
      </label>

      <label>
        Description

        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          rows="6"
          required
        />
      </label>

      <div className="ticket-actions">

        <button
          className="primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>

      </div>

    </form>
  </section>
)}

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