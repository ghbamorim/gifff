import logging
from collections.abc import AsyncGenerator
from typing import Annotated

import asyncpg
from fastapi import Depends
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import QueuePool

from app.core.db_credentials import db_credentials
from app.core.pool_monitor import PoolMonitor
from app.core.settings import settings

logger = logging.getLogger("uvicorn.error")


async def create_connection() -> asyncpg.Connection:
    password = await db_credentials.get_password()

    try:
        return await connect(password)
    except asyncpg.InvalidPasswordError:
        if settings.postgres_password is not None:
            raise

        logger.warning("DB_AUTH_FAILED: refreshing database credentials")

        await db_credentials.invalidate(password)

        new_password = await db_credentials.get_password()

        connection = await connect(new_password)

        logger.info("DB_AUTH_RECOVERED: database credentials refreshed")

        return connection


async def connect(password: str) -> asyncpg.Connection:
    return await asyncpg.connect(
        host=settings.postgres_host,
        port=settings.postgres_port,
        user=settings.postgres_user,
        password=password,
        database=settings.postgres_db,
    )


engine = create_async_engine(
    settings.database_url,
    async_creator=create_connection,
    echo=settings.database_echo,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_pool_max_overflow,
    pool_pre_ping=settings.database_pool_pre_ping,
    echo_pool=settings.database_echo_pool,
)

pool = engine.sync_engine.pool
assert isinstance(pool, QueuePool)

monitor = PoolMonitor(pool, max_overflow=settings.database_pool_max_overflow)

event.listen(pool, "checkout", monitor.check)
event.listen(pool, "checkin", monitor.check)
event.listen(pool, "close", monitor.check)
logger.warning("DB_POOL_MONITOR_REGISTERED")

SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

print(f"POOL: {engine.pool.status()}", flush=True)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session
    print(f"POOL: {engine.pool.status()}", flush=True)


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]
