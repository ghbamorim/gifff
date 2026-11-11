import logging
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import QueuePool

from app.core.pool_monitor import PoolMonitor
from app.core.settings import settings

logger = logging.getLogger("uvicorn.error")

engine = create_async_engine(
    settings.database_url,
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
