from collections.abc import AsyncGenerator
from typing import Annotated

from app.core.settings import settings
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)

SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]
