from unittest.mock import MagicMock

from fastapi import status
from fastapi.testclient import TestClient
from pwdlib import PasswordHash

from app.models.user import User


def test_create_user(test_client: TestClient, mock_user_service: MagicMock) -> None:
    # arrange

    data = {"email": "teste@email.com", "password": "123456", "is_active": True}

    user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    mock_user_service.create_user.return_value = user

    # act
    response = test_client.post("/users", json=data)

    # assert

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {"id": 1, "email": "teste@email.com", "is_active": True}


def test_get_users(test_client: TestClient, mock_user_service: MagicMock) -> None:
    # arrange

    users = [
        User(
            id=1,
            email="teste1@email.com",
            is_active=True,
        ),
        User(
            id=2,
            email="teste2@email.com",
            is_active=True,
        ),
    ]

    mock_user_service.get_users.return_value = users

    # act
    response = test_client.get("/users")

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
        }
        for user in users
    ]


def test_get_user_not_found(
    test_client: TestClient, mock_db_session: MagicMock
) -> None:
    # arrange

    mock_db_session.get.return_value = None

    # act
    response = test_client.get("/users/1")

    # assert

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "User not found"}


def test_get_user(test_client: TestClient, mock_db_session: MagicMock) -> None:
    # arrange

    user = User(
        id=1,
        email="teste1@email.com",
        is_active=True,
    )

    mock_db_session.get.return_value = user

    # act
    response = test_client.get("/users/1")

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
    }


def test_update_user(
    test_client: TestClient, mock_db_session: MagicMock, mock_user_service: MagicMock
) -> None:
    # arrange

    data = {"email": "new_test@email.com", "password": "123456", "is_active": False}

    old_user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    new_user = User(
        id=1,
        email="new_test@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=False,
    )

    mock_db_session.get.return_value = old_user

    mock_user_service.update_user.return_value = new_user

    # act
    response = test_client.put("/users/1", json=data)

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": 1,
        "email": "new_test@email.com",
        "is_active": False,
    }


def test_patch_user(
    test_client: TestClient, mock_db_session: MagicMock, mock_user_service: MagicMock
) -> None:
    # arrange

    data = {"is_active": False}

    old_user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    new_user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=False,
    )

    mock_db_session.get.return_value = old_user

    mock_user_service.update_user.return_value = new_user

    # act
    response = test_client.patch("/users/1", json=data)

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": 1,
        "email": "teste@email.com",
        "is_active": False,
    }


def test_delete_user(
    test_client: TestClient, mock_db_session: MagicMock, mock_user_service: MagicMock
) -> None:
    # arrange

    old_user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    mock_db_session.get.return_value = old_user

    # act
    response = test_client.delete("/users/1")

    # assert

    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_user_service.delete_user.assert_called_with(1, mock_db_session)
