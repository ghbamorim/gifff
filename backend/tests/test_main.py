from fastapi import status
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import setup_frontend
from fastapi import FastAPI


def test_main(test_client: TestClient) -> None:
    response = test_client.get("/health")
    assert response.status_code == status.HTTP_200_OK


def test_setup_frontend_when_directory_exists(tmp_path: Path) -> None:
    # arrange

    frontend_dir = tmp_path / "frontend"
    frontend_dir.mkdir()

    app = MagicMock(spec=FastAPI)

    # act
    setup_frontend(app, frontend_dir)

    # assert
    app.frontend.assert_called_once_with(
        "/",
        directory=str(frontend_dir),
    )


def test_setup_frontend_when_directory_does_not_exist(
    tmp_path: Path,
) -> None:
    # arrange

    frontend_dir = tmp_path / "frontend"

    app = MagicMock(spec=FastAPI)

    # act
    setup_frontend(app, frontend_dir)

    # assert
    app.frontend.assert_not_called()
