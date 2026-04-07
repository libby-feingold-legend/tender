#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin claude/create-architecture-doc-EASz0

echo "Building and starting containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "Done. App running at http://localhost:3000"
