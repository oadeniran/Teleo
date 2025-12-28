from motor.motor_asyncio import AsyncIOMotorClient
from init_env import MONGO_URI

DB_NAME = "teleo_db"
class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    """Call this on startup"""
    db.client = AsyncIOMotorClient(MONGO_URI)
    db.db = db.client[DB_NAME]
    print(f"🔥 Connected to MongoDB: {DB_NAME}")

    # Create a unique index on chain_job_id to prevent duplicates
    await db.db.jobs.create_index("chain_job_id", unique=True)

async def close_mongo_connection():
    """Call this on shutdown"""
    if db.client:
        db.client.close()
        print("💤 Disconnected from MongoDB")

# Helper to get the database instance directly
def get_database():
    return db.db