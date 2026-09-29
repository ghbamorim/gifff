from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.gif import router as gif_router

app = FastAPI()


app.include_router(gif_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def setup_frontend(app: FastAPI, frontend_dir: Path) -> None:
    if frontend_dir.exists():
        app.frontend("/", directory=str(frontend_dir))


frontend_dir = Path(__file__).resolve().parent / "frontend"

setup_frontend(app, frontend_dir)
