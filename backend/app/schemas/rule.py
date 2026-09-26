from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RuleField = Literal[
    "age", "monthly_income", "credit_score", "loan_amount", "property_value"
]


class RuleWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    rule_name: str = Field(min_length=2, max_length=120)
    field: RuleField
    operator: Literal[">=", "<=", "==", "!=", ">", "<"]
    value: Decimal = Field(ge=0, max_digits=16, decimal_places=2)
    reference_field: RuleField | None = None
    rejection_message: str = Field(min_length=3, max_length=255)
    is_active: bool = True


class RuleRead(RuleWrite):
    model_config = ConfigDict(from_attributes=True)
    id: int
