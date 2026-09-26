from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


def mount_frontend(app: FastAPI, directory: str) -> None:
    """Register after API routes so auth, API and OpenAPI retain priority."""
    app.mount("/", StaticFiles(directory=directory, html=True), name="frontend")
