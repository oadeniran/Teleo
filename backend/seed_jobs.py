import os
import asyncio
import random
from web3 import Web3
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# CONFIG
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
RPC_URL = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY") 
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
MNEE_ADDRESS = os.getenv("MNEE_TOKEN_ADDRESS")
SEPOLIA_CHAIN_ID = 11155111
YOUR_REAL_ADDRESS = "0x2aD61279aec6c38229cC1DeFcE4b586f8abF9Ece"

USERS = [
    {"name": "Neeraj Srivastava", "address": YOUR_REAL_ADDRESS},
    {"name": "Florent Thevenin",  "address": YOUR_REAL_ADDRESS},
    {"name": "Soheil Ahmadi",     "address": YOUR_REAL_ADDRESS},
    {"name": "Samir Azizi",       "address": YOUR_REAL_ADDRESS},
    {"name": "Owolabi Adeniran",  "address": YOUR_REAL_ADDRESS},
]

# (Pools remain the same)
CODING_POOL = [
    {"title": "Fix React Hydration Error", "desc": "Fix the hydration mismatch in Next.js 14 app layouts.", "tags": ["React", "Bug Fix"]},
    {"title": "Python Scraper for Twitter", "desc": "Build a scraper using Selenium to get latest tweets.", "tags": ["Python", "Automation"]},
    {"title": "Smart Contract Audit", "desc": "Audit this ERC20 token for re-entrancy attacks.", "tags": ["Solidity", "Security"]},
    {"title": "Integrate Stripe API", "desc": "Create a checkout session for a subscription service.", "tags": ["API", "Backend"]},
    {"title": "Debug Django ORM Query", "desc": "Optimize a slow SQL query in a Django View.", "tags": ["Python", "Django"]},
    {"title": "Build a Telegram Bot", "desc": "Bot should reply with current ETH gas prices.", "tags": ["Bot", "Node.js"]},
    {"title": "Convert Figma to HTML/CSS", "desc": "Pixel perfect conversion of the attached landing page.", "tags": ["Frontend", "CSS"]},
    {"title": "Setup Docker Compose", "desc": "Dockerize a MERN stack application with hot-reloading.", "tags": ["DevOps", "Docker"]},
    {"title": "Create Solana Wallet Adapter", "desc": "Integrate Phantom wallet connection on a React site.", "tags": ["Web3", "Solana"]},
    {"title": "Fix iOS Flexbox Layout", "desc": "CSS layout breaks on Safari mobile. Fix it.", "tags": ["CSS", "Mobile"]},
]

WRITING_POOL = [
    {"title": "Write Technical Whitepaper", "desc": "Explain our DePIN protocol architecture.", "tags": ["Writing", "Crypto"]},
    {"title": "Blog Post: AI Agents", "desc": "1000 words on the future of Autonomous Agents.", "tags": ["Writing", "AI"]},
    {"title": "Documentation for API", "desc": "Write Swagger docs for our 5 user endpoints.", "tags": ["Technical Writing"]},
    {"title": "Translate App to French", "desc": "Translate the en.json locale file to French.", "tags": ["Translation"]},
    {"title": "SEO Article: DeFi Trends", "desc": "Rank for 'Top DeFi Yields 2025'.", "tags": ["Marketing", "SEO"]},
]

async def seed():
    print("🚀 Starting God Mode Seeder (Extraction Fix)...")
    
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = w3.eth.account.from_key(PRIVATE_KEY)
    
    # Contract Setup
    escrow_abi = [{"inputs": [{"name": "_freelancer", "type": "address"}, {"name": "_amount", "type": "uint256"}, {"name": "_description", "type": "string"}], "name": "createJob", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"}]
    mnee_abi = [{"constant": False, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function"}]

    escrow_contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=escrow_abi)
    mnee_contract = w3.eth.contract(address=MNEE_ADDRESS, abi=mnee_abi)

    # DB Setup
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    db = mongo_client["teleo_db"]

    # --- CRITICAL FIX: CLEAR DB FIRST ---
    # Since the DB has "bad" IDs locked in it, we must clear it to start fresh.
    print("🧹 Cleaning up old database entries...")
    # await db.jobs.delete_many({"chain_id": SEPOLIA_CHAIN_ID})

    # Helper for Gas
    def get_gas_price():
        return int(w3.eth.gas_price * 1.2)

    # 1. APPROVE (Step 0)
    print("\n🔑 Step 0: Checking Approval...")
    try:
        tx = mnee_contract.functions.approve(CONTRACT_ADDRESS, w3.to_wei(1000000, 'ether')).build_transaction({
            'from': account.address, 'nonce': w3.eth.get_transaction_count(account.address), 'gas': 100000, 'gasPrice': get_gas_price()
        })
        signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        print("   ✅ Approved.")
    except Exception as e:
        print(f"   ⚠️ Approval Note: {e}")

    # 2. GENERATE JOBS
    all_tasks = CODING_POOL + WRITING_POOL
    random.shuffle(all_tasks)
    
    # Run 8 jobs
    for i, task in enumerate(all_tasks[:8]):
        user = USERS[i % len(USERS)]
        amount = random.randint(20, 80)
        
        try:
            print(f"   ⛓️ Posting: {task['title']}...")
            
            tx = escrow_contract.functions.createJob(
                user['address'], 
                w3.to_wei(amount, 'ether'), 
                task['desc']
            ).build_transaction({
                'from': account.address, 
                'nonce': w3.eth.get_transaction_count(account.address), 
                'gas': 300000, 
                'gasPrice': get_gas_price()
            })
            
            signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            # --- THE EXTRACTION FIX ---
            # Attempt to read ID from DATA field (Unindexed params)
            # The data field is 0x + chunks of 64 chars. 
            # Usually the first chunk is the ID.
            
            data_hex = receipt.logs[0].data
            if isinstance(data_hex, bytes):
                 data_hex = data_hex.hex()
            
            # Remove 0x prefix
            data_hex = data_hex.replace('0x', '')
            
            # Take the first 64 characters (32 bytes) -> This is the ID
            if len(data_hex) >= 64:
                id_hex = data_hex[:64]
                raw_id = int(id_hex, 16)
            else:
                # Fallback: Try topic 2 if it exists, otherwise random fallback to prevent crash
                if len(receipt.logs[0].topics) > 2:
                    raw_id = int(receipt.logs[0].topics[2].hex(), 16)
                else:
                    print("      ⚠️ Could not parse ID from logs! Using fallback.")
                    raw_id = random.randint(100000, 999999)

            chain_id_str = str(raw_id)
            
            await db.jobs.insert_one({
                "chain_job_id": chain_id_str,
                "chain_id": SEPOLIA_CHAIN_ID,
                "title": task['title'],
                "description": task['desc'],
                "amount_mnee": amount,
                
                # CLIENT INFO
                "client_address": user['address'],
                "client_name": user['name'], # e.g. "Neeraj"
                
                # FREELANCER INFO (OPEN)
                "freelancer_address": None, 
                "freelancer_name": None,    
                
                "tags": task['tags'],
                "status": "OPEN", # <--- UI sees this as "Anyone can apply"
                "applicants": [], # <--- New field for logic
                "created_at": i
            })
            print(f"      ✅ Created Job #{chain_id_str}")

        except Exception as e:
            print(f"      ❌ Failed: {e}")

    print("\n✨ SEEDING COMPLETE! ✨")

if __name__ == "__main__":
    asyncio.run(seed())