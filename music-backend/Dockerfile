FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .


RUN pip install --no-cache-dir Cython "numpy<2.0.0"
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

COPY . .

RUN mkdir -p /app/uploads /app/results

ENV PYTHONUNBUFFERED=1

# use Gunicorn for the API webserver; bind to 0.0.0.0:5000
# The docker-compose service will run gunicorn for the web and celery for the worker (see compose file).
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "2", "--threads", "4", "--log-level", "info"]