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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resolvehub_token");

  async function loadTickets() {
  const token = localStorage.getItem("resolvehub_token");

  if (!token) {
    setTickets([]);
    setLoading(false);
    setError("");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await getTickets(status, search);

    console.log("Tickets:", data);

    setTickets(data);
  } catch (err) {
    console.error(err);

    if (err.message === "Invalid or expired token") {
      localStorage.removeItem("resolvehub_token");
      localStorage.removeItem("resolvehub_user");
      setError("Your session has expired. Please log in again.");
    } else {
      setError("Could not load tickets. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
  const token = localStorage.getItem("resolvehub_token");

  if (!token) {
    setLoading(false);
    setTickets([]);
    return;
  }

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

       {!token ? (
        <div className="message">
          <p>Please log in to view and manage your support tickets.</p>

          <Link className="primary-button" to="/login">
            Log In
          </Link>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default Home;