from unittest.mock import MagicMock

from fastapi import status
from fastapi.testclient import TestClient
from pwdlib import PasswordHash

from app.core.settings import settings
from app.models.user import User


def test_auth_session_no_user(
    test_client: TestClient, mock_user_service: MagicMock
) -> None:
    # arrange

    data = {"email": "teste@email.com", "password": "123456"}

    mock_user_service.get_user_by_email.return_value = None

    # act
    response = test_client.post("/auth/session", json=data)

    # assert

    response = test_client.post("/auth/session", json=data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Invalid email or password"}


def test_auth_session_invalid_password(
    test_client: TestClient, mock_user_service: MagicMock
) -> None:
    # arrange

    data = {"email": "teste@email.com", "password": "123456"}

    user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("12345678"),
        is_active=True,
    )

    mock_user_service.get_user_by_email.return_value = user

    # act
    response = test_client.post("/auth/session", json=data)

    # assert

    response = test_client.post("/auth/session", json=data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Invalid email or password"}


def test_auth_session_inactive_user(
    test_client: TestClient, mock_user_service: MagicMock
) -> None:
    # arrange

    data = {"email": "teste@email.com", "password": "123456"}

    user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=False,
    )

    mock_user_service.get_user_by_email.return_value = user

    # act
    response = test_client.post("/auth/session", json=data)

    # assert

    response = test_client.post("/auth/session", json=data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": "User is inactive"}


def test_auth_session(test_client: TestClient, mock_user_service: MagicMock) -> None:
    # arrange

    data = {"email": "teste@email.com", "password": "123456"}

    user = User(
        id=1,
        email="teste@email.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    mock_user_service.get_user_by_email.return_value = user

    # act
    response = test_client.post("/auth/session", json=data)

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"authenticated": True}


def test_get_me(test_client: TestClient, mock_current_user: MagicMock) -> None:
    # arrange

    user = User(
        id=1,
        email="ghnerique@gmail.com",
        password_hash=PasswordHash.recommended().hash("123456"),
        is_active=True,
    )

    mock_current_user.return_value = user

    # act
    response = test_client.get("/auth/session")

    # assert

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"email": "ghnerique@gmail.com", "id": 1}


def test_auth_logout(test_client: TestClient) -> None:

    # arrange
    test_client.cookies.set(settings.auth_cookie_name, "fake_token")

    # act
    response = test_client.delete("/auth/session")

    # assert
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"authenticated": False}

    cookie = response.headers["set-cookie"]
    assert "access_token=" in cookie
    assert "Max-Age=0" in cookie
    assert "Path=/" in cookie
