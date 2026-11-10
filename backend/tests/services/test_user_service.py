from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.user import UserService


def model_to_dict(model) -> dict:
    return {
        column.key: getattr(model, column.key)
        for column in inspect(model).mapper.column_attrs
    }


@pytest.fixture
def user1() -> User:
    return User(
        id=1,
        email="test@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )


@pytest.mark.anyio
async def test_get_user(user1: User, mock_db_session: MagicMock) -> None:
    # arrange
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [user1]
    mock_db_session.execute = AsyncMock(return_value=mock_result)

    # act

    result = await UserService.get_users(mock_db_session)

    # assert
    assert result[0].id == 1
    assert result[0].email == "test@email.com"
    assert result[0].password_hash == user1.password_hash
    assert result[0].is_active


@pytest.mark.anyio
async def test_get_user_by_email(user1: User, mock_db_session: MagicMock) -> None:
    # arrange
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user1
    mock_db_session.execute = AsyncMock(return_value=mock_result)

    # act

    result = await UserService.get_user_by_email(mock_db_session, user1.email)

    # assert
    assert result is not None
    assert result.id == 1
    assert result.email == "test@email.com"
    assert result.password_hash == user1.password_hash
    assert result.is_active


@pytest.mark.anyio
async def test_create_user_integrityerror(mock_db_session: MagicMock) -> None:
    # arrange

    userCreate = UserCreate(email="test@test.com", password="123456", is_active=True)

    mock_db_session.flush.side_effect = IntegrityError(
        statement="INSERT INTO users",
        params={},
        orig=Exception("Duplicate key"),
    )

    # act
    with pytest.raises(HTTPException) as exception:
        await UserService.create_user(mock_db_session, userCreate)

    # assert

    assert exception.value.status_code == status.HTTP_409_CONFLICT
    assert exception.value.detail == "Database integrity constraint violated."

    mock_db_session.add.assert_called_once()
    mock_db_session.flush.assert_awaited_once()
    mock_db_session.refresh.assert_not_awaited()


@pytest.mark.anyio
async def test_create_user(mock_db_session: MagicMock) -> None:
    # arrange

    userCreate = UserCreate(email="test@email.com", password="123456", is_active=True)

    # act

    result = await UserService.create_user(mock_db_session, userCreate)

    # assert
    assert result.email == "test@email.com"
    assert result.password_hash is not None
    assert result.is_active

    mock_db_session.add.assert_called_once()
    mock_db_session.flush.assert_awaited_once()
    mock_db_session.refresh.assert_awaited_once()


@pytest.mark.anyio
async def test_update_user_not_found(mock_db_session: MagicMock) -> None:
    # arrange

    userCreate = UserUpdate(
        email="new_test@email.com", password="1234562", is_active=False
    )

    mock_db_session.get.return_value = None

    # act
    with pytest.raises(HTTPException) as exception:
        await UserService.update_user(1, userCreate, mock_db_session)

    # assert
    assert exception.value.status_code == status.HTTP_404_NOT_FOUND
    assert exception.value.detail == "User not found"

    mock_db_session.get.assert_called_once()
    mock_db_session.flush.assert_not_awaited()


@pytest.mark.anyio
async def test_update_user(user1: User, mock_db_session: MagicMock) -> None:
    # arrange

    userCreate = UserUpdate(
        email="new_test@email.com", password="1234562", is_active=False
    )

    mock_db_session.get.return_value = user1

    # act
    with patch.object(
        UserService,
        "load_from_pydantic",
        wraps=UserService.load_from_pydantic,
    ) as spy:
        result = await UserService.update_user(user1.id, userCreate, mock_db_session)

    # assert
    assert result.email == "new_test@email.com"
    assert result.password_hash is not None
    assert not result.is_active

    mock_db_session.flush.assert_awaited_once()
    spy.assert_called_once_with(
        user1,
        userCreate,
        exclude_unset=False,
    )


@pytest.mark.anyio
async def test_delete_user_not_found(mock_db_session: MagicMock) -> None:
    # arrange

    mock_db_session.get.return_value = None

    # act
    with pytest.raises(HTTPException) as exception:
        await UserService.delete_user(1, mock_db_session)

    # assert
    assert exception.value.status_code == status.HTTP_404_NOT_FOUND
    assert exception.value.detail == "User not found"

    mock_db_session.get.assert_called_once()
    mock_db_session.delete.assert_not_awaited()


@pytest.mark.anyio
async def test_delete_user(user1: User, mock_db_session: MagicMock) -> None:
    # arrange
    mock_db_session.get.return_value = user1

    # act
    await UserService.delete_user(user1.id, mock_db_session)

    # assert
    mock_db_session.get.assert_called_once_with(User, user1.id)
    mock_db_session.delete.assert_awaited_once()
