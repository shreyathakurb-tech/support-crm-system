from datetime import datetime, timedelta

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


def india_time():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)

    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    status = Column(
        String,
        default="Open",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=india_time,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=india_time,
        onupdate=india_time,
        nullable=False,
    )

    notes = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Open', 'In Progress', 'Closed')",
            name="valid_ticket_status",
        ),
    )


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(
        String,
        ForeignKey("tickets.ticket_id"),
        nullable=False,
        index=True,
    )

    note_text = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=india_time,
        nullable=False,
    )

    ticket = relationship(
        "Ticket",
        back_populates="notes",
    )