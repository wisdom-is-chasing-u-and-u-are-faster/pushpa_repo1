"""Unit & Integration tests for Adaptive Quiz Engine.
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


def test_generate_adaptive_quiz():
    """Validates adaptive quiz synthesis from material."""
    res = client.post("/api/v1/quizzes/generate", json={"material_id": "mat_1", "question_count": 2})
    assert res.status_code == 201
    data = res.json()
    assert "quiz_id" in data
    assert "questions" in data
    assert len(data["questions"]) >= 1


def test_list_and_get_quiz():
    """Validates fetching quiz list and individual quiz details."""
    list_res = client.get("/api/v1/quizzes")
    assert list_res.status_code == 200
    quizzes = list_res.json()
    assert len(quizzes) >= 1

    quiz_id = quizzes[0]["id"]
    get_res = client.get(f"/api/v1/quizzes/{quiz_id}")
    assert get_res.status_code == 200
    details = get_res.json()
    assert details["quiz_id"] == quiz_id
    assert len(details["questions"]) >= 1


def test_submit_quiz_answers():
    """Validates quiz evaluation, score calculation, and retention decay reduction."""
    list_res = client.get("/api/v1/quizzes")
    quiz_id = list_res.json()[0]["id"]

    details_res = client.get(f"/api/v1/quizzes/{quiz_id}")
    questions = details_res.json()["questions"]

    # Provide correct answer for question 0
    answers = [
        {"question_id": questions[0]["id"], "selected_index": questions[0]["correct_index"]}
    ]

    res = client.post("/api/v1/quizzes/submit", json={"quiz_id": quiz_id, "answers": answers})
    assert res.status_code == 200
    data = res.json()
    assert data["quiz_id"] == quiz_id
    assert data["total_correct"] >= 1
    assert data["score_percentage"] > 0
    assert "knowledge_decay_reduction" in data
