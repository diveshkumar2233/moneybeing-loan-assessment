from fastapi import HTTPException


class DuplicateLeadError(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail="Lead already exists")


class RuleConfigurationError(Exception):
    """An active database rule cannot be evaluated safely."""
