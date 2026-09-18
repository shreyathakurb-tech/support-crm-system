const API_URL = "/api/tickets";

export async function getTickets(status = "", search = "") {
  const params = new URLSearchParams();

  if (status && status !== "All") {
    params.append("status", status);
  }

  if (search) {
    params.append("search", search);
  }

  const queryString = params.toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}

export async function getTicket(ticketId) {
  const response = await fetch(`${API_URL}/${ticketId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch ticket");
  }

  return response.json();
}

export async function createTicket(ticketData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
}

export async function updateTicket(ticketId, ticketData) {
  const response = await fetch(`${API_URL}/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket");
  }

  return response.json();
}