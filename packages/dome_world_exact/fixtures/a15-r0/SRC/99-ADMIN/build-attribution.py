#!/usr/bin/env python3
"""Generate deterministic per-record attribution for redistribution-permitted Zenodo material."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    source = root / "01-MANIFESTS/candidate-corpus.jsonl"
    records = []
    for line in source.read_text(encoding="utf-8-sig").splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        if item.get("access_right") != "open" or str(item.get("license", "")).lower() != "cc-by-4.0":
            continue
        records.append({
            "schema_version": "attribution-record/v1",
            "manifestation_id": f"zenodo:{item['source_record_id']}",
            "title": item.get("title"),
            "creators": item.get("creators", []),
            "publication_date": item.get("publication_date"),
            "version": item.get("version"),
            "doi": item.get("doi"),
            "record_url": item.get("record_url"),
            "license": "CC-BY-4.0",
            "license_url": "https://creativecommons.org/licenses/by/4.0/",
            "rights_decision": "PUBLIC_ALLOWED",
            "archive_notice": "Preserved and redistributed as an independent research fixture; no TD613 authorship, derivation, affiliation, or endorsement is claimed.",
        })
    records.sort(key=lambda row: (row.get("publication_date") or "", row["manifestation_id"]))
    output = root / "01-MANIFESTS/phase2/attribution-v1.jsonl"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in records), encoding="utf-8")
    lines = [
        "# Attribution for redistribution-permitted material",
        "",
        "These entries describe works authored by their stated creators. TD613 and the archive operator claim no authorship, derivation, affiliation, endorsement, or scientific authority over them. Per-capture rights decisions remain controlling for export.",
        "",
    ]
    for row in records:
        creators = ", ".join(row["creators"]) or "Creator as stated by source record"
        lines.append(f"- {creators}. *{row['title']}* ({row['publication_date'] or 'date unstated'}). {row['doi']}. CC BY 4.0.")
    (root / "ATTRIBUTION.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"attribution_records": len(records)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
