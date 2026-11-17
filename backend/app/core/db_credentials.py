import asyncio
import json

import boto3

from app.core.settings import settings


class DatabaseCredentials:
    def __init__(self) -> None:
        self._password: str | None = None
        self._lock = asyncio.Lock()

    async def get_password(self) -> str:
        if settings.postgres_password is not None:
            return settings.postgres_password.get_secret_value()

        async with self._lock:
            if self._password is None:
                self._password = await asyncio.to_thread(self._load_from_aws)

            return self._password

    async def invalidate(self, failed_password: str) -> None:
        async with self._lock:
            if self._password == failed_password:
                self._password = None

    def _load_from_aws(self) -> str:
        if not settings.aws_db_secret_arn:
            raise RuntimeError("AWS_DB_SECRET_ARN is not configured")

        client = boto3.client("secretsmanager")

        response = client.get_secret_value(
            SecretId=settings.aws_db_secret_arn,
            VersionStage="AWSCURRENT",
        )

        secret = json.loads(response["SecretString"])
        return secret["password"]


db_credentials = DatabaseCredentials()
