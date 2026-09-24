import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAnalyticsSummary } from "../api/analytics";
import "./Analytics.css";


function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("resolvehub_user") || "null"
  );

  const isAdmin = user?.role === "admin";
  const token = localStorage.getItem("resolvehub_token");

async function loadAnalytics() {
  if (!token) {
    setLoading(false);
    setData(null);
    setError("");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const result = await getAnalyticsSummary();

    setData(result);
  } catch (err) {
    setError(err.message || "Could not load analytics.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-container">
          <p className="message">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

if (!token) {
  return (
    <main className="analytics-page">
      <div className="analytics-container">
        <p className="message">
          Please log in to view your support analytics.
        </p>
      </div>
    </main>
  );
}

if (error) {
  return (
    <main className="analytics-page">
      <div className="analytics-container">
        <p className="error-message">
          {error}
        </p>
      </div>
    </main>
  );
}

  return (
    <main className="analytics-page">
      <div className="analytics-container">

        <div className="analytics-header">
          <div>
            <h1>
              {isAdmin
                ? "Support Analytics"
                : "My Support Overview"}
            </h1>

            <p>
              {isAdmin
                ? "Monitor ticket workload and support activity."
                : "Track your support requests and ticket activity."}
            </p>
          </div>
        </div>

        {/* KPI CARDS */}

        <section className="kpi-grid">

          <div className="kpi-card">
            <span>Total Tickets</span>
            <strong>{data.total_tickets}</strong>
          </div>

          <div className="kpi-card">
            <span>Open</span>
            <strong>{data.open_tickets}</strong>
          </div>

          <div className="kpi-card">
            <span>In Progress</span>
            <strong>
              {data.in_progress_tickets}
            </strong>
          </div>

          <div className="kpi-card">
            <span>Closed</span>
            <strong>
              {data.closed_tickets}
            </strong>
          </div>

          <div className="kpi-card attention">
            <span>Aging 3+ Days</span>
            <strong>
              {data.aging_tickets}
            </strong>
          </div>

        </section>

        {/* CHARTS */}

        <section className="analytics-grid">

          <div className="analytics-card">
            <div className="card-heading">
              <h2>Ticket Status</h2>
              <span>Current distribution</span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>
                  <Pie
                    data={data.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {data.status_distribution.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              {data.status_distribution.map(
                (item) => (
                  <div
                    className="legend-item"
                    key={item.status}
                  >
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>
                )
              )}
            </div>
          </div>


          <div className="analytics-card">
            <div className="card-heading">
              <h2>Ticket Aging</h2>
              <span>Unresolved tickets</span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <BarChart
                  data={data.aging_distribution}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Tickets"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>


        <section className="analytics-card trend-card">

          <div className="card-heading">
            <h2>Tickets Created</h2>
            <span>Last 30 days</span>
          </div>

          <div className="trend-list">

            {data.daily_tickets.map(
              (item) => (
                <div
                  className="trend-row"
                  key={item.date}
                >
                  <span>{item.date}</span>

                  <div className="trend-bar-wrapper">
                    <div
                      className="trend-bar"
                      style={{
                        width: `${Math.max(
                          item.count * 12,
                          item.count > 0 ? 4 : 0
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {item.count}
                  </strong>
                </div>
              )
            )}

          </div>

        </section>


        <section className="analytics-card">

          <div className="card-heading">
            <h2>Recent Tickets</h2>
            <span>Latest activity</span>
          </div>

          {data.recent_tickets.length === 0 ? (
            <p className="empty-state">
              No tickets found.
            </p>
          ) : (
            <div className="recent-tickets">

              {data.recent_tickets.map(
                (ticket) => (
                  <div
                    className="recent-ticket"
                    key={ticket.ticket_id}
                  >
                    <div>
                      <strong>
                        {ticket.ticket_id}
                      </strong>

                      <p>
                        {ticket.subject}
                      </p>
                    </div>

                    <div className="recent-ticket-meta">
                      <span
                        className={`status-pill ${ticket.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {ticket.status}
                      </span>

                      <small>
                        {new Date(
                          ticket.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </small>
                    </div>
                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default Analytics;