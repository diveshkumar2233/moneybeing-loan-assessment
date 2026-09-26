FROM python:3.12-slim
WORKDIR /workspace/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app ./app
COPY database /workspace/database
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python /workspace/database/init_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
