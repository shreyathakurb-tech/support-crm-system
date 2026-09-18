import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTickets } from "../api/tickets";
import FilterBar from "../components/FilterBar";
import SearchBar from "../components/SearchBar";
import TicketCard from "../components/TicketCard";

function Home() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const data = await getTickets(status, search);

      console.log("Tickets:", data);

      setTickets(data);
    } catch (err) {
      console.error(err);
      setError("Could not load tickets. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [status, search]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Manage customer issues, statuses, and notes.</p>
        </div>

        <Link className="primary-button" to="/create">
          Create Ticket
        </Link>
      </div>

      <div className="toolbar">
        <SearchBar
          search={search}
          onSearchChange={setSearch}
        />

        <FilterBar
          status={status}
          onStatusChange={setStatus}
        />
      </div>

      {loading && (
        <p className="message">
          Loading tickets...
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        tickets.length === 0 && (
          <p className="message">
            No tickets found.
          </p>
        )}

      {!loading &&
        !error &&
        tickets.length > 0 && (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.ticket_id}
                ticket={ticket}
              />
            ))}
          </div>
        )}
    </div>
  );
}

export default Home;