"""Flashcard & FSRS Review REST API Router."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.fsrs import generate_flashcards_from_material, get_due_flashcards, record_card_review

router = APIRouter(prefix="/api/v1/flashcards", tags=["Flashcards"])


class GenerateFlashcardsRequest(BaseModel):
    material_id: str
    count: Optional[int] = 3


class CardReviewRequest(BaseModel):
    card_id: str
    rating: int  # 1: Again, 2: Hard, 3: Good, 4: Easy


@router.post("/generate", status_code=201)
def generate_flashcards(req: GenerateFlashcardsRequest) -> Dict[str, Any]:
    """Generates active recall flashcards from ingested content."""
    cards = generate_flashcards_from_material(
        material_id=req.material_id,
        count=req.count or 3,
        user_id="user_1"
    )
    return {
        "generated_count": len(cards),
        "flashcards": cards
    }


@router.get("/due")
def get_due_queue() -> List[Dict[str, Any]]:
    """Returns due flashcards for spaced repetition review."""
    return get_due_flashcards("user_1")


@router.post("/review")
def submit_review(req: CardReviewRequest) -> Dict[str, Any]:
    """Submits review rating and updates FSRS memory parameters."""
    if req.rating not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Rating must be between 1 (Again) and 4 (Easy)")
    try:
        return record_card_review(req.card_id, req.rating, "user_1")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
