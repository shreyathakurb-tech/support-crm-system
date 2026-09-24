from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from auth.security import decode_access_token
from database import get_db
from model import Note, Ticket
from schemas import (
    TicketCreate,
    TicketCreateResponse,
    TicketDetailResponse,
    TicketListResponse,
    TicketUpdate,
    TicketUpdateResponse,
)
from utils.ticket_id import generate_ticket_id


router = APIRouter(
    prefix="/api/tickets",
    tags=["tickets"],
)


@router.post("", response_model=TicketCreateResponse)
def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)

    new_ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status="Open",
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@router.get("", response_model=list[TicketListResponse])
def list_tickets(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    # Require login
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user_email = payload.get("email")
    user_role = payload.get("role")

    query = db.query(Ticket)

    # Customers can see ONLY their own tickets.
    # Admins can see all tickets.
    if user_role != "admin":
        query = query.filter(
            Ticket.customer_email == user_email
        )

    if status:
        query = query.filter(Ticket.status == status)

    if search:
        search_text = f"%{search}%"

        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(search_text),
                Ticket.customer_name.ilike(search_text),
                Ticket.customer_email.ilike(search_text),
                Ticket.subject.ilike(search_text),
                Ticket.description.ilike(search_text),
            )
        )

    tickets = (
        query
        .order_by(Ticket.created_at.desc())
        .all()
    )

    return tickets

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.notes))
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Update ticket information
    if ticket_data.customer_name is not None:
        ticket.customer_name = ticket_data.customer_name.strip()

    if ticket_data.customer_email is not None:
        ticket.customer_email = str(
            ticket_data.customer_email
        ).strip().lower()

    if ticket_data.subject is not None:
        ticket.subject = ticket_data.subject.strip()

    if ticket_data.description is not None:
        ticket.description = ticket_data.description.strip()

    # Update status
    if ticket_data.status is not None:
        ticket.status = ticket_data.status

    # Add note
    if ticket_data.notes is not None and ticket_data.notes.strip():
        new_note = Note(
            ticket_id=ticket.ticket_id,
            note_text=ticket_data.notes.strip(),
        )

        db.add(new_note)

    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "updated_at": ticket.updated_at,
    }