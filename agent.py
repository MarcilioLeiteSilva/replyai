import os
import json
import time
from datetime import datetime

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ==============================
# CONFIGURAÇÕES
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TOKEN_FILE = os.path.join(BASE_DIR, "token.json")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")
RESPONDED_FILE = os.path.join(BASE_DIR, "responded.json")

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

MAX_RESPONSES = 5


# ==============================
# UTILIDADES
# ==============================

def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ==============================
# YOUTUBE SERVICE
# ==============================

def get_youtube_service():
    if not os.path.exists(TOKEN_FILE):
        raise RuntimeError("❌ Token não encontrado. Autentique primeiro.")

    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return build("youtube", "v3", credentials=creds)


def get_channel_id(youtube):
    response = youtube.channels().list(
        part="id",
        mine=True
    ).execute()

    return response["items"][0]["id"]


def get_videos(youtube, channel_id, max_videos=5):
    response = youtube.search().list(
        part="id",
        channelId=channel_id,
        maxResults=max_videos,
        order="date",
        type="video"
    ).execute()

    return [item["id"]["videoId"] for item in response["items"]]


def get_comments(youtube, video_id):
    return youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=20,
        textFormat="plainText"
    ).execute()


def reply_comment(youtube, comment_id, text):
    youtube.comments().insert(
        part="snippet",
        body={
            "snippet": {
                "parentId": comment_id,
                "textOriginal": text
            }
        }
    ).execute()


# ==============================
# AGENTE PRINCIPAL
# ==============================

def run_agent():
    print("🤖 Agente iniciado...")

    try:
        youtube = get_youtube_service()

        responded = load_json(RESPONDED_FILE, [])
        history = load_json(HISTORY_FILE, [])

        responses_count = 0

        channel_id = get_channel_id(youtube)
        video_ids = get_videos(youtube, channel_id)

        # Importa IA SOMENTE aqui (evita erro circular)
        from ai.classifier import classify_comment
        from ai.responder import generate_reply

        for video_id in video_ids:
            comments_data = get_comments(youtube, video_id)

            for item in comments_data.get("items", []):
                if responses_count >= MAX_RESPONSES:
                    print("⚠️ Limite de respostas atingido.")
                    break

                comment_id = item["id"]
                snippet = item["snippet"]["topLevelComment"]["snippet"]
                text = snippet["textDisplay"]
                author = snippet.get("authorDisplayName", "Desconhecido")

                if comment_id in responded:
                    continue

                category = classify_comment(text)
                response_text = generate_reply(text, category)

                if not response_text:
                    continue

                reply_comment(youtube, comment_id, response_text)

                responded.append(comment_id)
                responses_count += 1

                history.append({
                    "comment": text,
                    "response": response_text,
                    "category": category,
                    "author": author,
                    "video_id": video_id,
                    "date": datetime.now().isoformat()
                })

                print(f"✅ Respondido ({responses_count}/{MAX_RESPONSES}): {text}")

                time.sleep(2)  # evita rate limit

        save_json(RESPONDED_FILE, responded)
        save_json(HISTORY_FILE, history)

    except HttpError as e:
        print("Erro YouTube API:", e)

    except Exception as e:
        print("Erro geral do agente:", e)

    print("🏁 Agente finalizado.")
