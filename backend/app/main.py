import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .database import get_connection, init_db
from .utils import save_upload_file

try:
    import whisper  # type: ignore
except Exception:  # pragma: no cover
    whisper = None  # type: ignore


AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio_files"

app = FastAPI()

# Make sure this allows origin so there wont be a CORS issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Initialize database first before loading modal
    init_db()

    app.state.whisper_modal = whisper.load_model("tiny")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> Dict[str, Any]:
    model = getattr(app.state, "whisper_modal", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Whisper model not loaded")

    filename = await save_upload_file(AUDIO_DIR, file)
    audio_path = AUDIO_DIR / filename

    result = model.transcribe(str(audio_path))
    text = (result.get("text")).strip() # remove spaces before inserting into db
    
    with get_connection() as conn:
        # insert the transcriptions output so that i can pull it out
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


@app.get("/search")
def search(filename: Optional[str] = None) -> List[Dict[str, Any]]:
    if not filename:
        raise HTTPException(status_code=400, detail="Missing required query param: filename")

    with get_connection() as conn:
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
