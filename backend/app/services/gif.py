from typing import Literal

from app.models.gif import Gif
from app.schemas.gif import GifCreate
from fastapi import HTTPException, status
from sqlalchemy import asc, desc, exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer


class GifService:
    @staticmethod
    async def create_gif(data: GifCreate, db: AsyncSession) -> Gif:
        gif = Gif(**data.model_dump())
        db.add(gif)
        await db.flush()
        return gif

    @staticmethod
    async def get_gifs(
        page: int, page_size: int, sort_order: Literal["asc", "desc"], db: AsyncSession
    ) -> tuple[list[Gif], int]:

        total = await db.scalar(select(func.count()).select_from(Gif))

        order_func = asc if sort_order == "asc" else desc

        off_set = (page - 1) * page_size

        result = await db.scalars(
            select(Gif)
            .options(defer(Gif.data))
            .order_by(order_func(Gif.created_at), order_func(Gif.id))
            .offset(off_set)
            .limit(page_size)
        )

        return result.all(), total

    @staticmethod
    async def get_gif(gif_id: int, db: AsyncSession) -> Gif:
        gif = await db.get(Gif, gif_id)
        if gif is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Gif not found"
            )

        return gif

    @staticmethod
    async def gif_exists(gif_id: int, db: AsyncSession) -> bool:
        stmt = select(exists().where(Gif.id == gif_id))

        exist = await db.scalar(stmt)

        if not exist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Gif not found"
            )

        return True

    @staticmethod
    async def delete_gif(gif_id: int, db: AsyncSession) -> None:
        gif = await GifService.get_gif(gif_id, db)
        await db.delete(gif)
