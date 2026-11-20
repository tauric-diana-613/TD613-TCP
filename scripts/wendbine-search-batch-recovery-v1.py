#!/usr/bin/env python3
"""Recover observed capture versions from verified local discovery responses.

This reads no encrypted archive and makes no network requests. Search-window
coverage remains incomplete until the discovery process finishes.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import urllib.parse

BASE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wendbine_discovery", BASE / "wendbine-archive-discover-source-ids-v1.py")
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)
h = d.h


def recover(manifest, workspace, destination):
    pinned = set(h.manifest_ids(manifest))
    h.local(workspace)
    h.local(destination)
    if not workspace.is_dir() or not destination.parent.is_dir():
        raise ValueError("LOCAL_SEARCH_RESPONSES_REQUIRED")
    if destination.exists():
        raise ValueError("CAPTURE_OUTPUT_ALREADY_EXISTS")
    receipts = sorted(workspace.glob("*.receipt.json"))
    if not receipts:
        raise ValueError("NO_COMPLETED_SEARCH_RECEIPTS")
    observations = []
    held = {}
    for path in receipts:
        if path.is_symlink() or not path.is_file():
            raise ValueError("INVALID_SEARCH_RECEIPT")
        receipt = h.json_from(path.read_bytes())
        window = receipt.get("window")
        if not isinstance(window, list) or len(window) != 2 or any(type(v) is not int for v in window) or window[0] >= window[1]:
            raise ValueError("INVALID_SEARCH_WINDOW")
        lo, hi = window
        url = d.SEARCH_URL + "?" + urllib.parse.urlencode({"author": h.AUTHOR, "subreddit": h.COMMUNITY,
            "after": d.stamp(lo - 1), "before": d.stamp(hi), "sort": "asc", "limit": d.LIMIT})
        request_hash = h.sha(url.encode("utf8"))
        if receipt.get("uri") != url or receipt.get("request_sha256") != request_hash or path.name != request_hash + ".receipt.json":
            raise ValueError("SEARCH_RECEIPT_REQUEST_MISMATCH")
        raw_path = workspace / (request_hash + ".json")
        if raw_path.is_symlink() or not raw_path.is_file():
            raise ValueError("SEARCH_RESPONSE_MISSING")
        raw = raw_path.read_bytes()
        if len(raw) > h.MAX_BYTES or h.sha(raw) != receipt.get("response_sha256"):
            raise ValueError("SEARCH_RESPONSE_HASH_MISMATCH")
        rows = d.search_response(raw)
        if len(rows) != receipt.get("returned_count") or len(rows) > d.LIMIT:
            raise ValueError("SEARCH_RESPONSE_COUNT_MISMATCH")
        observed = receipt.get("observed_utc")
        if not isinstance(observed, str):
            raise ValueError("SEARCH_OBSERVATION_TIME_REQUIRED")
        valid_ids, errors = d.observed_ids(rows, lo, hi)
        for error in errors:
            reason = error["reason"]
            held[reason] = held.get(reason, 0) + 1
        for ordinal, row in enumerate(rows):
            sid = "reddit:t3_" + row["id"].removeprefix("t3_")
            if sid not in valid_ids or not lo <= row["created_utc"] < hi:
                continue
            capture, reason = h.post_to_capture(sid, row, observed, url, ordinal)
            if capture is None:
                held[reason] = held.get(reason, 0) + 1
                continue
            capture["source_system"] = "ARCTIC_SHIFT_PUBLIC_POSTS_SEARCH_ARCHIVE"
            capture["source_archive_capture_note"] = "SEARCH_RESPONSE_OBSERVED_AT_REQUEST_TIME_NOT_AUTHOR_SIGNED"
            capture["source_archive_response_sha256"] = h.sha(raw)
            capture["source_archive_response_ordinal"] = ordinal
            capture["source_archive_id_class"] = "PINNED_MANIFEST" if sid in pinned else "DISCOVERED_SEARCH"
            observations.append(capture)
    # Overlapping discovery windows can return the same observation. Retain
    # earliest evidence for each distinct source/title/body/version combination.
    unique = {}
    for row in sorted(observations, key=lambda x: (x["captured_at_utc"], x["capture_id"])):
        key = (row["source_id"], row["published_at_utc"], row["title_sha256"], row["body_sha256"])
        unique.setdefault(key, row)
    rows = list(unique.values())
    if not rows:
        raise ValueError("NO_ELIGIBLE_SEARCH_CAPTURES")
    ids = [row["capture_id"] for row in rows]
    if len(ids) != len(set(ids)):
        raise ValueError("DUPLICATE_CAPTURE_ID")
    raw_output = b"\n".join(h.encoded(row) for row in rows) + b"\n"
    h.atomic_bytes(destination, raw_output)
    source_ids = {row["source_id"] for row in rows}
    return {"status": "OBSERVED_PARTIAL_SEARCH_CAPTURE_SET", "completed_responses": len(receipts),
        "capture_versions": len(rows), "unique_sources": len(source_ids),
        "pinned_sources_observed": len(source_ids & pinned), "discovered_sources_observed": len(source_ids - pinned),
        "full_body_versions": sum(bool(row["selftext"]) for row in rows),
        "title_only_versions": sum(not row["selftext"] for row in rows),
        "held_by_reason": held, "capture_manifest_sha256": hashlib.sha256(raw_output).hexdigest(),
        "complete_discovery_claim": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public-manifest", type=Path, required=True)
    parser.add_argument("--search-responses", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(recover(args.public_manifest, args.search_responses, args.output)))


if __name__ == "__main__":
    main()
