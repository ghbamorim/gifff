#!/usr/bin/env bash
set -euo pipefail
umask 077

mkdir -p /opt/gifff

python3 - <<'PY'
import base64
import json
import os
import subprocess

payload = json.loads(base64.b64decode(os.environ["PAYLOAD_B64"]))
region = payload["region"]

def read_secret(secret_id):
    return subprocess.check_output(
        ["aws", "secretsmanager", "get-secret-value",
         "--region", region, "--secret-id", secret_id,
         "--query", "SecretString", "--output", "text"],
        text=True,
    ).strip()

rds = json.loads(read_secret(payload["rds_secret_arn"]))
datadog_key = read_secret("gifff/datadog/api-key")
if not datadog_key or datadog_key == "None":
    raise RuntimeError("Datadog API key is empty")

jwt_secret_key = read_secret("gifff/jwt-secret-key")
if not jwt_secret_key or jwt_secret_key == "None":
    raise RuntimeError("JWT secret key is empty")

values = {
    "APP_IMAGE": payload["image"],
    "APP_VERSION": payload["version"],
    "POSTGRES_USER": rds["username"],
    "POSTGRES_PASSWORD": rds["password"],
    "POSTGRES_DB": payload["db_name"],
    "POSTGRES_HOST": payload["db_host"],
    "POSTGRES_PORT": payload["db_port"],
    "DD_API_KEY": datadog_key,
    "JWT_SECRET_KEY": jwt_secret_key,
}

def quote_env(value):
    # Single-quoted Compose .env values do not interpolate '$'.
    return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"

root = "/opt/gifff"
with open(f"{root}/compose.yaml.tmp", "w", encoding="utf-8") as file:
    file.write(payload["compose"])
os.chmod(f"{root}/compose.yaml.tmp", 0o600)
os.replace(f"{root}/compose.yaml.tmp", f"{root}/compose.yaml")

with open(f"{root}/.env.tmp", "w", encoding="utf-8") as file:
    for key, value in values.items():
        file.write(f"{key}={quote_env(value)}\n")
os.chmod(f"{root}/.env.tmp", 0o600)
os.replace(f"{root}/.env.tmp", f"{root}/.env")

print("Compose configuration and environment created.")
PY

cd /opt/gifff
docker compose --env-file .env -p gifff config -q

REGION=$(python3 -c 'import json,base64,os; print(json.loads(base64.b64decode(os.environ["PAYLOAD_B64"]))["region"])')
REGISTRY=$(python3 -c 'import json,base64,os; print(json.loads(base64.b64decode(os.environ["PAYLOAD_B64"]))["registry"])')
APP_IMAGE=$(python3 -c 'import json,base64,os; print(json.loads(base64.b64decode(os.environ["PAYLOAD_B64"]))["image"])')

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker pull "$APP_IMAGE"

# Remove the legacy standalone container only when it is not Compose-managed.
if docker inspect gifff >/dev/null 2>&1; then
    PROJECT=$(docker inspect gifff --format '{{ index .Config.Labels "com.docker.compose.project" }}')
    if [ "$PROJECT" != "gifff" ]; then
        docker rm -f gifff
    fi
fi

docker compose --env-file .env -p gifff up -d --wait --wait-timeout 180 --remove-orphans
docker compose --env-file .env -p gifff ps

for service in gifff datadog-agent; do
    test "$(docker inspect "$service" --format '{{.State.Running}}')" = "true"
done

curl --fail --silent --show-error --max-time 15 http://127.0.0.1:80/ --output /dev/null
echo "Deployment completed successfully."
