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

## Assumptions
- **SQLite is sufficient**: expected low concurrency, no heavy concurrent writes.
- **Whisper tiny is pre-downloaded**: model weights are fetched at Docker build time to avoid cold starts.
- **Open CORS**: `allow_origins=["*"]` is used for local dev/assessment simplicity.
- **Local file storage**: uploaded audio is stored inside the container filesystem (no persistent volume required for assessment).
- **ffmpeg handles decoding**: no manual audio preprocessing is required.
