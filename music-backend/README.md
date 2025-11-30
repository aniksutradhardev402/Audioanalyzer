# Backend - Audio Analyzer

**Python Flask API** for music audio analysis, chord detection, and feature extraction.

---

## Setup

### Prerequisites
- Python 3.8+
- pip or conda
- Virtual environment (recommended)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Running the Server

```bash
# Activate virtual environment first
source venv/bin/activate

# Start Flask server
python app.py
```

Server runs on: `http://localhost:5000`

---

## API Endpoints

### Health Check
```http
GET /api/health
Response: { "status": "ok" }
```

### Upload & Analyze
```http
POST /api/upload
Content-Type: multipart/form-data
Body: file=<audio_file>
```

---

## Key Files

- `app.py` - Main Flask application with route definitions
- `analyzer.py` - Audio analysis logic and ML model integration
- `tasks.py` - Celery tasks for async processing
- `requirements.txt` - Python dependencies
- `Dockerfile` - Docker container configuration

---

## Technologies

- **Flask** - Web framework
- **Librosa** - Audio processing
- **Essentia** - Music feature extraction
- **Celery** - Async task queue
- **Docker** - Containerization
