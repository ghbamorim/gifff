#!/bin/bash

set -e

docker compose \
  --env-file .env.prod \
  -p gifff-prod \
  -f compose.yaml \
  -f compose.prod.yaml \
  up -d