"""
Premier League Player Scraper
=============================
Theory of Computation Course Project

This scraper uses Python's `re` module (regular expressions) to extract
Premier League player data from Wikipedia. NO BeautifulSoup is used for
extraction — all data parsing is done via regex patterns.

Regex Patterns Used (6 non-trivial patterns):
    1. REGEX_PLAYER_LINKS    — Extract player page URLs from category listing
    2. REGEX_DATE_OF_BIRTH   — Extract date of birth from infobox
    3. REGEX_HEIGHT           — Extract height in cm (and convert ft/in)
    4. REGEX_POSITION         — Extract playing position from infobox
    5. REGEX_BIRTHPLACE       — Extract place of birth from infobox
    6. REGEX_FULL_NAME        — Extract full name from infobox
"""

import re
import json
import time
import requests

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "https://en.wikipedia.org"
CATEGORY_URL = f"{BASE_URL}/wiki/Category:Premier_League_players"
TARGET_PLAYER_COUNT = 120  # Scrape extra to ensure 100+ valid entries
OUTPUT_FILE = "players.json"
REQUEST_DELAY = 0.3  # seconds between requests to be respectful

HEADERS = {
    "User-Agent": (
        "PremierLeagueScraperBot/1.0 "
        "(Theory of Computation Course Project; educational use only)"
    )
}

# ============================================================================
# REGEX PATTERN 1: Extract Player Page Links from Category Page
# ============================================================================
# Matches <a href="/wiki/Player_Name" ...> links inside the category listing.
# Captures the URL path after /wiki/. Excludes meta pages (Category:, Wikipedia:,
# Help:, Template:, Talk:, Special:, File:, Portal:, User:, etc.)
# Also excludes pages with query strings (?action=edit, etc.)
# Pattern breakdown:
#   href="(/wiki/          — match href starting with /wiki/
#   (?!Category:|Wikipedia:|Help:|Template:|Talk:|Special:|File:|Portal:|User:)
#                          — negative lookahead: exclude namespace pages
#   ([^"#?]+))            — capture the rest of the URL (no quotes, hashes, queries)
#   "                      — closing quote
#   [^>]*                  — any other attributes in the tag
#   title="([^"]+)"        — capture the title attribute (player name)

REGEX_PLAYER_LINKS = re.compile(
    r'<a\s+href="(/wiki/'
    r"(?!Category:|Wikipedia:|Help:|Template:|Talk:|Special:|File:|Portal:|User:|Main_Page)"
    r'[^"#?]+)"'
    r'[^>]*\s+title="([^"]+)"',
    re.IGNORECASE,
)

# ============================================================================
# REGEX PATTERN 2: Date of Birth
# ============================================================================
# Matches the birth date from the Wikipedia infobox. Wikipedia uses a <span>
# with class="bday" to mark the canonical birth date in YYYY-MM-DD format.
# Pattern breakdown:
#   class="bday"[^>]*>    — find the bday span
#   (\d{4}-\d{2}-\d{2})   — capture YYYY-MM-DD format date

REGEX_DATE_OF_BIRTH = re.compile(
    r'class="bday"[^>]*>' r"[^<]*?(\d{4}-\d{2}-\d{2})", re.IGNORECASE
)

# ============================================================================
# REGEX PATTERN 3: Height
# ============================================================================
# Matches height from the infobox. Wikipedia shows height in various formats:
#   - "1.85 m" or "1.85m"
#   - "185 cm" or "185cm"
#   - "6 ft 1 in" with metric in parentheses
# We look for the metric value (cm or m format).
# Pattern breakdown:
#   (\d+(?:\.\d+)?)\s*(?:&nbsp;)?cm  — capture number followed by cm
#   |
#   (\d+\.\d+)\s*(?:&nbsp;)?m(?:\s|<|$|\()  — capture number.decimal followed by m

# Non-breaking space helper - Wikipedia uses &#160; in real HTML, not just &nbsp;
_NBSP = r"(?:&nbsp;|&#160;|\s)"

REGEX_HEIGHT = re.compile(
    rf"\b(1[5-9]\d){_NBSP}*cm\b"  # g1: 185 cm
    rf"|(\d\.\d{{1,2}}){_NBSP}*m(?:\s|<|&|$|\(|\))"  # g2: 1.85 m
    r"|height\s*[=:]\s*([\d\.]+)\s*(?:m|meters?|metres?)"  # g3: height=1.85
    r'|<span\s+class="nowrap">\s*([\d\.]+)\s*m\s*\([^)]+\)\s*</span>'  # g4: <span>
    rf"|(\d\.\d+){_NBSP}*m{_NBSP}*\(\d+{_NBSP}*ft{_NBSP}*\d+{_NBSP}*in\)"  # g5: 1.85 m (6 ft 1 in)
    r"|(\d+\.\d+)\s*meter"  # g6: 1.85 meter
    r"|(\d+)\s*centimeters?"  # g7: 185 centimeters
    rf"|<th[^>]*Height[^>]*>.*?<td[^>]*>\s*([\d\.]{{1,4}}){_NBSP}*m"  # g8: <th>Height
    rf"|<td[^>]*>\s*(1\.[5-9]\d|2\.[0-2]\d){_NBSP}+m{_NBSP}*\(",  # g9: infobox-data td
    re.IGNORECASE | re.DOTALL,
)

# ============================================================================
# REGEX PATTERN 4: Playing Position
# ============================================================================
# Extracts the playing position from the infobox row.
# Wikipedia infoboxes use <th> for labels and <td> for values.
# We look for "Position" label and extract common football positions.
# Pattern breakdown:
#   Position\s*</th>       — find the Position header cell
#   .*?<td[^>]*>           — skip to the data cell
#   .*?                    — lazy match content
#   (Goalkeeper|Defender|Midfielder|Forward|Striker|Winger|
#    Centre[- ]back|Full[- ]back|Left[- ]back|Right[- ]back|
#    Attacking midfielder|Defensive midfielder|Central midfielder|
#    Left winger|Right winger|Centre[- ]forward|Left midfielder|
#    Right midfielder|Sweeper|Wing[- ]?back)
#                          — capture known position keywords

REGEX_POSITION = re.compile(
    r"Position\s*</th>" r".*?<td[^>]*>" r"(.*?)</td>", re.IGNORECASE | re.DOTALL
)

# Sub-pattern to clean position text from HTML tags
REGEX_POSITION_CLEAN = re.compile(
    r"(Goalkeeper|Defender|Midfielder|Forward|Striker|Winger|"
    r"Centre[- ]back|Full[- ]back|Left[- ]back|Right[- ]back|"
    r"Attacking\s+midfielder|Defensive\s+midfielder|Central\s+midfielder|"
    r"Left\s+winger|Right\s+winger|Centre[- ]forward|Left\s+midfielder|"
    r"Right\s+midfielder|Sweeper|Wing[- ]?back)",
    re.IGNORECASE,
)

# ============================================================================
# REGEX PATTERN 5: Place of Birth / Nationality
# ============================================================================
# Extracts birthplace from the "Place of birth" or "birth_place" infobox field.
# Pattern breakdown:
#   birth_place\s*=\s*     — match the infobox parameter (wikitext style)
#   or
#   Place of birth</th>.*?<td> — match HTML table style
#   Then capture the text content, stripping wikilinks [[...]]

REGEX_BIRTHPLACE = re.compile(
    r"(?:Place\s+of\s+birth|Born)\s*</(?:th|div)>"
    r".*?<(?:td|div)[^>]*>\s*(.*?)\s*</(?:td|div)>",
    re.IGNORECASE | re.DOTALL,
)

# ============================================================================
# REGEX PATTERN 6: Full Name
# ============================================================================
# Extracts the full name from the infobox. Wikipedia football infoboxes
# typically have a "Full name" row.
# Pattern breakdown:
#   Full\s*name\s*</th>    — match "Full name" header
#   .*?<td[^>]*>           — skip to data cell
#   (.*?)                  — capture name content
#   </td>                  — end of data cell

REGEX_FULL_NAME = re.compile(
    r"Full\s*name\s*</th>" r".*?<td[^>]*>\s*(.*?)\s*</td>", re.IGNORECASE | re.DOTALL
)

# Helper: strip HTML tags from extracted text
REGEX_HTML_TAGS = re.compile(r"<[^>]+>")
REGEX_WHITESPACE = re.compile(r"\s+")
REGEX_WIKI_REF = re.compile(
    r"\[\s*(?:\d+|citation needed|note \d+)\s*\]", re.IGNORECASE
)

# Regex for finding next page link in category pages
REGEX_NEXT_PAGE = re.compile(
    r'<a[^>]+href="(/w/index\.php\?title=Category:Premier_League_players&amp;pagefrom=[^"]+)"[^>]*>next page</a>',
    re.IGNORECASE,
)


def clean_text(html_text: str) -> str:
    """Remove HTML tags, wiki references, and normalize whitespace."""
    text = REGEX_WIKI_REF.sub("", html_text)
    text = REGEX_HTML_TAGS.sub(" ", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&#160;", " ").replace("&#91;", "[").replace("&#93;", "]")
    text = REGEX_WHITESPACE.sub(" ", text)
    return text.strip()


def fetch_page(url: str) -> str | None:
    """Fetch a webpage and return its HTML content."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}")
        return None


def get_player_urls() -> list[tuple[str, str]]:
    """
    Scrape the category page(s) for all player URLs.
    Uses REGEX_PLAYER_LINKS (Pattern 1) to extract links.
    Returns list of (url, display_name) tuples.
    """
    player_urls = []
    seen_urls = set()
    page_url = CATEGORY_URL
    page_num = 0

    while page_url and len(player_urls) < TARGET_PLAYER_COUNT:
        page_num += 1
        print(f"\n[INFO] Fetching category page {page_num}: {page_url}")
        html = fetch_page(page_url)
        if not html:
            break

        # --- REGEX PATTERN 1 in action ---
        # Find the mw-category section to avoid navigation links
        cat_start = html.find('id="mw-pages"')
        if cat_start == -1:
            cat_start = html.find('class="mw-category')
        if cat_start == -1:
            cat_start = 0

        cat_section = html[cat_start:]
        matches = REGEX_PLAYER_LINKS.findall(cat_section)

        for url_path, title in matches:
            if url_path not in seen_urls and ":" not in url_path.split("/wiki/")[-1]:
                seen_urls.add(url_path)
                full_url = f"{BASE_URL}{url_path}"
                player_urls.append((full_url, title))

        print(f"  Found {len(matches)} links, total unique players: {len(player_urls)}")

        # Find "next page" link
        next_match = REGEX_NEXT_PAGE.search(html)
        if next_match and len(player_urls) < TARGET_PLAYER_COUNT:
            next_path = next_match.group(1).replace("&amp;", "&")
            page_url = f"{BASE_URL}{next_path}"
            time.sleep(REQUEST_DELAY)
        else:
            page_url = None

    return player_urls[:TARGET_PLAYER_COUNT]


def extract_player_data(url: str, display_name: str) -> dict | None:
    """
    Visit a player's Wikipedia page and extract data using regex patterns 2-6.
    Returns a dict with player fields, or None if insufficient data.
    """
    html = fetch_page(url)
    if not html:
        return None

    player = {
        "name": display_name,
        "full_name": None,
        "date_of_birth": None,
        "place_of_birth": None,
        "height": None,
        "position": None,
        "nationality": None,
        "wikipedia_url": url,
    }

    # --- REGEX PATTERN 6: Full Name ---
    name_match = REGEX_FULL_NAME.search(html)
    if name_match:
        name = clean_text(name_match.group(1))
        # Remove Wikipedia citation references [number] or [citation needed]
        name = re.sub(r"\s*\[\s*\d+\s*\]\s*", "", name)
        name = re.sub(
            r"\s*\[\s*citation\s+needed\s*\]\s*", "", name, flags=re.IGNORECASE
        )
        if name and len(name) < 100:
            player["full_name"] = name.strip()

    if not player["full_name"]:
        player["full_name"] = display_name

    # --- REGEX PATTERN 2: Date of Birth ---
    dob_match = REGEX_DATE_OF_BIRTH.search(html)
    if dob_match:
        player["date_of_birth"] = dob_match.group(1)

    # --- REGEX PATTERN 3: Height ---
    height_match = REGEX_HEIGHT.search(html)
    if height_match:
        cm_value = None
        g = height_match.groups()

        if g[0]:
            cm_value = int(g[0])  # 185 cm
        elif g[1]:
            cm_value = int(float(g[1]) * 100)  # 1.85 m
        elif g[2]:
            cm_value = int(float(g[2]) * 100)  # height=1.85
        elif g[3]:
            cm_value = int(float(g[3]) * 100)  # <span>
        elif g[4]:
            cm_value = int(float(g[4]) * 100)  # 1.85 m (6 ft 1 in)
        elif g[5]:
            cm_value = int(float(g[5]) * 100)  # 1.85 meter
        elif g[6]:
            cm_value = int(g[6])  # 185 centimeters
        elif g[7]:
            cm_value = int(float(g[7]) * 100)  # <th>Height
        elif g[8]:
            cm_value = int(float(g[8]) * 100)  # infobox-data td

        if cm_value and 150 <= cm_value <= 220:
            player["height"] = f"{cm_value} cm"

    # --- REGEX PATTERN 4: Position ---
    pos_match = REGEX_POSITION.search(html)
    if pos_match:
        pos_text = pos_match.group(1)
        pos_clean = REGEX_POSITION_CLEAN.findall(pos_text)
        if pos_clean:
            player["position"] = pos_clean[0].strip()
        else:
            cleaned = clean_text(pos_text)
            if cleaned and len(cleaned) < 50:
                player["position"] = cleaned

    # --- REGEX PATTERN 5: Place of Birth ---
    bp_match = REGEX_BIRTHPLACE.search(html)
    if bp_match:
        place = clean_text(bp_match.group(1))
        # Remove coordinate data if present
        place = re.sub(r"\d+°\d+.*", "", place).strip()
        # Remove Wikipedia citation references [number] or [citation needed]
        place = re.sub(r"\s*\[\s*\d+\s*\]\s*", "", place)
        place = re.sub(
            r"\s*\[\s*citation\s+needed\s*\]\s*", "", place, flags=re.IGNORECASE
        )
        if place and len(place) < 100:
            player["place_of_birth"] = place.strip()

    # Derive nationality from place of birth or page content
    if player["place_of_birth"]:
        parts = [p.strip() for p in player["place_of_birth"].split(",")]
        if parts:
            # Clean nationality by removing citation references like [ 3 ]
            nationality = parts[-1]
            # Remove Wikipedia citation references [number] or [citation needed]
            nationality = re.sub(r"\s*\[\s*\d+\s*\]\s*", "", nationality)
            nationality = re.sub(
                r"\s*\[\s*citation\s+needed\s*\]\s*",
                "",
                nationality,
                flags=re.IGNORECASE,
            )
            player["nationality"] = nationality.strip()

    # Check we have at least some useful data
    fields_filled = sum(1 for v in player.values() if v is not None)
    if fields_filled < 4:
        return None

    return player


def run_scraper():
    """Main scraper entry point."""
    print("=" * 60)
    print("  PREMIER LEAGUE PLAYER SCRAPER")
    print("  Theory of Computation — Regex-Based Web Crawler")
    print("=" * 60)

    # Step 1: Collect player URLs from category pages
    print("\n[STEP 1] Collecting player URLs from category pages...")
    player_urls = get_player_urls()
    print(f"\n[INFO] Collected {len(player_urls)} player URLs")

    # Step 2: Visit each player page and extract data
    print("\n[STEP 2] Extracting player data from individual pages...")
    players = []
    failed = 0

    for i, (url, name) in enumerate(player_urls):
        if len(players) >= 100:
            print(f"\n[INFO] Reached 100 valid players — stopping.")
            break

        print(f"  [{i+1}/{len(player_urls)}] Scraping: {name}...", end=" ")
        player = extract_player_data(url, name)

        if player:
            players.append(player)
            print(f"✓ ({len(players)} total)")
        else:
            failed += 1
            print("✗ (insufficient data)")

        time.sleep(REQUEST_DELAY)

    # Step 3: Save to JSON
    print(f"\n[STEP 3] Saving {len(players)} players to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(players, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"  SCRAPING COMPLETE")
    print(f"  Total players saved:  {len(players)}")
    print(f"  Failed extractions:   {failed}")
    print(f"  Output file:          {OUTPUT_FILE}")
    print(f"{'=' * 60}")

    # Print regex summary
    print("\n[REGEX PATTERNS USED]")
    print("  1. REGEX_PLAYER_LINKS   — Player URL extraction from category")
    print("  2. REGEX_DATE_OF_BIRTH  — Birth date (YYYY-MM-DD) from bday span")
    print("  3. REGEX_HEIGHT         — Height in cm/m formats")
    print("  4. REGEX_POSITION       — Playing position from infobox")
    print("  5. REGEX_BIRTHPLACE     — Place of birth from infobox")
    print("  6. REGEX_FULL_NAME      — Full name from infobox")
    print(f"\n  Total patterns: 6 (+ helper patterns for cleaning)")

    return players


if __name__ == "__main__":
    run_scraper()
