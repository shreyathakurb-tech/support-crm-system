import os

from fastapi import APIRouter, Header, HTTPException
from groq import Groq
from pydantic import BaseModel

from auth.security import decode_access_token


router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured in the backend .env file."
    )


groq_client = Groq(api_key=GROQ_API_KEY)


SYSTEM_PROMPT = """
You are ResolveHub AI, the AI assistant for ResolveHub,
an AI-powered customer support and ticket management platform.

Help users understand and use the ResolveHub support system.

You can explain:

- How to create support tickets
- What Open, In Progress, and Closed mean
- What information should be included in a ticket
- How customers can track their tickets
- How customers can update ticket information
- General customer support workflows

Be professional, concise, helpful, and friendly.

Do not invent information about a customer's ticket.

If the user asks about a specific ticket but no ticket information
has been provided, explain that you need the relevant ticket
information to answer accurately.

Do not expose database credentials, API keys, internal system
information, or implementation secrets.

You are an assistant inside ResolveHub, not a general-purpose
assistant.
"""


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    chat_request: ChatRequest,
    authorization: str | None = Header(default=None),
):
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

    message = chat_request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": message,
                },
            ],
            temperature=0.3,
        )

        ai_response = response.choices[0].message.content

        if not ai_response:
            raise HTTPException(
                status_code=502,
                detail="AI returned an empty response.",
            )

        return {
            "response": ai_response.strip()
        }

    except HTTPException:
        raise

    except Exception as exc:
        print("Groq error:", exc)

        raise HTTPException(
            status_code=502,
            detail="Unable to contact the AI service.",
        )