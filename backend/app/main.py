"""
- Tests set DISABLE_WHISPER=1 to skip model load.
- The spec asks for Hugging Face "openai/whisper-tiny". But im using the official
  `openai-whisper` package with model name "tiny". Which would be the same tiny model
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import get_connection, init_db
from .utils import save_upload_file

try:
    import whisper  # type: ignore
except Exception:  # pragma: no cover
    whisper = None  # type: ignore

# This is where the audio files are stored
AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio_files"
# This is to make sure the audio files are created
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    # Tests disable Whisper so pytest stays fast and does not need GPU/weights.
    if os.getenv("DISABLE_WHISPER") == "1":
        app.state.whisper_modal = None
        yield
        return

    if whisper is None:
        raise RuntimeError("openai-whisper is not installed or failed to import")

    app.state.whisper_modal = whisper.load_model("tiny")
    try:
        yield
    finally:
        app.state.whisper_modal = None


app = FastAPI(lifespan=lifespan)
# Expose saved uploads so the SPA can play back audio via <audio src="...">.
app.mount("/audio_files", StaticFiles(directory=AUDIO_DIR), name="audio_files")

# Make sure this allows origin so there wont be a CORS issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> Dict[str, Any]:
    model = getattr(app.state, "whisper_modal", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Whisper model not loaded")

    # save_upload_file ensures on-disk names are unique
    filename = await save_upload_file(AUDIO_DIR, file)
    audio_path = AUDIO_DIR / filename

    result = model.transcribe(str(audio_path))
    text = (result.get("text") or "").strip()

    with get_connection() as conn:
        conn.execute(
            "INSERT INTO transcriptions (filename, transcription) VALUES (?, ?)",
            (filename, text),
        )
        conn.commit()

    return {"filename": filename, "transcription": text}


@app.get("/transcriptions")
def get_transcriptions() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, filename, transcription, created_at
            FROM transcriptions
            ORDER BY datetime(created_at) DESC, id DESC
            """
        ).fetchall()

    return [dict(r) for r in rows]

# This search to extract file names with LIKE 
@app.get("/search")
def search(filename: Optional[str] = None) -> List[Dict[str, Any]]:
    if not filename:
        raise HTTPException(status_code=400, detail="Missing required query param: filename")

    with get_connection() as conn:
        # LIKE match on stored filenames
        rows = conn.execute(
            """
            SELECT id, filename, transcription, created_at
            FROM transcriptions
            WHERE filename LIKE ?
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            (f"%{filename}%",),
        ).fetchall()

    return [dict(r) for r in rows]
