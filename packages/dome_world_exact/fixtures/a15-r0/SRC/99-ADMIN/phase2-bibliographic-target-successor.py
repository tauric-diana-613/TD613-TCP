#!/usr/bin/env python3
"""Append-only bibliographic target resolver for the SRC Phase-2 reference interface.

The sealed reference-assertion/v1 registry is evidence and is never rewritten.
This successor resolves exact local DOI targets while preserving citation
semantics as unresolved unless the legacy row already records otherwise.
"""
from __future__ import annotations

import argparse
import collections
import json
import re
from pathlib import Path
from typing import Any, Iterable


FORBIDDEN_OUTPUT_SUFFIXES = (
    "05-OPERATIONS/phase2",
    "04-RECEIPTS/phase2",
    "04-RECEIPTS/assays/2026-08-24-phase2-kiln",
)


def rows(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_rows(path: Path, values: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in values),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def normalize_doi(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    text = value.strip()
    text = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", text, flags=re.I)
    text = re.sub(r"^doi\s*:\s*", "", text, flags=re.I)
    text = text.strip().strip("<>{}[]()\"'").rstrip(".,;:")
    if not re.fullmatch(r"10\.\d{4,9}/\S+", text, flags=re.I):
        return None
    return text.casefold()


def query_epoch(root: Path) -> dict[str, str]:
    current_path = root / "04-RECEIPTS/phase2/current-seal.json"
    if not current_path.is_file():
        return {
            "atelier_snapshot_id": "UNSEALED_WORKING_STATE",
            "seal_id": "UNAVAILABLE",
            "basis": "NO_CURRENT_SEAL",
        }
    current = read_json(current_path)
    snapshot = current.get("atelier_snapshot_id")
    seal = current.get("seal_id")
    if not snapshot or not seal:
        raise ValueError("current-seal.json lacks atelier_snapshot_id or seal_id")
    return {
        "atelier_snapshot_id": str(snapshot),
        "seal_id": str(seal),
        "basis": "CURRENT_SEAL",
    }


def doi_index(root: Path) -> dict[str, list[str]]:
    """Build exact DOI -> local Zenodo manifestation candidates.

    One DOI may map to more than one local manifestation record. The resolver
    preserves the candidate set and never chooses among ambiguous candidates.
    """
    index: dict[str, set[str]] = collections.defaultdict(set)
    for row in rows(root / "01-MANIFESTS/candidate-corpus.jsonl"):
        doi = normalize_doi(row.get("doi"))
        record_id = row.get("source_record_id")
        if not doi or record_id is None:
            continue
        index[doi].add(f"zenodo:{record_id}")
    return {doi: sorted(values) for doi, values in sorted(index.items())}


def resolve_targets(root: Path) -> list[dict[str, Any]]:
    index = doi_index(root)
    epoch = query_epoch(root)
    out: list[dict[str, Any]] = []
    for row in rows(root / "05-OPERATIONS/phase2/reference-assertions.jsonl"):
        normalized = normalize_doi(row.get("cited_doi_raw"))
        targets = index.get(normalized or "", [])
        if not normalized:
            status = "INVALID_OR_UNNORMALIZABLE_DOI_LITERAL"
        elif len(targets) == 0:
            status = "NO_LOCAL_TARGET"
        elif len(targets) == 1:
            status = "UNIQUE_LOCAL_TARGET"
        else:
            status = "AMBIGUOUS_LOCAL_TARGET"
        out.append({
            "schema_version": "reference-target-resolution/v2",
            "atelier_snapshot_id": epoch["atelier_snapshot_id"],
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_reference_assertion_id": row.get("reference_assertion_id"),
            "source_derivative_id": row.get("source_derivative_id"),
            "source_capture_id": row.get("source_capture_id"),
            "source_span": row.get("source_span"),
            "cited_doi_raw": row.get("cited_doi_raw"),
            "cited_doi_normalized": normalized,
            "local_target_resolution_status": status,
            "local_target_entity_ids": targets,
            "source_bibliography_graph_status": row.get("source_bibliography_graph_status"),
            "semantic_body_graph_status": row.get("semantic_body_graph_status"),
            "archive_reconstructed_graph_status": row.get("archive_reconstructed_graph_status"),
            "semantic_promotion_applied": False,
            "repair_applied_to_sealed_v1": False,
            "interpretive_limit": (
                "Exact DOI equality may resolve a local manifestation target. "
                "Target identity does not determine citation purpose, conceptual lineage, "
                "serial order, Codex membership, or work-level identity."
            ),
            "source_status": "DERIVED_FROM_WITNESSED_LITERAL_DOI_AND_LOCAL_MANIFEST_INDEX",
            "observation_status": status,
        })
    return out


def incoming(resolved_rows: list[dict[str, Any]], entity_id: str) -> list[dict[str, Any]]:
    return [
        row for row in resolved_rows
        if entity_id in row.get("local_target_entity_ids", [])
    ]


def resolution_audit(resolved_rows: list[dict[str, Any]]) -> dict[str, Any]:
    counts = collections.Counter(row["local_target_resolution_status"] for row in resolved_rows)
    semantic_promotions = [
        row.get("source_reference_assertion_id")
        for row in resolved_rows
        if row.get("semantic_promotion_applied") is not False
    ]
    ambiguous = [
        {
            "source_reference_assertion_id": row.get("source_reference_assertion_id"),
            "cited_doi_normalized": row.get("cited_doi_normalized"),
            "local_target_entity_ids": row.get("local_target_entity_ids", []),
        }
        for row in resolved_rows
        if row.get("local_target_resolution_status") == "AMBIGUOUS_LOCAL_TARGET"
    ]
    return {
        "schema_version": "bibliographic-target-resolution-audit/v1",
        "resolution_counts": dict(sorted(counts.items())),
        "ambiguous_rows": ambiguous,
        "semantic_promotions": semantic_promotions,
        "result": "FAIL_SEMANTIC_PROMOTION" if semantic_promotions else "PASS_TARGET_ONLY_RESOLUTION",
        "invariant": "DOI_LITERAL != LOCAL_TARGET_IDENTITY != CITATION_SEMANTICS",
        "claim_ceiling": (
            "This audit validates target-resolution bookkeeping only. "
            "It does not validate citation semantics or serial relations."
        ),
    }


def safe_output_dir(root: Path, output_dir: Path) -> Path:
    resolved_root = root.resolve()
    resolved = output_dir.resolve()
    try:
        relative = resolved.relative_to(resolved_root).as_posix()
    except ValueError:
        return resolved
    for forbidden in FORBIDDEN_OUTPUT_SUFFIXES:
        if relative == forbidden or relative.startswith(forbidden + "/"):
            raise SystemExit(f"Refusing to write successor projection into sealed/current path: {relative}")
    return resolved


def preview(root: Path, output_dir: Path) -> dict[str, Any]:
    output_dir = safe_output_dir(root, output_dir)
    resolved = resolve_targets(root)
    audit = resolution_audit(resolved)
    write_rows(output_dir / "reference-target-resolutions-v2.jsonl", resolved)
    write_json(output_dir / "bibliographic-target-resolution-audit.json", audit)
    return {
        "query_epoch": query_epoch(root),
        "rows": len(resolved),
        "resolution_counts": audit["resolution_counts"],
        "audit_result": audit["result"],
        "output_dir": str(output_dir),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("audit")
    incoming_parser = sub.add_parser("incoming")
    incoming_parser.add_argument("--entity-id", required=True)
    preview_parser = sub.add_parser("preview")
    preview_parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    if args.command == "audit":
        result = resolution_audit(resolve_targets(root))
        print(json.dumps(result, indent=2, sort_keys=True))
        return 1 if result["result"].startswith("FAIL") else 0
    if args.command == "incoming":
        epoch = query_epoch(root)
        matches = incoming(resolve_targets(root), args.entity_id)
        print(json.dumps({
            "schema_version": "bibliographic-incoming-neighborhood/v1",
            "query_epoch": epoch,
            "target_entity_id": args.entity_id,
            "incoming_reference_count": len(matches),
            "incoming_references": matches,
            "interpretive_limit": "Incoming DOI references are bibliographic neighbors only; serial meaning is unresolved.",
        }, indent=2, sort_keys=True))
        return 0
    result = preview(root, args.output_dir)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
