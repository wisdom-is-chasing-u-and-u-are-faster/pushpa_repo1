"""Main FastAPI Application Entrypoint for Smart Study Management System.
Mounts REST API routers and static frontend UI views.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.db import init_database
from app.routers import materials, flashcards, quizzes, schedule, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite tables and seeds baseline data on startup."""
    init_database()
    yield


app = FastAPI(
    title="Smart Study Management System API",
    version="1.0.0",
    description="Enterprise-grade study operating system optimizing memory retention and active recall.",
    lifespan=lifespan
)

# Enable CORS with explicit origin configurations
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Readiness and liveness probe."""
    return {
        "status": "ok",
        "service": "smart-study-management-system",
        "timestamp": datetime.utcnow().isoformat()
    }


class LoginRequest(BaseModel):
    email: str
    provider: str = "google"


@app.post("/api/v1/auth/login")
def login(req: LoginRequest):
    """User authentication and SSO login."""
    return {
        "token": "jwt-mock-token-session-12345",
        "user": {
            "id": "user_1",
            "name": "Alex Chen",
            "email": req.email,
            "role": "student"
        }
    }


@app.get("/api/v1/users/profile")
def get_user_profile():
    """Current learner profile and preferences."""
    return {
        "id": "user_1",
        "name": "Alex Chen",
        "email": "alex.chen@university.edu",
        "role": "student",
        "retention_target": 0.92,
        "preferred_study_time": "evening"
    }


# Include Routers
app.include_router(materials.router)
app.include_router(flashcards.router)
app.include_router(quizzes.router)
app.include_router(schedule.router)
app.include_router(analytics.router)

# Mount Static UI Files
public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
if os.path.exists(public_dir):
    app.mount("/", StaticFiles(directory=public_dir, html=True), name="public")
