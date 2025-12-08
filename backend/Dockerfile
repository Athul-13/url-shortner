FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

