"""Unit & Integration tests for Retention Telemetry & Mastery Heatmaps.
AC: Dashboards correctly display real-time analytics on learning progress and mastery.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_database()


def test_get_mastery_analytics():
    """Validates real-time retention telemetry and heatmap payload structure."""
    res = client.get("/api/v1/analytics/mastery")
    assert res.status_code == 200
    data = res.json()
    assert "retention_rate_pct" in data
    assert "mastery_score_pct" in data
    assert "cards_reviewed_today" in data
    assert "heatmap_data" in data
    assert len(data["heatmap_data"]) >= 1
    assert data["retention_rate_pct"] > 50.0
