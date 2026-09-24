import { API_URL } from "./config";

const TICKETS_API_URL = `${API_URL}/api/tickets`;

// =========================================================
// GET ALL TICKETS
// =========================================================

export async function getTickets(status = "", search = "") {
  const token = localStorage.getItem("resolvehub_token");

  const params = new URLSearchParams();

  if (status && status !== "All") {
    params.append("status", status);
  }

  if (search) {
    params.append("search", search);
  }

  const queryString = params.toString();

  const url = queryString
    ? `${TICKETS_API_URL}?${queryString}`
    : TICKETS_API_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Failed to fetch tickets"
    );
  }

  return response.json();
}


// =========================================================
// GET SINGLE TICKET
// =========================================================

export async function getTicket(ticketId) {
  const token = localStorage.getItem("resolvehub_token");

  const response = await fetch(
    `${TICKETS_API_URL}/${ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Failed to fetch ticket"
    );
  }

  return response.json();
}


// =========================================================
// CREATE TICKET
// =========================================================

export async function createTicket(ticketData) {
  const token = localStorage.getItem("resolvehub_token");

  const response = await fetch(TICKETS_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Failed to create ticket"
    );
  }

  return response.json();
}


// =========================================================
// UPDATE TICKET
// =========================================================

export async function updateTicket(
  ticketId,
  ticketData
) {
  const token = localStorage.getItem("resolvehub_token");

  const payload = {};

  if (ticketData.customer_name !== undefined) {
    payload.customer_name =
      ticketData.customer_name;
  }

  if (ticketData.customer_email !== undefined) {
    payload.customer_email =
      ticketData.customer_email;
  }

  if (ticketData.subject !== undefined) {
    payload.subject =
      ticketData.subject;
  }

  if (ticketData.description !== undefined) {
    payload.description =
      ticketData.description;
  }

  if (ticketData.status !== undefined) {
    payload.status =
      ticketData.status;
  }

  if (
    ticketData.notes &&
    ticketData.notes.trim()
  ) {
    payload.notes =
      ticketData.notes.trim();
  }

  const response = await fetch(
    `${TICKETS_API_URL}/${ticketId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const data =
      await response.json().catch(() => ({}));

    throw new Error(
      data.detail ||
      "Failed to update ticket"
    );
  }

  return response.json();
}