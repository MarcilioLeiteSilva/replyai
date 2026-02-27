from openai import OpenAI
from ai.prompts import RESPONDER_PROMPT

client = OpenAI()

def generate_reply(comment: str, category: str) -> str | None:
    if category in {"spam", "ofensa"}:
        return None  # trava de segurança

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "user", "content": RESPONDER_PROMPT.format(
                comment=comment,
                category=category
            )}
        ],
        temperature=0.6,
        max_tokens=120
    )

    return response.choices[0].message.content.strip()
