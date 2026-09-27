# One hosted URL: statically exported Next.js UI + FastAPI + managed PostgreSQL.
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_STATIC_EXPORT=true
ENV NEXT_DIST_DIR=out
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN test -f out/index.html && test -f out/login/index.html && test -f out/dashboard/index.html && test -f out/leads/index.html && test -f out/rules/index.html

FROM python:3.12-slim
WORKDIR /workspace
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/app ./backend/app
COPY database/init_db.py database/default_rules.json ./database/
COPY --from=frontend-build /frontend/out ./frontend/out
ENV PYTHONUNBUFFERED=1
ENV STATIC_FRONTEND_DIR=/workspace/frontend/out
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python database/init_db.py && exec uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}"]
