"""MOCK ONLY. Deterministic pseudo-random scores; no credit bureau is contacted."""

import hashlib

from app.core.config import get_settings


class CreditServiceError(Exception):
    pass


def fetch_credit_score(mobile: str, date_of_birth: str) -> int:
    if get_settings().mock_credit_failure:
        raise CreditServiceError("Mock credit score service is unavailable")
    digest = hashlib.sha256(
        f"moneybeing-demo:{mobile}:{date_of_birth}".encode()
    ).digest()
    return 550 + int.from_bytes(digest[:4], "big") % 301
