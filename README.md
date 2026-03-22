# HTX assessment test

## Local development

### Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Health check**: `GET http://localhost:8000/health`

## Unit tests

Run backend and frontend tests from the repository root (or after `cd` into each project).

### Backend (pytest)

From the repo root, with dependencies installed (same virtual environment as local development):

```bash
cd backend
pytest
```

Run a single file or verbose output if needed:

```bash
cd backend
pytest tests/ -v
```

### Frontend (Vitest)

Install dependencies once, then run the test suite:

```bash
cd frontend
npm install
npm run test -- --run
```

`--run` executes tests once and exits (suitable for CI). Omit it for watch mode while developing:

```bash
cd frontend
npm run test
```

Optional browser UI for Vitest:

```bash
cd frontend
npm run test:ui
```

## Docker

### Backend container

```bash
docker build -t transcription-backend ./backend
docker run --rm -p 8000:8000 transcription-backend
```

Then open `http://localhost:8000/health` (API root: `http://localhost:8000`; interactive docs: `/docs`).

### Frontend container

Build a production image (API URL is baked in at build time; point it at your backend):

```bash
docker build -t htx-frontend ./frontend
```

Run and map host port **3000** to the container’s nginx (**80**):

```bash
docker run --rm -p 3000:80 htx-frontend
```

Open `http://localhost:3000`.

If the backend runs on the host while the frontend runs in Docker, use your machine’s gateway (macOS/Windows Docker Desktop):

```bash
docker build --build-arg VITE_API_BASE_URL=http://host.docker.internal:8000 -t htx-frontend ./frontend
docker run --rm -p 3000:80 htx-frontend
```

## Assumptions
- **SQLite is sufficient**: expected low concurrency, no heavy concurrent writes.
- **Whisper tiny is pre-downloaded**: model weights are fetched at Docker build time to avoid cold starts.
- **Open CORS**: `allow_origins=["*"]` is used for local dev/assessment simplicity.
- **Local file storage**: uploaded audio is stored inside the container filesystem (no persistent volume required for assessment).
- **ffmpeg handles decoding**: no manual audio preprocessing is required.
