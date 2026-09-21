import json

from ai.client import client
from ai.query import SYSTEM_PROMPT, build_ticket_prompt


def analyze_ticket(
    customer_name: str,
    customer_email: str,
    subject: str,
    description: str,
):
    prompt = build_ticket_prompt(
        customer_name=customer_name,
        customer_email=customer_email,
        subject=subject,
        description=description,
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        response_format={
            "type": "json_object"
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("AI returned an empty response.")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "AI returned an invalid JSON response."
        ) from exc

    required_fields = [
        "category",
        "priority",
        "sentiment",
        "summary",
        "suggested_action",
        "suggested_response",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"AI response is missing required field: {field}"
            )

    return result