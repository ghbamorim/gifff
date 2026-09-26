import asyncio
import math
from typing import Annotated, Literal

from app.core.database import DbSession
from app.models.gif import Gif
from app.schemas.gif import GifCreate, GifResponse
from app.schemas.pagination import Page
from app.services.gif import GifService
from fastapi import (
    APIRouter,
    File,
    HTTPException,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)

router = APIRouter(prefix="/gifs", tags=["Gif"])

MAX_UPLOAD_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("")
async def create_gif(
    db: DbSession, files: Annotated[list[UploadFile], File()]
) -> list[GifResponse]:

    total_size = sum(file.size or 0 for file in files)

    if total_size > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"The total size of the files cannot exceed {MAX_UPLOAD_SIZE} byte",
        )

    async def read_file(file: UploadFile) -> GifCreate:
        content = await file.read()

        return GifCreate(
            filename=file.filename, content_type=file.content_type, data=content
        )

    file_contents = await asyncio.gather(*(read_file(file) for file in files))

    gifs: list[Gif] = [await GifService.create_gif(data, db) for data in file_contents]

    return [GifResponse.model_validate(result) for result in gifs]


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
async def get_gif(gif_id: int, request: Request, db: DbSession) -> Response:

    etag = f'"{gif_id}"'

    headers = {"Etag": etag, "Cache-control": "no-cache"}

    if (request.headers.get("if-none-match") == etag) and (
        await GifService.gif_exists(gif_id, db)
    ):

        return Response(status_code=304, headers=headers)

    gif = await GifService.get_gif(gif_id, db)
    return Response(
        content=gif.data,
        media_type=gif.content_type,
        headers=headers,
    )


@router.delete("/{gif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gif(gif_id: int, db: DbSession) -> Response:
    await GifService.delete_gif(gif_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
