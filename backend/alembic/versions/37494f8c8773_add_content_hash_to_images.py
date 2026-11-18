"""add content hash to images

Revision ID: 37494f8c8773
Revises: 4510bf14df7f
Create Date: 2026-11-17 16:11:01.353734
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "37494f8c8773"
down_revision: Union[str, Sequence[str], None] = "4510bf14df7f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()

    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.add_column(
        "images",
        sa.Column("content_hash", sa.String(64), nullable=True),
    )

    # Calculate hashes directly in PostgreSQL.
    connection.execute(
        sa.text(
            """
            UPDATE images
            SET content_hash = encode(digest(data, 'sha256'), 'hex')
            """
        )
    )

    # Delete duplicates, keeping the row with the lowest ID.
    connection.execute(
        sa.text(
            """
            DELETE FROM images AS duplicate
            USING images AS original
            WHERE duplicate.content_hash = original.content_hash
              AND duplicate.id > original.id
            """
        )
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
