"""
QA Persona v2 -- auto-generated tests
Service: app
Suite:   unit
Source:  test_strategy/plans/app__unit.json
Generated: 2024-07-12T13:01:01.123456Z
"""
import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime

from fastapi.testclient import TestClient
from app.main import app

from app.services.fsrs import calculate_fsrs_next_interval, generate_flashcards_from_material
from app.services.ingestion import process_material_upload
from app.services.analytics import get_mastery_analytics

@pytest.fixture
def client():
    """Provides a FastAPI TestClient for making requests to the app."""
    with TestClient(app) as c:
        yield c


def test_app_unit_001():
    """Verify FSRS algorithm calculates next review interval correctly.

    test_id: app__unit__001
    target: app.services.fsrs.calculate_fsrs_next_interval
    requirement_id: FUNC-CORE
    ac_ids: FUNC-CORE-AC-3
    """
    # Initial state
    stability, difficulty, rep_count = 5.0, 7.0, 2

    # Case 1: 'good' review (rating=3)
    good_review_result = calculate_fsrs_next_interval(3, stability, difficulty, rep_count)
    assert good_review_result['interval_days'] > 1
    assert good_review_result['stability'] > stability

    # Case 2: 'again' review (rating=1)
    again_review_result = calculate_fsrs_next_interval(1, stability, difficulty, rep_count)
    assert again_review_result['interval_days'] == 1
    assert again_review_result['stability'] < stability

@patch('app.services.ingestion.execute_db')
def test_app_unit_002(mock_execute_db):
    """Verify content chunking splits long text into smaller pieces.

    test_id: app__unit__002
    target: app.services.ingestion.process_material_upload
    requirement_id: FUNC-CORE
    ac_ids: FUNC-CORE-AC-2
    """
    long_text = ' '.join(['word'] * 120)
    result = process_material_upload(
        user_id='user_test',
        title='Long Document',
        category='research',
        format_type='text',
        content_text=long_text
    )
    # chunk_size is 50, so 120 words should result in 3 chunks
    assert result['chunks_count'] == 3
    assert mock_execute_db.call_count > 1 # 1 for material, 3 for chunks

@patch('app.services.fsrs.execute_db')
@patch('app.services.fsrs.query_db')
def test_app_unit_003(mock_query_db, mock_execute_db):
    """Verify flashcard generation service creates formatted flashcards.

    test_id: app__unit__003
    target: app.services.generation.generate_flashcards_from_material
    requirement_id: FUNC-CORE
    ac_ids: FUNC-CORE-AC-4
    """
    mock_query_db.return_value = {'id': 'mat_123', 'title': 'Test Material'}
    
    flashcards = generate_flashcards_from_material(material_id='mat_123', count=2)
    
    assert len(flashcards) == 2
    assert 'front' in flashcards[0]
    assert 'back' in flashcards[0]
    assert 'source_citation' in flashcards[0]
    assert 'Test Material' in flashcards[0]['front']
    mock_query_db.assert_called_once_with("SELECT * FROM materials WHERE id = ?", ('mat_123',), one=True)
    # 1 call for material, 2 for flashcards
    assert mock_execute_db.call_count == 2

@patch('app.services.analytics.query_db')
def test_app_unit_004(mock_query_db):
    """Verify mastery analytics service calculates metrics correctly.

    test_id: app__unit__004
    target: app.services.analytics.get_mastery_analytics
    requirement_id: FUNC-CORE
    ac_ids: FUNC-CORE-AC-5
    """
    # Mock DB calls with predictable data
    mock_query_db.side_effect = [
        {'count': 25},  # cards_reviewed
        {'avg_s': 3.0}, # avg_stability
        []             # history
    ]

    analytics = get_mastery_analytics(user_id='user_test')

    # Expected calculations based on mocked data and function logic
    # retention_pct = 75.0 + (3.0 * 6.5) = 94.5
    # mastery_pct = 94.5 * 0.96 = 90.72 -> round(90.7)
    assert analytics['cards_reviewed_today'] == 25
    assert analytics['stability_index'] == 3.0
    assert analytics['retention_rate_pct'] == 94.5
    assert analytics['mastery_score_pct'] == 90.7
    assert 'heatmap_data' in analytics
    assert len(analytics['heatmap_data']) > 0 # Check for default heatmap data

@patch('app.services.ingestion.execute_db')
def test_app_unit_005(mock_execute_db):
    """Verify material ingestion dispatches correctly for different file types.

    test_id: app__unit__005
    target: app.services.ingestion.process_material_upload
    requirement_id: FUNC-CORE
    ac_ids: FUNC-CORE-AC-1
    """
    # Test PDF (no special logic, should just pass through)
    process_material_upload('user_1', 'PDF Doc', 'notes', 'pdf', 'Some pdf text.')
    pdf_call_args = mock_execute_db.call_args_list[0].args[1]
    assert pdf_call_args[5] == 'Some pdf text.'

    mock_execute_db.reset_mock()

    # Test MP3 (should trigger transcription stub)
    title = 'Audio Lecture'
    process_material_upload('user_1', title, 'lecture', 'mp3', '')
    mp3_call_args = mock_execute_db.call_args_list[0].args[1]
    inserted_content_text = mp3_call_args[5]
    assert f"[Whisper Transcribed Audio from '{title}']" in inserted_content_text

def test_app_unit_006(client):
    """Verify login service logic for Google SSO.

    test_id: app__unit__006
    target: app.main.login
    requirement_id: NFR-SEC
    ac_ids: NFR-SEC-AC-2
    """
    email = 'test.user@google.com'
    response = client.post("/api/v1/auth/login", json={"email": email, "provider": "google"})
    
    assert response.status_code == 200
    data = response.json()
    assert 'token' in data
    assert data['token'] == 'jwt-mock-token-session-12345'
    assert 'user' in data
    assert data['user']['email'] == email
