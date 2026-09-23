from app.models.gif import Gif
from app.schemas.gif import GifCreate
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class GifService:
    @staticmethod
    async def create_gif(data: GifCreate, db: AsyncSession) -> Gif:
        gif = Gif(**data.model_dump())
        db.add(gif)
        await db.flush()
        return gif

    @staticmethod
    async def get_gifs(db: AsyncSession) -> list[Gif]:
        return (await db.scalars(select(Gif))).all()

    @staticmethod
    async def get_gif(gif_id: int, db: AsyncSession) -> Gif:
        gif = await db.get(Gif, gif_id)
        if gif is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Gif not found"
            )

        return gif

    @staticmethod
    async def delete_gif(gif_id: int, db: AsyncSession) -> None:
        gif = await GifService.get_gif(gif_id, db)
        await db.delete(gif)
