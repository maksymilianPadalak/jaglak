#!/bin/bash
# Start script for Render deployment
# Finds and runs server.js regardless of Render's path quirks

# Try multiple possible locations
if [ -f "dist/server.js" ]; then
  echo "Starting from current directory: dist/server.js"
  node dist/server.js
elif [ -f "apps/server/dist/server.js" ]; then
  echo "Starting from repo root: apps/server/dist/server.js"
  node apps/server/dist/server.js
elif [ -f "../apps/server/dist/server.js" ]; then
  echo "Starting from parent: ../apps/server/dist/server.js"
  node ../apps/server/dist/server.js
else
  echo "ERROR: Cannot find server.js"
  echo "Current directory: $(pwd)"
  echo "Searching for server.js..."
  find . -name "server.js" -type f 2>/dev/null | head -5
  exit 1
fi

