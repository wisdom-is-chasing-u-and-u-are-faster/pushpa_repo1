"""End-to-End full-stack workflow integration smoke tests.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_database()


def test_full_study_lifecycle_e2e():
    """Simulates complete learner journey:
    1. Health check & profile loading
    2. Upload study material
    3. Synthesize flashcards and complete review session
    4. Generate and submit adaptive quiz
    5. Check dynamic schedule and export iCal
    6. Verify updated retention telemetry analytics
    """
    # 1. Health Probe
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"

    # Profile
    prof_res = client.get("/api/v1/users/profile")
    assert prof_res.status_code == 200
    assert prof_res.json()["role"] == "student"

    # 2. Ingest Material
    upload_res = client.post("/api/v1/materials/upload", json={
        "title": "Computer Networks: TCP Congestion Control",
        "category": "Computer Science",
        "format": "pdf",
        "content_text": (
            "TCP Tahoe and Reno implement slow start, congestion avoidance, "
            "fast retransmit, and fast recovery mechanisms."
        )
    })
    assert upload_res.status_code == 201
    mat_id = upload_res.json()["material_id"]

    # 3. Flashcards Synthesis & Review
    fc_res = client.post("/api/v1/flashcards/generate", json={"material_id": mat_id, "count": 2})
    assert fc_res.status_code == 201
    fc_id = fc_res.json()["flashcards"][0]["id"]

    rev_res = client.post("/api/v1/flashcards/review", json={"card_id": fc_id, "rating": 4})
    assert rev_res.status_code == 200
    assert rev_res.json()["stability"] >= 2.0

    # 4. Adaptive Quiz
    quiz_res = client.post("/api/v1/quizzes/generate", json={"material_id": mat_id, "question_count": 2})
    assert quiz_res.status_code == 201
    quiz_id = quiz_res.json()["quiz_id"]
    questions = quiz_res.json()["questions"]

    sub_res = client.post("/api/v1/quizzes/submit", json={
        "quiz_id": quiz_id,
        "answers": [{"question_id": questions[0]["id"], "selected_index": questions[0]["correct_index"]}]
    })
    assert sub_res.status_code == 200
    assert sub_res.json()["score_percentage"] > 0

    # 5. Schedule & Calendar
    sched_res = client.get("/api/v1/schedule")
    assert sched_res.status_code == 200

    rebal_res = client.post("/api/v1/schedule/rebalance")
    assert rebal_res.status_code == 200

    ical_res = client.get("/api/v1/schedule/export-ical")
    assert ical_res.status_code == 200
    assert "BEGIN:VCALENDAR" in ical_res.text

    # 6. Analytics
    analytics_res = client.get("/api/v1/analytics/mastery")
    assert analytics_res.status_code == 200
    assert analytics_res.json()["mastery_score_pct"] > 0
