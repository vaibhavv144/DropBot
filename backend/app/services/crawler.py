from __future__ import annotations

from collections import deque
from urllib.parse import urlparse

import httpx

from ..config import settings
from .extractor import extract_html, extract_links

# A browser-like User-Agent; many sites reject unknown/bot agents with 403.
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36 ChatbotRAG/1.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


class CrawlError(Exception):
    """Raised when the starting URL cannot be fetched/parsed at all."""


class CrawledPage:
    def __init__(self, url: str, title: str, text: str) -> None:
        self.url = url
        self.title = title
        self.text = text


def _same_domain(a: str, b: str) -> bool:
    return urlparse(a).netloc == urlparse(b).netloc


def _fetch(client: httpx.Client, url: str) -> tuple[str, str] | None:
    """Fetch a URL and return (final_url, html), or None if not usable HTML.

    Raises httpx exceptions to the caller so the start URL can report a reason.
    """
    resp = client.get(url)
    resp.raise_for_status()
    ctype = resp.headers.get("content-type", "").lower()
    if "html" not in ctype and "xml" not in ctype and ctype != "":
        raise CrawlError(
            f"The URL returned '{ctype or 'unknown'}' content, not a web page."
        )
    return str(resp.url), resp.text


def crawl(start_url: str, max_pages: int | None = None) -> list[CrawledPage]:
    """Breadth-first crawl starting from a URL, returning extracted pages.

    Raises CrawlError with a human-readable reason if the starting page itself
    cannot be fetched or contains no readable text. Secondary link failures are
    skipped silently.
    """
    limit = max_pages or settings.max_crawl_pages
    seen: set[str] = set()
    queue: deque[str] = deque([start_url])
    pages: list[CrawledPage] = []
    first = True

    with httpx.Client(headers=_HEADERS, timeout=25.0, follow_redirects=True) as client:
        while queue and len(pages) < limit:
            url = queue.popleft()
            if url in seen:
                continue
            seen.add(url)

            try:
                fetched = _fetch(client, url)
            except CrawlError:
                if first:
                    raise
                first = False
                continue
            except httpx.HTTPStatusError as exc:
                if first:
                    code = exc.response.status_code
                    hint = " The site may be blocking automated requests." if code in (403, 429) else ""
                    raise CrawlError(f"Site returned HTTP {code} for {url}.{hint}") from exc
                first = False
                continue
            except httpx.ConnectError as exc:
                if first:
                    raise CrawlError(
                        f"Could not connect to {url}. Check the URL is correct and "
                        f"publicly reachable. ({exc})"
                    ) from exc
                first = False
                continue
            except httpx.HTTPError as exc:
                if first:
                    raise CrawlError(f"Failed to fetch {url}: {exc}") from exc
                first = False
                continue

            if fetched is None:
                first = False
                continue

            final_url, html = fetched
            title, text = extract_html(html)
            if text.strip():
                pages.append(CrawledPage(final_url, title, text))
            elif first:
                raise CrawlError(
                    "The page loaded but no readable text was found. The site may render "
                    "its content with JavaScript, which this crawler cannot execute. Try "
                    "uploading the content as a file instead."
                )

            first = False

            for link in extract_links(html, final_url):
                if link in seen:
                    continue
                if settings.crawl_same_domain_only and not _same_domain(link, start_url):
                    continue
                if link.lower().endswith(
                    (".jpg", ".jpeg", ".png", ".gif", ".svg", ".css", ".js", ".zip", ".mp4", ".pdf")
                ):
                    continue
                queue.append(link)

    return pages
