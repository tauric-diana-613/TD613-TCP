#!/usr/bin/env python3
"""Read-only, seal-pinned query entry for the SRC atelier."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def epoch(root: Path, requested_snapshot: str, requested_seal: str) -> dict[str, str]:
    current_path = root / "04-RECEIPTS/phase2/current-seal.json"
    if not current_path.is_file():
        raise SystemExit("No sealed query epoch exists at this projection.")
    current = read_json(current_path)
    if current.get("atelier_snapshot_id") != requested_snapshot or current.get("seal_id") != requested_seal:
        raise SystemExit("Requested snapshot/seal does not match this projection. Cross-epoch joins require a separate explicit assay.")
    seal_path = root / current["path"]
    if not seal_path.is_file():
        raise SystemExit("Matched seal manifest is missing.")
    seal = read_json(seal_path)
    if seal.get("atelier_snapshot_id") != requested_snapshot or seal.get("seal_id") != requested_seal:
        raise SystemExit("Current pointer and seal manifest disagree.")
    return {"atelier_snapshot_id": requested_snapshot, "seal_id": requested_seal}


def attach_epoch(value: Any, query_epoch: dict[str, str]) -> dict[str, Any]:
    return {"schema_version": "src-query-result/v1", "query_epoch": query_epoch, "result": value}


def summarize(root: Path) -> dict[str, Any]:
    outcomes = read_jsonl(root / "01-MANIFESTS/phase2/acquisition-outcomes.jsonl")
    counts: dict[str, dict[str, int]] = {}
    for row in outcomes:
        counts.setdefault(str(row.get("platform")), {}).setdefault(str(row.get("state")), 0)
        counts[str(row.get("platform"))][str(row.get("state"))] += 1
    expected = read_jsonl(root / "05-OPERATIONS/phase2/expected-object-observations.jsonl")
    roles = read_jsonl(root / "05-OPERATIONS/phase2/contextual-role-assertions.jsonl")
    compilers = read_jsonl(root / "05-OPERATIONS/phase2/compilation-passes.jsonl")
    authority = read_jsonl(root / "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl")
    lineages = read_jsonl(root / "05-OPERATIONS/phase2/evidence-lineage-assertions.jsonl")
    trails = read_jsonl(root / "04-RECEIPTS/assays/2026-08-24-phase2-kiln/coverage-ledger.jsonl")
    return {
        "coverage_by_platform_and_state": counts,
        "unresolved_expected_objects": [row for row in expected if row.get("state") == "OPEN_UNRESOLVED"],
        "compiler_map": {"compilation_passes": len(compilers), "contextual_role_assertions": len(roles)},
        "authority_jurisdiction_assertions": authority,
        "evidence_lineage_groups": lineages,
        "open_tomography_trails": [row for row in trails if "PENDING" in str(row.get("status")) or "REQUIRES" in str(row.get("status"))],
    }


def resolve(root: Path, entity_id: str) -> dict[str, Any]:
    resolver = read_jsonl(root / "01-MANIFESTS/phase2/entity-resolver-v2.jsonl")
    matches = [row for row in resolver if row.get("entity_id") == entity_id]
    if not matches:
        return {"entity_id": entity_id, "status": "UNRESOLVED_TARGET"}
    result = []
    for row in matches:
        item = dict(row)
        path = item.get("path")
        item["path_exists"] = bool(path and (root / path).exists())
        result.append(item)
    return {"entity_id": entity_id, "matches": result}


def contains_exact(value: Any, candidates: set[str]) -> bool:
    if isinstance(value, str):
        return value in candidates
    if isinstance(value, list):
        return any(contains_exact(item, candidates) for item in value)
    if isinstance(value, dict):
        return any(contains_exact(item, candidates) for item in value.values())
    return False


def trace(root: Path, entity_id: str) -> dict[str, Any]:
    """Return witnessed cross-registry hops without inventing missing joins."""
    phase15_entities = read_jsonl(root / "01-MANIFESTS/entity-index.jsonl")
    phase2_resolver = read_jsonl(root / "01-MANIFESTS/phase2/entity-resolver-v2.jsonl")
    entity_rows = [row for row in phase15_entities if row.get("entity_id") == entity_id]

    seeds = {entity_id}
    if ":" in entity_id:
        seeds.add(entity_id.rsplit(":", 1)[-1])
    for row in entity_rows:
        seeds.add(str(row.get("defined_by_record_id") or ""))
        seeds.update(str(item) for item in row.get("source_entity_ids", []) if item)
    seeds.discard("")

    resolver_rows = []
    for row in phase2_resolver:
        candidate = str(row.get("entity_id") or "")
        parent = str(row.get("parent_id") or "")
        if candidate in seeds or parent in seeds or any(candidate.startswith(seed + ":") for seed in seeds):
            item = dict(row)
            path = item.get("path")
            item["path_exists"] = bool(path and (root / path).exists())
            resolver_rows.append(item)

    capture_ids = {str(row.get("capture_id")) for row in resolver_rows if row.get("capture_id")}
    capture_ids.update(str(row.get("entity_id")) for row in resolver_rows if row.get("entity_type") == "capture")
    captures = [
        row for row in read_jsonl(root / "01-MANIFESTS/phase2/capture-v2.jsonl")
        if row.get("capture_id") in capture_ids or str(row.get("target_id") or "") in seeds
    ]
    capture_ids.update(str(row.get("capture_id")) for row in captures if row.get("capture_id"))

    derivatives = [
        row for row in read_jsonl(root / "01-MANIFESTS/phase2/derivative-v1.jsonl")
        if row.get("capture_id") in capture_ids
    ]

    evidence = [
        row for row in read_jsonl(root / "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/witnessed-evidence.jsonl")
        if str(row.get("manifestation_id") or "") in seeds or row.get("evidence_id") in seeds
    ]
    relation_paths = [
        "05-OPERATIONS/relations/typed-edges.jsonl",
        "05-OPERATIONS/relations/recompilation-edges.jsonl",
        "05-OPERATIONS/phase2/contextual-role-assertions.jsonl",
        "05-OPERATIONS/phase2/compilation-passes.jsonl",
        "05-OPERATIONS/phase2/reference-assertions.jsonl",
    ]
    relations = []
    for path in relation_paths:
        for row in read_jsonl(root / path):
            if contains_exact(row, seeds):
                relations.append({"registry_path": path, "record": row})

    authority_rows = [
        row for row in read_jsonl(root / "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl")
        if contains_exact(row.get("subject", {}), seeds) or contains_exact(row.get("declarer", {}), seeds)
    ]
    status = "RESOLVED" if any((entity_rows, resolver_rows, captures, derivatives, evidence, relations, authority_rows)) else "UNRESOLVED_TARGET"
    missing_hops = []
    if not entity_rows:
        missing_hops.append("PHASE15_ENTITY")
    if not captures:
        missing_hops.append("CAPTURE")
    if not derivatives:
        missing_hops.append("DERIVATIVE")
    if not evidence:
        missing_hops.append("EXACT_SOURCE_LOCATOR")
    if not relations:
        missing_hops.append("TYPED_RELATION")
    if not authority_rows:
        missing_hops.append("AUTHORITY_ASSERTION")
    return {
        "entity_id": entity_id,
        "status": status,
        "seed_identifiers": sorted(seeds),
        "entity_records": entity_rows,
        "resolver_records": resolver_rows,
        "captures": captures,
        "derivatives": derivatives,
        "source_evidence": evidence,
        "relations": relations,
        "authority_assertions": authority_rows,
        "missing_hops": missing_hops,
        "join_rule": "Only exact witnessed identifiers are followed; missing hops remain explicit.",
    }


def authority(root: Path, subject_id: str, scope_text: str | None) -> dict[str, Any]:
    rows = read_jsonl(root / "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl")
    applicable = []
    for row in rows:
        subject = row.get("subject") or {}
        if subject.get("id") != subject_id:
            continue
        if scope_text and scope_text.lower() not in json.dumps(row.get("scope", {}), ensure_ascii=False).lower():
            continue
        applicable.append(row)
    # Chronology is never a control edge.  The archive intentionally returns
    # every witnessed formulation until an explicit scope-specific relation is
    # present in the authority graph.
    return {
        "subject_id": subject_id,
        "requested_scope": scope_text,
        "controlling_formulation": None,
        "control_resolution": "NO_EXPLICIT_CURRENT_CONTROLS_OR_SUPERSEDES_SCOPE_EDGE",
        "applicable_witnessed_formulations": applicable,
        "newest_manifestation_is_not_authority": True,
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--snapshot-id", required=True)
    parser.add_argument("--seal-id", required=True)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("summary")
    res = sub.add_parser("resolve")
    res.add_argument("entity_id")
    trc = sub.add_parser("trace")
    trc.add_argument("entity_id")
    auth = sub.add_parser("authority")
    auth.add_argument("subject_id")
    auth.add_argument("--scope")
    args = parser.parse_args()
    root = args.root.resolve()
    query_epoch = epoch(root, args.snapshot_id, args.seal_id)
    if args.command == "summary":
        value = summarize(root)
    elif args.command == "resolve":
        value = resolve(root, args.entity_id)
    elif args.command == "trace":
        value = trace(root, args.entity_id)
    else:
        value = authority(root, args.subject_id, args.scope)
    print(json.dumps(attach_epoch(value, query_epoch), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
