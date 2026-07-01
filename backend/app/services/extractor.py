from __future__ import annotations

import io

from bs4 import BeautifulSoup

_STRIP_TAGS = ["script", "style", "noscript", "nav", "footer", "header", "form", "svg"]


def extract_html(html: str) -> tuple[str, str]:
    """Return (title, main_text) from an HTML document."""
    soup = BeautifulSoup(html, "lxml")
    title = (soup.title.string.strip() if soup.title and soup.title.string else "") or ""

    for tag in soup(_STRIP_TAGS):
        tag.decompose()

    main = soup.find("main") or soup.find("article") or soup.body or soup
    text = main.get_text(separator="\n")
    lines = [ln.strip() for ln in text.splitlines()]
    cleaned = "\n".join(ln for ln in lines if ln)
    return title, cleaned


def extract_links(html: str, base_url: str) -> list[str]:
    from urllib.parse import urljoin, urldefrag

    soup = BeautifulSoup(html, "lxml")
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = urldefrag(urljoin(base_url, href))[0]
        links.append(absolute)
    return links


def extract_pdf(data: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    pages = []
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n\n".join(pages)


def extract_file(filename: str, data: bytes) -> tuple[str, str]:
    """Return (title, text) for an uploaded file."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return filename, extract_pdf(data)
    if lower.endswith((".html", ".htm")):
        return extract_html(data.decode("utf-8", errors="ignore"))
    # txt, md, csv, json, and anything else -> treat as plain text
    return filename, data.decode("utf-8", errors="ignore")
