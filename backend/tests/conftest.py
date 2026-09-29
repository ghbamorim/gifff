from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.main import app
from app.services.gif import GifService


@pytest.fixture
def mock_db_session() -> MagicMock:
    return MagicMock(spec=AsyncSession)


@pytest.fixture
def test_client(mock_db_session: MagicMock) -> Generator[TestClient, None, None]:

    async def override_get_session():
        yield mock_db_session()

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_gif_service() -> Generator[MagicMock, None, None]:
    mock = MagicMock(spec=GifService)

    with patch("app.api.routers.gif.GifService", mock):
        yield mock
