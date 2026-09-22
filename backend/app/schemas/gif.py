from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_serializer


class BaseGif(BaseModel):
    filename: str
    content_type: str


class GifCreate(BaseGif):
    data: bytes


class GifResponse(BaseGif):
    id: int
    model_config = ConfigDict(from_attributes=True)
    data: bytes
    created_at: datetime

    @field_serializer("data")
    def serialize_data(self, data: bytes) -> str:
        import base64

        return base64.b64encode(data).decode("ascii")
