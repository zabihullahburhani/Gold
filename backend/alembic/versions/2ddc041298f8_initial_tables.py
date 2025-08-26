"""Initial tables

Revision ID: 2ddc041298f8
Revises: 9517ef008001
Create Date: 2025-08-04 17:43:44.976192

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ddc041298f8'
down_revision: Union[str, Sequence[str], None] = '9517ef008001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
