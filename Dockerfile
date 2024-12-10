# Use the official Python base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system-level dependencies required for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libatlas-base-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt to the container
COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf ~/.cache/pip

# Copy the rest of the application code
COPY . .

# Expose port for the web server (default for Flask is 8080)
EXPOSE 8080

# Use Gunicorn as the production server
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "main:app"]
