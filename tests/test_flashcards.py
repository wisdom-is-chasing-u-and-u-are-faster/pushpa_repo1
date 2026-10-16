"""Unit & Integration tests for FSRS Review Engine & Flashcards.
AC: Users can participate in flashcard review sessions and take adaptive quizzes based on their content.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_database()


def test_generate_flashcards():
    """Validates LLM-assisted flashcard synthesis from ingested material."""
    res = client.post("/api/v1/flashcards/generate", json={"material_id": "mat_1", "count": 2})
    assert res.status_code == 201
    data = res.json()
    assert data["generated_count"] >= 1
    assert "flashcards" in data
    assert len(data["flashcards"]) >= 1
    first_card = data["flashcards"][0]
    assert "front" in first_card
    assert "back" in first_card


def test_get_due_flashcard_queue():
    """Validates fetching due flashcards for spaced repetition."""
    res = client.get("/api/v1/flashcards/due")
    assert res.status_code == 200
    cards = res.json()
    assert isinstance(cards, list)
    assert len(cards) >= 1


def test_submit_fsrs_review_rating():
    """Validates FSRS review submission and interval calculation."""
    # Fetch due cards first
    due_res = client.get("/api/v1/flashcards/due")
    cards = due_res.json()
    card_id = cards[0]["id"]

    # Submit Good rating (3)
    res = client.post("/api/v1/flashcards/review", json={"card_id": card_id, "rating": 3})
    assert res.status_code == 200
    data = res.json()
    assert data["card_id"] == card_id
    assert "new_interval_days" in data
    assert data["new_interval_days"] >= 1
    assert "stability" in data
