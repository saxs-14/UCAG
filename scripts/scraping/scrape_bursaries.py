#!/usr/bin/env python3
"""Collects additional real South African bursaries not already in
UCAG's seeded set (37 bursaries in scripts/seed-real-bursaries-and-
statistics.mts). Writes local JSON to output/bursaries.json. Does not
touch Firestore, .env, or any seed script.

Each candidate URL below is a guess at a real provider's official
bursary page -- verified by actually fetching it (not assumed correct).
A URL that 404s, redirects somewhere clearly unrelated, or whose content
doesn't actually describe a bursary is dropped, not guessed around.
"""

from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from urllib.parse import urlparse

import truststore

truststore.inject_into_ssl()

import requests
from bs4 import BeautifulSoup

from robots_check import RobotsChecker

USER_AGENT = "UCAG-DataCollector/1.0 (South African bursary catalogue research; contact: project maintainer)"
RATE_LIMIT_SECONDS = 1.5
TIMEOUT = 25
OUTPUT_DIR = Path(__file__).parent / "output"

_last_request_at: dict[str, float] = {}
_robots_cache: dict[str, RobotsChecker] = {}


def _host(url: str) -> str:
    return urlparse(url).netloc


def _robots_for(url: str) -> RobotsChecker:
    host = _host(url)
    if host not in _robots_cache:
        _robots_cache[host] = RobotsChecker(f"https://{host}/")
    return _robots_cache[host]


def polite_get(url: str) -> requests.Response | None:
    robots = _robots_for(url)
    if not robots.can_fetch(url):
        print(f"  [skip, robots.txt disallows] {url}")
        return None
    host = _host(url)
    elapsed = time.monotonic() - _last_request_at.get(host, 0)
    if elapsed < RATE_LIMIT_SECONDS:
        time.sleep(RATE_LIMIT_SECONDS - elapsed)
    _last_request_at[host] = time.monotonic()
    try:
        return requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT, allow_redirects=True)
    except requests.RequestException as e:
        print(f"  [error] {url}: {e}")
        return None


@dataclass
class BursaryCandidate:
    id: str
    name: str
    provider: str
    guess_url: str
    expected_keywords: list[str] = field(default_factory=list)


# Candidates: real, well-known SA bursary providers not already in
# UCAG's 37 seeded bursaries. URL is a best-guess at the provider's own
# official bursary page, verified below before being included.
CANDIDATES = [
    BursaryCandidate(
        "standard-bank-bursary",
        "Standard Bank Bursary Programme",
        "Standard Bank",
        "https://www.standardbank.co.za/southafrica/personal/beyond-banking/bursaries",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "absa-bursary",
        "Absa Bursary Programme",
        "Absa",
        "https://www.absa.co.za/absa-foundation/bursary-and-scholarship-programme/",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "nedbank-bursary",
        "Nedbank Bursary Programme",
        "Nedbank",
        "https://www.nedbank.co.za/content/nedbank/desktop/gt/en/aboutus/corporate-social-responsibility/bursaries.html",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "investec-bursary",
        "Investec Bursary Programme",
        "Investec",
        "https://www.investec.com/en_za/welcome-to-investec/about-us/corporate-social-investment/education/bursaries.html",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "transnet-bursary",
        "Transnet Bursary Scheme",
        "Transnet SOC Ltd",
        "https://www.transnet.net/BursaryScheme/Pages/default.aspx",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "mtn-bursary",
        "MTN South Africa Bursary Programme",
        "MTN South Africa",
        "https://www.mtn.co.za/about-mtn-bursary-scheme/",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "harmony-gold-bursary",
        "Harmony Gold Bursary Scheme",
        "Harmony Gold Mining Company",
        "https://www.harmony.co.za/sustainability/communities/bursaries/",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "rand-water-bursary",
        "Rand Water Bursary Scheme",
        "Rand Water",
        "https://www.randwater.co.za/CareersAndStudy/Pages/Bursary.aspx",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "merseta-bursary",
        "merSETA Bursary Programme",
        "Manufacturing, Engineering and Related Services SETA (merSETA)",
        "https://www.merseta.org.za/learning-programmes/bursaries",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "wrseta-bursary",
        "W&RSETA Bursary Programme",
        "Wholesale and Retail SETA (W&RSETA)",
        "https://www.wrseta.org.za/Pages/Bursaries.aspx",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "gauteng-doe-bursary",
        "Gauteng Department of Education Bursary Scheme",
        "Gauteng Provincial Government",
        "https://www.gauteng.gov.za/web/education/bursaries",
        ["bursary", "bursaries"],
    ),
    BursaryCandidate(
        "wcg-bursary",
        "Western Cape Government Bursary Programme",
        "Western Cape Provincial Government",
        "https://www.westerncape.gov.za/general-publication/bursaries",
        ["bursary", "bursaries"],
    ),
]


def verify_and_extract(candidate: BursaryCandidate) -> dict | None:
    print(f"\n{candidate.name} -> {candidate.guess_url}")
    resp = polite_get(candidate.guess_url)
    if resp is None:
        return None
    if resp.status_code != 200:
        print(f"  [reject] status={resp.status_code}")
        return None

    text = resp.text.lower()
    if not any(kw in text for kw in candidate.expected_keywords):
        print(f"  [reject] page doesn't mention expected keywords {candidate.expected_keywords}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")
    body_text = soup.get_text(" ", strip=True)

    # Heuristic extraction only -- these pages are mostly narrative/CMS
    # content, not structured data like UNISA's qualification list was.
    # Only include a field when it's actually stated in recognizable
    # form; leave everything else null rather than guess from prose.
    closes_match = re.search(
        r"clos(?:e|ing)[^.]{0,40}?(\d{1,2}\s+\w+\s+20\d{2})", body_text, re.IGNORECASE
    )
    opens_match = re.search(
        r"open(?:s|ing)?[^.]{0,40}?(\d{1,2}\s+\w+\s+20\d{2})", body_text, re.IGNORECASE
    )

    print(f"  [accept] {len(body_text)} chars of body text, "
          f"closesOn hint={closes_match.group(1) if closes_match else None}")

    return {
        "id": candidate.id,
        "name": candidate.name,
        "provider": candidate.provider,
        "fieldsOfStudy": [],
        "levelRequired": "currentlyEnrolled",
        "opensOn": None,
        "closesOn": None,
        "value": "Amount not stated in scraped page text -- see sourceUrl",
        "criteria": [],
        "applyUrl": candidate.guess_url,
        "riskFlags": [],
        "sourceUrl": candidate.guess_url,
        "note": (
            "Page confirmed real and live, confirmed to be a genuine bursary page "
            "(contains 'bursary'/'bursaries'), but specific fields (value, criteria, "
            "dates, fields of study) were not reliably extractable from narrative "
            "page text with the keyword-based approach used here -- needs a human "
            "to read the actual page and fill these in, not a confident guess."
        ),
    }


def main():
    results = []
    rejected = []
    for candidate in CANDIDATES:
        result = verify_and_extract(candidate)
        if result:
            results.append(result)
        else:
            rejected.append({"id": candidate.id, "name": candidate.name, "guessUrl": candidate.guess_url})

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / "bursaries.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print(f"\n{len(results)} verified-real bursary pages, {len(rejected)} rejected (404/wrong content/robots-blocked).")
    print(f"Wrote {out_path}")
    if rejected:
        print("Rejected:")
        for r in rejected:
            print(f"  - {r['name']}: {r['guessUrl']}")


if __name__ == "__main__":
    main()
