from ai.classifier import classify_comment

tests = [
    "Esse vídeo ficou incrível, parabéns!",
    "Não concordo com essa opinião.",
    "Qual versículo fala sobre isso?",
    "Isso é uma vergonha!",
    "Gostaria de um vídeo sobre esse tema.",
    "👍👍👍",
    "Confira meu canal no link abaixo!"
]

print("\n🔍 TESTE DO CLASSIFICADOR\n")

for text in tests:
    category = classify_comment(text)
    print(f"Comentário: {text}")
    print(f"Categoria: {category}")
    print("-" * 40)
