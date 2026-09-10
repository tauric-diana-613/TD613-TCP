#!/usr/bin/env python3
"""Reconcile the user-supplied Aug. 24/25 SignalRupture Zenodo burst.

This is a post-seal maintenance/assay tool. It does not mutate the sealed SRC kiln,
does not infer work identity from title similarity, and does not treat publication
timing as evidence of a private access channel.

Default mode is stdout only. `--write-dir` may be used to write post-seal receipts
outside the sealed snapshot directories.
"""
from __future__ import annotations

import argparse
import collections
import json
import pathlib
import statistics
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

ORCID = "0009-0009-9348-3534"
CREATOR_NAME = "Rupture, Signal"
API = "https://zenodo.org/api/records"
NY = ZoneInfo("America/New_York")
DEFAULT_SEED = pathlib.Path(__file__).resolve().parents[1] / "04-RECEIPTS" / "live" / "2026-08-24-25-user-supplied-zenodo-burst.jsonl"


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def get_json(url: str, delay: float = 0.0) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "TD613-SRC-post-seal-burst-reconciliation/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        payload = json.load(response)
    if delay:
        time.sleep(delay)
    return payload


def creator_matches(record: dict) -> bool:
    creators = record.get("metadata", {}).get("creators", [])
    return any(
        c.get("orcid") == ORCID or c.get("name", "").strip().lower() == CREATOR_NAME.lower()
        for c in creators
    )


def load_seed(path: pathlib.Path) -> list[dict]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    rows.sort(key=lambda r: int(r["seed_order"]))
    return rows


def fetch_seed_records(seed: list[dict], delay: float) -> tuple[list[dict], list[dict]]:
    records = []
    failures = []
    for row in seed:
        rid = str(row["record_id"])
        try:
            record = get_json(f"{API}/{rid}", delay)
            if not creator_matches(record):
                failures.append({"record_id": rid, "error": "creator_mismatch"})
                continue
            records.append(record)
        except Exception as exc:
            failures.append({"record_id": rid, "error": repr(exc)})
    return records, failures


def fetch_author_inventory(delay: float, page_size: int = 25) -> list[dict]:
    """Fetch the full creator inventory with pagination and bounded query fallbacks."""
    queries = [f'creators.orcid:"{ORCID}"', f'creators.name:"{CREATOR_NAME}"']
    seen: dict[int, dict] = {}
    errors = []
    for query in queries:
        page = 1
        query_seen = 0
        while True:
            params = urllib.parse.urlencode(
                {"q": query, "sort": "newest", "size": page_size, "page": page}
            )
            try:
                payload = get_json(f"{API}?{params}", delay)
            except Exception as exc:
                errors.append({"query": query, "page": page, "error": repr(exc)})
                break
            hits = payload.get("hits", {}).get("hits", [])
            if not hits:
                break
            for record in hits:
                if creator_matches(record):
                    seen[int(record["id"])] = record
                    query_seen += 1
            if payload.get("links", {}).get("next") is None:
                break
            page += 1
        if query_seen:
            # ORCID is preferred. Once a query produces an inventory, the second
            # query is unnecessary unless the caller later compares aliases.
            break
    if not seen:
        raise RuntimeError(f"No creator inventory returned. errors={errors!r}")
    return list(seen.values())


def local_metadata_ids(src_root: pathlib.Path) -> set[int]:
    directory = src_root / "03-DERIVATIVES" / "text" / "zenodo"
    ids = set()
    if not directory.exists():
        return ids
    for path in directory.glob("zenodo-*-metadata.md"):
        parts = path.stem.split("-")
        if len(parts) >= 3 and parts[1].isdigit():
            ids.add(int(parts[1]))
    return ids


def compact_record(record: dict, seed_order: int | None = None) -> dict:
    metadata = record.get("metadata", {})
    created = parse_dt(record.get("created"))
    modified = parse_dt(record.get("modified") or record.get("updated"))
    return {
        "schema_version": "src-live-zenodo-reconciled/v1",
        "seed_order": seed_order,
        "record_id": str(record.get("id")),
        "concept_record_id": str(record.get("conceptrecid")) if record.get("conceptrecid") is not None else None,
        "title": metadata.get("title"),
        "doi": metadata.get("doi") or record.get("doi"),
        "created_utc": created.isoformat() if created else None,
        "created_america_new_york": created.astimezone(NY).isoformat() if created else None,
        "modified_utc": modified.isoformat() if modified else None,
        "publication_date": metadata.get("publication_date"),
        "resource_type": metadata.get("resource_type"),
        "license": (metadata.get("license") or {}).get("id") if isinstance(metadata.get("license"), dict) else metadata.get("license"),
        "access_right": metadata.get("access_right"),
        "files": [
            {
                "key": f.get("key"),
                "bytes": f.get("size"),
                "checksum": f.get("checksum"),
                "download_url": f.get("links", {}).get("self"),
            }
            for f in record.get("files", [])
        ],
        "stats": record.get("stats", {}),
        "source_url": f"https://zenodo.org/records/{record.get('id')}",
        "automatic_work_identity_promotion": False,
    }


def daily_counts(records: list[dict], tz: timezone | ZoneInfo) -> collections.Counter[str]:
    out: collections.Counter[str] = collections.Counter()
    for record in records:
        created = parse_dt(record.get("created"))
        if created:
            out[created.astimezone(tz).date().isoformat()] += 1
    return out


def top_days(counter: collections.Counter[str], n: int = 20) -> list[dict]:
    return [{"date": day, "count": count} for day, count in counter.most_common(n)]


def interarrival(seed_records: list[dict]) -> list[dict]:
    ordered = sorted(
        (r for r in seed_records if parse_dt(r.get("created"))),
        key=lambda r: parse_dt(r["created"]),
    )
    rows = []
    prior = None
    for record in ordered:
        current = parse_dt(record["created"])
        gap = (current - prior).total_seconds() if prior is not None else None
        rows.append(
            {
                "record_id": str(record["id"]),
                "title": record.get("metadata", {}).get("title"),
                "created_utc": current.isoformat(),
                "created_america_new_york": current.astimezone(NY).isoformat(),
                "seconds_since_previous_seed_record": gap,
            }
        )
        prior = current
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=pathlib.Path, default=DEFAULT_SEED)
    parser.add_argument("--src-root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument("--delay-ms", type=int, default=550)
    parser.add_argument("--write-dir", type=pathlib.Path, default=None)
    args = parser.parse_args()

    delay = max(args.delay_ms, 0) / 1000.0
    seed = load_seed(args.seed)
    seed_by_id = {int(r["record_id"]): r for r in seed}

    fetched_seed, seed_failures = fetch_seed_records(seed, delay)
    inventory = fetch_author_inventory(delay)
    inventory_by_id = {int(r["id"]): r for r in inventory}
    local_ids = local_metadata_ids(args.src_root)

    reconciled = []
    for row in seed:
        rid = int(row["record_id"])
        record = inventory_by_id.get(rid) or next((r for r in fetched_seed if int(r["id"]) == rid), None)
        if record is None:
            reconciled.append(
                {
                    "schema_version": "src-live-zenodo-reconciled/v1",
                    "seed_order": row["seed_order"],
                    "record_id": row["record_id"],
                    "title_user_supplied": row["title"],
                    "status": "DIRECT_FETCH_FAILED_OR_NOT_IN_CREATOR_INVENTORY",
                    "automatic_work_identity_promotion": False,
                }
            )
            continue
        compact = compact_record(record, int(row["seed_order"]))
        compact["title_user_supplied"] = row["title"]
        compact["title_matches_user_supplied_exactly"] = compact["title"] == row["title"]
        compact["already_in_sealed_or_main_metadata"] = rid in local_ids
        compact["status"] = "SOURCE_RECONCILED"
        reconciled.append(compact)

    august = []
    for record in inventory:
        created = parse_dt(record.get("created"))
        if created and created.year == 2026 and created.month == 8:
            compact = compact_record(record)
            rid = int(record["id"])
            compact["in_user_seed"] = rid in seed_by_id
            compact["already_in_sealed_or_main_metadata"] = rid in local_ids
            august.append(compact)
    august.sort(key=lambda r: r.get("created_utc") or "")

    seed_ids = set(seed_by_id)
    additional_august = [
        r for r in august
        if int(r["record_id"]) not in seed_ids and not r["already_in_sealed_or_main_metadata"]
    ]

    utc_counts = daily_counts(inventory, timezone.utc)
    ny_counts = daily_counts(inventory, NY)
    target_utc_day = "2026-08-24"
    target_ny_days = ["2026-08-23", "2026-08-24", "2026-08-25"]

    file_sizes = [
        f.get("bytes")
        for r in reconciled
        if r.get("status") == "SOURCE_RECONCILED"
        for f in r.get("files", [])
        if isinstance(f.get("bytes"), int)
    ]

    summary = {
        "schema_version": "src-august-burst-analysis/v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "seed_count": len(seed),
        "seed_source_reconciled": sum(r.get("status") == "SOURCE_RECONCILED" for r in reconciled),
        "seed_fetch_failures": seed_failures,
        "creator_inventory_count": len(inventory),
        "august_2026_inventory_count": len(august),
        "additional_august_missing_from_seed_and_local_metadata_count": len(additional_august),
        "target_utc_day_count": utc_counts.get(target_utc_day, 0),
        "target_utc_day_rank": 1 + sum(v > utc_counts.get(target_utc_day, 0) for v in utc_counts.values()),
        "top_utc_created_days": top_days(utc_counts),
        "target_new_york_created_day_counts": {d: ny_counts.get(d, 0) for d in target_ny_days},
        "top_new_york_created_days": top_days(ny_counts),
        "seed_file_count": len(file_sizes),
        "seed_total_bytes": sum(file_sizes),
        "seed_median_file_bytes": statistics.median(file_sizes) if file_sizes else None,
        "seed_max_file_bytes": max(file_sizes) if file_sizes else None,
        "interarrival": interarrival(fetched_seed),
        "claim_ceiling": [
            "publication-density anomaly may be measured after full reconciliation",
            "title-sequence correspondence does not establish publication trigger",
            "traffic observation does not identify downloader",
            "release trigger does not establish private-workspace access",
            "record creation order does not establish drafting order",
        ],
    }

    output = {
        "summary": summary,
        "reconciled_seed": reconciled,
        "additional_august_records": additional_august,
    }
    print(json.dumps(output, indent=2, ensure_ascii=False, sort_keys=True))

    if args.write_dir:
        args.write_dir.mkdir(parents=True, exist_ok=True)
        (args.write_dir / "summary.json").write_text(
            json.dumps(summary, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        with (args.write_dir / "reconciled-seed.jsonl").open("w", encoding="utf-8") as handle:
            for row in reconciled:
                handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
        with (args.write_dir / "additional-august-records.jsonl").open("w", encoding="utf-8") as handle:
            for row in additional_august:
                handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"August Zenodo burst analysis failed: {exc}", file=sys.stderr)
        raise
