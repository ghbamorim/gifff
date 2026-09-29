#!/bin/bash

set -e

echo "Running backend tests..."

cd backend
pytest
cd ..

echo "Building production image..."

docker compose \
  --env-file .env.prod \
  -p gifff-prod \
  -f compose.yaml \
  -f compose.prod.yaml \
  build