from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


TicketStatus = Literal["Open", "In Progress", "Closed"]


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    notes: Optional[str] = Field(None, min_length=1)


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime