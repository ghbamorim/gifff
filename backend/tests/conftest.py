from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_session
from app.main import app
from app.models.user import User
from app.services.gif import GifService
from app.services.user import UserService


@pytest.fixture
def mock_db_session() -> MagicMock:
    return MagicMock(spec=AsyncSession)


@pytest.fixture
def mock_current_user() -> MagicMock:
    return MagicMock(spec=User)


@pytest.fixture
def test_client(
    mock_db_session: MagicMock, mock_current_user: MagicMock
) -> Generator[TestClient, None, None]:

    async def override_get_session():
        yield mock_db_session

    async def override_current_user():
        return mock_current_user.return_value

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_current_user

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_gif_service() -> Generator[MagicMock, None, None]:
    mock = MagicMock(spec=GifService)

    with patch("app.api.routers.gif.GifService", mock):
        yield mock


@pytest.fixture
def mock_user_service() -> Generator[MagicMock, None, None]:
    mock = MagicMock(spec=UserService)

    with (
        patch("app.api.routers.auth.UserService", mock),
        patch("app.api.routers.user.UserService", mock),
    ):
        yield mock
