from __future__ import annotations

"""
Upload handling: unique on-disk names and streaming writes.

if a filename already exists on the server, store under a new
unique name (UUID suffix) instead of overwriting.
"""
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import UploadFile


def unique_filename(directory: Path, original_filename: str) -> str:
    directory.mkdir(parents=True, exist_ok=True)
    candidate = original_filename
    path = directory / candidate

    if not path.exists():
        return candidate

    stem = path.stem
    suffix = path.suffix
    return f"{stem}_{uuid4().hex[:8]}{suffix}"


async def save_upload_file(directory: Path, upload: UploadFile) -> str:
    filename = unique_filename(directory, upload.filename or "upload")
    dst = directory / filename

    # Stream in chunks to avoid loading very large recordings into memory at once and prevent issues
    async with aiofiles.open(dst, "wb") as f:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            await f.write(chunk)

    await upload.close()
    return filename
