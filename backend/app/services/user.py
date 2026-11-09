from collections.abc import Collection
from typing import TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserPatch, UserSearch, UserUpdate

T = TypeVar("T")


class UserService():

    @staticmethod
    def load_from_pydantic(
        model: T,
        data: BaseModel,
        *,
        exclude_unset: bool = True,
        exclude: Collection[str] = (),
    ) -> T:
        values = data.model_dump(exclude_unset=exclude_unset, exclude=set(exclude))

        for field, value in values.items():
            setattr(model, field, value)
        return model


    @staticmethod
    async def get_users(db: AsyncSession) -> list[User]:
        stmt = select(User)
        result = await db.execute(stmt)

        return list(result.scalars().all())

    @staticmethod
    async def search_by_email(search: str, db: AsyncSession) -> list[User]:
        result = await db.execute(
            select(User).where(User.email.ilike(search))
        )

        return list(result.scalars().all())

    @staticmethod
    async def search(keys: UserSearch, db: AsyncSession) -> list[User]:
        filters = []

        for field, value in keys.model_dump(exclude_unset=True).items():
            column = getattr(User, field)

            if isinstance(value, str):
                filters.append(column.ilike(f"%{value}%"))
            else:
                filters.append(column == value)

        result = await db.execute(select(User).where(*filters))

        return list(result.scalars().all())

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        stmt = select(User).where(User.email == email)

        result = await db.execute(stmt)

        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, user: UserCreate) -> User:
        result = User(
            **user.model_dump(exclude={"password"}),
            password_hash=await hash_password(user.password),
        )

        db.add(result)
        try:
            await db.flush()
            await db.refresh(result)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Database integrity constraint violated.",
            )

        return result

    @staticmethod
    async def update_user(
        user_id: int, data: UserUpdate | UserPatch, db: AsyncSession
    ) -> User:
        exclude_unset = isinstance(data, UserPatch)

        user: User | None = await db.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        UserService.load_from_pydantic(user, data, exclude_unset=exclude_unset)

        await db.flush()
        return user

    @staticmethod
    async def delete_user(user_id: int, db: AsyncSession) -> None:

        user: User | None = await db.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        await db.delete(user)
