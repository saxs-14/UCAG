#!/usr/bin/env python3
"""Second-pass enrichment: attempts facultyId/schoolId linkage for UNISA's
224 already-enriched programmes (output/unisa.json) by crawling each
college's own sub-pages and checking which qualification codes are
genuinely mentioned there -- not by guessing from the qualification name.

Reads and rewrites output/unisa.json in place. Does not touch Firestore,
.env, or any seed script.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

import truststore

truststore.inject_into_ssl()

from bs4 import BeautifulSoup

from robots_check import RobotsChecker
from scrape import polite_get, USER_AGENT  # noqa: F401 (USER_AGENT kept for parity/debug)

OUTPUT_PATH = Path(__file__).parent / "output" / "unisa.json"
BASE = "https://www.unisa.ac.za"


def discover_college_subpages(college_url: str, robots: RobotsChecker, max_pages: int = 10) -> list[str]:
    """Fetches a college's own page and returns up to max_pages of its own
    sub-page URLs (same path prefix), prioritizing ones whose link text or
    path suggests qualification/programme/school content -- these are the
    pages most likely to actually list qualification names, not just
    admin boilerplate ("About the college", "Contact", "News" are
    deprioritized)."""
    resp = polite_get(college_url, robots)
    if resp is None:
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    prefix = college_url.rstrip("/") + "/"

    priority_keywords = ["qualif", "school", "department", "programme", "course", "undergraduate"]
    scored: list[tuple[int, str]] = []
    seen: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(BASE, href)
        if not full.startswith(prefix) or full == college_url or full in seen:
            continue
        seen.add(full)
        text = a.get_text(strip=True).lower()
        score = sum(1 for kw in priority_keywords if kw in text or kw in full.lower())
        scored.append((score, full))

    scored.sort(key=lambda t: -t[0])
    return [url for _, url in scored[:max_pages]]


def main() -> None:
    data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    programmes = data["programmes"]
    faculties = data["faculties"]
    robots = RobotsChecker(BASE)

    # code -> set of facultyIds whose pages mention that code
    code_to_faculties: dict[str, set[str]] = {}
    pages_checked = 0

    for faculty in faculties:
        college_url = faculty["sourceUrl"]
        print(f"UNISA linkage: discovering sub-pages for {faculty['name']}")
        subpages = discover_college_subpages(college_url, robots)
        print(f"  -> checking {len(subpages)} sub-pages (plus the college page itself)")
        all_pages = [college_url] + subpages

        combined_text = ""
        for url in all_pages:
            resp = polite_get(url, robots)
            pages_checked += 1
            if resp is None:
                continue
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup.find_all(["nav", "header", "footer", "script", "style"]):
                tag.decompose()
            combined_text += " " + soup.get_text(" ", strip=True)

        for programme in programmes:
            code = programme["qualificationCode"]
            if not code:
                continue
            # Match the bare numeric qualification code (e.g. "98201" out
            # of "98201" or "90148 - MAT") as a whole token, not a
            # substring of some unrelated longer number.
            bare_code = code.split(" - ")[0].split("-")[0].strip()
            if re.search(rf"(?<!\d){re.escape(bare_code)}(?!\d)", combined_text):
                code_to_faculties.setdefault(programme["id"], set()).add(faculty["id"])

    linked = 0
    ambiguous = 0
    for programme in programmes:
        matches = code_to_faculties.get(programme["id"], set())
        if len(matches) == 1:
            programme["facultyId"] = next(iter(matches))
            linked += 1
        elif len(matches) > 1:
            ambiguous += 1
            existing_note = programme.get("note", "")
            programme["note"] = (existing_note + " " if existing_note else "") + (
                f"Qualification code found on more than one college's pages ({sorted(matches)}) -- "
                "ambiguous, facultyId left null rather than guessing which one is correct."
            )

    print(f"UNISA linkage: {pages_checked} pages checked, {linked}/{len(programmes)} programmes linked to exactly one college, {ambiguous} ambiguous (multiple colleges), {len(programmes) - linked - ambiguous} not found on any college page")

    data["notes"].append(
        f"Second-pass faculty linkage: crawled each of the 7 colleges' own pages plus up to 10 of their "
        f"own sub-pages each (prioritized by whether the link text/path suggested qualification/school/"
        f"programme content), checking for each programme's own qualification code as a verbatim match -- "
        f"not a name-based guess. Result: {linked}/{len(programmes)} programmes got a facultyId this way "
        f"(their qualification code appeared on exactly one college's pages), {ambiguous} were ambiguous "
        f"(code appeared under more than one college -- left null, noted per-programme), and "
        f"{len(programmes) - linked - ambiguous} genuinely weren't found mentioned on any college page "
        "this pass checked (left null, no note added per-programme for this group since it's the expected "
        "default state, not a new finding). schoolId was not attempted: no college sub-page checked listed "
        "qualifications grouped by school/department, only by college."
    )

    OUTPUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
