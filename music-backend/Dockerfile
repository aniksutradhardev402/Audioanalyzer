FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install build-time dependencies like Cython and numpy first.
# This ensures they are available when other packages (like madmom) are being built.
# We also install the CPU-only version of PyTorch here to satisfy demucs's dependency.
RUN pip install --no-cache-dir Cython "numpy<2.0.0"
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads results

CMD ["python", "app.py"]