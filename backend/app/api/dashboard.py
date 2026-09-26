from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.lead import Lead

router = APIRouter(
    prefix="/api/dashboard", tags=["Dashboard"], dependencies=[Depends(require_admin)]
)


class Summary(BaseModel):
    total_leads: int
    eligible_leads: int
    rejected_leads: int
    average_credit_score: float | None


@router.get("/summary", response_model=Summary)
def summary(db: Session = Depends(get_db)):
    total, eligible, rejected, average = db.execute(
        select(
            func.count(Lead.id),
            func.sum(case((Lead.bre_status == "Eligible", 1), else_=0)),
            func.sum(case((Lead.bre_status == "Not Eligible", 1), else_=0)),
            func.avg(Lead.credit_score),
        )
    ).one()
    return Summary(
        total_leads=total,
        eligible_leads=eligible or 0,
        rejected_leads=rejected or 0,
        average_credit_score=round(float(average), 1) if average is not None else None,
    )
