#!/bin/bash

set -e

# Load development environment variables into this shell
set -a
source backend/.env
set +a

docker compose \
  --env-file backend/.env \
  -p gifff-dev \
  -f compose.yaml \
  -f compose.dev.yaml \
  up -d --wait

cd backend

source .venv/Scripts/activate

alembic upgrade head

uvicorn app.main:app --reload --port 8001