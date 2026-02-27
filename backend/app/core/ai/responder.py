from openai import OpenAI
from typing import Optional

client = OpenAI()

SKIP_CATEGORIES = {"spam", "ofensa"}


def generate_reply(
    comment: str,
    category: str,
    persona_name: str = "Assistente",
    tone: str = "casual",
    custom_prompt: Optional[str] = None,
    language: str = "pt-BR",
) -> Optional[str]:
    if category in SKIP_CATEGORIES:
        return None

    tone_descriptions = {
        "formal": "formal e profissional",
        "casual": "descontraído e amigável",
        "funny": "bem-humorado e engraçado",
        "empathetic": "empático e acolhedor",
        "professional": "profissional e direto ao ponto",
    }
    tone_desc = tone_descriptions.get(tone, "amigável")

    base_prompt = f"""Você é {persona_name}, responsável pela gestão de comentários nas redes sociais.
Responda ao comentário abaixo de forma {tone_desc}, em {language}.
Seja humano, conciso e genuíno. Máximo de 2-3 frases.
Contexto do comentário: {category}
"""
    if custom_prompt:
        base_prompt += f"\nInstruções adicionais: {custom_prompt}\n"

    base_prompt += f'\nComentário:\n"{comment}"'

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": base_prompt}],
            temperature=0.7,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None
