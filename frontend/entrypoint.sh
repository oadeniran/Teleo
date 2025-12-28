#!/bin/sh

# 1. Recreate the public/env.js file
# We use the 'public' directory because Next.js serves static files from there.
echo "window.env = {" > ./public/env.js

# 2. Append variables
# We intentionally explicitly list them for security (so we don't leak server secrets)
echo "  NEXT_PUBLIC_API_URL: \"$NEXT_PUBLIC_API_URL\"," >> ./public/env.js
echo "  NEXT_PUBLIC_AGENT_ID_ROUTER: \"$NEXT_PUBLIC_AGENT_ID_ROUTER\"," >> ./public/env.js
echo "  NEXT_PUBLIC_AGENT_ID_DEBATER: \"$NEXT_PUBLIC_AGENT_ID_DEBATER\"," >> ./public/env.js
echo "  NEXT_PUBLIC_AGENT_ID_COACH: \"$NEXT_PUBLIC_AGENT_ID_COACH\"," >> ./public/env.js

echo "};" >> ./public/env.js

# 3. Start the Next.js App
# "exec" ensures the process signal handling works correctly
echo "Starting Next.js..."
exec npm start