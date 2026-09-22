from datetime import datetime, timedelta

from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session

from auth.security import decode_access_token
from database import get_db
from model import Ticket


router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"],
)


def get_current_user(authorization: str | None):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header.",
        )

    token = authorization.replace("Bearer ", "", 1).strip()

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    return payload


@router.get("/summary")
def analytics_summary(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    user = get_current_user(authorization)

    role = user.get("role")
    email = user.get("email")

    if role == "admin":
        tickets = (
            db.query(Ticket)
            .order_by(Ticket.created_at.desc())
            .all()
        )
    else:
        tickets = (
            db.query(Ticket)
            .filter(Ticket.customer_email == email)
            .order_by(Ticket.created_at.desc())
            .all()
        )

    now = datetime.now()

    total_tickets = len(tickets)

    open_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "Open"
    )

    in_progress_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "In Progress"
    )

    closed_tickets = sum(
        1 for ticket in tickets
        if ticket.status == "Closed"
    )

    # Tickets that have remained unresolved for at least 3 days.
    aging_tickets = sum(
        1
        for ticket in tickets
        if ticket.status != "Closed"
        and (now - ticket.created_at).days >= 3
    )

    # -----------------------------
    # Status distribution
    # -----------------------------

    status_distribution = [
        {
            "status": "Open",
            "count": open_tickets,
        },
        {
            "status": "In Progress",
            "count": in_progress_tickets,
        },
        {
            "status": "Closed",
            "count": closed_tickets,
        },
    ]

    # -----------------------------
    # Tickets created over last 30 days
    # -----------------------------

    start_date = (
        now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        - timedelta(days=29)
    )

    daily_counts = {}

    for index in range(30):
        date_value = (
            start_date + timedelta(days=index)
        ).strftime("%Y-%m-%d")

        daily_counts[date_value] = 0

    for ticket in tickets:
        created_date = ticket.created_at.strftime("%Y-%m-%d")

        if created_date in daily_counts:
            daily_counts[created_date] += 1

    daily_tickets = [
        {
            "date": date_value,
            "count": count,
        }
        for date_value, count in daily_counts.items()
    ]

    # -----------------------------
    # Ticket aging
    # -----------------------------

    aging_distribution = {
        "Less than 1 day": 0,
        "1-3 days": 0,
        "3-7 days": 0,
        "More than 7 days": 0,
    }

    for ticket in tickets:
        if ticket.status == "Closed":
            continue

        age_days = (now - ticket.created_at).days

        if age_days < 1:
            aging_distribution["Less than 1 day"] += 1
        elif age_days < 3:
            aging_distribution["1-3 days"] += 1
        elif age_days < 7:
            aging_distribution["3-7 days"] += 1
        else:
            aging_distribution["More than 7 days"] += 1

    aging_data = [
        {
            "range": age_range,
            "count": count,
        }
        for age_range, count in aging_distribution.items()
    ]

    # -----------------------------
    # Recent tickets
    # -----------------------------

    recent_tickets = [
        {
            "ticket_id": ticket.ticket_id,
            "subject": ticket.subject,
            "status": ticket.status,
            "created_at": ticket.created_at,
        }
        for ticket in tickets[:5]
    ]

    return {
        "role": role,
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "closed_tickets": closed_tickets,
        "aging_tickets": aging_tickets,
        "status_distribution": status_distribution,
        "daily_tickets": daily_tickets,
        "aging_distribution": aging_data,
        "recent_tickets": recent_tickets,
    }