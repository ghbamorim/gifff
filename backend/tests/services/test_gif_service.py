import hashlib
from contextlib import AbstractContextManager, nullcontext
from datetime import datetime, timezone
from unittest.mock import MagicMock, Mock

import pytest
from fastapi import HTTPException, status
from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError

from app.models.gif import Gif
from app.schemas.gif import GifCreate
from app.services.gif import GifService


class MockUniqueViolationError(Exception):
    constraint_name = "uq_images_content_hash"


def model_to_dict(model) -> dict:
    return {
        column.key: getattr(model, column.key)
        for column in inspect(model).mapper.column_attrs
    }


@pytest.fixture
def gif1() -> Gif:
    return Gif(
        id=1,
        filename="gif1.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 10, 0, 0, 0, timezone.utc),
    )


@pytest.fixture
def gif2() -> Gif:
    return Gif(
        id=2,
        filename="gif2.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 10, 0, 1, 0, timezone.utc),
    )


@pytest.mark.anyio
async def test_create_gif(mock_db_session: MagicMock) -> None:
    # arrange
    gif_arg = GifCreate(
        filename="gif1.gif",
        content_type="image/gif",
        data=b"gif content",
    )

    mock_db_session.scalar.return_value = None

    # act
    result = await GifService.create_gif(gif_arg, mock_db_session)

    # assert
    assert result.filename == "gif1.gif"
    assert result.content_type == "image/gif"
    assert result.data == b"gif content"
    assert result.content_hash == hashlib.sha256(b"gif content").hexdigest()

    mock_db_session.scalar.assert_awaited_once()
    mock_db_session.add.assert_called_once_with(result)
    mock_db_session.flush.assert_awaited_once()


@pytest.mark.anyio
async def test_create_gif_duplicate(
    mock_db_session: MagicMock,
) -> None:
    # arrange
    data = GifCreate(
        filename="another_name.gif",
        content_type="image/gif",
        data=b"same content",
    )

    mock_db_session.scalar.return_value = 42

    # act
    with pytest.raises(HTTPException) as exc:
        await GifService.create_gif(data, mock_db_session)

    # assert
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == {
        "message": "This file already exists",
        "gif_id": 42,
        "filename": "another_name.gif",
    }

    mock_db_session.scalar.assert_awaited_once()
    mock_db_session.add.assert_not_called()
    mock_db_session.flush.assert_not_awaited()


@pytest.mark.anyio
async def test_create_gif_database_conflict(
    mock_db_session: MagicMock,
) -> None:
    # arrange
    data = GifCreate(
        filename="duplicate.gif",
        content_type="image/gif",
        data=b"duplicate content",
    )

    mock_db_session.scalar.return_value = None

    original_error = MockUniqueViolationError("Unique constraint violation")

    driver_error = Exception("Database error")
    driver_error.__cause__ = original_error

    mock_db_session.flush.side_effect = IntegrityError(
        statement="INSERT INTO images",
        params={},
        orig=driver_error,
    )

    # act
    with pytest.raises(HTTPException) as exc:
        await GifService.create_gif(data, mock_db_session)

    # assert
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == {
        "message": "This file already exists",
        "filename": "duplicate.gif",
    }

    mock_db_session.add.assert_called_once()
    mock_db_session.flush.assert_awaited_once()


@pytest.mark.anyio
async def test_create_gif_other_integrity_error(
    mock_db_session: MagicMock,
) -> None:
    # arrange
    data = GifCreate(
        filename="gif.gif",
        content_type="image/gif",
        data=b"gif content",
    )

    mock_db_session.scalar.return_value = None

    integrity_error = IntegrityError(
        statement="INSERT INTO images",
        params={},
        orig=Exception("Another database constraint failed"),
    )

    mock_db_session.flush.side_effect = integrity_error

    # act / assert
    with pytest.raises(IntegrityError):
        await GifService.create_gif(data, mock_db_session)

    mock_db_session.add.assert_called_once()
    mock_db_session.flush.assert_awaited_once()


@pytest.mark.anyio
async def test_get_gifs(
    gif1: Gif,
    gif2: Gif,
    mock_db_session: MagicMock,
) -> None:
    # arrange
    mock_db_session.scalar.return_value = 2

    mock_db_session.scalars.return_value = Mock()
    mock_db_session.scalars.return_value.all.return_value = [
        gif1,
        gif2,
    ]

    # act
    gifs, total = await GifService.get_gifs(1, 1, "desc", mock_db_session)

    # assert
    assert total == 2

    assert gifs[0].id == 1
    assert gifs[0].filename == "gif1.gif"
    assert gifs[0].content_type == "image/gif"
    assert gifs[0].created_at == datetime(2026, 9, 29, 10, 0, tzinfo=timezone.utc)

    assert gifs[1].id == 2
    assert gifs[1].filename == "gif2.gif"
    assert gifs[1].content_type == "image/gif"
    assert gifs[1].created_at == datetime(2026, 9, 29, 10, 0, 1, tzinfo=timezone.utc)


@pytest.mark.anyio
async def test_get_gif(
    gif1: Gif,
    mock_db_session: MagicMock,
) -> None:
    # arrange
    mock_db_session.get.return_value = gif1

    # act
    result = await GifService.get_gif(1, mock_db_session)

    # assert
    assert result.id == 1
    assert result.filename == "gif1.gif"
    assert result.content_type == "image/gif"
    assert result.created_at == datetime(2026, 9, 29, 10, 0, tzinfo=timezone.utc)


@pytest.mark.anyio
async def test_get_gif_not_found(
    mock_db_session: MagicMock,
) -> None:
    # arrange
    mock_db_session.get.return_value = None

    # act
    with pytest.raises(HTTPException) as exception:
        await GifService.get_gif(1, mock_db_session)

    # assert
    assert exception.value.status_code == status.HTTP_404_NOT_FOUND
    assert exception.value.detail == "Gif not found"


@pytest.mark.parametrize(
    ("exists", "context"),
    [
        (True, nullcontext(True)),
        (False, pytest.raises(HTTPException)),
    ],
)
@pytest.mark.anyio
async def test_gif_exists(
    exists: bool,
    context: AbstractContextManager,
    mock_db_session: MagicMock,
) -> None:
    # arrange
    mock_db_session.scalar.return_value = exists

    # act / assert
    with context as expected:
        result = await GifService.gif_exists(1, mock_db_session)

        assert result == expected
        assert isinstance(result, bool) or (
            expected.value.status_code == status.HTTP_404_NOT_FOUND
            and expected.value.detail == "Gif not found"
        )


@pytest.mark.anyio
async def test_delete_gif(
    gif1: Gif,
    mock_db_session: MagicMock,
) -> None:
    # arrange
    mock_db_session.get.return_value = gif1

    # act
    await GifService.delete_gif(1, mock_db_session)

    # assert
    mock_db_session.delete.assert_awaited_once_with(gif1)
