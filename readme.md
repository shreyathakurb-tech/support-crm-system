# Support CRM System

A full-stack customer support ticket management system that handles the complete lifecycle of support tickets — from creation and search to status updates and internal notes.

**[Live Demo](https://ticket-crm-frontend.netlify.app)** &nbsp;·&nbsp; **[API Docs](https://ticket-crm-system.onrender.com/docs)**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

## Overview

The system is designed for support teams to manage customer issues end-to-end — create tickets, search and filter across all tickets, update statuses, and log internal notes without losing context.

**Architectural approach:** The backend is a REST API (FastAPI) that manages all data and business logic. The frontend (React) is a separate SPA that communicates with the API exclusively through a dedicated `api/` module. This separation keeps the two layers independently deployable and easy to reason about.

---

## Features

| Feature | Description |
|---------|-------------|
| Create tickets | Capture customer name, email, subject, and description. Auto-generates a unique ticket ID (TKT-001, TKT-002, …) and timestamp |
| List all tickets | Clean table view showing ID, customer name, subject, status, and created date |
| Live search | Searches across name, email, ticket ID, and description as you type (debounced) |
| Filter by status | One-click filters for Open, In Progress, and Closed |
| Ticket detail view | Full view of all ticket fields with edit capability |
| Status updates | Change ticket status at any point in its lifecycle |
| Internal notes | Add timestamped internal notes to any ticket for team context |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy |
| Database | SQLite |
| Validation | Pydantic v2 |
| Frontend hosting | Netlify |
| Backend hosting | Render |

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/support-crm.git
cd support-crm
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Copy the environment file and fill in values:

```bash
cp .env.example .env
```

Start the development server:

```bash
uvicorn main:app --reload
```

The backend runs at `http://localhost:8000`.
Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs`.

### 3. Frontend setup

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

> In development, Vite proxies all `/api` requests to `http://localhost:8000` automatically via `vite.config.js`. No manual URL switching needed.

---

## API Reference

**Production base URL:** `https://ticket-crm-system.onrender.com`

---

### Create a ticket

```
POST /api/tickets
```

**Request body:**

```json
{
  "customer_name": "Priya Sharma",
  "customer_email": "priya@example.com",
  "subject": "Login button not working on mobile",
  "description": "The login button does not respond after the latest app update on iOS 17."
}
```

**Response `201`:**

```json
{
  "ticket_id": "TKT-001",
  "created_at": "2025-06-01T10:30:00"
}
```

---

### List all tickets

```
GET /api/tickets
```

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by `Open`, `In Progress`, or `Closed` |
| `search` | string | Search across customer name, email, ticket ID, and description |

Both params are optional and combinable.

**Response `200`:**

```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "Priya Sharma",
    "subject": "Login button not working on mobile",
    "status": "Open",
    "created_at": "2025-06-01T10:30:00"
  }
]
```

---

### Get ticket details

```
GET /api/tickets/{ticket_id}
```

**Response `200`:**

```json
{
  "ticket_id": "TKT-001",
  "customer_name": "Priya Sharma",
  "customer_email": "priya@example.com",
  "subject": "Login button not working on mobile",
  "description": "The login button does not respond after the latest app update on iOS 17.",
  "status": "In Progress",
  "created_at": "2025-06-01T10:30:00",
  "updated_at": "2025-06-01T14:00:00",
  "notes": [
    {
      "note_text": "Reproduced on iOS 17.4. Escalated to the mobile dev team.",
      "created_at": "2025-06-01T14:00:00"
    }
  ]
}
```

**Response `404`** (ticket not found):

```json
{
  "detail": "Ticket TKT-999 not found"
}
```

---

### Update a ticket

```
PUT /api/tickets/{ticket_id}
```

**Request body** (all fields optional):

```json
{
  "status": "Closed",
  "note": "Fixed in v2.3.1 hotfix. Verified by QA."
}
```

**Response `200`:**

```json
{
  "success": true,
  "updated_at": "2025-06-01T16:00:00"
}
```

---

## Database Schema

```sql
CREATE TABLE tickets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id      TEXT    UNIQUE NOT NULL,          -- e.g. TKT-001
    customer_name  TEXT    NOT NULL,
    customer_email TEXT    NOT NULL,
    subject        TEXT    NOT NULL,
    description    TEXT    NOT NULL,
    status         TEXT    NOT NULL DEFAULT 'Open',  -- Open | In Progress | Closed
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id  TEXT      NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    note_text  TEXT      NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Ticket IDs are generated sequentially by querying the current max ID and incrementing — no UUID dependency needed, keeping them human-readable (TKT-001, TKT-002, …).

---

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py               # FastAPI app instantiation + CORS config
│   ├── database.py           # SQLite engine, session factory, Base
│   ├── models.py             # SQLAlchemy ORM models (Ticket, Note)
│   ├── schemas.py            # Pydantic request and response schemas
│   ├── utils/
│   │   └── ticket_id.py      # Sequential ticket ID generator (TKT-001…)
│   ├── routes/
│   │   ├── __init__.py
│   │   └── tickets.py        # All 4 REST endpoints
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx          # ReactDOM.createRoot entry point
│   │   ├── App.jsx           # React Router v6 (3 routes)
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Ticket list, live search, status filter
│   │   │   ├── CreateTicket.jsx   # New ticket form with validation
│   │   │   └── TicketDetail.jsx   # View ticket, update status, add notes
│   │   ├── components/
│   │   │   ├── TicketCard.jsx     # Single ticket row in the list
│   │   │   ├── SearchBar.jsx      # Debounced search input
│   │   │   └── FilterBar.jsx      # Status filter tab group
│   │   └── api/
│   │       └── tickets.js         # Fetch wrappers for all 4 endpoints
│   ├── public/
│   │   └── _redirects            # Netlify SPA redirect rule
│   ├── package.json
│   ├── vite.config.js            # Dev proxy: /api → localhost:8000
│   └── tailwind.config.js
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Path to the SQLite database file
DATABASE_URL=sqlite:///./crm.db

# Comma-separated list of allowed CORS origins
CORS_ORIGINS=http://localhost:5173,https://ticket-crm-frontend.netlify.app
```

### Frontend (`frontend/.env`)

```env
# Backend API base URL (used in production builds only)
VITE_API_URL=https://ticket-crm-system.onrender.com
```

> The Vite dev proxy handles `/api` routing locally, so `VITE_API_URL` is only needed when building for production.

---

## Deployment

### Backend — Render

1. Push the repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend/`.
4. Set **Build Command** to `pip install -r requirements.txt`.
5. Set **Start Command** to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
6. Add environment variables (`DATABASE_URL`, `CORS_ORIGINS`) in the Render dashboard under **Environment**.

> Note: Render's free tier spins down after inactivity. The first request after a cold start may take 30–60 seconds.

### Frontend — Netlify

1. Create a new site on [Netlify](https://netlify.com) and connect the GitHub repository.
2. Set **Base Directory** to `frontend/`.
3. Set **Build Command** to `npm run build`.
4. Set **Publish Directory** to `dist/`.
5. Add `VITE_API_URL` as an environment variable in **Site settings > Environment variables**.
6. Ensure `frontend/public/_redirects` contains:
   ```
   /*  /index.html  200
   ```
   This is required for React Router — without it, direct URL access to routes like `/tickets/TKT-001` returns a 404.

---

## Future Improvements

Given more time, these would be the next priorities:

- **Authentication** — Role-based login (admin vs. support agent) using JWT
- **Email notifications** — Notify customers automatically on status changes via SendGrid
- **Ticket priority levels** — Low, Medium, High, Urgent with visual indicators
- **Agent assignment** — Assign and transfer tickets between team members
- **Analytics dashboard** — Ticket volume over time, average resolution time, open vs. closed ratio
- **Pagination** — Server-side pagination for large ticket volumes
- **Optimistic UI updates** — Instant status changes in the frontend before the API confirms
