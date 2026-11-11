from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.settings import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,
    echo_pool="debug",
)

SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

print(f"POOL: {engine.pool.status()}", flush=True)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session
    print(f"POOL: {engine.pool.status()}", flush=True)


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]
