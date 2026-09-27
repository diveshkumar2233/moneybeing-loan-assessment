"""Evaluate database rule data using a fixed, safe vocabulary (never eval)."""

import operator
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import RuleConfigurationError
from app.models.rule import Rule

# These are supported operations, not eligibility thresholds.
# Each rule's operator and threshold come from the database.
OPERATORS = {
    ">=": operator.ge,
    "<=": operator.le,
    "==": operator.eq,
    "!=": operator.ne,
    ">": operator.gt,
    "<": operator.lt,
}
FIELDS = {"age", "monthly_income", "credit_score", "loan_amount", "property_value"}


def evaluate_lead(db: Session, application, credit_score: int | None):
    today = date.today()
    dob = application.date_of_birth
    values = {field: getattr(application, field, None) for field in FIELDS}
    # Subtract one year if the customer's birthday has not occurred this year.
    values["age"] = (
        today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    )
    values["credit_score"] = credit_score
    reasons, results = [], []
    # No cache: every application observes the current committed active rules.
    for rule in db.scalars(
        select(Rule).where(Rule.is_active.is_(True)).order_by(Rule.id)
    ):
        if (
            rule.field not in FIELDS
            or rule.operator not in OPERATORS
            or (rule.reference_field and rule.reference_field not in FIELDS)
        ):
            raise RuleConfigurationError(f"Invalid configuration for rule {rule.id}")
        actual = values[rule.field]
        reference = values.get(rule.reference_field) if rule.reference_field else None
        target = Decimal(rule.value)
        if rule.reference_field:
            # A reference field makes the stored value a percentage of that field.
            # Decimal keeps monetary comparisons free of float rounding errors.
            target = (
                Decimal(reference) * target / Decimal(100)
                if reference is not None
                else None
            )
        passed = (
            actual is not None
            and target is not None
            and OPERATORS[rule.operator](Decimal(actual), target)
        )
        if not passed:
            reasons.append(rule.rejection_message)
        # Save the evaluated rule values with the lead so later rule edits do not
        # change the explanation of an earlier decision.
        results.append(
            {
                "rule_id": rule.id,
                "rule_name": rule.rule_name,
                "field": rule.field,
                "operator": rule.operator,
                "value": str(rule.value),
                "reference_field": rule.reference_field,
                "actual": str(actual) if actual is not None else None,
                "target": str(target) if target is not None else None,
                "passed": passed,
            }
        )
    if credit_score is None:
        # Missing provider data requires review, even if no active rule uses it.
        reasons.append(
            "Credit score unavailable; manual review required. Please contact support."
        )
    return ("Not Eligible" if reasons else "Eligible"), reasons, results
