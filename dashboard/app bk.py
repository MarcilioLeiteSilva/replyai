from flask import Flask, render_template, jsonify
import subprocess
import threading
import os
import json
import sys


# 🔹 Adiciona raiz do projeto ao sys.path para importar agent.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from agent import run_agent, TOKEN_FILE  # import do agente

app = Flask(__name__)


# 🔹 Arquivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_FILE = os.path.join(BASE_DIR, "token.pkl")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")
OAUTH_FILE = os.path.join(BASE_DIR, "run_oauth.py")

# 🔹 Thread do agente
agent_thread = None

def start_agent():
    import agent
    agent.run_agent()

# 🔹 Página principal
@app.route("/")
def index():
    authenticated = os.path.exists(TOKEN_FILE)
    return render_template("index.html", authenticated=authenticated)

# 🔹 Botão Autenticar
@app.route("/authenticate", methods=["POST"])
def authenticate():
    if not os.path.exists(OAUTH_FILE):
        return jsonify({"status": "oauth_file_missing"})
    
    def oauth_thread():
        subprocess.run(["python", OAUTH_FILE])
    threading.Thread(target=oauth_thread).start()
    
    return jsonify({"status": "oauth_started"})

# 🔹 Botão Iniciar Agente
@app.route("/run", methods=["POST"])
def run_agent_route():
    if not os.path.exists(TOKEN_FILE):
        return jsonify({"status": "no_token"})
    
    global agent_thread
    if agent_thread is None or not agent_thread.is_alive():
        agent_thread = threading.Thread(target=start_agent)
        agent_thread.start()
        return jsonify({"status": "agent_started"})
    
    return jsonify({"status": "agent_already_running"})

# 🔹 Histórico de comentários/respostas
@app.route("/history")
def get_history():
    if not os.path.exists(HISTORY_FILE):
        return jsonify([])
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

# 🔹 Status do painel
@app.route("/status")
def status():
    authenticated = os.path.exists(TOKEN_FILE)
    running = agent_thread.is_alive() if agent_thread else False
    return jsonify({
        "authenticated": authenticated,
        "running": running
    })

# 🔹 Rodar app
if __name__ == "__main__":
    # ⚠️ use_reloader=False previne o WinError 10038 no Windows
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
