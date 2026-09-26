import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api import auth, dashboard, leads, rules
from app.core.config import get_settings
from app.core.database import engine
from app.exceptions.custom_exceptions import RuleConfigurationError

app = FastAPI(
    title="MoneyBeing Loan Eligibility & Lead Management",
    version="1.0.0",
    description="Database-driven eligibility assessment. Credit scores are MOCK data, not bureau results.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Rejection-Reasons", "X-Credit-Score-Error"],
)
for router in (auth.router, leads.router, rules.router, dashboard.router):
    app.include_router(router)


@app.exception_handler(SQLAlchemyError)
async def database_error(request: Request, exc: SQLAlchemyError):
    logging.getLogger(__name__).error(
        "Database operation failed: %s", type(exc).__name__
    )
    return JSONResponse(
        status_code=503,
        content={"detail": "Database temporarily unavailable. Please try again."},
    )


@app.exception_handler(RuleConfigurationError)
async def rule_error(request: Request, exc: RuleConfigurationError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Eligibility rules are misconfigured. Please contact an administrator."
        },
    )


@app.get("/health", tags=["Health"])
def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
