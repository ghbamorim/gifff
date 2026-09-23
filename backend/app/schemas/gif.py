from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseGif(BaseModel):
    filename: str
    content_type: str


class GifCreate(BaseGif):
    data: bytes


class GifResponse(BaseGif):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
