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


## Docker

### Backend container

```bash
docker build -t transcription-backend ./backend
docker run --rm -p 8000:8000 transcription-backend
```

Then open `http://localhost:3000`.

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
