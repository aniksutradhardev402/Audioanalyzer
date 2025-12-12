# Audioanalyzer

**An AI-powered music analysis tool** that detects chords, extracts audio features, and provides detailed musical insights using deep learning models.

---

## Overview

Audioanalyzer is a full-stack web application built with:
- **Backend**: Python (Flask) - audio processing, ML models, REST APIs
- **Frontend**: React + Vite + Tailwind CSS - interactive UI for music uploads and analysis results

---

## Project Structure

```
Audioanalyzer/
├── music-backend/          # Python FastAPI backend
│   ├── app.py              # Main Flask/FastAPI app
│   ├── analyzer.py         # Audio analysis logic
│   ├── requirements.txt    # Python dependencies
│   ├── docker-compose.yml  # Docker setup
│   ├── Dockerfile          # Container config
│   └── uploads/            # Uploaded audio files
├── music-frontend/         # React + Vite frontend
│   ├── src/                # React components
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── index.html          # HTML entry point
└── results/                # Analysis output
```

---
---

+## System Architecture
+
+The application follows a decoupled client-server architecture:
+
+1.  **Frontend**: Built with React, Vite, and Tailwind CSS. It handles user interactions, file uploads, and visualization of analysis results.
+2.  **Backend**: A Flask (Python) API that processes audio files. It uses libraries like Librosa and Essentia for DSP (Digital Signal Processing) and ML tasks.
+3.  **Async Processing**: Heavy analysis tasks are offloaded to Celery workers to ensure API responsiveness.
+4.  **Containerization**: Services are containerized using Docker for consistent deployment.
+
+---
+

## Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- pip or conda (Python package manager)
+- Docker & Docker Compose (optional)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/aniksutradhardev402/Audioanalyzer.git
cd Audioanalyzer
```


```bash
cd music-backend
```
---

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

---



```bash
cd music-frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Frontend-Backend Connection

### Vite Proxy Configuration

The frontend is configured to proxy all `/api/` requests to the backend during development.

In `music-frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### Making API Calls from React

Inside your React components, make API calls like this:

```javascript
// Automatically proxied to http://localhost:5000/api/...
fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
.then(res => res.json())
.then(data => console.log(data));
```

This avoids CORS errors during development!

---

## Backend API Endpoints

### Health Check
```http
GET /api/health
Response: { "status": "ok" }
```

### Upload & Analyze Audio
```http
POST /api/upload
Content-Type: multipart/form-data
Body: { "file": <audio_file> }
Response: { "id": "...", "analysis": { ... } }
```

---

## Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **Librosa** - Audio processing & feature extraction
- **PyTorch / TensorFlow** - ML models for chord detection
- **Docker** - Containerization
- **Python** - Primary backend language

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript/JSX** - Frontend language

---

## Troubleshooting

### CORS Errors
- Make sure backend is running on `http://localhost:5000`
- Check `vite.config.js` proxy configuration is correct
- Restart the Vite dev server after changes

### API Not Responding
- Verify backend is running: `http://localhost:5000/api/health`
- Check backend terminal for errors or exceptions
- Ensure both services are on correct ports (Backend: 5000, Frontend: 5173)

### Frontend Won't Load
- Clear browser cache or use Incognito mode
- Check browser console for JavaScript errors (F12)
- Verify Node.js version: `node --version` (should be 16+)
- Reinstall node_modules: `npm install`

---

## Environment Variables

Create a `.env` file in `music-backend/` if needed:

```bash
PYTHON_ENV=development
API_PORT=5000
UPLOAD_FOLDER=uploads/
RESULTS_FOLDER=results/

```

---

## Docker Deployment 

You can run it in Docker:

```bash
cd Audioanalyzer

# Build Docker image
docker-compose build  

# Or use docker-compose
docker-compose up -d
```

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues, questions, or suggestions, please open an [Issue](https://github.com/aniksutradhardev402/Audioanalyzer/issues) on GitHub.

---

**Built by Anik Sutradhar**
