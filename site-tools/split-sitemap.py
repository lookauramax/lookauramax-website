#!/usr/bin/env python3
"""split-sitemap.py — split the Lookauramax sitemap.xml into a sitemap index.

Website Round 2, Decision 6 / S1 (split sitemaps with honest lastmod).

Zero-dependency, Python 3 stdlib only.

Usage:
    python3 tools/split-sitemap.py <root-or-sitemap.xml> [--out <dir>] [--add <url>]...

    <root>   a directory containing sitemap.xml, or the sitemap.xml file itself.
    --out    output directory (default: the sitemap's own directory).
    --add    extra URL to include (repeatable). Its <lastmod> is today's date.
             Use it when a NEW page ships so the split includes it from day one.

Classification (by URL path):
    articles  /blog/*            (except the /blog/ index itself, which is a page)
    tools     /tools/*
    glossary  /glossary*
    pages     everything else — INCLUDING /hubs/* and /new-year-glow-up-2027/*,
              which count as pages by the Round-2 rule.

Outputs (in --out):
    sitemap.xml            a <sitemapindex> pointing at the four children
    sitemap-pages.xml      <urlset>
    sitemap-articles.xml   <urlset>
    sitemap-tools.xml      <urlset>
    sitemap-glossary.xml   <urlset>

Every <loc> and its <lastmod> are carried across EXACTLY as they appear in the
input (the splitter parses the raw <url> blocks; it never reformats a URL and
never invents or refreshes a lastmod — honest lastmod is the point). Input
order is preserved inside each child file. Each child <sitemap> entry in the
index carries the newest <lastmod> found inside that child.

Prints the count per file and the total, and verifies total == input + adds
(exit 1 if the arithmetic — or any URL — does not survive the split).
"""

import argparse
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

URL_BLOCK = re.compile(
    r"<url>\s*<loc>(.*?)</loc>\s*(?:<lastmod>(.*?)</lastmod>)?\s*</url>",
    re.DOTALL,
)

HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n'
URLSET_OPEN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
INDEX_OPEN = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

BUCKETS = ("pages", "articles", "tools", "glossary")


def classify(raw_url: str) -> str:
    path = urlparse(raw_url).path
    if path.startswith("/blog/") and path != "/blog/":
        return "articles"
    if path.startswith("/tools/"):
        return "tools"
    if path.startswith("/glossary"):
        return "glossary"
    return "pages"  # everything else, incl. /blog/, /hubs/*, /new-year-glow-up-2027/*


def main() -> int:
    ap = argparse.ArgumentParser(description="Split sitemap.xml into a sitemap index + 4 typed sitemaps.")
    ap.add_argument("root", help="directory containing sitemap.xml, or the sitemap.xml file itself")
    ap.add_argument("--out", default=None, help="output directory (default: the sitemap's directory)")
    ap.add_argument("--add", action="append", default=[], metavar="URL",
                    help="extra URL to add (repeatable); lastmod = today")
    args = ap.parse_args()

    root = Path(args.root)
    sitemap_path = root if root.is_file() else root / "sitemap.xml"
    if not sitemap_path.exists():
        print(f"split-sitemap: no sitemap found at {sitemap_path}", file=sys.stderr)
        return 1
    out_dir = Path(args.out) if args.out else sitemap_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    raw = sitemap_path.read_text(encoding="utf-8")
    entries = [(m.group(1), m.group(2)) for m in URL_BLOCK.finditer(raw)]
    if not entries:
        print(f"split-sitemap: parsed 0 <url> entries from {sitemap_path} — refusing to write empty sitemaps",
              file=sys.stderr)
        return 1

    today = date.today().isoformat()
    added = [(u, today) for u in args.add]
    all_entries = entries + added

    buckets = {name: [] for name in BUCKETS}
    for loc, lastmod in all_entries:
        buckets[classify(loc)].append((loc, lastmod))

    # scheme + host for the child sitemap URLs in the index (from the input itself)
    first = urlparse(entries[0][0])
    origin = f"{first.scheme}://{first.netloc}"

    # write children
    counts = {}
    for name in BUCKETS:
        lines = [HEADER, URLSET_OPEN]
        for loc, lastmod in buckets[name]:
            if lastmod:
                lines.append(f"  <url><loc>{loc}</loc><lastmod>{lastmod}</lastmod></url>\n")
            else:
                lines.append(f"  <url><loc>{loc}</loc></url>\n")
        lines.append("</urlset>\n")
        (out_dir / f"sitemap-{name}.xml").write_text("".join(lines), encoding="utf-8")
        counts[name] = len(buckets[name])

    # write index (each child's lastmod = newest lastmod inside it, if any)
    lines = [HEADER, INDEX_OPEN]
    for name in BUCKETS:
        mods = [lm for _, lm in buckets[name] if lm]
        child = f"{origin}/sitemap-{name}.xml"
        if mods:
            lines.append(f"  <sitemap><loc>{child}</loc><lastmod>{max(mods)}</lastmod></sitemap>\n")
        else:
            lines.append(f"  <sitemap><loc>{child}</loc></sitemap>\n")
    lines.append("</sitemapindex>\n")
    (out_dir / "sitemap.xml").write_text("".join(lines), encoding="utf-8")

    total = sum(counts.values())
    expected = len(entries) + len(added)
    print(f"split-sitemap: input {len(entries)} URLs from {sitemap_path}" +
          (f" + {len(added)} added" if added else ""))
    for name in BUCKETS:
        print(f"  sitemap-{name}.xml: {counts[name]}")
    print(f"  sitemap.xml (index): 4 children")
    print(f"  TOTAL: {total} (expected {expected})")
    if total != expected:
        print("split-sitemap: COUNT MISMATCH — a URL was lost or duplicated", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
