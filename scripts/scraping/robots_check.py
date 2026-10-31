"""Minimal robots.txt compliance check, mirroring the spirit of this
repo's lib/ingestion/robotsCheck.ts (respect Disallow/Allow per the
project's stated principle of honouring robots.txt for any automated
fetch of a third-party site). Uses the standard library's robotparser
rather than reimplementing parsing, since Python already ships a correct
one.

A site with no robots.txt (e.g. unisa.ac.za returns 404 for it) is
treated as "no restriction declared" -- the standard, conventional
interpretation -- not as "treat everything as disallowed."

Found during the NWU/UKZN scrape (2026-10-31): RobotFileParser.read()
makes its own urlopen() call carrying Python's default User-Agent
(Python-urllib/x.y), not ours. Some WAF-protected subdomains (observed:
clms.ukzn.ac.za, coh.ukzn.ac.za) 403 that default UA. Critically,
RobotFileParser.read() does NOT raise on a 401/403 -- per the stdlib's
own documented behavior it silently sets disallow_all = True instead,
so the old try/except around .read() never fired and every URL on that
host silently read as disallowed, with no error or signal anywhere.
Fix: fetch robots.txt ourselves with our own honest UA (the same one
every other request in this scraper sends) and hand the parser the text
directly via parse(), rather than letting it make its own anonymous
request.
"""

from __future__ import annotations

import urllib.error
import urllib.request
import urllib.robotparser
from urllib.parse import urljoin

USER_AGENT = (
    "UCAG-DataCollector/1.0 (South African institution catalogue research; "
    "contact: project maintainer)"
)


class RobotsChecker:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.parser = urllib.robotparser.RobotFileParser()
        robots_url = urljoin(base_url, "/robots.txt")
        self.parser.set_url(robots_url)
        try:
            request = urllib.request.Request(
                robots_url, headers={"User-Agent": USER_AGENT}
            )
            with urllib.request.urlopen(request, timeout=10) as response:
                body = response.read().decode("utf-8", errors="replace")
            self.parser.parse(body.splitlines())
            self._available = True
        except urllib.error.HTTPError as err:
            if err.code in (401, 403):
                # Matches RobotFileParser's own convention for 401/403:
                # treat as "this host disallows everything" rather than
                # "no robots.txt exists" -- but now it's a real result
                # from OUR request, not a silently-swallowed one.
                self.parser.disallow_all = True
                self._available = True
            else:
                # 404 and friends -- "no robots.txt exists", fail open.
                self._available = False
        except Exception:
            # Network error, timeout, etc -- fail open, same convention
            # as "no robots.txt exists."
            self._available = False

    def can_fetch(self, url: str) -> bool:
        if not self._available:
            return True
        return self.parser.can_fetch(USER_AGENT, url)
