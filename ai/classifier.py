from openai import OpenAI
from ai.prompts import CLASSIFIER_PROMPT

client = OpenAI()

def classify_comment(comment: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "user", "content": CLASSIFIER_PROMPT.format(comment=comment)}
        ],
        temperature=0
    )

    category = response.choices[0].message.content.strip().lower()

    allowed = {
        "elogio", "duvida", "critica", "discordancia",
        "ofensa", "spam", "neutro", "pedido_de_conteudo"
    }

    return category if category in allowed else "neutro"
