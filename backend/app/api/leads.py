import json
import logging
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.exceptions.custom_exceptions import DuplicateLeadError
from app.models.lead import Lead
from app.schemas.lead import (
    BREStatus,
    LeadCreate,
    LeadCreated,
    LeadPage,
    LeadRead,
    LoanType,
)
from app.services import credit_score
from app.services.bre_engine import evaluate_lead

router = APIRouter(prefix="/api/leads", tags=["Leads"])
logger = logging.getLogger(__name__)


def filters(search=None, loan_type=None, bre_status=None):
    clauses = []
    if search:
        escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        clauses.append(
            or_(
                Lead.full_name.ilike(f"%{escaped}%", escape="\\"),
                Lead.mobile.ilike(f"%{escaped}%", escape="\\"),
            )
        )
    if loan_type:
        clauses.append(Lead.loan_type == loan_type)
    if bre_status:
        clauses.append(Lead.bre_status == bre_status)
    return clauses


@router.post(
    "",
    response_model=LeadCreated,
    status_code=201,
    responses={409: {"description": "Lead already exists"}},
)
def create_lead(data: LeadCreate, response: Response, db: Session = Depends(get_db)):
    if db.scalar(select(Lead.id).where(Lead.mobile == data.mobile)) is not None:
        raise DuplicateLeadError()
    score, score_error = None, None
    try:
        score = credit_score.fetch_credit_score(
            data.mobile, data.date_of_birth.isoformat()
        )
        if not isinstance(score, int) or not 300 <= score <= 900:
            raise credit_score.CreditServiceError("Invalid credit service response")
    except Exception:
        logger.warning(
            "Credit score provider failed; application requires manual review"
        )
        score = None
        score_error = "Credit score service unavailable; manual review required"
    status, reasons, results = evaluate_lead(db, data, score)
    lead = Lead(
        **data.model_dump(),
        credit_score=score,
        credit_score_error=score_error,
        bre_status=status,
        rejection_reasons=reasons,
        rule_results=results,
    )
    db.add(lead)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if db.scalar(select(Lead.id).where(Lead.mobile == data.mobile)) is not None:
            raise DuplicateLeadError()
        raise
    db.refresh(lead)
    # Preserve the mandated four-key JSON body. Exposed headers let the public
    # applicant see reasons without granting access to private lead records.
    response.headers["X-Rejection-Reasons"] = json.dumps(reasons, ensure_ascii=True)
    if score_error:
        response.headers["X-Credit-Score-Error"] = score_error
    return LeadCreated(lead_id=lead.id, credit_score=score, bre_status=status)


@router.get("", response_model=LeadPage, dependencies=[Depends(require_admin)])
def list_leads(
    search: str | None = Query(None, max_length=120),
    loan_type: LoanType | None = None,
    bre_status: BREStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    clauses = filters(search, loan_type, bre_status)
    total = db.scalar(select(func.count()).select_from(Lead).where(*clauses))
    items = db.scalars(
        select(Lead)
        .where(*clauses)
        .order_by(Lead.created_at.desc(), Lead.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return LeadPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/export", dependencies=[Depends(require_admin)])
def export_leads(
    search: str | None = Query(None, max_length=120),
    loan_type: LoanType | None = None,
    bre_status: BREStatus | None = None,
    db: Session = Depends(get_db),
):
    workbook = Workbook(write_only=True)
    sheet = workbook.create_sheet("Leads")
    sheet.append(
        [
            "Lead ID",
            "Customer Name",
            "Mobile",
            "Loan Type",
            "Credit Score",
            "BRE Status",
            "Created Date",
            "Rejection Reasons",
        ]
    )
    for lead in db.scalars(
        select(Lead)
        .where(*filters(search, loan_type, bre_status))
        .order_by(Lead.id)
        .execution_options(yield_per=500)
    ):
        row = [
            lead.id,
            lead.full_name,
            lead.mobile,
            lead.loan_type,
            lead.credit_score,
            lead.bre_status,
            lead.created_at.isoformat(),
            "; ".join(lead.rejection_reasons),
        ]
        sheet.append(
            [
                "'" + value
                if isinstance(value, str) and value.startswith(("=", "+", "-", "@"))
                else value
                for value in row
            ]
        )
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="moneybeing-leads.xlsx"'},
    )


@router.get(
    "/{lead_id}", response_model=LeadRead, dependencies=[Depends(require_admin)]
)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if lead is None:
        raise HTTPException(404, "Lead not found")
    return lead
