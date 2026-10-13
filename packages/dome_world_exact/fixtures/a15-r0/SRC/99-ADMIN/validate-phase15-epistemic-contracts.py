from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from json_schema_subset import SchemaValidationError, validate as validate_schema


def jsonl(path: Path):
    rows = []
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_no, line in enumerate(stream, 1):
            if line.strip():
                try:
                    rows.append(json.loads(line))
                except Exception as exc:
                    raise AssertionError(f"invalid JSONL {path}:{line_no}: {exc}") from exc
    return rows


def require(value, message):
    if not value:
        raise AssertionError(message)


def iter_references(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if isinstance(child, str) and child and (key.endswith("_id") or key == "id") and child.startswith(("zenodo:", "substack:", "medium:", "academia:", "sr-", "archive-", "surface:")):
                yield child
            elif isinstance(child, list) and key.endswith("_ids"):
                for item in child:
                    if isinstance(item, str) and item.startswith(("zenodo:", "substack:", "medium:", "academia:", "sr-", "archive-", "surface:")):
                        yield item
            yield from iter_references(child)
    elif isinstance(value, list):
        for child in value:
            yield from iter_references(child)


def main(vault: Path):
    assay = vault / "04-RECEIPTS" / "assays" / "2026-08-24-phase15-authority-recompilation"
    evidence_rows = jsonl(assay / "witnessed-evidence.jsonl")
    evidence_ids = {row["evidence_id"] for row in evidence_rows}
    require(len(evidence_ids) == len(evidence_rows), "duplicate witnessed evidence IDs")

    schema_dir = vault / "01-MANIFESTS" / "schemas"
    schemas = {}
    for path in schema_dir.glob("*.json"):
        schemas[path.relative_to(vault).as_posix()] = json.loads(path.read_text(encoding="utf-8-sig"))

    registry_index = json.loads((vault / "01-MANIFESTS" / "registry-index.json").read_text(encoding="utf-8-sig"))
    require(registry_index["phase_2"] == "NOT_RUN_HUMAN_GATE_CLOSED", "connector index opens Phase 2")
    registry_rows = {}
    for registry in registry_index["registries"]:
        require((vault / registry["path"]).is_file(), f"connector registry missing: {registry['path']}")
        rows = jsonl(vault / registry["path"])
        registry_rows[registry["path"]] = rows
        primary_ids = [row[registry["primary_key"]] for row in rows]
        require(len(primary_ids) == len(set(primary_ids)), f"duplicate primary key in {registry['path']}")
        if registry["schema"]:
            require((vault / registry["schema"]).is_file(), f"connector schema missing: {registry['schema']}")
            schema = schemas[registry["schema"]]
            for index, row in enumerate(rows, 1):
                try:
                    validate_schema(row, schema, f"{registry['path']}:{index}")
                except SchemaValidationError as exc:
                    raise AssertionError(str(exc)) from exc

    authority = jsonl(vault / "05-OPERATIONS" / "authority" / "authority-assertions.jsonl")
    authority_ids = set()
    axes = {"G_genealogical", "C_canonical", "E_empirical", "F_field_defining", "K_controlling"}
    for row in authority:
        require(row["schema_version"] == "authority-assertion/v1", "authority schema version")
        require(set(row["authority"]) == axes, f"authority axes incomplete: {row['authority_assertion_id']}")
        require(all(isinstance(value, dict) for value in row["authority"].values()), "authority axis flattened to scalar")
        require(row["authority_assertion_id"] not in authority_ids, "duplicate authority assertion ID")
        authority_ids.add(row["authority_assertion_id"])
        if row["subject"]["kind"] == "CLASS":
            require(row["individual_expansion_status"] != "COMPLETE" or row["evidence_ids"], "class expansion lacks evidence")
        for evid in row["evidence_ids"]:
            require(evid in evidence_ids, f"authority evidence missing: {evid}")

    relations = jsonl(vault / "05-OPERATIONS" / "relations" / "recompilation-edges.jsonl")
    typed_relations = jsonl(vault / "05-OPERATIONS" / "relations" / "typed-edges.jsonl")
    relation_ids = set()
    for row in relations + typed_relations:
        require(row["schema_version"] == "relation-assertion/v2", "relation schema version")
        require(row["edge_id"] not in relation_ids, "duplicate edge ID")
        relation_ids.add(row["edge_id"])
        if row["origin"] == "explicit-source":
            require(row["declared_by_id"] and row["source_predicate_raw"], f"explicit edge lacks source predicate: {row['edge_id']}")
        if row["relation_provenance_mode"] == "RETROSPECTIVE":
            require(row["declared_by_id"], f"retrospective edge lacks declaring source: {row['edge_id']}")
        for evid in row["evidence_ids"]:
            require(evid in evidence_ids, f"relation evidence missing: {evid}")

    compiler_candidates = jsonl(vault / "05-OPERATIONS" / "relations" / "compiler-input-candidates.jsonl")
    for row in compiler_candidates:
        for evid in row["evidence_ids"]:
            require(evid in evidence_ids, f"compiler candidate evidence missing: {evid}")
        for slot in row["input_slots"]:
            require(slot["candidate_ids"], f"compiler slot has no candidate or explicit unresolved object: {row['compiler_candidate_id']}")

    maps = jsonl(vault / "05-OPERATIONS" / "maps" / "canon-map-snapshots.jsonl")
    map_ids = [row["snapshot_id"] for row in maps]
    require(len(map_ids) == len(set(map_ids)) == 3, "expected three unique canon-map snapshots")
    require(all(row["immutable_snapshot"] is True for row in maps), "canon-map snapshot is mutable")
    require(all(row["nodes"] for row in maps), "canon-map snapshot has no locally witnessed node labels")

    transformations = jsonl(vault / "05-OPERATIONS" / "relations" / "representation-lift-candidates.jsonl")
    required_effects = {"semantic_core", "scope", "causality", "universality", "variables", "falsifiers", "caveats"}
    for row in transformations:
        require(row["schema_version"] == "transformation-assertion/v1", "transformation schema version")
        require(set(row["claim_effects"]) == required_effects, f"incomplete claim effects: {row['transformation_id']}")
        require("authority" not in row and "validated" not in row, f"transformation silently promotes authority: {row['transformation_id']}")

    states = jsonl(vault / "05-OPERATIONS" / "state" / "epistemic-object-states.jsonl")
    state_axes = {"E_existence", "V_visibility", "R_retrievability", "P_provenance", "L_lineage", "A_authority"}
    for row in states:
        require(set(row["dimensions"]) == state_axes, f"state vector incomplete: {row['state_assertion_id']}")
        require("overall_state" not in row, "state vector contains prohibited composite state")

    graph_observations = jsonl(assay / "graph-assay-observations.jsonl")
    edge_by_id = {row["edge_id"]: row for row in relations + typed_relations}
    for row in graph_observations:
        payload = row["payload"]
        require("score" not in json.dumps(payload).lower() and "distance" not in json.dumps(payload).lower(), f"graph observation contains prohibited scalar score/distance: {row['observation_id']}")
        if row["observation_kind"] != "TYPED_CYCLE":
            continue
        edge_ids = payload["ordered_edge_ids"]
        require(all(edge_id in edge_by_id for edge_id in edge_ids), f"typed cycle has unresolved edge ID: {row['observation_id']}")
        actual_projections = {edge_by_id[edge_id]["graph_kind"] for edge_id in edge_ids}
        require(actual_projections == set(payload["graph_projections"]), f"typed cycle projection mismatch: {row['observation_id']}")
        if payload["closure_type"] == "RECIPROCAL_TYPED_PAIR":
            pairs = [(edge_by_id[edge_id]["from_id"], edge_by_id[edge_id]["to_id"]) for edge_id in edge_ids]
            require(len(pairs) >= 2 and pairs[0][0] == pairs[-1][1] and pairs[0][1] == pairs[-1][0], f"reciprocal pair is not a closed walk: {row['observation_id']}")
        if payload["closure_type"] == "CROSS_GRAPH_ANTI_CYCLE":
            require(len(actual_projections) >= 2, f"cross-graph anti-cycle collapsed to one projection: {row['observation_id']}")
        if payload["closure_type"] == "SURFACE_RELATIVE_CHRONOLOGY":
            require(len(payload["orders"]) >= 2 and len({order["scope_id"] for order in payload["orders"]}) >= 2, f"surface-relative chronology lacks two scopes: {row['observation_id']}")

    summary = json.loads((assay / "curated-summary.json").read_text(encoding="utf-8"))
    require(summary["network_requests"] == 0, "assay reports network activity")
    require(summary["new_acquisitions"] == 0, "assay reports acquisition")
    require(summary["phase_2"] == "NOT_RUN_HUMAN_GATE_CLOSED", "Phase 2 gate is not closed")
    priorities = jsonl(assay / "phase-2-acquisition-priorities.jsonl")
    require(all(row["gate"] == "PHASE_2_HUMAN_GATE_CLOSED" for row in priorities), "an acquisition priority is not gated")

    coverage = jsonl(assay / "coverage-ledger.jsonl")
    require(all(row["phase_2_run"] is False for row in coverage), "coverage ledger reports a Phase 2 run")
    for row in coverage:
        require(row["audit_status"] in {"IMPLEMENTED", "PARTIAL", "BLOCKED", "SCHEMA_ONLY", "HUMAN_GATED"}, f"coverage status is untyped: {row['trail_id']}")
        require(row["reachability"] in {"SCHEMA_ONLY", "SEEDED", "BOUNDED_EXECUTED", "BLOCKED_BY_SOURCE", "HUMAN_GATED"}, f"coverage reachability is untyped: {row['trail_id']}")
        for rel_path in row["implemented_in"]:
            require((vault / rel_path).is_file(), f"coverage path is missing: {row['trail_id']} -> {rel_path}")
        if row["audit_status"] in {"BLOCKED", "HUMAN_GATED"}:
            require(row["blocker_ids"], f"blocked coverage entry lacks blocker IDs: {row['trail_id']}")

    entity_rows = jsonl(vault / "01-MANIFESTS" / "entity-index.jsonl")
    entity_ids = {row["entity_id"] for row in entity_rows}
    require(len(entity_ids) == len(entity_rows), "duplicate entity index IDs")
    for row in entity_rows:
        require(all(source_id in entity_ids for source_id in row["source_entity_ids"]), f"entity index source does not resolve: {row['entity_id']}")
    for path, rows in registry_rows.items():
        if path == "01-MANIFESTS/entity-index.jsonl":
            continue
        for row in rows:
            for ref in iter_references(row):
                require(ref in entity_ids, f"registry reference absent from entity index: {path} -> {ref}")
    for row in graph_observations:
        for ref in iter_references(row):
            require(ref in entity_ids, f"graph reference absent from entity index: {row['observation_id']} -> {ref}")

    sealed = vault / "04-RECEIPTS" / "assays" / "2026-08-23-phase15-local-architecture"
    for receipt in jsonl(sealed / "output-hashes.jsonl"):
        path = sealed / receipt["path"]
        require(path.is_file(), f"sealed prior output missing: {path}")
        require(path.stat().st_size == receipt["bytes"], f"sealed prior output length changed: {path}")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == receipt["sha256"], f"sealed prior output hash changed: {path}")

    for receipt in jsonl(assay / "input-hashes.jsonl"):
        path = vault / receipt["path"]
        require(path.is_file(), f"current assay input missing: {path}")
        require(path.stat().st_size == receipt["bytes"], f"current assay input length changed: {path}")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == receipt["sha256"], f"current assay input hash changed: {path}")

    for receipt in jsonl(assay / "output-hashes.jsonl"):
        path = vault / receipt["path"]
        require(path.is_file(), f"current assay output missing: {path}")
        require(path.stat().st_size == receipt["bytes"], f"current assay output length changed: {path}")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == receipt["sha256"], f"current assay output hash changed: {path}")

    print(json.dumps({
        "status": "PASS",
        "authority_assertions": len(authority),
        "recompilation_edges": len(relations),
        "typed_graph_edges": len(typed_relations),
        "canon_map_snapshots": len(maps),
        "representation_transformations": len(transformations),
        "epistemic_states": len(states),
        "coverage_trails": len(coverage),
        "entity_index_entries": len(entity_rows),
        "json_schema_validation": True,
        "phase_2": "NOT_RUN_HUMAN_GATE_CLOSED",
        "prior_sealed_assay_verified": True,
        "current_assay_inputs_and_outputs_verified": True,
    }, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--vault", type=Path, required=True)
    args = parser.parse_args()
    main(args.vault)
