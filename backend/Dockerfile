FROM python:3.12-slim

# Configuração essencial de Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

WORKDIR /app

# Dependências do sistema (gcc necessário para psycopg2/alembic/etc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instala dependências Python primeiro (aproveita cache do Docker)
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copia TODOS os arquivos do backend para /app
COPY backend/ .

# Verifica que o módulo app consegue ser importado no build
RUN python -c "import sys; print('PYTHONPATH:', sys.path); import app; print('app module OK')"

EXPOSE 8000

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

