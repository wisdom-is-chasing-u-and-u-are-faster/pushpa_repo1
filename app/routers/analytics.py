"""Analytics & Retention Telemetry Router."""

from fastapi import APIRouter
from typing import Dict, Any
from app.services.analytics import get_mastery_analytics

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/mastery")
def get_mastery() -> Dict[str, Any]:
    """Returns mastery heatmaps and longitudinal retention telemetry."""
    return get_mastery_analytics("user_1")


@router.get("/overview")
def get_overview() -> Dict[str, Any]:
    """Returns dashboard overview analytics."""
    return get_mastery_analytics("user_1")
