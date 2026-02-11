"""
Premier League Player Explorer — FastAPI Backend
=================================================
Serves player data from players.json with search, pagination, and stats.
"""

import json
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# ============================================================================
# APP SETUP
# ============================================================================

app = FastAPI(
    title="Premier League Player Explorer API",
    description="API for Premier League player data extracted via regex from Wikipedia",
    version="1.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*",  # Allow all for development; restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA LOADING
# ============================================================================

DATA_FILE = Path(__file__).parent / "players.json"


def load_players() -> list[dict]:
    """Load player data from JSON file."""
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================================
# ENDPOINTS
# ============================================================================


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Premier League Player Explorer API",
        "endpoints": {
            "/players": "GET — List players (supports ?search=, ?page=, ?limit=)",
            "/stats": "GET — Player collection statistics",
        },
    }


@app.get("/players")
def get_players(
    search: str = Query(default="", description="Search by name, position, or nationality"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Players per page"),
):
    """
    Return paginated player data with optional search filtering.
    """
    players = load_players()

    # Apply search filter
    if search:
        query = search.lower()
        players = [
            p for p in players
            if query in (p.get("name") or "").lower()
            or query in (p.get("full_name") or "").lower()
            or query in (p.get("position") or "").lower()
            or query in (p.get("nationality") or "").lower()
            or query in (p.get("place_of_birth") or "").lower()
        ]

    # Pagination
    total = len(players)
    total_pages = max(1, (total + limit - 1) // limit)
    start = (page - 1) * limit
    end = start + limit
    paginated = players[start:end]

    return {
        "players": paginated,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


@app.get("/stats")
def get_stats():
    """Return statistics about the player collection."""
    players = load_players()
    total = len(players)

    positions = {}
    nationalities = {}
    with_dob = 0
    with_height = 0

    for p in players:
        if p.get("date_of_birth"):
            with_dob += 1
        if p.get("height"):
            with_height += 1
        pos = p.get("position")
        if pos:
            positions[pos] = positions.get(pos, 0) + 1
        nat = p.get("nationality")
        if nat:
            nationalities[nat] = nationalities.get(nat, 0) + 1

    return {
        "total_players": total,
        "with_date_of_birth": with_dob,
        "with_height": with_height,
        "positions": dict(sorted(positions.items(), key=lambda x: -x[1])),
        "nationalities": dict(sorted(nationalities.items(), key=lambda x: -x[1])[:15]),
    }
