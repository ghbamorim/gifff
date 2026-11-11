import asyncio
import os

import boto3

from app.core.database import SessionLocal
from app.schemas.user import UserCreate
from app.services.user import UserService

ADMIN_EMAIL = "ghnerique@gmail.com"
SECRET_NAME = "gifff/initial-user-password"


async def seed():
    client = boto3.client(
        "secretsmanager",
        region_name=os.getenv("AWS_REGION", "us-east-2"),
    )

    password = client.get_secret_value(SecretId=SECRET_NAME)["SecretString"]

    async with SessionLocal() as db, db.begin():
        user = await UserService.get_user_by_email(db, ADMIN_EMAIL)
        if user is not None:
            return
        data = UserCreate(email=ADMIN_EMAIL, password=password, is_active=True)
        await UserService.create_user(db, data)

    print("Initial user created.")


if __name__ == "__main__":
    asyncio.run(seed())
