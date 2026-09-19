import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from database import get_db
from model import User
from schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email.lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
        role="customer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        new_user.id,
        new_user.email,
        new_user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
    }


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email.lower())
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        user.id,
        user.email,
        user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@router.post("/create-admin")
def create_admin(
    db: Session = Depends(get_db),
):
    admin_email = os.getenv(
        "ADMIN_EMAIL",
        "admin@resolvehub.com",
    ).lower()

    admin_password = os.getenv(
        "ADMIN_PASSWORD",
        "Admin@12345",
    )

    existing_admin = (
        db.query(User)
        .filter(User.email == admin_email)
        .first()
    )

    if existing_admin:
        return {
            "message": "Admin account already exists."
        }

    admin = User(
        name="ResolveHub Admin",
        email=admin_email,
        password_hash=hash_password(admin_password),
        role="admin",
    )

    db.add(admin)
    db.commit()

    return {
        "message": "Admin account created successfully."
    }