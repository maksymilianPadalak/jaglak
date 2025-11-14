#!/bin/bash
# Verify build output exists
if [ -f "dist/server.js" ]; then
  echo "✓ Build verified: dist/server.js exists"
  ls -la dist/server.js
  exit 0
else
  echo "✗ ERROR: dist/server.js not found!"
  echo "Current directory: $(pwd)"
  echo "Contents of current directory:"
  ls -la
  echo "Looking for server.js..."
  find . -name "server.js" -type f 2>/dev/null || echo "No server.js found"
  exit 1
fi

