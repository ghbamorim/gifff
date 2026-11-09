from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    authenticated: bool


class CurrentUserResponse(BaseModel):
    id: int
    email: str

    model_config = ConfigDict(from_attributes=True)
