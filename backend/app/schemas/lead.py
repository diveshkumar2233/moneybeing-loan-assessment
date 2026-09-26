from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StrictBool, field_validator

LoanType = Literal["Home Loan", "LAP"]
EmploymentType = Literal["Salaried", "Self Employed"]
BREStatus = Literal["Eligible", "Not Eligible"]
Money = Annotated[Decimal, Field(gt=0, max_digits=16, decimal_places=2)]


class LeadCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    full_name: str = Field(min_length=2, max_length=120)
    mobile: str = Field(pattern=r"^[0-9]{10}$")
    email: EmailStr
    date_of_birth: date
    city: str = Field(min_length=2, max_length=100)
    pincode: str = Field(pattern=r"^[1-9][0-9]{5}$")
    loan_type: LoanType
    employment_type: EmploymentType
    monthly_income: Money
    loan_amount: Money
    property_value: Money
    consent: StrictBool

    @field_validator("date_of_birth")
    @classmethod
    def valid_dob(cls, value):
        if not date(1900, 1, 1) <= value < date.today():
            raise ValueError("Date of birth must be between 1900-01-01 and yesterday")
        return value

    @field_validator("consent")
    @classmethod
    def consent_required(cls, value):
        if value is not True:
            raise ValueError("Consent is required")
        return value


class LeadCreated(BaseModel):
    status: Literal["success"] = "success"
    lead_id: int
    credit_score: int | None
    bre_status: BREStatus


class LeadRead(LeadCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    credit_score: int | None
    credit_score_error: str | None
    bre_status: BREStatus
    rejection_reasons: list[str]
    rule_results: list[dict]
    created_at: datetime


class LeadPage(BaseModel):
    items: list[LeadRead]
    total: int
    page: int
    page_size: int
