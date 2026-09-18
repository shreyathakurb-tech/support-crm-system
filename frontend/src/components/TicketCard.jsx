import { Link } from "react-router-dom";

function TicketCard({ ticket }) {
  const statusClass = ticket.status
    .toLowerCase()
    .replaceAll(" ", "-");

  return (
    <Link
      className="ticket-card"
      to={`/tickets/${ticket.ticket_id}`}
    >
      <div className="ticket-main">
        <div className="ticket-id">
          {ticket.ticket_id}
        </div>

        <h2>{ticket.subject}</h2>

        <p>{ticket.customer_name}</p>

        <p className="ticket-email">
          {ticket.customer_email}
        </p>
      </div>

      <div className="ticket-meta">
        <span className={`status-badge ${statusClass}`}>
          {ticket.status}
        </span>

        <small>
          {new Date(ticket.created_at).toLocaleDateString()}
        </small>
      </div>
    </Link>
  );
}

export default TicketCard;