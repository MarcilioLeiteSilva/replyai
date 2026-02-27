import os
import json
import threading
import time
import subprocess
from flask import Flask, jsonify, render_template
from googleapiclient.discovery import build
import pickle
import config  # arquivo externo com CHANNEL_ID, MAX_RESPONSES

app = Flask(__name__)

# ------------------------
# Estado do agente
# ------------------------
AGENT_RUNNING = False
agent_thread = None
responded_count = 0
history_file = "history.json"

youtube = None  # Inicializado após carregar token

# ------------------------
# Funções utilitárias
# ------------------------
def load_history():
    if not os.path.exists(history_file):
        return []
    with open(history_file, "r", encoding="utf-8") as f:
        return json.load(f)

def save_history(data):
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ------------------------
# Agente
# ------------------------
def run_agent():
    global AGENT_RUNNING, responded_count, youtube

    if youtube is None:
        print("❌ YouTube não autenticado!")
        AGENT_RUNNING = False
        return

    AGENT_RUNNING = True
    responded_count = 0

    while AGENT_RUNNING and responded_count < config.MAX_RESPONSES:
        try:
            request = youtube.commentThreads().list(
                part="snippet",
                allThreadsRelatedToChannelId=config.CHANNEL_ID,
                textFormat="plainText",
                maxResults=5
            )
            response = request.execute()
            items = response.get("items", [])

            for item in items:
                comment_id = item["id"]
                comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]

                history = load_history()
                if any(h["id"] == comment_id for h in history):
                    continue

                reply_text = "Obrigado pelo comentário! 😊"
                youtube.comments().insert(
                    part="snippet",
                    body={
                        "snippet": {
                            "parentId": comment_id,
                            "textOriginal": reply_text
                        }
                    }
                ).execute()

                history.append({
                    "id": comment_id,
                    "comment": comment_text,
                    "response": reply_text,
                    "time": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                save_history(history)
                responded_count += 1
                print(f"✅ Respondido ({responded_count}/{config.MAX_RESPONSES})")

            time.sleep(10)

        except Exception as e:
            print("❌ Erro no agente:", e)
            time.sleep(10)

    AGENT_RUNNING = False

# ------------------------
# Rotas Flask
# ------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/run", methods=["POST"])
def start_agent():
    global agent_thread, AGENT_RUNNING, youtube

    if AGENT_RUNNING:
        return jsonify({"status": "already_running"})

    # Se token não existe, tenta rodar OAuth externo (Windows safe)
    if not os.path.exists("token.pkl"):
        print("❌ Nenhum token encontrado. Abra run_oauth.py para autenticar.")
        # Opcional: descomente abaixo para tentar rodar processo externo
        # subprocess.run(["python", "run_oauth.py"])
        return jsonify({"status": "no_token"})

    # Carrega token existente
    with open("token.pkl", "rb") as f:
        creds = pickle.load(f)
    youtube = build("youtube", "v3", credentials=creds)

    # Inicia agente
    agent_thread = threading.Thread(target=run_agent, daemon=True)
    agent_thread.start()

    return jsonify({"status": "started"})

@app.route("/status")
def status():
    return jsonify({
        "running": AGENT_RUNNING,
        "responded": responded_count,
        "max": config.MAX_RESPONSES
    })

@app.route("/history")
def history():
    return jsonify(load_history())

# ------------------------
# Inicialização Flask
# ------------------------
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,           # ⚠️ previne problemas no Windows
        use_reloader=False     # ⚠️ previne WinError 10038
    )
