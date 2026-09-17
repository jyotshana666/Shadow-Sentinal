# Production Dockerfile for Shadow Sentinel ML Microservice
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./ML/requirements.txt
RUN pip install --no-cache-dir -r ./ML/requirements.txt

COPY . ./ML

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "-m", "uvicorn", "ML.api.app:app", "--host", "0.0.0.0", "--port", "5000"]
