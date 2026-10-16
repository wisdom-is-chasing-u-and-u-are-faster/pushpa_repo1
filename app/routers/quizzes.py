"""Adaptive Quiz REST API Router."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.quiz import (
    generate_quiz_for_material,
    list_quizzes_for_user,
    get_quiz_details,
    evaluate_quiz_submission,
)

router = APIRouter(prefix="/api/v1/quizzes", tags=["Quizzes"])


class QuizGenerateRequest(BaseModel):
    material_id: str
    question_count: Optional[int] = 3


class AnswerItem(BaseModel):
    question_id: str
    selected_index: int


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[AnswerItem]


@router.post("/generate", status_code=201)
def generate_quiz(req: QuizGenerateRequest) -> Dict[str, Any]:
    """Generates an adaptive quiz from study content."""
    return generate_quiz_for_material(
        material_id=req.material_id,
        question_count=req.question_count or 3,
        user_id="user_1"
    )


@router.get("")
def list_quizzes() -> List[Dict[str, Any]]:
    """Lists available quizzes."""
    return list_quizzes_for_user("user_1")


@router.get("/{quiz_id}")
def get_quiz(quiz_id: str) -> Dict[str, Any]:
    """Fetches details and questions for a quiz."""
    try:
        return get_quiz_details(quiz_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/submit")
def submit_quiz(req: QuizSubmitRequest) -> Dict[str, Any]:
    """Evaluates quiz submission and updates learning metrics."""
    try:
        answers_dict = [{"question_id": a.question_id, "selected_index": a.selected_index} for a in req.answers]
        return evaluate_quiz_submission(req.quiz_id, answers_dict, "user_1")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
