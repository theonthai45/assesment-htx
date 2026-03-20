FROM python:3.10-slim

WORKDIR /app

# This is added in to reduce bloat for docker init
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    XDG_CACHE_HOME=/app/.cache


# gathering the minimum for best perf runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Pre download model weights at build time to avoid cold starts
RUN mkdir -p "$XDG_CACHE_HOME"
RUN python -c "import whisper; whisper.load_model('tiny')"

COPY app /app/app

# This is to make sure the dockerfile doesn't uplaod the audio files when i'm testing it locally
RUN mkdir -p /app/audio_files

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
