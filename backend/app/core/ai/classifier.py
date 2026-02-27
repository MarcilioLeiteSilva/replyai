from openai import OpenAI

ALLOWED_CATEGORIES = {
    "elogio", "duvida", "critica", "discordancia",
    "ofensa", "spam", "neutro", "pedido_de_conteudo"
}


def classify_comment(comment: str, language: str = "pt-BR") -> str:
    client = OpenAI()
    prompt = f"""Você é um classificador de comentários para redes sociais.

Classifique o comentário abaixo em UMA das categorias:
elogio, duvida, critica, discordancia, ofensa, spam, neutro, pedido_de_conteudo

Responda APENAS com o nome da categoria em minúsculas, sem pontuação.

Comentário:
"{comment}"
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=20,
        )
        category = response.choices[0].message.content.strip().lower()
        return category if category in ALLOWED_CATEGORIES else "neutro"
    except Exception:
        return "neutro"
