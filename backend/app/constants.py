# 1. The Addresses you just deployed
MOCK_MNEE_ADDRESS = "0xC24Ca92955eE1Fe6975689F84D261Ee873C5B909"
TELEO_ESCROW_ADDRESS = "0x57e9Bd08Af827AE3D19CBDa714114EbCFcA6f35c"

# 2. The Minimal ABI (Only the functions our Backend needs to call)
TELEO_ESCROW_ABI = [
    {
        "inputs": [{"name": "_jobId", "type": "uint256"}],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "_jobId", "type": "uint256"}],
        "name": "refundClient",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "id", "type": "uint256"}],
        "name": "jobs",
        "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "client", "type": "address"},
            {"name": "freelancer", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "description", "type": "string"},
            {"name": "isSettled", "type": "bool"},
            {"name": "isApproved", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

GOD_USERS = [
    {"id": 1, "name": "Neeraj Srivastava", "address": "0x1111111111111111111111111111111111111111", "avatar": "👨🏽‍💻"},
    {"id": 2, "name": "Florent Thevenin",  "address": "0x2222222222222222222222222222222222222222", "avatar": "👨🏻‍🎨"},
    {"id": 3, "name": "Soheil Ahmadi",     "address": "0x3333333333333333333333333333333333333333", "avatar": "🧔🏻‍♂️"},
    {"id": 4, "name": "Samir Azizi",       "address": "0x4444444444444444444444444444444444444444", "avatar": "👨🏾‍💼"},
    {"id": 5, "name": "Owolabi Adeniran",  "address": "0x5555555555555555555555555555555555555555", "avatar": "👨🏿‍💻"}
]