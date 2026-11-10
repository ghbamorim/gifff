from pydantic import BaseModel, ConfigDict


class BaseUser(BaseModel):
    email: str


class UserCreate(BaseUser):
    password: str
    is_active: bool | None = False


class UserUpdate(BaseUser):
    password: str
    is_active: bool


class UserPatch(BaseModel):
    email: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserResponse(BaseUser):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
