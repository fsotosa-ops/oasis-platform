# ============================================================================
# Stage 1: Builder - Install dependencies with Poetry
# ============================================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install Poetry
ENV POETRY_HOME="/opt/poetry" \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1

RUN pip install --no-cache-dir poetry==1.8.2

# Copy only dependency files first (better caching)
COPY pyproject.toml poetry.lock ./

# Install dependencies (no dev dependencies)
RUN poetry install --only main --no-root

# ============================================================================
# Stage 2: Runtime - Minimal production image
# ============================================================================
FROM python:3.11-slim AS runtime

WORKDIR /app

# Create non-root user for security
RUN groupadd --gid 1000 appgroup && \
    useradd --uid 1000 --gid appgroup --shell /bin/bash appuser

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Set PATH to use venv
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copy application code
COPY common/ ./common/
COPY services/webhook_service/ ./services/webhook_service/

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Cloud Run uses PORT environment variable (default 8080)
ENV PORT=8080

EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

# Run the application
CMD ["sh", "-c", "uvicorn services.webhook_service.main:app --host 0.0.0.0 --port ${PORT}"]
