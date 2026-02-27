from ai.responder import generate_reply

tests = [
    ("Esse vídeo ficou incrível!", "elogio"),
    ("Não concordo com isso.", "discordancia"),
    ("Qual versículo fala sobre isso?", "duvida"),
    ("Confira meu canal!", "spam")
]

print("\n✍️ TESTE DO RESPONDER\n")

for text, category in tests:
    reply = generate_reply(text, category)
    print(f"Comentário: {text}")
    print(f"Categoria: {category}")
    print(f"Resposta: {reply}")
    print("-" * 40)
