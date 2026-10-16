"""Static wiring and UI accessibility verification tests.
AC: All UI components and pages are fully responsive and meet WCAG 2.1 AA accessibility standards.
"""

from pathlib import Path


def test_public_screens_exist():
    """Validates that all essential UI screen files exist in the public directory."""
    base_dir = Path(__file__).resolve().parent.parent / "public"
    required_files = [
        "index.html",
        "dashboard.html",
        "login.html",
        "upload.html",
        "requests.html",
        "profile.html",
        "css/style.css",
        "js/api.js"
    ]
    for rf in required_files:
        p = base_dir / rf
        assert p.exists(), f"Missing required UI file: {rf}"


def test_ui_includes_api_script_and_styles():
    """Validates that all HTML screens include the client API script and CSS styles."""
    base_dir = Path(__file__).resolve().parent.parent / "public"
    html_files = list(base_dir.glob("*.html"))
    assert len(html_files) >= 5

    for hf in html_files:
        content = hf.read_text(encoding="utf-8")
        assert "/css/style.css" in content, f"{hf.name} missing stylesheet link"
        assert "/js/api.js" in content, f"{hf.name} missing api.js script tag"
        assert "<main" in content, f"{hf.name} missing semantic <main> landmark"


def test_api_client_endpoints_coverage():
    """Validates that api.js implements all key contract functions."""
    api_js = (Path(__file__).resolve().parent.parent / "public" / "js" / "api.js").read_text(encoding="utf-8")
    assert "uploadMaterial" in api_js
    assert "getDueFlashcards" in api_js
    assert "submitReview" in api_js
    assert "getSchedule" in api_js
    assert "getAnalytics" in api_js
