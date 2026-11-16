# Enterprise Multi-Stage Dockerfile for Python (psales-anl-bb47vo)
# Modernized for Google Cloud Run
FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt* pyproject.toml* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir --user -r requirements.txt; \
    elif [ -f pyproject.toml ]; then pip install --no-cache-dir --user .; \
    else pip install --no-cache-dir --user flask gunicorn psycopg2-binary; fi

FROM python:3.11-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .

ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

CMD ["sh", "-c", "if [ -f app.py ]; then python3 app.py; elif [ -f main.py ]; then python3 main.py; elif [ -f wsgi.py ]; then gunicorn --bind 0.0.0.0:$PORT wsgi:app; else python3 -m http.server $PORT; fi"]
