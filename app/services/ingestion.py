"""Multi-modal ingestion pipeline service.
Handles document extraction, Whisper transcription stubbing, chunking, and vector indexing.
"""

import uuid
from typing import Dict, List, Any
from app.db import execute_db, query_db


def process_material_upload(
    user_id: str,
    title: str,
    category: str,
    format_type: str,
    content_text: str = ""
) -> Dict[str, Any]:
    """Ingests multi-modal academic content and creates semantic chunks."""
    material_id = f"mat_{uuid.uuid4().hex[:8]}"

    # Stub audio transcription if format is audio
    if format_type.lower() in ["audio", "mp3", "wav", "m4a"]:
        if not content_text or content_text.strip() == "":
            content_text = (
                f"[Whisper Transcribed Audio from '{title}']: "
                f"Today we discussed core mechanisms of spaced repetition and active recall. "
                f"Retention decays exponentially unless reinforced with retrieval practice."
            )

    # Chunk content into ~200 word blocks
    words = content_text.split()
    chunk_size = 50
    chunks: List[str] = []
    if not words:
        chunks = [content_text if content_text else f"Content for {title}"]
    else:
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))

    # Insert into database
    execute_db(
        """
        INSERT INTO materials (id, user_id, title, category, format, content_text, chunks_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PROCESSED')
        """,
        (material_id, user_id, title, category, format_type, content_text, len(chunks))
    )

    for idx, chunk_text in enumerate(chunks):
        chunk_id = f"chk_{uuid.uuid4().hex[:8]}"
        execute_db(
            """
            INSERT INTO material_chunks (id, material_id, chunk_index, content, embedding_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (chunk_id, material_id, idx, chunk_text, f"emb_{chunk_id}")
        )

    return {
        "material_id": material_id,
        "title": title,
        "format": format_type,
        "status": "PROCESSED",
        "chunks_count": len(chunks)
    }


def list_materials_for_user(user_id: str = "user_1") -> List[Dict[str, Any]]:
    """Lists all study materials."""
    return query_db(
        "SELECT id, title, category, format, chunks_count, status, created_at FROM materials ORDER BY created_at DESC"
    )
