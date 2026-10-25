#!/usr/bin/env python3
"""Second-pass: collects UJ undergraduate programme names (+ duration/
career outcomes where cleanly stated) via Wayback Machine, for each of the
8 faculties already in output/uj.json. Reads and rewrites that file in
place. Does not touch Firestore, .env, or any seed script.

Per-faculty programme-listing URL paths are NOT uniform across UJ's site
(confirmed: only 2 of 8 faculties have a snapshot at the naively-guessed
"/courses-and-programmes/undergraduate/" path) -- each faculty's own main
page is re-fetched to discover its real link first, rather than assuming
one pattern holds everywhere.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urljoin

import truststore

truststore.inject_into_ssl()

from bs4 import BeautifulSoup

from robots_check import RobotsChecker
from scrape import polite_get, _wayback_snapshot_url, Programme as _ProgrammeDC  # noqa: F401

OUTPUT_PATH = Path(__file__).parent / "output" / "uj.json"
BASE = "https://www.uj.ac.za"

UJ_QUALIFICATION_PREFIXES: list[tuple[str, str]] = [
    ("Baccalaureus Legum", "bachelorsDegree"),  # LLB -- checked before the generic Baccalaureus match
    ("Baccalaureus", "bachelorsDegree"),
    ("Bachelor of", "bachelorsDegree"),
    ("Higher Certificate in", "higherCertificate"),
    ("Advanced Certificate in", "advancedCertificate"),
    ("Advanced Diploma in", "advancedDiploma"),
    ("Diploma in", "diploma"),
]


def classify(name: str) -> str | None:
    for prefix, t in UJ_QUALIFICATION_PREFIXES:
        if name.strip().startswith(prefix):
            return t
    return None


def find_programme_listing_url(faculty_page_url: str, faculty_code: str, archive_robots: RobotsChecker) -> str | None:
    """Re-fetches a faculty's own main (Wayback) page and looks for its
    real link to an undergraduate programme/courses listing -- link text
    match, not a guessed path. Scoped to hrefs containing this faculty's
    own /faculties/<code>/ path: an unscoped "any link whose text says
    undergraduate" match picked up a single site-wide admission-aid nav
    link shared by every faculty page instead (same wrong link for all 8
    faculties on the first run), since that generic nav item happens to
    appear before the real faculty-specific link in the page."""
    resp = polite_get(faculty_page_url, archive_robots)
    if resp is None:
        return None
    soup = BeautifulSoup(resp.text, "html.parser")
    candidates = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True).lower()
        if "undergraduate" in text and len(text) < 40 and f"/faculties/{faculty_code}/" in href:
            m = re.search(r"(https?://(?:www\.)?uj\.ac\.za/[^\s\"']+)", href)
            if m:
                candidates.append(m.group(1))
    return candidates[0] if candidates else None


def extract_programmes_from_text(text: str, source_url: str, faculty_id: str) -> list[dict]:
    """Looks for "<Qualification Name> – <ABBR>" or "<Qualification Name>
    (ABBR)" patterns and a following duration mention. Conservative: only
    emits an entry when a real qualification-type prefix is recognized,
    same discipline as the UNISA parser -- no catch-all guess pattern."""
    out = []
    seen = set()
    prefix_pattern = "|".join(re.escape(p) for p, _ in UJ_QUALIFICATION_PREFIXES)
    # Find every prefix occurrence's position first, then slice the text
    # BETWEEN consecutive occurrences (or up to a 150-char cap) as one
    # entry's raw text -- avoids a single greedy regex accidentally
    # swallowing into the next entry, which a first version of this
    # function did (its "abbreviation" group had no real stop condition
    # and ran on past the actual abbreviation into unrelated text).
    starts = [(m.start(), m.group(0)) for m in re.finditer(prefix_pattern, text)]
    for i, (start, prefix) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else min(len(text), start + 150)
        raw = text[start:min(end, start + 150)]

        # Split on the first en-dash/hyphen to separate the qualification
        # name from its abbreviation (e.g. "Baccalaureus Artium
        # (Iurisprudentiae) – BA (Law)").
        dash_match = re.search(r"\s*[–\-]\s*", raw)
        if dash_match:
            name = raw[:dash_match.start()].strip()
            tail = raw[dash_match.end():].strip()
            # A real abbreviation here is a short ALL-CAPS token (BA,
            # BCom, LLB, ...), optionally followed by one parenthetical
            # qualifier ("(Law)") -- anchored at the start of `tail` so
            # unrelated trailing prose (page nav text, a "Download this
            # brochure" sentence, the next entry's name) can't be
            # swallowed in, which a looser split-on-whitespace heuristic
            # did (captured "LLB Undergraduate" instead of just "LLB").
            abbr_match = re.match(r"([A-Z][A-Za-z]{1,6}(?:\s*\([^)]{1,30}\))?)", tail)
            abbr = abbr_match.group(1).strip() if abbr_match else ""
        else:
            name = raw.strip()
            abbr = ""

        if len(name) < 8 or len(name) > 140:
            continue
        qual_type = classify(name)
        if qual_type is None:
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:70]
        pid = f"uj-{faculty_id.replace('uj-', '')}-{slug}"
        if pid in seen:
            continue
        seen.add(pid)

        duration = None
        # Look for a duration mention within ~400 chars after this entry
        # starts, in the source text (same page, nearby context). UJ's
        # observed phrasing spells the number out with the digit as a
        # parenthetical clarifier ("three (3) years"), not a bare digit
        # -- match on the parenthesized digit, which is present either way.
        window = text[start:start + 400]
        dur_match = re.search(r"minimum period of study[^.]*?\((\d+)\)\s*years?", window, re.I)
        if dur_match:
            duration = f"{dur_match.group(1)} years"

        out.append({
            "id": pid,
            "institutionId": "uj",
            "name": name + (f" ({abbr})" if abbr and abbr.lower() not in name.lower() else ""),
            "qualificationType": qual_type,
            "qualificationCode": None,
            "facultyId": faculty_id,
            "schoolId": None,
            "nqfLevel": None,
            "totalCredits": None,
            "saqaId": None,
            "duration": duration,
            "minAps": None,
            "additionalRequirements": [],
            "sourceUrl": source_url,
            "note": "Extracted from faculty programme-listing page prose (name + duration where stated); "
                    "no qualification code, NQF level, or APS found on this page -- UJ's pages don't "
                    "consistently publish these inline the way UNISA's per-qualification pages do.",
        })
    return out


def main() -> None:
    data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    archive_robots = RobotsChecker("https://web.archive.org")

    all_programmes: list[dict] = []
    pdf_only_faculties: list[str] = []
    no_listing_faculties: list[str] = []

    for faculty in data["faculties"]:
        print(f"UJ programmes: {faculty['name']}")
        listing_url_original = find_programme_listing_url(faculty["sourceUrl"], faculty["code"], archive_robots)
        if listing_url_original is None:
            print("  -> no undergraduate programme link found on faculty page")
            no_listing_faculties.append(faculty["name"])
            continue

        listing_wb = _wayback_snapshot_url(listing_url_original)
        if listing_wb is None:
            print(f"  -> no Wayback snapshot of {listing_url_original}")
            no_listing_faculties.append(faculty["name"])
            continue

        resp = polite_get(listing_wb, archive_robots)
        if resp is None:
            no_listing_faculties.append(faculty["name"])
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup.find_all(["nav", "header", "footer", "script", "style"]):
            tag.decompose()
        text = soup.get_text(" ", strip=True)

        has_pdf_only = len(text) < 400 and bool(soup.find_all("a", href=lambda h: h and ".pdf" in h.lower()))
        if has_pdf_only:
            print(f"  -> page is a near-empty stub routing to a PDF yearbook/brochure, not extracted (len={len(text)})")
            pdf_only_faculties.append(faculty["name"])
            continue

        programmes = extract_programmes_from_text(text, listing_wb, faculty["id"])
        print(f"  -> {len(programmes)} programmes extracted from {listing_wb}")
        all_programmes.extend(programmes)

    data["programmes"] = all_programmes
    print(f"\nUJ programmes total: {len(all_programmes)}")
    print(f"Faculties with no programme listing found: {no_listing_faculties}")
    print(f"Faculties whose listing routes to a PDF only (not extracted): {pdf_only_faculties}")

    data["notes"].append(
        f"Programme collection (second pass): {len(all_programmes)} programmes extracted from "
        f"{len({p['facultyId'] for p in all_programmes})} faculties whose own undergraduate "
        "programme-listing page (discovered from each faculty's own page, not a guessed URL pattern -- "
        "confirmed the path isn't uniform across faculties) had real prose text, not just a PDF link. "
        f"Faculties with no programme listing link found on their main page: {no_listing_faculties}. "
        f"Faculties whose listing page routes to a PDF yearbook/brochure with no real content of its own "
        f"(near-empty stub, same pattern as CPUT/UNISA-Science): {pdf_only_faculties} -- consistent with "
        "the instruction to only extract from a PDF if its text is cleanly machine-readable, these PDFs "
        "were not fetched/parsed in this pass (time/scope), so these faculties have zero programmes "
        "rather than a low-confidence PDF extraction; a genuine next step would be fetching and "
        "text-checking each one individually. Every extracted programme has qualificationCode, nqfLevel, "
        "minAps, saqaId, and schoolId as null -- UJ's programme-listing pages state a qualification name, "
        "sometimes a minimum-study-duration sentence, and general purpose/career-outcome prose, but not "
        "a clean labeled code/NQF/APS the way UNISA's per-qualification detail pages do. All programmes "
        "have facultyId (the faculty whose own page they were found on); schoolId was not attempted."
    )

    OUTPUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
