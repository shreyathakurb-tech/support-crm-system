from datetime import datetime
from typing import List, Literal, Optional

import re

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


TicketStatus = Literal["Open", "In Progress", "Closed"]


class TicketCreate(BaseModel): 
    customer_name: str = Field(..., min_length=2, max_length=100) 
    customer_email: EmailStr 
    subject: str = Field(..., min_length=3, max_length=200) 
    description: str = Field(..., min_length=10)

    @field_validator("customer_email")
    @classmethod
    def validate_email_domain(cls, value):
        email = str(value).lower()

        if not email.endswith("@gmail.com"):
            raise ValueError("Please enter a valid Gmail address.")

        return value


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

def validate_email_format(value: str) -> str:
    value = str(value).strip().lower()

    pattern = r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$"

    if not re.fullmatch(pattern, value):
        raise ValueError(
            "Please enter a valid email address, such as name@example.com."
        )

    return value


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        return validate_email_format(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        return validate_email_format(value)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str
    role: str