"""Application processing and persistence, independent of HTTP response formatting."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import DuplicateLeadError
from app.models.lead import Lead
from app.schemas.lead import LeadCreate
from app.services import credit_score
from app.services.bre_engine import evaluate_lead

logger = logging.getLogger(__name__)


def mobile_exists(db: Session, mobile: str) -> bool:
    return db.scalar(select(Lead.id).where(Lead.mobile == mobile)) is not None


def get_credit_score(application: LeadCreate) -> tuple[int | None, str | None]:
    """Keep provider failures from discarding an otherwise valid application."""
    try:
        score = credit_score.fetch_credit_score(
            application.mobile, application.date_of_birth.isoformat()
        )
        if not isinstance(score, int) or not 300 <= score <= 900:
            raise credit_score.CreditServiceError("Invalid credit service response")
        return score, None
    except Exception:
        logger.warning(
            "Credit score provider failed; application requires manual review"
        )
        return None, "Credit score service unavailable; manual review required"


def save_application(db: Session, application: LeadCreate) -> Lead:
    if mobile_exists(db, application.mobile):
        raise DuplicateLeadError()

    score, score_error = get_credit_score(application)
    status, rejection_reasons, rule_results = evaluate_lead(db, application, score)
    lead = Lead(
        **application.model_dump(),
        credit_score=score,
        credit_score_error=score_error,
        bre_status=status,
        rejection_reasons=rejection_reasons,
        rule_results=rule_results,
    )

    db.add(lead)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Two concurrent requests can pass the initial mobile check.
        # The unique constraint remains the final authority.
        if mobile_exists(db, application.mobile):
            raise DuplicateLeadError()
        raise

    db.refresh(lead)
    return lead
