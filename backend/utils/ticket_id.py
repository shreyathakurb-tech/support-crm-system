from sqlalchemy.orm import Session


def generate_ticket_id(db: Session) -> str:
    from model import Ticket

    last_ticket = (
        db.query(Ticket)
        .order_by(Ticket.id.desc())
        .first()
    )

    if not last_ticket:
        return "TKT-001"

    last_number = int(last_ticket.ticket_id.split("-")[1])
    new_number = last_number + 1
    return f"TKT-{new_number:03d}"