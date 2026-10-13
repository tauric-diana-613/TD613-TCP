from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_no, line in enumerate(stream, 1):
            if line.strip():
                yield line_no, json.loads(line)


def write_jsonl(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def entity_kind(entity_id: str, fallback: str = "UNRESOLVED_OBJECT") -> str:
    prefixes = {
        "zenodo:": "MANIFESTATION", "substack:": "MANIFESTATION", "medium:": "MANIFESTATION",
        "academia:": "MANIFESTATION", "sr-evidence:": "EVIDENCE", "sr-edge:": "RELATION",
        "sr-transform:": "TRANSFORMATION", "sr-authority:": "AUTHORITY_ASSERTION",
        "sr-claim-event:": "CLAIM_EVENT", "sr-claim:": "CLAIM", "sr-lineage:": "LINEAGE",
        "sr-canon-map:": "MAP_SNAPSHOT", "sr-canon-map-node:": "MAP_NODE",
        "sr-operator-event:": "LIFECYCLE_EVENT", "sr-state:": "STATE_ASSERTION",
        "sr-family:": "REPRESENTATION_FAMILY", "sr-series-observation:": "SERIES_OBSERVATION",
        "sr-series:": "SERIES_NAMESPACE", "sr-anatomy:": "STRUCTURAL_ANATOMY",
        "sr-hyp-": "HYPOTHESIS", "sr-evidence-taxonomy:": "EVIDENCE_TAXONOMY",
        "sr-type-control:": "TYPE_CONTROL", "sr-architecture:": "ARCHITECTURE",
        "sr-genealogy:": "GENEALOGY", "sr-class:": "CLASS", "sr-role:": "ROLE",
        "sr-module:": "MODULE", "sr-corpus:": "CORPUS_SNAPSHOT", "sr-formulation:": "FORMULATION",
        "sr-measure:": "MEASUREMENT_DEFINITION", "sr-falsifier:": "FALSIFIER",
        "sr-blocker:": "BLOCKER", "sr-gate:": "HUMAN_GATE", "sr-search-scope:": "SEARCH_SCOPE",
        "archive-assay:": "ASSAY", "archive-search:": "SEARCH_RECEIPT", "surface:": "SURFACE",
    }
    for prefix, kind in prefixes.items():
        if entity_id.startswith(prefix):
            return kind
    return fallback


def looks_like_entity_id(value: str) -> bool:
    prefixes = (
        "zenodo:", "substack:", "medium:", "academia:", "sr-", "archive-", "surface:",
    )
    return value.startswith(prefixes)


def iter_references(value, parent_key: str | None = None):
    if isinstance(value, dict):
        for key, child in value.items():
            if isinstance(child, str) and child and (key.endswith("_id") or key == "id") and looks_like_entity_id(child):
                yield child
            elif isinstance(child, list) and key.endswith("_ids"):
                for item in child:
                    if isinstance(item, str) and looks_like_entity_id(item):
                        yield item
            yield from iter_references(child, key)
    elif isinstance(value, list):
        for child in value:
            yield from iter_references(child, parent_key)


def main(vault: Path):
    registry_index_path = vault / "01-MANIFESTS" / "registry-index.json"
    registry_index = json.loads(registry_index_path.read_text(encoding="utf-8-sig"))
    defined: dict[str, dict] = {}
    references: dict[str, set[str]] = defaultdict(set)

    def define(entity_id: str, kind: str, label: str, path: str, record_id: str | None, status: str = "DEFINED", limit: str | None = None):
        candidate = {
            "schema_version": "entity-index/v1",
            "entity_id": entity_id,
            "entity_kind": kind,
            "label": label,
            "definition_status": status,
            "defined_in_path": path,
            "defined_by_record_id": record_id,
            "source_entity_ids": [],
            "interpretive_limit": limit,
        }
        prior = defined.get(entity_id)
        if prior is None or (prior["definition_status"] != "DEFINED" and status == "DEFINED"):
            defined[entity_id] = candidate

    candidate_path = vault / "01-MANIFESTS" / "candidate-corpus.jsonl"
    for _, row in read_jsonl(candidate_path):
        eid = f"zenodo:{row['source_record_id']}"
        define(eid, "MANIFESTATION", row.get("title") or eid, "01-MANIFESTS/candidate-corpus.jsonl", eid)

    platform_root = vault / "01-MANIFESTS" / "platforms"
    for path in sorted(platform_root.glob("*.jsonl")):
        platform = path.stem.lower()
        rel = path.relative_to(vault).as_posix()
        for _, row in read_jsonl(path):
            raw_id = row.get("platform_item_id")
            if raw_id is None:
                continue
            eid = f"{platform}:{raw_id}"
            define(eid, "MANIFESTATION", row.get("title") or eid, rel, eid)

    evidence_path = vault / registry_index["evidence_resolver"]
    for _, row in read_jsonl(evidence_path):
        eid = row["evidence_id"]
        define(eid, "EVIDENCE", row.get("label") or eid, registry_index["evidence_resolver"], eid)
        for ref in iter_references(row):
            references[ref].add(eid)

    object_kind_map = {
        "time-indexed five-axis authority assertion": "AUTHORITY_ASSERTION",
        "criterion match without individual authority assignment": "LEGACY_MEMBERSHIP_CANDIDATE",
        "claim status event": "CLAIM_EVENT",
        "source-specific evidence taxonomy": "EVIDENCE_TAXONOMY",
        "immutable author self-model snapshot C_t": "MAP_SNAPSHOT",
        "typed, time-aware source/compiler relation": "RELATION",
        "typed graph edge used by graph observations": "RELATION",
        "source-declared compiler slot with unresolved exact inputs": "COMPILER_INPUT_CANDIDATE",
        "non-collapsed representation family": "REPRESENTATION_FAMILY",
        "surface or epistemic transformation assertion": "TRANSFORMATION",
        "ordinal sequence with explicit namespace resolution status": "SERIES_OBSERVATION",
        "bounded first-appearance developmental anatomy": "STRUCTURAL_ANATOMY",
        "append-only epistemic lifecycle event": "LIFECYCLE_EVENT",
        "six-axis E/V/R/P/L/A state assertion": "STATE_ASSERTION",
        "research hypothesis; never a source claim": "HYPOTHESIS",
        "connector entity resolver": "ENTITY_INDEX_ENTRY",
    }
    for registry in registry_index["registries"]:
        if registry["path"] == "01-MANIFESTS/entity-index.jsonl":
            continue
        path = vault / registry["path"]
        if not path.is_file():
            continue
        kind = object_kind_map.get(registry["object"], "REGISTRY_RECORD")
        for _, row in read_jsonl(path):
            primary = row.get(registry["primary_key"])
            if not isinstance(primary, str) or not primary:
                continue
            label = row.get("title") or row.get("source_title") or row.get("label") or primary
            define(primary, kind, label, registry["path"], primary)
            for ref in iter_references(row):
                if ref != primary:
                    references[ref].add(primary)

            if registry["primary_key"] == "snapshot_id":
                for node in row.get("nodes", []):
                    node_id = node.get("snapshot_node_id")
                    if node_id:
                        define(node_id, "MAP_NODE", node.get("raw_label") or node_id, registry["path"], primary)

    extra_reference_paths = [
        "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/graph-assay-observations.jsonl",
        "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/coverage-ledger.jsonl",
        "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/phase-2-acquisition-priorities.jsonl",
    ]
    for rel in extra_reference_paths:
        path = vault / rel
        if not path.is_file():
            continue
        for _, row in read_jsonl(path):
            source_id = row.get("observation_id")
            if source_id:
                define(source_id, "GRAPH_OBSERVATION", source_id, rel, source_id)
            elif row.get("trail_id"):
                source_id = f"sr-coverage:{row['trail_id']}"
                define(source_id, "COVERAGE_ENTRY", row["trail_id"], rel, source_id)
            elif row.get("priority") is not None:
                source_id = f"sr-acquisition-priority:{row['priority']}"
                define(source_id, "ACQUISITION_PRIORITY", f"Phase 2 acquisition priority {row['priority']}", rel, source_id)
            else:
                source_id = f"archive-record:{rel}"
                define(source_id, "REGISTRY_RECORD", rel, rel, source_id)
            for ref in iter_references(row):
                references[ref].add(str(source_id))

    for target, sources in references.items():
        if target not in defined:
            unresolved = any(token in target for token in ("unresolved", "expected", "unknown"))
            define(
                target,
                entity_kind(target),
                target,
                "01-MANIFESTS/entity-index.jsonl",
                None,
                "UNRESOLVED" if unresolved else "PLACEHOLDER",
                "Referenced by a canonical record but not independently defined in the bounded local vault; never autocomplete this object.",
            )
        defined[target]["source_entity_ids"] = sorted(sources)

    rows = [defined[key] for key in sorted(defined)]
    write_jsonl(vault / "01-MANIFESTS" / "entity-index.jsonl", rows)
    counts = defaultdict(int)
    for row in rows:
        counts[row["definition_status"]] += 1
    print(json.dumps({"entities": len(rows), "definition_status": dict(sorted(counts.items()))}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--vault", type=Path, required=True)
    args = parser.parse_args()
    main(args.vault)
