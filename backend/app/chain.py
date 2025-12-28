import json
from web3 import Web3
from app.constants import TELEO_ESCROW_ADDRESS, TELEO_ESCROW_ABI
from init_env import RPC_URL, PRIVATE_KEY

if not RPC_URL or not PRIVATE_KEY:
    raise ValueError("Missing SEPOLIA_RPC_URL or JUDGE_PRIVATE_KEY in .env")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

# 2. Setup the Contract
contract = w3.eth.contract(address=TELEO_ESCROW_ADDRESS, abi=TELEO_ESCROW_ABI)

def get_job_details(job_id: int):
    """Reads job data from the blockchain to verify it exists."""
    try:
        job = contract.functions.jobs(job_id).call()
        # Return a nice dict
        return {
            "id": job[0],
            "client": job[1],
            "freelancer": job[2],
            "amount": w3.from_wei(job[3], 'ether'), # Convert Wei to MNEE
            "description": job[4],
            "is_settled": job[5],
            "is_approved": job[6]
        }
    except Exception as e:
        print(f"Error fetching job: {e}")
        return None

def release_payment(job_id: int):
    """The AI calls this to release money."""
    # 1. Ensure we get the key correctly
    if not PRIVATE_KEY:
        raise Exception("CRITICAL: PRIVATE_KEY not found in env vars!")

    account = w3.eth.account.from_key(PRIVATE_KEY)
    
    # --- DEBUGGING BLOCK START ---
    print(f"\n DEBUGGING PAYMENT TRANSACTION:")
    print(f"   ▶ Network: {w3.eth.chain_id} (Should be 11155111 for Sepolia)")
    print(f"   ▶ Signer: {account.address}")
    
    balance_wei = w3.eth.get_balance(account.address)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    print(f"   ▶ Balance: {balance_eth} ETH")
    
    if balance_wei == 0:
        raise Exception(f"⛔ WALLET IS EMPTY! Address {account.address} has 0 ETH.")
    # --- DEBUGGING BLOCK END ---

    # 2. Build Transaction
    # Note: We ensure job_id is an INT for the contract
    tx = contract.functions.releaseFunds(int(job_id)).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 200000,
        'gasPrice': int(w3.eth.gas_price * 1.2) # Boost gas by 20%
    })
    
    # 3. Sign & Send
    print("   ▶ Sending Transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    print(f"   ✅ Sent! Hash: {tx_hash.hex()}")
    
    # 4. Wait for Receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt.transactionHash.hex()