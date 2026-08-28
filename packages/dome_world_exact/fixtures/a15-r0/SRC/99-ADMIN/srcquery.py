#!/usr/bin/env python3
"""Read-only, seal-pinned query entry for the SRC atelier."""

from __future__ import annotations

import argparse
import json
import re
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


def normalize_title(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", value.casefold()))


def platform_manifest_rows(root: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    specs = (
        ("Substack", "substack", root / "01-MANIFESTS/platforms/substack.jsonl"),
        ("Medium", "medium", root / "01-MANIFESTS/platforms/medium.jsonl"),
        ("Academia.edu", "academia", root / "01-MANIFESTS/platforms/academia.jsonl"),
    )
    for display, key, path in specs:
        for row in read_jsonl(path):
            rows.append({
                "platform": display,
                "platform_key": key,
                "id": str(row.get("platform_item_id") or ""),
                "title": str(row.get("title") or ""),
                "url": row.get("url"),
            })
    for row in read_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl"):
        rows.append({
            "platform": "Zenodo",
            "platform_key": "zenodo",
            "id": str(row.get("source_record_id") or ""),
            "title": str(row.get("title") or ""),
            "url": row.get("record_url"),
            "doi": row.get("doi"),
        })
    return rows


def direct_derivatives_for_targets(root: Path, target_ids: set[str]) -> list[dict[str, Any]]:
    captures = read_jsonl(root / "01-MANIFESTS/phase2/capture-v2.jsonl")
    derivatives = read_jsonl(root / "01-MANIFESTS/phase2/derivative-v1.jsonl")
    capture_ids = {str(row.get("capture_id")) for row in captures if str(row.get("target_id") or "") in target_ids}
    result = []
    for row in derivatives:
        if str(row.get("capture_id") or "") not in capture_ids:
            continue
        item = dict(row)
        path = str(item.get("local_path") or "")
        item["path_exists"] = bool(path and (root / path).is_file())
        if item["path_exists"]:
            result.append(item)
    return result


def expand_zenodo_targets(outcomes: list[dict[str, Any]], source_id: str) -> set[str]:
    prefix = f"zenodo:{source_id}:"
    return {str(row.get("target_id")) for row in outcomes if str(row.get("target_id") or "").startswith(prefix)}


def readable(root: Path, query: str) -> dict[str, Any]:
    """Resolve a content query to a connector-readable derivative without web fallback."""
    outcomes = read_jsonl(root / "01-MANIFESTS/phase2/acquisition-outcomes.jsonl")
    manifests = platform_manifest_rows(root)
    exact_crosswalk = read_jsonl(root / "01-MANIFESTS/crosswalk/exact-title-crosswalk.jsonl")
    substack_doi_links = read_jsonl(root / "01-MANIFESTS/platforms/substack-doi-links.jsonl")
    corpus = read_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl")
    opaque = read_jsonl(root / "01-MANIFESTS/phase2/opaque-private-locators.jsonl")
    normalized_query = normalize_title(query)

    matched_manifestations: list[dict[str, Any]] = []
    for row in manifests:
        platform_id = f"{row['platform_key']}:{row['id']}"
        target_id = f"{platform_id}:page" if row["platform_key"] != "zenodo" else platform_id
        if query in {row["id"], platform_id, target_id, str(row.get("doi") or "")} or normalize_title(row["title"]) == normalized_query:
            matched_manifestations.append(row)

    direct_outcomes = [row for row in outcomes if str(row.get("target_id") or "") == query]
    for row in direct_outcomes:
        platform_key = str(row.get("platform") or "")
        matched_manifestations.append({
            "platform": {"academia": "Academia.edu", "substack": "Substack", "medium": "Medium", "zenodo": "Zenodo"}.get(platform_key, platform_key),
            "platform_key": platform_key,
            "id": str(row.get("source_id") or ""),
            "title": str(row.get("title") or ""),
            "url": row.get("url"),
        })

    unique: dict[tuple[str, str], dict[str, Any]] = {}
    for row in matched_manifestations:
        unique[(row["platform_key"], row["id"])] = row
    matched_manifestations = list(unique.values())

    if not matched_manifestations:
        return {
            "query": query,
            "status": "UNRESOLVED_TARGET",
            "readability_contract": "No web fallback before archive resolution.",
        }

    direct_readable: list[dict[str, Any]] = []
    equivalent_readable: list[dict[str, Any]] = []
    blockers: list[dict[str, Any]] = []

    for manifestation in matched_manifestations:
        platform_key = manifestation["platform_key"]
        source_id = manifestation["id"]
        if platform_key == "zenodo":
            target_ids = expand_zenodo_targets(outcomes, source_id)
        else:
            target_ids = {f"{platform_key}:{source_id}:page"}

        direct = direct_derivatives_for_targets(root, target_ids)
        for derivative in direct:
            direct_readable.append({
                "manifestation": manifestation,
                "readability": "READABLE_DIRECT",
                "derivative_id": derivative.get("derivative_id"),
                "path": derivative.get("local_path"),
                "confidence": derivative.get("confidence"),
            })

        if direct:
            continue

        if platform_key == "substack":
            doi_rows = [row for row in substack_doi_links if str(row.get("substack_id") or "") == source_id]
            for doi_row in doi_rows:
                for doi in doi_row.get("dois") or []:
                    zenodo_rows = [row for row in corpus if str(row.get("doi") or "") == str(doi)]
                    for zenodo_row in zenodo_rows:
                        zenodo_id = str(zenodo_row.get("source_record_id") or "")
                        sibling_targets = expand_zenodo_targets(outcomes, zenodo_id)
                        siblings = direct_derivatives_for_targets(root, sibling_targets)
                        for derivative in siblings:
                            equivalent_readable.append({
                                "manifestation": manifestation,
                                "readability": "READABLE_EQUIVALENT",
                                "identity_basis": "explicit-platform-doi-link",
                                "doi": doi,
                                "readable_manifestation": {
                                    "platform": "Zenodo",
                                    "id": zenodo_id,
                                    "title": zenodo_row.get("title"),
                                    "url": zenodo_row.get("record_url"),
                                    "doi": doi,
                                },
                                "derivative_id": derivative.get("derivative_id"),
                                "path": derivative.get("local_path"),
                                "confidence": derivative.get("confidence"),
                            })

        normalized = normalize_title(manifestation["title"])
        clusters = [row for row in exact_crosswalk if row.get("normalized_title") == normalized]
        for cluster in clusters:
            for entry in cluster.get("entries") or []:
                if str(entry.get("platform")) != "Zenodo":
                    continue
                zenodo_id = str(entry.get("id") or "")
                sibling_targets = expand_zenodo_targets(outcomes, zenodo_id)
                siblings = direct_derivatives_for_targets(root, sibling_targets)
                for derivative in siblings:
                    equivalent_readable.append({
                        "manifestation": manifestation,
                        "readability": "READABLE_EQUIVALENT",
                        "identity_basis": "normalized-title-exact",
                        "crosswalk_id": cluster.get("crosswalk_id"),
                        "readable_manifestation": {
                            "platform": "Zenodo",
                            "id": zenodo_id,
                            "title": entry.get("title"),
                            "url": entry.get("url"),
                            "doi": entry.get("doi"),
                        },
                        "derivative_id": derivative.get("derivative_id"),
                        "path": derivative.get("local_path"),
                        "confidence": derivative.get("confidence"),
                    })

        target_id = f"{platform_key}:{source_id}:page"
        private_rows = [row for row in opaque if row.get("target_id") == target_id]
        if not direct and not any(item["manifestation"] == manifestation for item in equivalent_readable):
            if private_rows:
                blockers.append({
                    "manifestation": manifestation,
                    "readability": "HUMAN_GATED",
                    "blocker": "PRIVATE_CAPTURE_NO_PUBLIC_TEXT_DERIVATIVE",
                    "custody": private_rows,
                })
            elif platform_key == "zenodo":
                blockers.append({
                    "manifestation": manifestation,
                    "readability": "MISSING_DERIVATIVE_BUG",
                    "blocker": "PUBLIC_FORMAL_MANIFESTATION_HAS_NO_READABLE_DERIVATIVE",
                })
            else:
                blockers.append({
                    "manifestation": manifestation,
                    "readability": "HUMAN_GATED",
                    "blocker": "NO_STRONG_READABLE_SIBLING_AND_NO_PUBLIC_TEXT_DERIVATIVE",
                })

    if direct_readable:
        status = "READABLE_DIRECT"
    elif equivalent_readable:
        status = "READABLE_EQUIVALENT"
    elif any(row["readability"] == "MISSING_DERIVATIVE_BUG" for row in blockers):
        status = "MISSING_DERIVATIVE_BUG"
    else:
        status = "HUMAN_GATED"

    return {
        "query": query,
        "status": status,
        "matched_manifestations": matched_manifestations,
        "direct_readable": direct_readable,
        "equivalent_readable": equivalent_readable,
        "blockers": blockers,
        "readability_contract": (
            "Archive-first content resolution: direct derivative > explicit DOI-linked sibling > "
            "exact-title readable sibling > explicit blocker. Fuzzy title candidates and web search never establish work identity."
        ),
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
    rd = sub.add_parser("read")
    rd.add_argument("query", help="manifestation ID, acquisition target ID, DOI, platform item ID, or exact title")
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
    elif args.command == "read":
        value = readable(root, args.query)
    else:
        value = authority(root, args.subject_id, args.scope)
    print(json.dumps(attach_epoch(value, query_epoch), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
