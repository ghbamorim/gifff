from fastapi import APIRouter, HTTPException, Response, status

from app.core.auth import CurrentUser
from app.core.database import DbSession
from app.core.security import create_access_token, verify_password
from app.core.settings import settings
from app.schemas.auth import CurrentUserResponse, LoginRequest, LoginResponse
from app.services.user import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/session", response_model=LoginResponse)
async def authenticate_user(
    request: LoginRequest, response: Response, db: DbSession
) -> LoginResponse:
    user = await UserService.get_user_by_email(db, request.email.lower())

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    password_is_valid = await verify_password(request.password, user.password_hash)
    if not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive"
        )

    access_token = create_access_token(user.id)

    response.set_cookie(
        key=settings.auth_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.auth_cookie_secure,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        path="/",
    )
    return LoginResponse(authenticated=True)


@router.get("/session", response_model=CurrentUserResponse)
async def get_me(current_user: CurrentUser) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user)


@router.delete("/session")
async def logout(response: Response) -> LoginResponse:
    response.delete_cookie(key=settings.auth_cookie_name, path="/")
    return LoginResponse(authenticated=False)
