from decimal import Decimal

from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Rule(Base):
    __tablename__ = "rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(120))
    field: Mapped[str] = mapped_column(String(40))
    operator: Mapped[str] = mapped_column(String(2))
    value: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    reference_field: Mapped[str | None] = mapped_column(String(40), nullable=True)
    rejection_message: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
