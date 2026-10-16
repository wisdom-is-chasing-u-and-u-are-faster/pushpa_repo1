"""Unit & Integration tests for Dynamic Study Workflow Scheduler & iCal Calendar Sync.
AC: A personalized study schedule is automatically generated and can be synced with external calendars.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_database()


def test_get_study_schedule():
    """Validates retrieving upcoming personalized study workflow sessions."""
    res = client.get("/api/v1/schedule")
    assert res.status_code == 200
    data = res.json()
    assert "upcoming_sessions" in data
    assert len(data["upcoming_sessions"]) >= 1


def test_rebalance_study_schedule():
    """Validates dynamic schedule rebalancing based on FSRS review queue."""
    res = client.post("/api/v1/schedule/rebalance")
    assert res.status_code == 200
    data = res.json()
    assert "upcoming_sessions" in data
    assert len(data["upcoming_sessions"]) >= 2


def test_export_ical_feed():
    """Validates RFC 5545 iCalendar feed export."""
    res = client.get("/api/v1/schedule/export-ical")
    assert res.status_code == 200
    assert "text/calendar" in res.headers["content-type"]
    content = res.text
    assert "BEGIN:VCALENDAR" in content
    assert "BEGIN:VEVENT" in content
    assert "END:VCALENDAR" in content
