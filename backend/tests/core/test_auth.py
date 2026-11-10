from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi import HTTPException, status
from pwdlib import PasswordHash

from app.core.auth import get_current_user
from app.core.security import hash_password
from app.core.settings import settings
from app.models.user import User


@pytest.mark.anyio
async def test_get_current_user_without_token():
    # arrange
    db = MagicMock()

    # act
    with pytest.raises(HTTPException) as exception:
        await get_current_user(db, None)

    # assert
    assert exception.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exception.value.detail == "Not authenticated"


@pytest.mark.anyio
async def test_get_current_user_with_invalid_token():
    # arrange
    db = MagicMock()

    token = jwt.encode(
        {"sub": None},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )

    # act
    with (
        patch("app.core.auth.jwt.decode", return_value={"sub": None}),
        pytest.raises(HTTPException) as exception,
    ):
        await get_current_user(db, token)

    # assert
    assert exception.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exception.value.detail == "Invalid token"


@pytest.mark.anyio
async def test_get_current_user_with_expired_token():
    # arrange

    now = datetime.now(timezone.utc)

    expires_at = now - timedelta(minutes=1)

    payload = {"sub": str(1), "iat": now, "exp": expires_at}

    db = MagicMock()

    token = jwt.encode(
        payload,
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )

    # act
    with pytest.raises(HTTPException) as exception:
        await get_current_user(db, token)

    # assert
    assert exception.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exception.value.detail == "Invalid or expired token"


@pytest.mark.anyio
async def test_user_not_found():
    # arrange
    db = MagicMock()
    db.get = AsyncMock(return_value=None)

    token = jwt.encode(
        {"sub": "1"},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )

    # act
    with pytest.raises(HTTPException) as exception:
        await get_current_user(db, token)

        # assert
    assert exception.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exception.value.detail == "User not found"


@pytest.mark.anyio
async def test_inactive_user():
    # arrange
    user = User(id=1, email="teste@email.com", is_active=False)
    db = MagicMock()
    db.get = AsyncMock(return_value=user)

    token = jwt.encode(
        {"sub": "1"},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )

    # act
    with pytest.raises(HTTPException) as exception:
        await get_current_user(db, token)

        # assert
    assert exception.value.status_code == status.HTTP_403_FORBIDDEN
    assert exception.value.detail == "User is inactive"


@pytest.mark.anyio
async def test_get_current_user_success():
    # arrange
    user = User(id=1, email="teste@email.com", is_active=True)
    db = MagicMock()
    db.get = AsyncMock(return_value=user)

    token = jwt.encode(
        {"sub": "1"},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )

    # act
    result = await get_current_user(db, token)

    # assert
    assert result == user
    db.get.assert_awaited_once_with(User, 1)


@pytest.mark.anyio
async def test_hash_password():
    # arrange
    password = "123456"

    # act
    hashed = await hash_password(password)

    # assert
    assert hashed != password
    assert PasswordHash.recommended().verify(password, hashed)
    assert not PasswordHash.recommended().verify("wrong_password", hashed)
