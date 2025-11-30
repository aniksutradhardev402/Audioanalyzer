# Frontend - Audio Analyzer

**React + Vite + Tailwind CSS** interactive UI for audio file uploads, analysis visualization, and music insights.

---

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Development

### Start Dev Server

```bash
npm run dev
```

Server runs on: `http://localhost:5173`

**Note:** Make sure the backend is running on `http://localhost:5000` before starting frontend

---

## Build

```bash
npm run build
```

Production-ready files in `dist/` folder

---

## Key Technologies

- **React 18** - UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios/Fetch** - API communication

---

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── styles/         # CSS/Tailwind styles
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

---

## API Integration

Frontend communicates with backend via proxy. Vite forwards `/api/` requests to backend.

Example API call:
```javascript
fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```
