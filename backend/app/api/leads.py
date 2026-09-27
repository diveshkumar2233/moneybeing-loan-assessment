import json

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.lead import Lead
from app.schemas.lead import (
    BREStatus,
    LeadCreate,
    LeadCreated,
    LeadPage,
    LeadRead,
    LoanType,
)
from app.services.lead_export import build_leads_workbook
from app.services.lead_service import save_application

router = APIRouter(prefix="/api/leads", tags=["Leads"])


def build_lead_filters(
    search: str | None = None,
    loan_type: LoanType | None = None,
    bre_status: BREStatus | None = None,
) -> list[ColumnElement[bool]]:
    clauses = []
    if search:
        # Treat SQL wildcard characters as literal user input when searching.
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
    lead = save_application(db, data)
    # Expose rejection reasons without changing the required JSON response.
    response.headers["X-Rejection-Reasons"] = json.dumps(
        lead.rejection_reasons, ensure_ascii=True
    )
    if lead.credit_score_error:
        response.headers["X-Credit-Score-Error"] = lead.credit_score_error
    return LeadCreated(
        lead_id=lead.id, credit_score=lead.credit_score, bre_status=lead.bre_status
    )


@router.get("", response_model=LeadPage, dependencies=[Depends(require_admin)])
def list_leads(
    search: str | None = Query(None, max_length=120),
    loan_type: LoanType | None = None,
    bre_status: BREStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    clauses = build_lead_filters(search, loan_type, bre_status)
    total = db.scalar(select(func.count()).select_from(Lead).where(*clauses))
    items = db.scalars(
        # ID breaks timestamp ties, keeping pagination order consistent.
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
    # Export every matching lead, using the same filters as the paginated table.
    query = (
        select(Lead)
        .where(*build_lead_filters(search, loan_type, bre_status))
        .order_by(Lead.id)
        .execution_options(yield_per=500)
    )
    output = build_leads_workbook(db.scalars(query))
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
