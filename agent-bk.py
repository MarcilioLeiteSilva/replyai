import os
import json
import time
from googleapiclient.discovery import build
import pickle
import config

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(BASE_DIR, "token.pkl")  # ou token.json se for o caso

history_file = "history.json"
MAX_RESPONSES = config.MAX_RESPONSES

def load_history():
    if not os.path.exists(history_file):
        return []
    with open(history_file, "r", encoding="utf-8") as f:
        return json.load(f)

def save_history(data):
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def run_agent():
    if not os.path.exists("token.pkl"):
        print("❌ Nenhum token encontrado. Rode run_oauth.py primeiro!")
        return

    with open("token.pkl", "rb") as f:
        creds = pickle.load(f)

    youtube = build("youtube", "v3", credentials=creds)
    responded_count = 0

    while responded_count < MAX_RESPONSES:
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
                print(f"✅ Respondido ({responded_count}/{MAX_RESPONSES})")

            time.sleep(10)
        except Exception as e:
            print("❌ Erro no agente:", e)
            time.sleep(10)

if __name__ == "__main__":
    run_agent()
