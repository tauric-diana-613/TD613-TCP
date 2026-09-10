#!/usr/bin/env python3
"""Discover public SignalRupture Zenodo records missing from the sealed SRC archive.

Networked maintenance helper. Dry-run/stdout by default. It never writes into the sealed
Phase-2 snapshot and never promotes title similarity into work identity.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ORCID = "0009-0009-9348-3534"
CREATOR_NAME = "Rupture, Signal"
ZENODO_API = "https://zenodo.org/api/records"
DEFAULT_START = "2026-08-01T00:00:00Z"


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def normalized_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def creator_matches(record: dict) -> bool:
    creators = record.get("metadata", {}).get("creators", [])
    for creator in creators:
        if creator.get("orcid") == ORCID:
            return True
        if creator.get("name", "").strip().lower() == CREATOR_NAME.lower():
            return True
    return False


def query_candidates(size: int = 200) -> list[dict]:
    # Zenodo/Invenio query syntax has changed historically, so try bounded fallbacks.
    queries = [
        f'creators.orcid:"{ORCID}"',
        f'creators.name:"{CREATOR_NAME}"',
        f'"{CREATOR_NAME}"',
    ]
    seen: dict[int, dict] = {}
    errors: list[str] = []
    for query in queries:
        params = urllib.parse.urlencode({"q": query, "sort": "newest", "size": size})
        url = f"{ZENODO_API}?{params}"
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                payload = json.load(response)
        except Exception as exc:  # network/runtime environment may block live access
            errors.append(f"{query}: {exc}")
            continue
        for hit in payload.get("hits", {}).get("hits", []):
            if creator_matches(hit):
                seen[int(hit["id"])] = hit
    if not seen and errors:
        raise RuntimeError("all Zenodo discovery queries failed: " + " | ".join(errors))
    return list(seen.values())


def local_record_ids(root: pathlib.Path) -> set[int]:
    result: set[int] = set()
    zenodo_dir = root / "03-DERIVATIVES" / "text" / "zenodo"
    if not zenodo_dir.exists():
        return result
    for path in zenodo_dir.glob("zenodo-*-metadata.md"):
        match = re.match(r"zenodo-(\d+)-metadata\.md$", path.name)
        if match:
            result.add(int(match.group(1)))
    return result


def local_titles(root: pathlib.Path) -> set[str]:
    result: set[str] = set()
    zenodo_dir = root / "03-DERIVATIVES" / "text" / "zenodo"
    if not zenodo_dir.exists():
        return result
    for path in zenodo_dir.glob("zenodo-*-metadata.md"):
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        match = re.search(r'^source_title:\s*"?(.*?)"?\s*$', text, re.MULTILINE)
        if match:
            result.add(normalized_title(match.group(1)))
    return result


def classify(record: dict, ids: set[int], titles: set[str]) -> str:
    rid = int(record["id"])
    title = record.get("metadata", {}).get("title", "")
    if rid in ids:
        return "ALREADY_CAPTURED"
    if normalized_title(title) in titles:
        return "NEW_VERSION_OR_PROTOCOL_OR_DUPLICATE_TITLE_REVIEW_REQUIRED"
    return "NEW_PUBLIC_RECORD_CANDIDATE_IDENTITY_ADJUDICATION_REQUIRED"


def compact(record: dict, classification: str) -> dict:
    metadata = record.get("metadata", {})
    return {
        "schema_version": "src-post-seal-zenodo-discovery/v1",
        "record_id": str(record.get("id")),
        "doi": metadata.get("doi") or record.get("doi"),
        "title": metadata.get("title"),
        "created": record.get("created"),
        "modified": record.get("modified"),
        "publication_date": metadata.get("publication_date"),
        "resource_type": metadata.get("resource_type"),
        "creators": metadata.get("creators", []),
        "files": [
            {
                "key": f.get("key"),
                "size": f.get("size"),
                "checksum": f.get("checksum"),
                "self": f.get("links", {}).get("self"),
            }
            for f in record.get("files", [])
        ],
        "source_url": f"https://zenodo.org/records/{record.get('id')}",
        "classification": classification,
        "automatic_work_identity_promotion": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src-root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument("--start", default=DEFAULT_START)
    parser.add_argument("--end", default=None)
    parser.add_argument("--include-captured", action="store_true")
    args = parser.parse_args()

    start = parse_dt(args.start)
    end = parse_dt(args.end) if args.end else datetime.now(timezone.utc)
    ids = local_record_ids(args.src_root)
    titles = local_titles(args.src_root)

    records = []
    for record in query_candidates():
        created = parse_dt(record["created"])
        if not (start <= created <= end):
            continue
        classification = classify(record, ids, titles)
        if classification == "ALREADY_CAPTURED" and not args.include_captured:
            continue
        records.append(compact(record, classification))

    records.sort(key=lambda r: r.get("created") or "")
    for record in records:
        print(json.dumps(record, sort_keys=True, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"post-seal Zenodo discovery failed: {exc}", file=sys.stderr)
        raise
