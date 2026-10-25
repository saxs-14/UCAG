"""Minimal robots.txt compliance check, mirroring the spirit of this
repo's lib/ingestion/robotsCheck.ts (respect Disallow/Allow per the
project's stated principle of honouring robots.txt for any automated
fetch of a third-party site). Uses the standard library's robotparser
rather than reimplementing parsing, since Python already ships a correct
one.

A site with no robots.txt (e.g. unisa.ac.za returns 404 for it) is
treated as "no restriction declared" -- the standard, conventional
interpretation -- not as "treat everything as disallowed."
"""

from __future__ import annotations

import urllib.robotparser
from urllib.parse import urljoin

USER_AGENT = "UCAG-DataCollector"


class RobotsChecker:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.parser = urllib.robotparser.RobotFileParser()
        robots_url = urljoin(base_url, "/robots.txt")
        self.parser.set_url(robots_url)
        try:
            self.parser.read()
            self._available = True
        except Exception:
            # Unreadable robots.txt (network error, non-200 that
            # robotparser's own urlopen call raised on) -- fail open,
            # same convention as "no robots.txt exists."
            self._available = False

    def can_fetch(self, url: str) -> bool:
        if not self._available:
            return True
        return self.parser.can_fetch(USER_AGENT, url)
