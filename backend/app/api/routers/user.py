from fastapi import APIRouter, HTTPException, Response, status

from app.core.auth import CurrentUser
from app.core.database import DbSession
from app.models.user import User
from app.schemas.user import UserCreate, UserPatch, UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: DbSession,
    _: CurrentUser,
) -> UserResponse:
    user = await UserService.create_user(db, data)
    return UserResponse.model_validate(user)


@router.get("", response_model=list[UserResponse])
async def get_users(db: DbSession, _: CurrentUser) -> list[UserResponse]:
    users = await UserService.get_users(db)
    return [UserResponse.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DbSession, _: CurrentUser) -> UserResponse:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, data: UserUpdate, db: DbSession, _: CurrentUser
) -> UserResponse:
    user = await UserService.update_user(user_id, data, db)
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def patch_user(
    user_id: int, data: UserPatch, db: DbSession, _: CurrentUser
) -> UserResponse:
    user = await UserService.update_user(user_id, data, db)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: DbSession, _: CurrentUser) -> Response:
    await UserService.delete_user(user_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
