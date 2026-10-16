"""Database Initialization and Query Helper for Smart Study Management System.
Supports SQLite out of the box with automatic schema migrations and seed loading.
"""

import os
import sqlite3
from pathlib import Path
from typing import Any

DB_FILE = os.getenv("DATABASE_PATH", "study_platform.db")


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_database() -> None:
    """Initializes schema and seed data if tables do not exist."""
    base_dir = Path(__file__).resolve().parent.parent
    schema_path = base_dir / "db" / "schema.sql"
    seed_path = base_dir / "db" / "seed.sql"

    conn = get_db_connection()
    cursor = conn.cursor()

    if schema_path.exists():
        schema_sql = schema_path.read_text(encoding="utf-8")
        cursor.executescript(schema_sql)

    if seed_path.exists():
        seed_sql = seed_path.read_text(encoding="utf-8")
        cursor.executescript(seed_sql)

    conn.commit()
    conn.close()


def query_db(query: str, args: tuple = (), one: bool = False) -> Any:
    """Executes a SELECT query and returns dictionary rows."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    if not rv:
        return None if one else []
    return dict(rv[0]) if one else [dict(row) for row in rv]


def execute_db(query: str, args: tuple = ()) -> int:
    """Executes an INSERT/UPDATE/DELETE query and returns affected rows."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    last_row_id = cursor.lastrowid or 0
    conn.close()
    return last_row_id
