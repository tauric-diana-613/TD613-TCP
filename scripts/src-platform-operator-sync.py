#!/usr/bin/env python3
"""Operator-gated live platform delta census for the SignalRupture Atelier.

This companion to src-zenodo-operator-sync.py covers platform discovery surfaces
whose rights/acquisition behavior differs from Zenodo. It writes only live,
post-seal manifests/receipts. It never republishes Medium/Substack/Academia
bodies into the public fixture and never claims completeness for an adapter that
cannot prove exhaustion.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

SCHEMA = "src-platform-operator-sync/v1"
USER_AGENT = "SRC-Platform-Operator-Sync/1.0 (+research preservation; no access-control bypass)"
DEFAULT_SUBSTACK_FEED = "https://signalrupture.substack.com/feed"
DEFAULT_MEDIUM_FEED = "https://medium.com/feed/@SignalRupture26"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def compact_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def iter_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    if not path.exists():
        return
    with path.open("r", encoding="utf-8-sig") as fh:
        for line_no, line in enumerate(fh, 1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except Exception as exc:
                raise RuntimeError(f"invalid JSONL {path}:{line_no}: {exc}") from exc
            if isinstance(row, dict):
                yield row


def append_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    rows = list(rows)
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        for row in rows:
            fh.write(compact_json(row) + "\n")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch(url: str, *, accept: str = "*/*", timeout: int = 45) -> tuple[int, bytes, str, list[str]]:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": accept, "Cache-Control": "no-cache"},
    )
    redirects: list[str] = []
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            final_url = response.geturl()
            if final_url != url:
                redirects.append(final_url)
            return int(response.status), response.read(), final_url, redirects
    except urllib.error.HTTPError as exc:
        body = exc.read() if getattr(exc, "fp", None) else b""
        return int(exc.code), body, getattr(exc, "url", url), redirects
    except urllib.error.URLError as exc:
        raise RuntimeError(f"network error for {url}: {exc}") from exc


def text(node: ET.Element | None, path: str) -> str:
    if node is None:
        return ""
    found = node.find(path)
    return (found.text or "").strip() if found is not None and found.text else ""


def parse_rss(payload: bytes) -> list[dict[str, str]]:
    root = ET.fromstring(payload)
    items: list[dict[str, str]] = []
    for item in root.findall(".//item"):
        title = text(item, "title")
        link = text(item, "link")
        guid = text(item, "guid")
        pub = text(item, "pubDate")
        if link:
            items.append({"title": title, "url": link, "guid": guid, "published_at": pub})
    return items


def known_urls(root: Path, platform: str) -> set[str]:
    urls: set[str] = set()
    for path in (
        root / "01-MANIFESTS" / "platforms" / f"{platform}.jsonl",
        root / "01-MANIFESTS" / "live" / "platforms" / f"{platform}.jsonl",
    ):
        for row in iter_jsonl(path):
            url = str(row.get("url") or row.get("source_url") or "").strip()
            if url:
                urls.add(url.rstrip("/"))
    return urls


def medium_id(url: str) -> str | None:
    match = re.search(r"-([0-9a-f]{12})(?:[/?#]|$)", url)
    return match.group(1) if match else None


def substack_id_from_html(data: bytes) -> str | None:
    text_value = data.decode("utf-8", errors="replace")
    patterns = (
        r'"post_id"\s*:\s*"?(\d+)"?',
        r'"postId"\s*:\s*"?(\d+)"?',
        r'"id"\s*:\s*"?(\d+)"?\s*,\s*"publication_id"',
    )
    for pattern in patterns:
        match = re.search(pattern, text_value)
        if match:
            return match.group(1)
    return None


def discovery_row(
    *,
    platform: str,
    item: dict[str, str],
    platform_item_id: str,
    observed_at: str,
    page_status: int | None,
    page_sha256: str | None,
    page_bytes: int | None,
    page_final_url: str | None,
    acquisition_state: str,
) -> dict[str, Any]:
    return {
        "schema": "src-live-platform-manifest/v1",
        "platform": platform,
        "platform_item_id": platform_item_id,
        "title": item.get("title") or "",
        "url": item["url"],
        "published_at": item.get("published_at") or None,
        "guid": item.get("guid") or None,
        "observed_at": observed_at,
        "rights_state": "PRIVATE_ONLY",
        "rights_basis": "public availability is not redistribution permission",
        "page_http_status": page_status,
        "page_sha256": page_sha256,
        "page_byte_length": page_bytes,
        "page_final_url": page_final_url,
        "acquisition_state": acquisition_state,
        "body_publicly_redistributed": False,
        "authority": "LIVE_POST_SEAL_PLATFORM_POINTER",
    }


def sync_feed_platform(root: Path, platform: str, feed_url: str) -> dict[str, Any]:
    observed_at = utc_now()
    status, payload, final_url, _ = fetch(feed_url, accept="application/rss+xml,application/xml,text/xml,*/*")
    if status != 200:
        return {
            "platform": platform,
            "discovery": "RSS",
            "feed_url": feed_url,
            "feed_final_url": final_url,
            "feed_http_status": status,
            "complete_delta_claim": False,
            "new_count": 0,
            "new_ids": [],
            "state": "DISCOVERY_FAILED",
        }

    items = parse_rss(payload)
    existing = known_urls(root, platform)
    new_rows: list[dict[str, Any]] = []
    new_ids: list[str] = []
    unresolved_ids: list[str] = []

    for item in reversed(items):
        url = item["url"].rstrip("/")
        if url in existing:
            continue

        page_status: int | None = None
        page_sha: str | None = None
        page_bytes: int | None = None
        page_final: str | None = None
        acquisition_state = "POINTER_ONLY"
        platform_id: str | None = None

        if platform == "medium":
            platform_id = medium_id(url)
            page_status, page, page_final, _ = fetch(url, accept="text/html,*/*")
            if page:
                page_sha, page_bytes = sha256(page), len(page)
            acquisition_state = "VERIFIED_REACHABLE" if page_status == 200 else (
                "AUTH_REQUIRED" if page_status in (401, 403) else f"HTTP_{page_status}"
            )
        elif platform == "substack":
            page_status, page, page_final, _ = fetch(url, accept="text/html,*/*")
            if page:
                page_sha, page_bytes = sha256(page), len(page)
            if page_status == 200:
                platform_id = substack_id_from_html(page)
                acquisition_state = "VERIFIED_REACHABLE"
            else:
                acquisition_state = "AUTH_REQUIRED" if page_status in (401, 403) else f"HTTP_{page_status}"

        if not platform_id:
            platform_id = f"urlsha256:{sha256(url.encode('utf-8'))[:24]}"
            unresolved_ids.append(platform_id)

        row = discovery_row(
            platform=platform,
            item=item,
            platform_item_id=platform_id,
            observed_at=observed_at,
            page_status=page_status,
            page_sha256=page_sha,
            page_bytes=page_bytes,
            page_final_url=page_final,
            acquisition_state=acquisition_state,
        )
        new_rows.append(row)
        new_ids.append(platform_id)
        existing.add(url)

    manifest = root / "01-MANIFESTS" / "live" / "platforms" / f"{platform}.jsonl"
    append_jsonl(manifest, new_rows)

    return {
        "platform": platform,
        "discovery": "RSS",
        "feed_url": feed_url,
        "feed_final_url": final_url,
        "feed_http_status": status,
        "feed_item_count": len(items),
        "new_count": len(new_rows),
        "new_ids": new_ids,
        "native_id_unresolved": unresolved_ids,
        "complete_delta_claim": True,
        "historical_recensus_complete": False,
        "state": "SYNCED_BOUNDED_FEED_WINDOW",
    }


def academia_adapter(root: Path) -> dict[str, Any]:
    known = sum(1 for _ in iter_jsonl(root / "01-MANIFESTS" / "platforms" / "academia.jsonl"))
    return {
        "platform": "academia",
        "discovery": "NO_RETAINED_STABLE_INCREMENTAL_ENDPOINT",
        "known_snapshot_count": known,
        "new_count": 0,
        "new_ids": [],
        "complete_delta_claim": False,
        "historical_recensus_complete": False,
        "state": "HOLD_DISCOVERY_ROUTE_REQUIRED",
        "note": "Adapter is represented in the gate receipt but cannot claim a live delta until a reproducible public profile endpoint is retained.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--gate-issue", required=True)
    parser.add_argument("--relay-identity", required=True)
    parser.add_argument("--atelier-branch", required=True)
    parser.add_argument("--summary-path", type=Path, required=True)
    parser.add_argument("--substack-feed", default=DEFAULT_SUBSTACK_FEED)
    parser.add_argument("--medium-feed", default=DEFAULT_MEDIUM_FEED)
    args = parser.parse_args()

    root = args.root.resolve()
    if not (root / "CONNECTOR_ENTRY.md").exists():
        raise RuntimeError(f"SRC root does not look valid: {root}")

    platforms = [
        sync_feed_platform(root, "substack", args.substack_feed),
        sync_feed_platform(root, "medium", args.medium_feed),
        academia_adapter(root),
    ]
    summary = {
        "schema": SCHEMA,
        "run_id": str(args.run_id),
        "gate_issue": str(args.gate_issue),
        "relay_identity": args.relay_identity,
        "atelier_branch": args.atelier_branch,
        "generated_at": utc_now(),
        "authority": "LIVE_POST_SEAL_PLATFORM_DELTA_ONLY",
        "platforms": platforms,
        "all_platform_delta_claims_complete": all(bool(p.get("complete_delta_claim")) for p in platforms),
        "sealed_phase2_mutation": False,
        "A15_R0_scientific_mutation": False,
        "merge": False,
        "publication": False,
        "production": False,
    }
    receipt = root / "04-RECEIPTS" / "live" / "platform-sync-runs" / f"{args.run_id}.json"
    write_json(receipt, summary)
    write_json(args.summary_path, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
