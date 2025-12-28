import os
from dotenv import load_dotenv
load_dotenv()

RPC_URL = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY = os.getenv("JUDGE_PRIVATE_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")