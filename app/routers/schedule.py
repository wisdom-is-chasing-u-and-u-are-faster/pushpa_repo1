"""Study Workflow Schedule & Calendar Sync Router."""

from fastapi import APIRouter, Response
from typing import Dict, Any
from app.services.scheduler import get_user_schedule, rebalance_study_schedule, generate_ical_export

router = APIRouter(prefix="/api/v1/schedule", tags=["Schedule"])


@router.get("")
def get_schedule() -> Dict[str, Any]:
    """Returns the personalized study workflow schedule."""
    return get_user_schedule("user_1")


@router.post("/rebalance")
def rebalance() -> Dict[str, Any]:
    """Triggers dynamic study schedule re-balancing."""
    return rebalance_study_schedule("user_1")


@router.get("/export-ical")
def export_ical():
    """Exports an RFC 5545 compliant iCalendar .ics feed."""
    ical_content = generate_ical_export("user_1")
    return Response(content=ical_content, media_type="text/calendar", headers={
        "Content-Disposition": "attachment; filename=study_schedule.ics"
    })
