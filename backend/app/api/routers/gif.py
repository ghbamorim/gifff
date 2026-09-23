from typing import Annotated

from app.core.database import DbSession
from app.schemas.gif import GifCreate, GifResponse
from app.services.gif import GifService
from fastapi import APIRouter, File, Response, UploadFile, status

router = APIRouter(prefix="/gifs", tags=["Gif"])


@router.post("", response_model=GifResponse)
async def create_gif(db: DbSession, file: Annotated[UploadFile, File()]) -> GifResponse:
    content = await file.read()

    data = GifCreate(
        filename=file.filename, content_type=file.content_type, data=content
    )
    result = await GifService.create_gif(data, db)
    return GifResponse.model_validate(result)


@router.get("", response_model=list[GifResponse])
async def get_gifs(db: DbSession) -> list[GifResponse]:
    result = await GifService.get_gifs(db)
    return [GifResponse.model_validate(gif) for gif in result]


@router.get("/{gif_id}")
async def get_gif(gif_id: int, db: DbSession) -> Response:
    gif = await GifService.get_gif(gif_id, db)
    return Response(content=gif.data, media_type=gif.content_type)


@router.delete("/{gif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gif(gif_id: int, db: DbSession) -> Response:
    await GifService.delete_gif(gif_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
