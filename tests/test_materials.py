"""Unit & Integration tests for Study Material Ingestion Service.
AC: Users can successfully upload and manage various study material formats.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_database()


def test_upload_pdf_material():
    """Validates multi-modal PDF upload."""
    payload = {
        "title": "Quantum Mechanics Syllabus",
        "category": "Physics",
        "format": "pdf",
        "content_text": "Schrodinger equation and wave function collapse principles."
    }
    res = client.post("/api/v1/materials/upload", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Quantum Mechanics Syllabus"
    assert data["format"] == "pdf"
    assert data["status"] == "PROCESSED"
    assert data["chunks_count"] >= 1


def test_upload_audio_whisper_transcription():
    """Validates audio material processing and Whisper transcription fallback."""
    payload = {
        "title": "Algorithms Lecture 4 - Dynamic Programming",
        "category": "Computer Science",
        "format": "audio",
        "content_text": ""
    }
    res = client.post("/api/v1/materials/upload", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Algorithms Lecture 4 - Dynamic Programming"
    assert data["format"] == "audio"
    assert data["chunks_count"] >= 1


def test_list_materials():
    """Validates fetching material list from content library."""
    res = client.get("/api/v1/materials")
    assert res.status_code == 200
    materials = res.json()
    assert isinstance(materials, list)
    assert len(materials) >= 1
