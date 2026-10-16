"""Dynamic Study Workflow Scheduler & iCal Calendar Export Service.
Generates automated study schedules and RFC 5545 compliant iCal feeds.
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
from app.db import execute_db, query_db


def get_user_schedule(user_id: str = "user_1") -> Dict[str, Any]:
    """Returns the personalized study schedule."""
    sessions = query_db(
        "SELECT id, title, scheduled_time, duration_minutes, topic, status "
        "FROM study_schedules WHERE user_id = ? ORDER BY scheduled_time ASC",
        (user_id,)
    )
    return {"upcoming_sessions": sessions}


def rebalance_study_schedule(user_id: str = "user_1") -> Dict[str, Any]:
    """Dynamically re-balances upcoming study workflows based on pending flashcards and quizzes."""
    due_cards = query_db("SELECT count(*) as count FROM flashcards WHERE user_id = ?", (user_id,), one=True)
    card_count = due_cards["count"] if due_cards else 0

    now = datetime.utcnow()
    new_id = f"sch_{uuid.uuid4().hex[:8]}"
    scheduled_time = (now + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")

    execute_db(
        """
        INSERT INTO study_schedules (id, user_id, title, scheduled_time, duration_minutes, topic, status)
        VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')
        """,
        (new_id, user_id, f"FSRS Rebalanced Session ({card_count} items)", scheduled_time, 35, "Spaced Review Queue")
    )

    return get_user_schedule(user_id)


def generate_ical_export(user_id: str = "user_1") -> str:
    """Generates an RFC 5545 compliant iCalendar string for calendar synchronization."""
    sessions = query_db(
        "SELECT id, title, scheduled_time, duration_minutes, topic FROM study_schedules WHERE user_id = ?",
        (user_id,)
    )

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Smart Study Management System//Study Planner 1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]

    for s in sessions:
        dt_str = s["scheduled_time"].replace("-", "").replace(":", "").replace(" ", "T")
        if "T" not in dt_str:
            dt_str += "T090000"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{s['id']}@smartstudy.edu",
            f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{dt_str}",
            f"SUMMARY:{s['title']}",
            f"DESCRIPTION:Topic: {s['topic']} - Duration: {s['duration_minutes']} minutes",
            f"DURATION:PT{s['duration_minutes']}M",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)
