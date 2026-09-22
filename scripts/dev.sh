#!/bin/bash

set -e

# Load development environment variables into this shell
set -a
source .env.dev
set +a

docker compose \
  --env-file .env.dev \
  -p gifff-dev \
  -f compose.yaml \
  -f compose.dev.yaml \
  up -d --wait

cd backend

source .venv/Scripts/activate

alembic upgrade head

uvicorn app.main:app --reload --port 8001