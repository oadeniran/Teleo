import os
from dotenv import load_dotenv
load_dotenv()
import requests
import json

RPC_URL = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY = os.getenv("JUDGE_PRIVATE_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
JSON_URL = os.getenv("JSON_URL")
GOOGLE_APP_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "creds.json")

# Download Google vertex Json
response = requests.get(JSON_URL)
if response.status_code == 200:
    os.makedirs(os.path.dirname(GOOGLE_APP_CREDENTIALS), exist_ok=True)
    with open(GOOGLE_APP_CREDENTIALS, "w") as file:
        json_f = response.json()
        json.dump(json_f, file)