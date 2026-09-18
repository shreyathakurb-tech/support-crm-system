from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes.tickets import router as tickets_router

# Import models so SQLAlchemy knows which tables to create.
import model


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Support CRM API",
    description="Customer support ticketing CRM backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets_router)


@app.get("/")
def health_check():
    return {
        "message": "Support CRM API is running",
    }