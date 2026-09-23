#!/bin/bash

set -e

echo "WARNING: This will DELETE all data from the development database."
read -p "Continue? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Cancelled."
    exit 0
fi

# Production variables
PROD_USER=$(grep '^POSTGRES_USER=' .env.prod | cut -d '=' -f2-)
PROD_DB=$(grep '^POSTGRES_DB=' .env.prod | cut -d '=' -f2-)

# Development variables
DEV_USER=$(grep '^POSTGRES_USER=' backend/.env | cut -d '=' -f2-)
DEV_DB=$(grep '^POSTGRES_DB=' backend/.env | cut -d '=' -f2-)

echo "Production:  $PROD_DB"
echo "Development: $DEV_DB"

docker compose \
  --env-file .env.prod \
  -p gifff-prod \
  -f compose.yaml \
  -f compose.prod.yaml \
  exec -T postgres \
  pg_dump \
    -U "$PROD_USER" \
    -d "$PROD_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
| docker compose \
    --env-file backend/.env \
    -p gifff-dev \
    -f compose.yaml \
    -f compose.dev.yaml \
    exec -T postgres \
    psql \
      -U "$DEV_USER" \
      -d "$DEV_DB"

echo "Development database successfully synchronized."