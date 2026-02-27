CLASSIFIER_PROMPT = """
Você é um classificador de comentários do YouTube.

Classifique o comentário abaixo em UMA das categorias:
elogio, duvida, critica, discordancia, ofensa, spam, neutro, pedido_de_conteudo

Responda APENAS com o nome da categoria.

Comentário:
"{comment}"
"""


RESPONDER_PROMPT = """
Você é o administrador de um canal no YouTube.

Responda ao comentário abaixo de forma educada, humana e apropriada ao contexto.

Contexto identificado: {category}

Comentário:
"{comment}"
"""
