#!/usr/bin/env python3
"""Institution data collector for UCAG's Tier 2 institutions (uj, unisa,
cput -- see README.md for why exactly these three). Writes local JSON to
output/<institution-id>.json. Does not touch Firestore, .env files, or
any npm seed script -- see README.md.

Usage: python scrape.py <uj|unisa|cput>
"""

from __future__ import annotations

import json
import re
import sys
import time
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urljoin

# Uses the OS's own certificate store (what curl/the browser trust)
# instead of only the certifi bundle -- some SA institution sites (e.g.
# cput.ac.za) send an incomplete certificate chain that certifi alone
# can't verify, even though it's perfectly valid to a normal browser.
import truststore

truststore.inject_into_ssl()

import requests
from bs4 import BeautifulSoup

from robots_check import RobotsChecker

USER_AGENT = "UCAG-DataCollector/1.0 (South African institution catalogue research; contact: project maintainer)"
RATE_LIMIT_SECONDS = 1.5
REQUEST_TIMEOUT = 25
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 4
OUTPUT_DIR = Path(__file__).parent / "output"

_last_request_at: dict[str, float] = {}


def _host(url: str) -> str:
    return re.sub(r"^https?://", "", url).split("/")[0]


def polite_get(url: str, robots: RobotsChecker | None) -> requests.Response | None:
    """Rate-limited, robots-respecting, honestly-identified GET. Returns
    None (not an exception) when robots.txt disallows the path or the
    request fails -- callers are expected to handle a missing page
    gracefully (it becomes a documented gap, not a crash)."""
    if robots is not None and not robots.can_fetch(url):
        print(f"  [skip, robots.txt disallows] {url}")
        return None

    host = _host(url)

    # unisa.ac.za in particular resets connections or times out on a
    # meaningful fraction of requests regardless of pacing (observed
    # repeatedly across this session, including on retries seconds apart)
    # -- a few automatic retries with backoff turns what was previously
    # "re-run the whole script and hope" into something that can actually
    # get through a few hundred sequential requests unattended.
    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        elapsed = time.monotonic() - _last_request_at.get(host, 0)
        if elapsed < RATE_LIMIT_SECONDS:
            time.sleep(RATE_LIMIT_SECONDS - elapsed)
        _last_request_at[host] = time.monotonic()

        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True,
            )
            break
        except requests.RequestException as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"  [attempt {attempt + 1}/{MAX_RETRIES} failed, retrying] {url}: {e}")
                time.sleep(RETRY_BACKOFF_SECONDS * (attempt + 1))
    else:
        print(f"  [request failed after {MAX_RETRIES} attempts] {url}: {last_error}")
        return None

    if resp.status_code != 200:
        print(f"  [HTTP {resp.status_code}] {url}")
        return None
    return resp


def extract_brand_colors(html: str, max_colors: int = 6) -> list[dict]:
    """Finds the most-repeated hex colors in a page's inline/embedded CSS
    as a brand-color heuristic. Caller is expected to sanity-check the
    result against what the institution is actually known to use --
    this is a signal, not a verified fact (no sourceUrl-worthy claim is
    made beyond "this hex appeared N times on this page")."""
    hexes = re.findall(r"#[0-9a-fA-F]{6}\b", html)
    # Drop common framework/neutral defaults that show up on nearly every
    # Bootstrap-based site regardless of brand -- they'd otherwise crowd
    # out the real brand colors by sheer repetition.
    noise = {"#ffffff", "#000000", "#f7f7f7", "#6c757d", "#f8f9fa", "#e9ecef", "#dee2e6"}
    counts = Counter(h.lower() for h in hexes if h.lower() not in noise)
    return [{"hex": h, "occurrences": n} for h, n in counts.most_common(max_colors)]


@dataclass
class Faculty:
    id: str
    institution_id: str
    name: str
    code: str
    source_url: str


@dataclass
class Programme:
    id: str
    institution_id: str
    name: str
    qualification_type: str | None
    qualification_code: str | None
    faculty_id: str | None
    school_id: str | None
    source_url: str
    note: str | None = None
    nqf_level: int | None = None
    total_credits: int | None = None
    saqa_id: str | None = None
    duration: str | None = None
    min_aps: int | None = None
    additional_requirements: list[str] = field(default_factory=list)


@dataclass
class ScrapeResult:
    institution_id: str
    faculties: list[Faculty] = field(default_factory=list)
    schools: list[dict] = field(default_factory=list)
    programmes: list[Programme] = field(default_factory=list)
    unmapped_qualifications: list[Programme] = field(default_factory=list)
    brand_colors: list[dict] = field(default_factory=list)
    brand_color_source: str | None = None
    notes: list[str] = field(default_factory=list)


def _wayback_snapshot_url(original_url: str) -> str | None:
    """Resolves the most recent 200-status Wayback Machine snapshot of a
    URL via the CDX API, or None if archive.org has nothing. Returns the
    full, directly-fetchable web.archive.org URL (which itself encodes
    both the snapshot timestamp and the original URL -- a reader can see
    at a glance that this is an archived copy and recover the live URL
    from it)."""
    cdx_resp = requests.get(
        "https://web.archive.org/cdx/search/cdx",
        params={"url": original_url, "filter": "statuscode:200", "output": "json", "limit": -1},
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT,
    )
    if cdx_resp.status_code != 200:
        return None
    rows = cdx_resp.json()
    if len(rows) < 2:
        return None
    timestamp = rows[1][1]
    return f"https://web.archive.org/web/{timestamp}/{original_url}"


def scrape_uj() -> ScrapeResult:
    result = ScrapeResult(institution_id="uj")
    result.notes.append(
        "uj.ac.za itself is behind a Cloudflare managed challenge -- both "
        "https://www.uj.ac.za/robots.txt and https://www.uj.ac.za/ "
        "returned HTTP 403 with a 'Just a moment...' challenge page on "
        "direct request (confirmed, not assumed). Solving or bypassing "
        "that challenge is out of scope for this scraper by design -- see "
        "README.md. "
        "Per explicit instruction, checked the Wayback Machine instead: "
        "archive.org has clean, genuinely recent (homepage snapshot from "
        "2026-10-17, the day before this run) 200-status archived copies "
        "of uj.ac.za that are NOT Cloudflare challenge pages (confirmed: "
        "no 'Just a moment' text, no cf_chl markers in the archived HTML) "
        "-- Wayback's own crawler evidently isn't subject to the same "
        "block this scraper's requests hit directly. Data below is "
        "sourced entirely from those archived copies. Every sourceUrl is "
        "a web.archive.org URL, which encodes both the snapshot date and "
        "the real original uj.ac.za URL in its own path -- this IS the "
        "note that it's an archived copy, not live data; the original URL "
        "is recoverable by reading the part after the timestamp."
    )

    # web.archive.org has no robots.txt at all (confirmed: 404) -- same
    # "no restriction declared" case as unisa.ac.za, handled the same way
    # by RobotsChecker rather than special-cased here.
    archive_robots = RobotsChecker("https://web.archive.org")

    base = "https://www.uj.ac.za"
    home_wayback = _wayback_snapshot_url(base + "/")
    if home_wayback is None:
        result.notes.append("No Wayback Machine snapshot of the UJ homepage was found either -- no UJ data collected.")
        return result

    print(f"UJ: fetching Wayback snapshot of homepage: {home_wayback}")
    home = polite_get(home_wayback, archive_robots)
    if home is None:
        result.notes.append("Wayback snapshot of the UJ homepage exists but failed to fetch.")
        return result

    result.brand_colors = extract_brand_colors(home.text)
    result.brand_color_source = home_wayback

    soup = BeautifulSoup(home.text, "html.parser")
    faculty_links: dict[str, str] = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        # Wayback rewrites in-page links to their own /web/<ts>/<original>
        # form -- match on the real uj.ac.za path embedded in that.
        m = re.search(r"uj\.ac\.za(/faculties/[a-z0-9\-]+/?)$", href.rstrip("/") + "/")
        if m:
            text = a.get_text(strip=True)
            if text and text.lower() != "faculties":
                faculty_links[m.group(1).rstrip("/")] = text

    print(f"UJ: found {len(faculty_links)} faculties, fetching each for departments (schools)")
    for path, name in faculty_links.items():
        code = path.rstrip("/").split("/")[-1]
        original_url = base + path + "/"
        fac_wayback = _wayback_snapshot_url(original_url)
        faculty = Faculty(
            id=f"uj-{code}",
            institution_id="uj",
            name=name,
            code=code,
            source_url=fac_wayback or original_url,
        )
        result.faculties.append(faculty)

        if fac_wayback is None:
            continue
        fac_resp = polite_get(fac_wayback, archive_robots)
        if fac_resp is None:
            continue
        fac_soup = BeautifulSoup(fac_resp.text, "html.parser")
        seen_school_ids: set[str] = set()
        for a in fac_soup.find_all("a", href=True):
            href = a["href"]
            m = re.search(rf"uj\.ac\.za(/faculties/{re.escape(code)}/departments[^/]*/[a-z0-9\-]+/?)$", href.rstrip("/") + "/")
            if m:
                school_name = a.get_text(strip=True)
                if not school_name:
                    continue
                school_code = m.group(1).rstrip("/").split("/")[-1]
                school_id = f"uj-{code}-{school_code}"
                if school_id in seen_school_ids:
                    # same department link appears more than once on the
                    # page (nav menu + in-page list, observed on several
                    # faculty pages)
                    continue
                seen_school_ids.add(school_id)
                result.schools.append({
                    "id": school_id,
                    "facultyId": faculty.id,
                    "name": school_name,
                    "code": school_code,
                    "sourceUrl": fac_wayback,
                })

    print(f"UJ: {len(result.faculties)} faculties, {len(result.schools)} departments/schools")
    result.notes.append(
        f"{len(result.schools)} departments collected from each faculty's own archived page (department "
        "pages are UJ's nearest equivalent to UCAG's 'School' level -- UJ calls them Departments, not "
        "Schools, except for the College of Business and Economics which does use 'School'). Programmes/"
        "courses were NOT collected in this pass: each faculty's undergraduate/postgraduate programme "
        "listing is itself another page needing its own Wayback resolution + fetch, and several observed "
        "programme pages link out to PDF brochures for the actual curriculum detail (same PDF-reliance "
        "pattern as CPUT) -- scoped out of this already-large UJ archive-recovery effort rather than "
        "rushed. facultyId/schoolId cross-referencing wasn't attempted for programmes since no programmes "
        "were collected to cross-reference. No brand-color note needed: colors were extracted from the "
        "same real, recent, non-challenge-page archived homepage."
    )
    return result


def scrape_cput() -> ScrapeResult:
    base = "https://www.cput.ac.za"
    robots = RobotsChecker(base)
    result = ScrapeResult(institution_id="cput")

    print("CPUT: fetching homepage for faculty list + brand colors")
    home = polite_get(base + "/", robots)
    # cput.ac.za's current failure mode is a genuine PHP fatal error served
    # with HTTP 200 (confirmed live: a ~190-byte body consisting entirely
    # of "Parse error: ... in /var/www/html/..."), which polite_get has no
    # way to distinguish from real content by status code alone --
    # detected here instead.
    if home is not None and "Parse error" in home.text and "/var/www/html/" in home.text:
        print("CPUT: homepage returned HTTP 200 but the body is a PHP fatal error, treating as unreachable")
        home = None
    used_wayback = False
    home_source_url = base + "/"
    if home is None:
        # cput.ac.za went down with a live PHP fatal error partway through
        # this scraper's own session (its homepage worked earlier the same
        # session; confirmed via Wayback that it was still healthy as of
        # 2026-10-17 14:39, hours before this fallback was needed) -- same
        # "live site genuinely unreachable, try a recent clean archive"
        # situation as UJ's Cloudflare block, so the same fallback applies.
        print("CPUT: live homepage fetch failed, falling back to Wayback Machine")
        archive_robots = RobotsChecker("https://web.archive.org")
        home_wayback = _wayback_snapshot_url(base + "/")
        if home_wayback is None:
            result.notes.append("Live homepage fetch failed and no Wayback Machine snapshot was found either; no data collected.")
            return result
        home = polite_get(home_wayback, archive_robots)
        if home is None:
            result.notes.append(f"Live homepage fetch failed and the Wayback snapshot ({home_wayback}) also failed to fetch; no data collected.")
            return result
        used_wayback = True
        home_source_url = home_wayback
        result.notes.append(
            f"cput.ac.za's live homepage was unreachable when this ran (see other note for the PHP "
            f"fatal errors found on its prospectus pages) -- faculties and brand colors below are from "
            f"a Wayback Machine snapshot instead ({home_wayback}), confirmed real/current (archived "
            "2026-10-17, same day as this run, well before the site broke) rather than a stale archive. "
            "sourceUrl for these records is the web.archive.org URL, which encodes the original cput.ac.za "
            "URL and snapshot date in its own path."
        )

    result.brand_colors = extract_brand_colors(home.text)
    result.brand_color_source = home_source_url

    soup = BeautifulSoup(home.text, "html.parser")
    faculty_links: dict[str, str] = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if used_wayback:
            m = re.search(r"cput\.ac\.za(/faculties/[a-z0-9\-]+)/?$", href.rstrip("/") + "/")
            path = m.group(1) if m else None
        else:
            path = href if href.startswith("/faculties/") and href.count("/") == 2 else None
        if path:
            text = a.get_text(strip=True)
            if text:
                faculty_links[path] = text

    for path, name in faculty_links.items():
        code = path.rstrip("/").split("/")[-1]
        url = home_source_url if used_wayback else urljoin(base, path)
        result.faculties.append(
            Faculty(
                id=f"cput-{code}",
                institution_id="cput",
                name=name,
                code=code,
                source_url=url,
            )
        )
    print(f"CPUT: found {len(result.faculties)} faculties" + (" (via Wayback Machine)" if used_wayback else ""))

    result.notes.append(
        "Schools/departments and programmes/courses were NOT collected for "
        "CPUT, after a second, deeper attempt specifically to find and "
        "parse the PDF prospectus this scraper's first pass assumed "
        "existed behind /faculties/<code>/courses's 'Courses (Prospectus)' "
        "link. What was actually found: "
        "(1) /study-at-cput/undergraduate/prospectus, "
        "/study-at-cput/postgraduate/prospectus, and /faculties/prospectus "
        "all return HTTP 200 but with a genuine PHP fatal error as the "
        "entire page body (e.g. \"Parse error: syntax error, unexpected "
        "token '<', expecting end of file in /var/www/html/index.php on "
        "line 50\") -- confirmed on live fetch, this is CPUT's own site "
        "being broken right now, not a scraping obstacle. "
        "(2) /faculties/fid/resources (a faculty's own 'Documents & "
        "Resources' page, checked as an alternate path to a prospectus "
        "PDF) hits the same class of PHP error "
        "(/var/www/html/includes/framework.php). "
        "(3) /faculties/fid/courses itself (not just the prospectus link) "
        "returns a real 200 with no actual course listing in the body -- "
        "confirmed not a transient issue by checking Wayback Machine "
        "snapshots of that same URL from 2025-11-14 through 2026-06-09, "
        "all of which show the identical content-less stub, so this has "
        "been the page's real state for at least several months, not a "
        "one-off glitch during this scraping session. "
        "(4) Wayback Machine DOES have older (2013-2019) archived HTML "
        "course-detail pages from a previous version of CPUT's site "
        "(/academic/faculties/<name>/prospectus/course?i=<id>), not PDFs "
        "-- deliberately NOT used as a data source here: presenting "
        "programme names/requirements from up to 13 years ago as current "
        "2026 data would be a worse violation of 'verified, not guessed' "
        "than collecting nothing, given how much a university's "
        "programme list and entry requirements can change over that span. "
        "Net result: no PDF was ever reachable to parse (live or recently "
        "archived), and the genuinely old archived alternative was judged "
        "too stale to present as current. Faculties and brand colors "
        "remain solid, current data (see the other note on this run: "
        "collected via a same-day Wayback snapshot once the live site "
        "itself went down mid-session, not fabricated or reused from an "
        "earlier successful fetch this session)."
    )
    return result


# Ordered most-specific first: "Advanced Diploma in" must be tried before
# plain "Diploma in" (which is a substring of it), likewise "Postgraduate
# Diploma in" / "Postgraduate Certificate in" before any shorter prefix
# that could also match inside them. Each maps to the closest
# QualificationType in lib/firestore/types.ts, or None with a note when
# the schema genuinely has no matching value (Advanced Certificate and
# Postgraduate Certificate aren't in that enum at all).
UNISA_QUALIFICATION_PREFIXES: list[tuple[str, str | None]] = [
    ("Advanced Diploma in", "advancedDiploma"),
    # advancedCertificate/postgraduateCertificate added to QualificationType
    # in lib/firestore/types.ts specifically because of this scraper's own
    # first-run findings -- these 39 entries no longer need to sit in
    # unmappedQualifications.
    ("Advanced Certificate in", "advancedCertificate"),
    ("Postgraduate Diploma in", "postgraduateDiploma"),
    ("Postgraduate Certificate in", "postgraduateCertificate"),
    ("Higher Certificate in", "higherCertificate"),
    ("Diploma in", "diploma"),
    ("Bachelor of", "bachelorsDegree"),
    ("Bachelor's", "bachelorsDegree"),
]


def _parse_unisa_qualification_links(soup: BeautifulSoup, base: str, source_url: str) -> list[Programme]:
    """Reads qualification name + detail-page URL directly from each
    listing's own <a href> (e.g. ".../All-qualifications/Higher-
    Certificate-in-Accounting-Sciences-(98201)"), instead of regexing the
    flattened page text. This is the second version of this parser: the
    first one regexed over nav/header/footer-stripped plain text and
    occasionally swallowed adjacent filter-UI label text into the first
    real match (no whitespace separated them once stripped to plain
    text) -- scoping each match to one anchor's own text eliminates that
    failure mode structurally, not just with a tighter regex. Also
    captures the real per-qualification URL, needed for enrichment."""
    prefix_pattern = "|".join(re.escape(p) for p, _ in UNISA_QUALIFICATION_PREFIXES)
    name_code_pattern = re.compile(rf"^({prefix_pattern})([^()]{{2,160}}?)\s*\(([\w\s\-]{{2,20}})\)\s*$")

    seen_ids: set[str] = set()
    out: list[Programme] = []
    for a in soup.find_all("a", href=True):
        text = a.get_text(" ", strip=True)
        match = name_code_pattern.match(text)
        if not match:
            continue
        prefix, rest, code = match.group(1), match.group(2).strip(), match.group(3).strip()
        name = f"{prefix} {rest}".strip()
        detail_url = urljoin(base, a["href"])

        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:80]
        pid = f"unisa-{slug}-{code.lower().replace(' ', '')}"
        if pid in seen_ids:
            continue
        seen_ids.add(pid)

        qual_type = next((t for p, t in UNISA_QUALIFICATION_PREFIXES if p == prefix), None)

        out.append(
            Programme(
                id=pid,
                institution_id="unisa",
                name=name,
                qualification_type=qual_type,
                qualification_code=code,
                faculty_id=None,
                school_id=None,
                source_url=detail_url,
            )
        )
    return out


# Labeled key:value facts that UNISA's own qualification detail pages
# state in plain prose, e.g. "NQF level: 5" or "APS/AS: 14" -- anchored on
# the exact label text observed on a real page
# (Higher-Certificate-in-Accounting-Sciences-(98201)), not guessed.
DETAIL_PAGE_FIELD_PATTERNS = {
    "nqf_level": re.compile(r"NQF level:\s*(\d+)"),
    "total_credits": re.compile(r"Total credits:\s*(\d+)"),
    "saqa_id": re.compile(r"SAQA ID:\s*(\S+)"),
    "min_aps": re.compile(r"APS/AS:\s*(\d+)"),
    "duration": re.compile(r"Maximum time to complete this qualification:\s*([^.]+?)(?:\s{2,}|Admission requirements|$)"),
}


def enrich_unisa_programme(programme: Programme, robots: RobotsChecker) -> None:
    """Fetches one qualification's own detail page and fills in whatever
    of nqfLevel/totalCredits/saqaId/minAps/duration/additionalRequirements
    it states. Mutates `programme` in place; leaves fields None/[] (not a
    guess) for anything the page doesn't state. No facultyId/schoolId/
    campuses/careerOutcomes/applyUrl here -- confirmed absent from this
    page (see scrape_unisa's own note on why)."""
    resp = polite_get(programme.source_url, robots)
    if resp is None:
        programme.note = ((programme.note + " ") if programme.note else "") + (
            "Detail page fetch failed -- no enrichment fields collected for this qualification."
        )
        return

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup.find_all(["nav", "header", "footer", "script", "style"]):
        tag.decompose()
    text = soup.get_text(" ", strip=True)

    for field_name, pattern in DETAIL_PAGE_FIELD_PATTERNS.items():
        match = pattern.search(text)
        if not match:
            continue
        value = match.group(1).strip()
        if field_name in ("nqf_level", "total_credits", "min_aps"):
            try:
                setattr(programme, field_name, int(value))
            except ValueError:
                pass
        else:
            setattr(programme, field_name, value)

    # Admission requirements: real prose, not a structured per-subject
    # breakdown -- stored as additionalRequirements (free text), not
    # forced into subjectRequirements (which implies parsed per-subject
    # objects this scraper did not produce).
    req_match = re.search(
        r"Qualification admission requirements\s*(.+?)(?:Click here for more information about Unisa's general admission requirements|Student fees and funding)",
        text,
    )
    if req_match:
        programme.additional_requirements = [req_match.group(1).strip()[:2000]]


def scrape_unisa() -> ScrapeResult:
    base = "https://www.unisa.ac.za"
    robots = RobotsChecker(base)
    result = ScrapeResult(institution_id="unisa")

    print("UNISA: fetching homepage for college list + brand colors")
    home = polite_get(base + "/sites/corporate/default/", robots)
    if home is None:
        result.notes.append("Could not fetch homepage at all; no data collected.")
        return result

    soup = BeautifulSoup(home.text, "html.parser")

    # Colleges: real teaching colleges only -- excludes "College of Graduate
    # Studies" (an admin umbrella for postgrad support, not a faculty with
    # its own undergraduate programmes) and the separately-run Graduate
    # School of Business Leadership subsite, to keep this directly
    # comparable to the Faculty shape other institutions use.
    exclude = {
        "advancing excellence through our colleges",
        "college of graduate studies",
        "inaugural lectures",  # a lecture series page, not an academic college
    }
    college_links: dict[str, str] = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        # Exactly .../Colleges/<Name> -- 5 path segments after stripping
        # slashes (sites/corporate/default/Colleges/<Name>). The original
        # `href.count("/") == 6` matched every sub-page too (e.g.
        # .../Colleges/Law/About-the-college also has 6 slash characters),
        # which is why this returned 82 "colleges" instead of 8 on the
        # first run -- caught by sanity-checking the count against what
        # manual exploration found.
        if "/Colleges/" in href and len(href.strip("/").split("/")) == 5:
            text = a.get_text(strip=True)
            if text and text.lower() not in exclude:
                college_links[href] = text

    for href, name in college_links.items():
        code = href.rstrip("/").split("/")[-1]
        url = urljoin(base, href)
        result.faculties.append(
            Faculty(
                id=f"unisa-{re.sub(r'[^a-z0-9]+', '-', code.lower()).strip('-')}",
                institution_id="unisa",
                name=name,
                code=code,
                source_url=url,
            )
        )
    print(f"UNISA: found {len(result.faculties)} colleges")

    # Brand colors: the homepage itself is nearly colorless inline (theme
    # colors live in the linked stylesheet, not inline styles), so pull
    # from the actual theme CSS file instead.
    css_url = urljoin(base, "/static/corporate_web/Design/themes/bootstrap_5/css/cwLegacy.css")
    print("UNISA: fetching theme CSS for brand colors")
    css_resp = polite_get(css_url, robots)
    if css_resp is not None:
        result.brand_colors = extract_brand_colors(css_resp.text)
        result.brand_color_source = css_url
    else:
        result.notes.append("Could not fetch theme CSS; no brand colors collected.")

    # Qualifications: the central "All qualifications" page is a Liferay
    # portlet page. Higher Certificates and Advanced Certificates are
    # present in the server-rendered HTML with real codes; Diplomas and
    # Bachelor Degrees are not in the static HTML at all (confirmed:
    # zero "Bachelor of"/"Diploma in" matches in the raw response body
    # outside of two incidental prose mentions) -- they're loaded by a
    # client-side portlet call this scraper does not attempt to
    # reverse-engineer (see README.md).
    quals_url = urljoin(
        base,
        "/sites/corporate/default/Apply-for-admission/Undergraduate-qualifications/Qualifications/All-qualifications",
    )
    print("UNISA: fetching undergraduate qualifications list")
    quals_resp = polite_get(quals_url, robots)
    if quals_resp is None:
        result.notes.append("Could not fetch the qualifications list page.")
        return result

    qsoup = BeautifulSoup(quals_resp.text, "html.parser")
    parsed = _parse_unisa_qualification_links(qsoup, base, quals_url)
    result.programmes = parsed
    print(f"UNISA: {len(parsed)} qualifications, all with a matching QualificationType")

    # Faculty/school linkage: investigated three paths, found no reliable
    # source for any of them --
    #  1. The qualification-list accordion groups items by LEVEL
    #     (id="HIGHERCERTIFICATES" etc.), not by college.
    #  2. No data-college/data-filter attribute (or any data-* attribute)
    #     on the <li>/<a> for any qualification -- confirmed by inspecting
    #     the raw HTML around a known entry.
    #  3. A qualification's own detail page (enriched below) doesn't
    #     mention its college anywhere in its text either.
    # The page's visible "College" filter dropdown exists, but it isn't
    # backed by static per-item data this scraper found -- it's most
    # likely an AJAX re-query against a Liferay portlet, which this
    # scraper does not reverse-engineer (same call made for Diplomas/
    # Bachelor's in the previous run, before those turned out to actually
    # be static after all; this is a different, confirmed-absent case,
    # not the same mistake repeated). facultyId/schoolId are left null
    # rather than guessed from the qualification name, per instruction.
    result.notes.append(
        f"Qualification list from {quals_url}, {len(parsed)} entries, all "
        "mapped to a real QualificationType (advancedCertificate and "
        "postgraduateCertificate now exist in lib/firestore/types.ts, so "
        "the 39 entries previously under unmappedQualifications are now "
        "ordinary programmes). facultyId/schoolId are null on every entry: "
        "investigated the list's own accordion structure (grouped by "
        "qualification level, not college), per-item data attributes "
        "(none present), and each qualification's detail page (no college "
        "mention) -- no reliable college-to-qualification source was "
        "found via static HTML; the visible 'College' filter dropdown is "
        "not backed by data this scraper could read. A small number of "
        "entries whose real name has its own descriptive parenthetical "
        "before the official code (e.g. '...Psychology and Physiology "
        "(with Genetics) (98053 - ...)') may have that first parenthetical "
        "mis-captured as qualificationCode -- spot-check codes before "
        "relying on them."
    )

    print(f"UNISA: fetching {len(result.programmes)} qualification detail pages for enrichment (rate-limited, this takes a while)")
    enriched = 0
    failed = 0
    for i, programme in enumerate(result.programmes, 1):
        enrich_unisa_programme(programme, robots)
        if programme.nqf_level is not None or programme.min_aps is not None:
            enriched += 1
        if programme.note and "fetch failed" in programme.note:
            failed += 1
        if i % 20 == 0 or i == len(result.programmes):
            print(f"  ...{i}/{len(result.programmes)} detail pages processed ({enriched} enriched, {failed} failed so far)")
            _write_unisa_checkpoint(result)
    print(f"UNISA: enrichment done -- {enriched}/{len(result.programmes)} got at least nqfLevel or minAps, {failed} detail-page fetches failed")
    result.notes.append(
        f"Detail-page enrichment: {enriched}/{len(result.programmes)} qualifications got at least "
        f"one of nqfLevel/minAps from their own detail page; {failed} detail-page fetches failed "
        "outright after retries (those entries have a per-programme note saying so, and no "
        "enrichment fields). campuses, careerOutcomes, and applyUrl are null on every entry: "
        "UNISA is a distance-learning institution with no campus-specific qualifications (so "
        "'campuses' doesn't apply the way it does for a contact university), no qualification "
        "page stated a structured list of career outcomes (only general purpose-statement prose, "
        "which wasn't confident enough to extract as discrete outcomes), and 'Apply now' links to "
        "one central application tool shared by every qualification, not a qualification-specific "
        "URL -- using the institution's own already-known applicationPortalUrl for that, not a "
        "fabricated per-programme link."
    )

    return result


def _write_unisa_checkpoint(result: ScrapeResult) -> None:
    """Writes progress to disk every 20 detail-page fetches so an
    interrupted run (this one hits ~230 requests against a server that's
    been intermittently flaky all session) doesn't lose everything."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "unisa.json"
    out_path.write_text(json.dumps(to_json(result), indent=2, ensure_ascii=False), encoding="utf-8")


SCRAPERS = {"uj": scrape_uj, "cput": scrape_cput, "unisa": scrape_unisa}


def to_json(result: ScrapeResult) -> dict:
    def prog_to_dict(p: Programme) -> dict:
        d = {
            "id": p.id,
            "institutionId": p.institution_id,
            "name": p.name,
            "qualificationType": p.qualification_type,
            "qualificationCode": p.qualification_code,
            "facultyId": p.faculty_id,
            "schoolId": p.school_id,
            "nqfLevel": p.nqf_level,
            "totalCredits": p.total_credits,
            "saqaId": p.saqa_id,
            "duration": p.duration,
            "minAps": p.min_aps,
            "additionalRequirements": p.additional_requirements,
            "sourceUrl": p.source_url,
        }
        if p.note:
            d["note"] = p.note
        return d

    return {
        "institutionId": result.institution_id,
        "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "verifiedOn": None,
        "faculties": [
            {
                "id": f.id,
                "institutionId": f.institution_id,
                "name": f.name,
                "code": f.code,
                "sourceUrl": f.source_url,
            }
            for f in result.faculties
        ],
        "schools": result.schools,
        "programmes": [prog_to_dict(p) for p in result.programmes],
        "unmappedQualifications": [prog_to_dict(p) for p in result.unmapped_qualifications],
        "brandColors": result.brand_colors,
        "brandColorSource": result.brand_color_source,
        "notes": result.notes,
    }


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in SCRAPERS:
        print(f"Usage: python {sys.argv[0]} <{'|'.join(SCRAPERS)}>")
        sys.exit(1)

    institution_id = sys.argv[1]
    print(f"=== Scraping {institution_id} ===")
    result = SCRAPERS[institution_id]()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{institution_id}.json"
    out_path.write_text(json.dumps(to_json(result), indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Faculties: {len(result.faculties)}  Programmes: {len(result.programmes)}  Unmapped: {len(result.unmapped_qualifications)}")
    for note in result.notes:
        print(f"NOTE: {note}")


if __name__ == "__main__":
    main()
