from datetime import datetime, timezone
from unittest.mock import MagicMock

from fastapi import status
from fastapi.testclient import TestClient

from app.api.routers.gif import MAX_UPLOAD_SIZE
from app.models.gif import Gif


def test_create_gif(test_client: TestClient, mock_gif_service: MagicMock) -> None:
    # arrange

    files = [
        ("files", ("gif1.gif", b"GifContent", "image/gif")),
        ("files", ("gif1.gif", b"GifContent", "image/gif")),
    ]

    gif1 = Gif(
        id=1,
        filename="gif1.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 9, 10, 00, 0, timezone.utc),
    )

    gif2 = Gif(
        id=2,
        filename="gif2.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 9, 10, 1, 0, timezone.utc),
    )

    mock_gif_service.create_gif.side_effect = [gif1, gif2]

    # act
    response = test_client.post("/gifs", files=files)

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "filename": "gif1.gif",
            "content_type": "image/gif",
            "id": 1,
            "created_at": "2026-09-29T09:10:00Z",
        },
        {
            "filename": "gif2.gif",
            "content_type": "image/gif",
            "id": 2,
            "created_at": "2026-09-29T09:10:01Z",
        },
    ]


def test_create_gif_exceed_max_upload_size(
    test_client: TestClient, mock_gif_service: MagicMock
) -> None:
    # arrange

    files = [
        ("files", ("gif1.gif", b"x" * (MAX_UPLOAD_SIZE // 2), "image/gif")),
        ("files", ("gif1.gif", b"x" * ((MAX_UPLOAD_SIZE // 2) + 1), "image/gif")),
    ]

    # act
    response = test_client.post("/gifs", files=files)

    # assert

    assert response.status_code == status.HTTP_413_CONTENT_TOO_LARGE
    assert response.json() == {
        "detail": f"The total size of the files cannot exceed {MAX_UPLOAD_SIZE} bytes"
    }
    mock_gif_service.create_gif.assert_not_awaited()


def test_get_gifs(test_client: TestClient, mock_gif_service: MagicMock) -> None:
    # arrange

    gif1 = Gif(
        id=1,
        filename="gif1.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 9, 10, 00, 0, timezone.utc),
    )

    gif2 = Gif(
        id=2,
        filename="gif2.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 9, 10, 1, 0, timezone.utc),
    )

    mock_gif_service.get_gifs.return_value = [gif1, gif2], 2

    # act
    response = test_client.get("/gifs?page=1&page_size=2")

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "items": [
            {
                "filename": "gif1.gif",
                "content_type": "image/gif",
                "id": 1,
                "created_at": "2026-09-29T09:10:00Z",
            },
            {
                "filename": "gif2.gif",
                "content_type": "image/gif",
                "id": 2,
                "created_at": "2026-09-29T09:10:01Z",
            },
        ],
        "page": 1,
        "pages": 1,
        "page_size": 2,
        "total": 2,
    }


def test_get_gif(test_client: TestClient, mock_gif_service: MagicMock) -> None:
    # first attempt
    # arrange

    gif1 = Gif(
        id=1,
        filename="gif1.gif",
        content_type="image/gif",
        created_at=datetime(2026, 9, 29, 9, 10, 00, 0, timezone.utc),
        data=b"gif content",
    )

    mock_gif_service.get_gif.return_value = gif1

    # act

    response = test_client.get("/gifs/1")

    # assert

    assert response.content == gif1.data
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["etag"] == f'"{gif1.id}"'
    assert response.headers["cache-control"] == "no-cache"
    mock_gif_service.gif_exists.assert_not_awaited()

    # second attempt, must tell to use http cache

    # arrange

    mock_gif_service.gif_exists.return_value = True
    mock_gif_service.get_gif.reset_mock()

    # act

    response = test_client.get("/gifs/1", headers={"If-None-Match": f'"{gif1.id}"'})

    # assert

    assert response.content == b""
    assert response.status_code == status.HTTP_304_NOT_MODIFIED
    assert response.headers["etag"] == f'"{gif1.id}"'
    mock_gif_service.get_gif.assert_not_awaited()


def test_delete_gif(test_client: TestClient, mock_gif_service: MagicMock) -> None:
    # act

    response = test_client.delete("/gifs/1")

    # assert
    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_gif_service.delete_gif.assert_awaited_once()
