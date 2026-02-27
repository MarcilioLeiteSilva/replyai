from flask import Blueprint, render_template, jsonify
import subprocess
import json
import os

routes = Blueprint("routes", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENT_PATH = os.path.join(BASE_DIR, "main.py")
RESPONDED_FILE = os.path.join(BASE_DIR, "data", "responded.json")

@routes.route("/")
def index():
    return render_template("index.html")

@routes.route("/status")
def status():
    total_responses = 0

    if os.path.exists(RESPONDED_FILE):
        with open(RESPONDED_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            total_responses = len(data)

    return jsonify({
        "status": "OK",
        "responses_today": total_responses
    })

@routes.route("/history")
def history():
    if not os.path.exists(RESPONDED_FILE):
        return jsonify([])

    with open(RESPONDED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    history_list = []

    for comment_id, info in data.items():
        history_list.append({
            "comment_id": comment_id,
            "comment": info.get("comment", ""),
            "response": info.get("response", ""),
            "video_id": info.get("video_id", ""),
            "timestamp": info.get("timestamp", "")
        })

    # mais recentes primeiro
    history_list.reverse()

    return jsonify(history_list)



@routes.route("/run", methods=["POST"])
def run_agent():
    try:
        subprocess.Popen(["python", AGENT_PATH])
        return jsonify({"message": "Agente iniciado com sucesso"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
