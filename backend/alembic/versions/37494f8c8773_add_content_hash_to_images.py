"""add content hash to images

Revision ID: 37494f8c8773
Revises: 4510bf14df7f
Create Date: 2026-11-17 16:11:01.353734
"""

import hashlib
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "37494f8c8773"
down_revision: Union[str, Sequence[str], None] = "4510bf14df7f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "images",
        sa.Column("content_hash", sa.String(64), nullable=True),
    )

    connection = op.get_bind()

    images = connection.execute(sa.text("SELECT id, data FROM images ORDER BY id"))

    seen_hashes: set[str] = set()

    for image_id, data in images:
        content_hash = hashlib.sha256(data).hexdigest()

        if content_hash in seen_hashes:
            connection.execute(
                sa.text("DELETE FROM images WHERE id = :id"),
                {"id": image_id},
            )
            continue

        seen_hashes.add(content_hash)

        connection.execute(
            sa.text("UPDATE images SET content_hash = :content_hash WHERE id = :id"),
            {
                "content_hash": content_hash,
                "id": image_id,
            },
        )

    op.alter_column(
        "images",
        "content_hash",
        existing_type=sa.String(64),
        nullable=False,
    )

    op.create_unique_constraint(
        "uq_images_content_hash",
        "images",
        ["content_hash"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_images_content_hash",
        "images",
        type_="unique",
    )

    op.drop_column("images", "content_hash")
