FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Tesseract-OCR
RUN apt-get update && apt-get install -y \
    gcc \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create bills directory
RUN mkdir -p /app/bills

# Run the application with startup initialization
CMD ["sh", "-c", "python -c \"from app.main import init_db; init_db()\" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
