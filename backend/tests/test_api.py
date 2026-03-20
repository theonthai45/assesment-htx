import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app  # noqa: E402

# Ran into deprecated function on_event is deprecated, use lifespan event handlers instead.
# had to check for lifespan events instead

@pytest_asyncio.fixture(scope="session", autouse=True)
async def _lifespan() -> None:
    await app.router.startup()
    yield
    await app.router.shutdown()


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
