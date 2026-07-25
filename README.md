# Handwritten Digit Recognition

Draw a digit (0-9) on a canvas and get a real-time prediction from an
Artificial Neural Network (ANN) trained on MNIST, served by a FastAPI backend.

```
React (Vite + TS)  →  Canvas drawing  →  Axios  →  FastAPI  →  Keras ANN  →  JSON prediction
```

## Project Structure

```
backend/    FastAPI service, ML training/inference pipeline
frontend/   React + Vite + TypeScript + Tailwind UI
```

See `backend/README` sections below for API details, and the source tree:

```
backend/app/
├── api/          # predict.py, health.py — route handlers
├── core/         # config.py, logging.py — centralized settings & logging
├── ml/           # preprocess.py, train.py, evaluate.py, predictor.py
├── models/       # digit_ann.keras — trained model artifact
└── schemas/      # request.py, response.py — Pydantic models

frontend/src/
├── components/   # Canvas, Toolbar, PredictionCard, ConfidenceChart, Loader
├── hooks/        # usePrediction, useTheme
├── services/     # api.ts — centralized Axios client
├── utils/        # canvas.ts, image.ts
├── pages/        # Home.tsx
└── types/        # prediction.ts
```

## Prerequisites

- Python 3.13 (TensorFlow 2.21 requires 3.10-3.13; **not** yet compatible with 3.14)
- Node.js 20+
- Docker + Docker Compose (optional, for containerized run)

## Quick Start (Docker Compose)

The trained model is already committed at `backend/app/models/digit_ann.keras`,
so no training step is required.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (docs at `/docs`)

## Manual Setup

### 1. Backend

```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Train the model** (only needed if `app/models/digit_ann.keras` is missing —
training is intentionally separate from serving):

```bash
python -m app.ml.train
```

This downloads MNIST, trains the ANN (Dense 256 → 128 → 64 → Softmax(10))
with early stopping, and saves the model to `app/models/digit_ann.keras`.
Typical test accuracy: ~98%.

Optionally evaluate a saved model in detail (classification report + confusion matrix):

```bash
python -m app.ml.evaluate
```

**Run the API:**

```bash
uvicorn app.main:app --reload --port 8000
```

The model is loaded once at startup (see the `lifespan` handler in `app/main.py`)
and never retrained on request.

- Health check: `GET http://localhost:8000/health`
- Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # adjust VITE_API_BASE_URL if the backend isn't on :8000
npm run dev
```

Open http://localhost:5173.

## API Reference

### `POST /api/predict`

Request:

```json
{ "image": "base64_encoded_png" }
```

`image` may optionally include a `data:image/png;base64,` prefix (as produced by
`canvas.toDataURL()`), which is stripped automatically.

Response:

```json
{
  "prediction": 8,
  "confidence": 0.993,
  "probabilities": { "0": 0.0001, "1": 0.0002, "...": "...", "9": 0.0010 },
  "inference_time_ms": 12.4
}
```

Errors (e.g. invalid base64, empty/blank drawing) return `400` with:

```json
{ "detail": "No digit strokes detected in the image." }
```

### `GET /health`

```json
{ "status": "ok", "model_loaded": true }
```

## ANN Architecture

```
Input (784)
  → Dense(256, ReLU) → Dropout(0.3)
  → Dense(128, ReLU) → Dropout(0.3)
  → Dense(64, ReLU)
  → Dense(10, Softmax)
```

Trained with Adam + sparse categorical crossentropy, early stopping on
validation loss, batch size 128.

## Image Preprocessing Pipeline

Canvas drawings rarely match MNIST's format directly, so the backend
(`app/ml/preprocess.py`) normalizes them before inference:

1. Decode base64 → PIL image, composite onto white if it has alpha
2. Convert to grayscale, invert (canvas is dark-on-white; MNIST is light-on-dark)
3. Threshold out anti-aliasing noise, crop to the digit's bounding box
4. Resize (aspect-preserving) to fit a 20×20 box, pad to 28×28
5. Center the digit on its center of mass (matches MNIST's own preparation)
6. Normalize pixels to `[0, 1]` and flatten to a 784-length vector

## Code Quality

**Backend** (Black + Ruff, configured in `backend/pyproject.toml`):

```bash
cd backend
black app
ruff check app
```

**Frontend** (ESLint + Prettier):

```bash
cd frontend
npm run lint
npm run format
```

## Environment Variables

**Backend** (optional `.env`, prefix `APP_`):

| Variable | Default | Description |
|---|---|---|
| `APP_ENVIRONMENT` | `development` | Environment name |
| `APP_LOG_LEVEL` | `INFO` | Logging level |
| `APP_CORS_ORIGINS` | `["http://localhost:5173", ...]` | Allowed CORS origins (JSON array) |

**Frontend** (`.env`, see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend base URL |

## Features

- Freehand canvas drawing with adjustable brush size
- Undo last stroke / clear canvas
- Loading state and inference-time display during prediction
- Confidence bar chart across all 10 digit classes
- Dark / light mode (persisted, respects system preference by default)
- Client- and server-side validation for empty/invalid drawings
