#!/bin/sh

# 1. Start the file
echo "window.env = {" > ./public/env.js

# 2. Append YOUR ACTUAL TELEO VARIABLES
echo "  NEXT_PUBLIC_API_URL: \"$NEXT_PUBLIC_API_URL\"," >> ./public/env.js

echo "  NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_MAINNET: \"$NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_MAINNET\"," >> ./public/env.js
echo "  NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_SEPOLIA: \"$NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_SEPOLIA\"," >> ./public/env.js

echo "  NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET: \"$NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET\"," >> ./public/env.js
echo "  NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA: \"$NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA\"," >> ./public/env.js

echo "  NEXT_PUBLIC_SEPOLIA_RPC: \"$NEXT_PUBLIC_SEPOLIA_RPC\"," >> ./public/env.js
echo "  NEXT_PUBLIC_MAINNET_RPC: \"$NEXT_PUBLIC_MAINNET_RPC\"," >> ./public/env.js

# 3. Close the object
echo "};" >> ./public/env.js

# Start the App
echo "Starting Next.js..."
exec npm start