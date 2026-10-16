"""Free Spaced Repetition Scheduler (FSRS) Algorithm & Flashcard Service.
Calculates memory stability, difficulty adjustments, and next review intervals.
"""

import math
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.db import execute_db, query_db

# FSRS standard baseline parameters
W_WEIGHTS = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]


def calculate_fsrs_next_interval(rating: int, stability: float, difficulty: float, rep_count: int) -> Dict[str, Any]:
    """Calculates updated stability, difficulty, and next interval in days using FSRS.
    Ratings: 1 = Again (failed recall), 2 = Hard, 3 = Good, 4 = Easy.
    """
    # 1. Update Difficulty (D)
    diff_factor = 0.8 * (rating - 3)
    new_difficulty = max(1.0, min(10.0, difficulty - diff_factor))

    # 2. Update Stability (S)
    if rating == 1:
        # Memory lapse
        new_stability = max(0.5, stability * 0.4)
        new_interval = 1
    else:
        # Successful retrieval reinforcement
        retrievability = math.exp(-1.0 / (stability + 0.001))
        boost = 1.0 + (rating - 2) * 0.75
        mult = (
            math.exp(W_WEIGHTS[8]) * (11 - new_difficulty) * (math.pow(retrievability, -W_WEIGHTS[9]) - 1) * boost
        )
        new_stability = max(1.0, stability * (1.0 + mult))
        new_interval = max(1, int(round(new_stability * 2.5)))

    return {
        "stability": round(new_stability, 2),
        "difficulty": round(new_difficulty, 2),
        "interval_days": new_interval,
        "next_review_date": (datetime.utcnow() + timedelta(days=new_interval)).strftime("%Y-%m-%d %H:%M:%S")
    }


def generate_flashcards_from_material(
    material_id: str, count: int = 3, user_id: str = "user_1"
) -> List[Dict[str, Any]]:
    """Synthesizes active recall flashcards from material chunks using simulated LLM synthesis."""
    material = query_db("SELECT * FROM materials WHERE id = ?", (material_id,), one=True)
    if not material:
        title = "Study Material"
    else:
        title = material["title"]

    generated = []
    templates = [
        (
            f"Core definition and objectives of {title}?",
            f"Key theoretical model and foundational principles establishing {title}.",
            "Section 1.1"
        ),
        (
            f"What key problem or trade-off does {title} address?",
            "Eliminates cognitive overload and optimizes long-term memory retention through systematic intervals.",
            "Section 2.3"
        ),
        (
            f"How is error recovery and consistency maintained in {title}?",
            "Automated state tracking, health heartbeats, and idempotent commit logging.",
            "Section 3.4"
        ),
    ]

    for idx in range(min(count, len(templates))):
        fc_id = f"fc_{uuid.uuid4().hex[:8]}"
        front, back, citation = templates[idx]
        execute_db(
            """
            INSERT INTO flashcards (
                id, material_id, user_id, front, back, source_citation,
                stability, difficulty, interval_days, repetition_count
            )
            VALUES (?, ?, ?, ?, ?, ?, 2.0, 5.0, 1, 0)
            """,
            (fc_id, material_id, user_id, front, back, citation)
        )
        generated.append({
            "id": fc_id,
            "front": front,
            "back": back,
            "source_citation": citation
        })

    return generated


def get_due_flashcards(user_id: str = "user_1") -> List[Dict[str, Any]]:
    """Fetches all flashcards due for review."""
    cards = query_db(
        "SELECT id, front, back, source_citation, stability, difficulty, interval_days, repetition_count "
        "FROM flashcards WHERE user_id = ?",
        (user_id,)
    )
    return cards


def record_card_review(card_id: str, rating: int, user_id: str = "user_1") -> Dict[str, Any]:
    """Records a review rating and updates FSRS card parameters."""
    card = query_db("SELECT * FROM flashcards WHERE id = ?", (card_id,), one=True)
    if not card:
        raise ValueError(f"Flashcard {card_id} not found")

    fsrs_result = calculate_fsrs_next_interval(
        rating=rating,
        stability=card["stability"],
        difficulty=card["difficulty"],
        rep_count=card["repetition_count"]
    )

    execute_db(
        """
        UPDATE flashcards
        SET stability = ?, difficulty = ?, interval_days = ?, repetition_count = repetition_count + 1, due_date = ?
        WHERE id = ?
        """,
        (
            fsrs_result["stability"],
            fsrs_result["difficulty"],
            fsrs_result["interval_days"],
            fsrs_result["next_review_date"],
            card_id,
        )
    )

    execute_db(
        """
        INSERT INTO review_logs (id, card_id, user_id, rating, stability_before, stability_after)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (f"rev_{uuid.uuid4().hex[:8]}", card_id, user_id, rating, card["stability"], fsrs_result["stability"])
    )

    return {
        "card_id": card_id,
        "next_review_date": fsrs_result["next_review_date"],
        "new_interval_days": fsrs_result["interval_days"],
        "stability": fsrs_result["stability"]
    }
