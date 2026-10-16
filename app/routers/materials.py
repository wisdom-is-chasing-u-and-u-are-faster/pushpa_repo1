"""Materials Ingestion REST API Router."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.ingestion import process_material_upload, list_materials_for_user

router = APIRouter(prefix="/api/v1/materials", tags=["Materials"])


class MaterialUploadRequest(BaseModel):
    title: str
    category: str
    format: str
    content_text: Optional[str] = ""


@router.post("/upload", status_code=201)
def upload_material(req: MaterialUploadRequest) -> Dict[str, Any]:
    """Ingests multi-modal academic content (PDF, syllabus, notes, audio)."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Material title cannot be empty")
    return process_material_upload(
        user_id="user_1",
        title=req.title,
        category=req.category,
        format_type=req.format,
        content_text=req.content_text or ""
    )


@router.get("", response_model=List[Dict[str, Any]])
def list_materials() -> List[Dict[str, Any]]:
    """Lists all study materials in the content library."""
    return list_materials_for_user("user_1")
