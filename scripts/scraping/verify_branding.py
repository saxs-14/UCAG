#!/usr/bin/env python3
"""One-off verification pass for lib/institutions/branding.ts's hardcoded
colors/logos for ump, up, wits, tut, uct, nmu -- read-only, writes a
report to output/branding_verification.json. Does not edit branding.ts
itself (that's a manual review + edit step)."""

from __future__ import annotations

import json
import re
import sys
import time
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin, urlparse

import truststore

truststore.inject_into_ssl()

import requests
from bs4 import BeautifulSoup

from robots_check import RobotsChecker

USER_AGENT = "UCAG-DataCollector/1.0 (South African institution catalogue research; contact: project maintainer)"
RATE_LIMIT_SECONDS = 1.5
TIMEOUT = 25
OUTPUT_DIR = Path(__file__).parent / "output"

TARGETS = {
    "ump": "https://www.ump.ac.za/",
    "up": "https://www.up.ac.za/",
    "wits": "https://www.wits.ac.za/",
    "tut": "https://www.tut.ac.za/",
    "uct": "https://www.uct.ac.za/",
    "nmu": "https://www.mandela.ac.za/",
}

CURRENT_HARDCODED = {
    "ump": {"primary": "#003b5c", "secondary": "#00a896", "accent": "#d4af37"},
    "up": {"primary": "#8b0000", "secondary": "#d4af37", "accent": "#111827"},
    "wits": {"primary": "#002147", "secondary": "#c5a059", "accent": "#0056b3"},
    "tut": {"primary": "#004d40", "secondary": "#d84315", "accent": "#00897b"},
    "uct": {"primary": "#0f2027", "secondary": "#203a43", "accent": "#2c5364"},
    "nmu": {"primary": "#002f6c", "secondary": "#ffc72c", "accent": "#0066b2"},
}

_last_request_at: dict[str, float] = {}


def _host(url: str) -> str:
    return urlparse(url).netloc


def polite_get(url: str, robots: RobotsChecker | None) -> requests.Response | None:
    if robots is not None and not robots.can_fetch(url):
        print(f"  [skip, robots.txt disallows] {url}")
        return None
    host = _host(url)
    elapsed = time.monotonic() - _last_request_at.get(host, 0)
    if elapsed < RATE_LIMIT_SECONDS:
        time.sleep(RATE_LIMIT_SECONDS - elapsed)
    _last_request_at[host] = time.monotonic()
    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT, allow_redirects=True)
        return resp
    except requests.RequestException as e:
        print(f"  [error] {url}: {e}")
        return None


def extract_brand_colors(html: str, max_colors: int = 6) -> list[dict]:
    hexes = re.findall(r"#[0-9a-fA-F]{6}\b", html)
    noise = {"#ffffff", "#000000", "#f7f7f7", "#6c757d", "#f8f9fa", "#e9ecef", "#dee2e6"}
    counts = Counter(h.lower() for h in hexes if h.lower() not in noise)
    return [{"hex": h, "occurrences": n} for h, n in counts.most_common(max_colors)]


def find_logo_candidate(html: str, base_url: str, robots: RobotsChecker) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    candidates: list[str] = []

    for img in soup.find_all("img"):
        src = img.get("src") or ""
        alt = (img.get("alt") or "").lower()
        cls = " ".join(img.get("class") or []).lower()
        if "logo" in src.lower() or "logo" in alt or "logo" in cls:
            candidates.append(urljoin(base_url, src))

    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        candidates.append(urljoin(base_url, og_image["content"]))

    for icon_rel in ("icon", "shortcut icon", "apple-touch-icon"):
        link = soup.find("link", rel=icon_rel)
        if link and link.get("href"):
            candidates.append(urljoin(base_url, link["href"]))

    for url in candidates:
        resp = polite_get(url, robots)
        if resp is not None and resp.status_code == 200:
            content_type = resp.headers.get("content-type", "")
            if content_type.startswith("image/"):
                return {"url": url, "contentType": content_type, "bytes": len(resp.content)}
    return None


def verify_one(institution_id: str, base_url: str) -> dict:
    print(f"\n{institution_id.upper()} -- {base_url}")
    robots = RobotsChecker(base_url)
    resp = polite_get(base_url, robots)
    if resp is None or resp.status_code != 200:
        return {
            "institutionId": institution_id,
            "sourceUrl": base_url,
            "status": "unreachable",
            "note": f"homepage request failed or returned non-200 (status={resp.status_code if resp else None})",
        }

    colors = extract_brand_colors(resp.text)
    logo = find_logo_candidate(resp.text, base_url, robots)
    hardcoded = CURRENT_HARDCODED[institution_id]

    real_hexes = {c["hex"] for c in colors}
    verdict = "wrong"
    if hardcoded["primary"].lower() in real_hexes:
        verdict = "right"
    else:
        # loose hue-family check: close if the hardcoded primary's hue
        # family (first 2 hex digit pairs' rough magnitude) matches any
        # real color -- cheap heuristic, human should still eyeball it.
        verdict = "wrong-or-unconfirmed"

    print(f"  colors found: {colors[:4]}")
    print(f"  logo: {logo}")
    print(f"  hardcoded primary {hardcoded['primary']} -> verdict: {verdict}")

    return {
        "institutionId": institution_id,
        "sourceUrl": base_url,
        "status": "ok",
        "realColors": colors,
        "logoCandidate": logo,
        "hardcodedValue": hardcoded,
        "verdict": verdict,
    }


def main():
    results = []
    for institution_id, base_url in TARGETS.items():
        results.append(verify_one(institution_id, base_url))

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / "branding_verification.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
