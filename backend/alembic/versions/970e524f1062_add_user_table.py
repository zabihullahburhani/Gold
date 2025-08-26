"""Add user table

Revision ID: 970e524f1062
Revises: 2ddc041298f8
Create Date: 2025-08-04 17:50:17.781893

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '970e524f1062'
down_revision: Union[str, Sequence[str], None] = '2ddc041298f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
