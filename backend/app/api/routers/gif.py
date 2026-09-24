import math
from typing import Annotated, Literal

from app.core.database import DbSession
from app.schemas.gif import GifCreate, GifResponse
from app.schemas.pagination import Page
from app.services.gif import GifService
from fastapi import APIRouter, File, Query, Response, UploadFile, status

router = APIRouter(prefix="/gifs", tags=["Gif"])


@router.post("")
async def create_gif(db: DbSession, file: Annotated[UploadFile, File()]) -> GifResponse:
    content = await file.read()

    data = GifCreate(
        filename=file.filename, content_type=file.content_type, data=content
    )
    result = await GifService.create_gif(data, db)
    return GifResponse.model_validate(result)


@router.get("")
async def get_gifs(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_order: Literal["asc", "desc"] = Query("asc"),
) -> Page[GifResponse]:
    result, total = await GifService.get_gifs(page, page_size, sort_order, db)

    pages = math.ceil(total / page_size)

    return Page(
        items=[GifResponse.model_validate(gif) for gif in result],
        page=page,
        pages=pages,
        page_size=page_size,
        total=total,
    )


@router.get("/{gif_id}")
async def get_gif(gif_id: int, db: DbSession) -> Response:
    gif = await GifService.get_gif(gif_id, db)
    return Response(content=gif.data, media_type=gif.content_type)


@router.delete("/{gif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gif(gif_id: int, db: DbSession) -> Response:
    await GifService.delete_gif(gif_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
