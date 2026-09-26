from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.rule import Rule
from app.schemas.rule import RuleRead, RuleWrite

router = APIRouter(
    prefix="/api/rules", tags=["Business rules"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=list[RuleRead])
def list_rules(db: Session = Depends(get_db)):
    return db.scalars(select(Rule).order_by(Rule.id)).all()


@router.post("", response_model=RuleRead, status_code=201)
def create_rule(data: RuleWrite, db: Session = Depends(get_db)):
    rule = Rule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/{rule_id}", response_model=RuleRead)
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if rule is None:
        raise HTTPException(404, "Rule not found")
    return rule


@router.put("/{rule_id}", response_model=RuleRead)
def update_rule(rule_id: int, data: RuleWrite, db: Session = Depends(get_db)):
    rule = get_rule(rule_id, db)
    for key, value in data.model_dump().items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    db.delete(get_rule(rule_id, db))
    db.commit()
    return Response(status_code=204)
