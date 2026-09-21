from app.models.base import Base
from sqlalchemy import LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column


class Gif(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    data: Mapped[bytes] = mapped_column(LargeBinary)
