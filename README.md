# 🏟️ Premier League Player Explorer

> **Theory of Computation Course Project**
> A full-stack web application that scrapes Premier League player data from Wikipedia using **Python Regular Expressions** and displays it in a modern, premium web interface.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│                                                                 │
│    ┌──────────────────────────────────────────────────────┐     │
│    │          Next.js 14 Frontend (Vercel)                │     │
│    │    ┌──────────────────────────────────────────┐      │     │
│    │    │  Hero Section    │  Search & Filters     │      │     │
│    │    │  Table View      │  Card View            │      │     │
│    │    │  Pagination      │  Loading Skeletons    │      │     │
│    │    └──────────────────────────────────────────┘      │     │
│    └────────────────────┬─────────────────────────────────┘     │
│                         │ HTTP GET /players                     │
│                         ▼                                       │
│    ┌──────────────────────────────────────────────────────┐     │
│    │          FastAPI Backend (Render)                    │     │
│    │    ┌──────────────────────────────────────────┐      │     │
│    │    │  GET /players  →  Search + Pagination    │      │     │
│    │    │  GET /stats    →  Aggregated Stats       │      │     │
│    │    │  GET /         →  Health Check           │      │     │
│    │    └──────────────────┬───────────────────────┘      │     │
│    │                       │ reads                        │     │
│    │    ┌──────────────────▼───────────────────────┐      │     │
│    │    │          players.json (100+ players)     │      │     │
│    │    └─────────────────────────────────────────-┘      │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                 │
│    ┌──────────────────────────────────────────────────────┐     │
│    │        Python Scraper (run locally once)             │     │
│    │    ┌──────────────────────────────────────────┐      │     │
│    │    │  1. Fetch category page                  │      │     │
│    │    │  2. Regex extract player URLs             │      │     │
│    │    │  3. Visit each player page                │      │     │
│    │    │  4. Regex extract: name, DOB, height,    │      │     │
│    │    │     position, birthplace, nationality     │      │     │
│    │    │  5. Save to players.json                  │      │     │
│    │    └──────────────────────────────────────────┘      │     │
│    └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Regular Expressions (Theory of Computation)

This project demonstrates 6 non-trivial regex patterns. Below is each pattern with its explanation:

### Pattern 1 — Player URL Extraction

```python
REGEX_PLAYER_LINKS = re.compile(
    r'<a\s+href="(/wiki/'
    r'(?!Category:|Wikipedia:|Help:|Template:|Talk:|Special:|File:|Portal:|User:|Main_Page)'
    r'[^"#?]+)"'
    r'[^>]*\s+title="([^"]+)"',
    re.IGNORECASE
)
```

| Component | Explanation |
|-----------|-------------|
| `<a\s+href="` | Match anchor tag with href attribute |
| `/wiki/` | URL must start with /wiki/ |
| `(?!Category:\|...)` | **Negative lookahead** — exclude namespace pages |
| `[^"#?]+"` | Capture URL path (no quotes, hashes, query strings) |
| `title="([^"]+)"` | Capture display title in second group |

**Theory**: Uses negative lookahead (zero-width assertion), a feature beyond regular grammars.

### Pattern 2 — Date of Birth

```python
REGEX_DATE_OF_BIRTH = re.compile(
    r'class="bday"[^>]*>[^<]*?(\d{4}-\d{2}-\d{2})',
    re.IGNORECASE
)
```

| Component | Explanation |
|-----------|-------------|
| `class="bday"` | Locate the Wikipedia birth date span |
| `[^>]*>` | Skip remaining attributes |
| `[^<]*?` | Non-greedy match before the date |
| `(\d{4}-\d{2}-\d{2})` | Capture YYYY-MM-DD format |

**Theory**: `\d{4}` demonstrates bounded repetition (finite automaton counting).

### Pattern 3 — Height

```python
REGEX_HEIGHT = re.compile(
    r'(\d{2,3})\s*(?:&nbsp;|\s)*cm'
    r'|(\d\.\d{1,2})\s*(?:&nbsp;|\s)*m(?:\s|<|&|$|\(|\))',
    re.IGNORECASE
)
```

| Component | Explanation |
|-----------|-------------|
| `(\d{2,3})` | Capture 2-3 digit number (cm value) |
| `(?:&nbsp;\|\s)*` | Handle HTML entities and whitespace |
| `\|` | **Alternation** — match cm OR m format |
| `(\d\.\d{1,2})` | Capture decimal meters (e.g., 1.85) |

**Theory**: Alternation (`|`) demonstrates union of regular languages L₁ ∪ L₂.

### Pattern 4 — Playing Position

```python
REGEX_POSITION_CLEAN = re.compile(
    r'(Goalkeeper|Defender|Midfielder|Forward|Striker|Winger|'
    r'Centre[- ]back|Full[- ]back|Left[- ]back|Right[- ]back|'
    r'Attacking\s+midfielder|Defensive\s+midfielder|...)',
    re.IGNORECASE
)
```

| Component | Explanation |
|-----------|-------------|
| Multiple `\|` alternatives | Enumerate all valid football positions |
| `Centre[- ]back` | Character class `[- ]` matches hyphen or space |
| `Attacking\s+midfielder` | `\s+` matches one or more whitespace chars |

**Theory**: Finite set of alternatives — equivalent to a finite automaton with multiple accept states.

### Pattern 5 — Place of Birth

```python
REGEX_BIRTHPLACE = re.compile(
    r'(?:Place\s+of\s+birth|Born)\s*</(?:th|div)>'
    r'.*?<(?:td|div)[^>]*>\s*(.*?)\s*</(?:td|div)>',
    re.IGNORECASE | re.DOTALL
)
```

| Component | Explanation |
|-----------|-------------|
| `(?:Place\s+of\s+birth\|Born)` | Non-capturing group with alternation |
| `</(?:th\|div)>` | Match closing tag (th or div) |
| `.*?` | **Non-greedy** quantifier (lazy matching) |
| `re.DOTALL` | Dot matches newlines (multiline content) |

**Theory**: Non-greedy vs greedy quantifiers relate to leftmost-shortest vs leftmost-longest matching.

### Pattern 6 — Full Name

```python
REGEX_FULL_NAME = re.compile(
    r'Full\s*name\s*</th>'
    r'.*?<td[^>]*>\s*(.*?)\s*</td>',
    re.IGNORECASE | re.DOTALL
)
```

| Component | Explanation |
|-----------|-------------|
| `Full\s*name` | "Full" + optional whitespace + "name" |
| `</th>.*?<td` | Lazy match between header and data cells |
| `\s*(.*?)\s*` | Capture trimmed content |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm**

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/premier-league-explorer.git
cd premier-league-explorer
```

### 2. Run the Scraper (one-time)

```bash
cd backend
pip install -r requirements.txt
python scraper.py
# This creates players.json with 100+ players
```

### 3. Start the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
# API available at http://localhost:8000
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Deploy — note the URL (e.g., `https://pl-player-explorer-api.onrender.com`)

### Frontend → Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variable**: `NEXT_PUBLIC_API_URL` = your Render backend URL
4. Deploy

---

## 📁 Project Structure

```
root/
├── backend/
│   ├── scraper.py          # Web scraper (6 regex patterns)
│   ├── main.py             # FastAPI server
│   ├── players.json        # Scraped data (100+ players)
│   ├── requirements.txt    # Python dependencies
│   └── render.yaml         # Render deployment config
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx  # Root layout (SEO, fonts)
│   │   │   ├── page.tsx    # Homepage (hero, table, cards)
│   │   │   └── globals.css # Theme & animations
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── PlayerTable.tsx
│   │   │   ├── PlayerCards.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ViewToggle.tsx
│   │   ├── lib/
│   │   │   └── api.ts      # API client
│   │   └── types/
│   │       └── index.ts    # TypeScript types
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🎬 YouTube Presentation Outline

| # | Section | Duration | Content |
|---|---------|----------|---------|
| 1 | Introduction | 1 min | Project overview, TOC relevance |
| 2 | Theory Background | 2 min | Regular expressions, finite automata, regex engines |
| 3 | Regex Patterns | 3 min | Walk through all 6 patterns with examples |
| 4 | Live Demo — Scraper | 2 min | Run scraper, show terminal output |
| 5 | Live Demo — App | 3 min | Show homepage, search, table/cards, pagination |
| 6 | Architecture | 2 min | Backend/frontend diagram, API design |
| 7 | Deployment | 1 min | Show Render + Vercel live deployments |
| 8 | Conclusion | 1 min | Summary, challenges, future improvements |

**Total**: ~15 minutes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Scraper | Python, `requests`, `re` |
| Backend | FastAPI, Uvicorn |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Storage | JSON file |
| Backend Deploy | Render (free) |
| Frontend Deploy | Vercel (free) |

---

## 📜 License

This project is for educational purposes — Theory of Computation course project.
Data sourced from Wikipedia under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
