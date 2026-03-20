import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# skip Whisper model loading during tests.
os.environ["DISABLE_WHISPER"] = "1"

from app.main import app  # noqa: E402
from app.database import DB_PATH  # noqa: E402

@pytest_asyncio.fixture(autouse=True)
async def _lifespan() -> None:
    # ensure the tests validate `init_db()` by starting from a clean DB.
    if DB_PATH.exists():
        DB_PATH.unlink()

    async with app.router.lifespan_context(app):
        yield


@pytest.mark.asyncio
async def test_health() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")

    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_transcriptions_returns_list() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/transcriptions")

    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_search_missing_param_returns_400() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/search")

    assert resp.status_code == 400
