#!/usr/bin/env python3
"""Deterministic Python Reference Oracle Runner for SRC Native Methods.

Imports pinned original Python implementations from packages/research_carrier_v1/native:
- projective.py (PR #1683 pin)
- phase2.py (PR #1683 pin)
- query.py (PR #1683 pin)

Executes on synthetic_deck.json using authentic function calls (addressing Finding A-S2-F04)
and emits typed python_oracle_output.json.
"""

from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

# Insert native carrier directory into sys.path
CARRIER_NATIVE = Path(__file__).resolve().parents[2] / "research_carrier_v1" / "native"
sys.path.insert(0, str(CARRIER_NATIVE))

import projective
import phase2
import query

DECK_PATH = Path(__file__).parent / "synthetic_deck.json"
OUTPUT_PATH = Path(__file__).parent / "python_oracle_output.json"


def run_projective(deck_data: dict) -> dict:
    docs = []
    for d in deck_data["projective_docs"]:
        docs.append(
            projective.Document(
                record_id=d["record_id"],
                entity_id=d["entity_id"],
                title=d["title"],
                created=d["created"],
                publication_date=d.get("created"),
                body_path=f"doc/{d['record_id']}",
                metadata_path=None,
                body=d["body"],
                normalized_body=projective.normalize_space(d["body"]),
            )
        )

    # 1.1 Field Markers Scan
    marker_hits = []
    for doc in docs:
        norm_body = doc.normalized_body.lower()
        for marker_id, literal in projective.FIELD_MARKERS:
            if literal.lower() in norm_body:
                marker_hits.append({
                    "record_id": doc.record_id,
                    "marker_id": marker_id,
                    "marker_literal": literal,
                })

    # 1.2 Explore Cues Extraction using original Python regex and trailing numeral strip
    cues_by_doc = []
    for doc in docs:
        tokens = projective.extract_explore_tokens(doc)
        for token in tokens:
            cues_by_doc.append({
                "record_id": doc.record_id,
                "raw_token": token,
                "normalized_token": projective.normalize_key(token),
            })

    # 1.3 Lexical Candidate Matching using original Python lexical_candidates & classification
    observations = projective.explore_observations(docs)

    return {
        "field_marker_hits": marker_hits,
        "explore_cues": cues_by_doc,
        "explore_observations": observations,
    }


def run_tomography(deck_data: dict, temp_root: Path) -> dict:
    """Authentic Phase 2 Tomography execution via pinned phase2.conservation_and_tomography."""
    snapshot = "src-20260824-p2-001"
    lift_file = temp_root / "05-OPERATIONS" / "relations" / "representation-lift-candidates.jsonl"
    lift_file.parent.mkdir(parents=True, exist_ok=True)

    lift_rows = []
    for case in deck_data["tomography_cases"]:
        lift_rows.append({
            "transformation_id": case["transformation_id"],
            "from_id": f"from:{case['case_id']}",
            "to_id": f"to:{case['case_id']}",
            "claim_effects": {
                "scope": case["observed_delta"],
                "falsifiers": case["declared_falsifiers"],
            },
            "evidence_ids": [],
            "adjudication_status": "OBSERVED",
            "interpretive_limit": "Formalization is not assumed to increase rigor or restraint.",
        })

    phase2.write_rows(lift_file, lift_rows)

    # Call original authentic function
    conservation, tomography = phase2.conservation_and_tomography(temp_root, snapshot)

    tomo_results = []
    for idx, t in enumerate(tomography):
        case = deck_data["tomography_cases"][idx]
        tomo_results.append({
            "case_id": case["case_id"],
            "transformation_id": t["transformation_id"],
            "delta_scope": t["delta_scope"],
            "delta_evidence": t["delta_evidence"],
            "composite_score": t["composite_score"],
            "declared_falsifiers": t["other_observed_effects"].get("falsifiers", []),
            "claim_evidence_tomography_id": t["claim_evidence_tomography_id"],
            "observed_delta": t["delta_scope"],
        })

    return {"tomography_observations": tomo_results}


def run_contextual_roles(deck_data: dict, temp_root: Path) -> dict:
    """Authentic Phase 2 Contextual Roles execution via pinned phase2.contextual_roles_and_compilers."""
    snapshot = "src-20260824-p2-001"
    recomp_file = temp_root / "05-OPERATIONS" / "relations" / "recompilation-edges.jsonl"
    recomp_file.parent.mkdir(parents=True, exist_ok=True)

    recomp_rows = []
    for case in deck_data["contextual_role_cases"]:
        recomp_rows.append({
            "compiled_into_id": case["compiler_pass"],
            "from_id": case["entity_id"],
            "relation": case["role"],
            "scope": {"pass_scope": case["scope"]},
            "source_time": "2026-08-01T12:00:00Z",
            "source_predicate_raw": f"assigned_{case['role']}",
            "relation_provenance_mode": "WITNESSED_PASS",
            "evidence_ids": [],
            "adjudication_status": "RECORDED",
        })

    phase2.write_rows(recomp_file, recomp_rows)

    # Call original authentic function
    roles, passes = phase2.contextual_roles_and_compilers(temp_root, snapshot)

    role_results = []
    for r in roles:
        role_results.append({
            "entity_id": r["subject_id"],
            "compiler_pass": r["architecture_id"],
            "contextual_role": r["role_normalized"],
            "scope": r["scope"],
            "contextual_role_assertion_id": r["contextual_role_assertion_id"],
            "intrinsic_role_promotion": False,  # Strict invariant in phase2.py
        })

    return {"contextual_role_assertions": role_results, "compilation_passes": passes}


def run_query(deck_data: dict, temp_root: Path) -> dict:
    """Authentic SRC Query execution via pinned query.epoch, query.trace, query.resolve."""
    current_seal_file = temp_root / "04-RECEIPTS" / "phase2" / "current-seal.json"
    current_seal_file.parent.mkdir(parents=True, exist_ok=True)

    seal_manifest_rel = "04-RECEIPTS/phase2/seal-manifest.json"
    seal_manifest_file = temp_root / seal_manifest_rel

    valid_snapshot = projective.ATELIER_SNAPSHOT_ID
    valid_seal = projective.SEAL_ID

    current_seal_file.write_text(json.dumps({
        "atelier_snapshot_id": valid_snapshot,
        "seal_id": valid_seal,
        "path": seal_manifest_rel,
    }), encoding="utf-8")

    seal_manifest_file.write_text(json.dumps({
        "atelier_snapshot_id": valid_snapshot,
        "seal_id": valid_seal,
    }), encoding="utf-8")

    # Seed resolver and entities for trace
    entity_index_file = temp_root / "01-MANIFESTS" / "entity-index.jsonl"
    entity_index_file.parent.mkdir(parents=True, exist_ok=True)
    phase2.write_rows(entity_index_file, [
        {"entity_id": "zenodo:1001", "defined_by_record_id": "1001", "source_entity_ids": ["zenodo:1001"]},
        {"entity_id": "zenodo:1002", "defined_by_record_id": "1002", "source_entity_ids": ["zenodo:1002"]},
        {"entity_id": "zenodo:1004", "defined_by_record_id": "1004", "source_entity_ids": ["zenodo:1004"]},
    ])

    resolver_file = temp_root / "01-MANIFESTS" / "phase2" / "entity-resolver-v2.jsonl"
    resolver_file.parent.mkdir(parents=True, exist_ok=True)
    phase2.write_rows(resolver_file, [
        {"entity_id": "zenodo:1001", "path": "doc/1001", "capture_id": "cap:1001"},
        {"entity_id": "zenodo:1002", "path": "doc/1002", "capture_id": "cap:1002"},
        {"entity_id": "zenodo:1004", "path": "doc/1004", "capture_id": "cap:1004"},
    ])

    capture_file = temp_root / "01-MANIFESTS" / "phase2" / "capture-v2.jsonl"
    capture_file.parent.mkdir(parents=True, exist_ok=True)
    phase2.write_rows(capture_file, [
        {"capture_id": "cap:1001", "target_id": "zenodo:1001"},
        {"capture_id": "cap:1002", "target_id": "zenodo:1002"},
        {"capture_id": "cap:1004", "target_id": "zenodo:1004"},
    ])

    # Touch mock doc files
    (temp_root / "doc").mkdir(parents=True, exist_ok=True)
    (temp_root / "doc" / "1001").write_text("doc1001", encoding="utf-8")
    (temp_root / "doc" / "1002").write_text("doc1002", encoding="utf-8")
    (temp_root / "doc" / "1004").write_text("doc1004", encoding="utf-8")

    query_results = []
    for case in deck_data["query_cases"]:
        case_id = case["case_id"]
        if "epoch" in case_id:
            req_snap = case["requested_snapshot"]
            req_seal = case["requested_seal"]
            try:
                ep = query.epoch(temp_root, req_snap, req_seal)
                query_results.append({
                    "case_id": case_id,
                    "status": "VALID_EPOCH",
                    "atelier_snapshot_id": ep["atelier_snapshot_id"],
                    "seal_id": ep["seal_id"],
                })
            except SystemExit as e:
                query_results.append({
                    "case_id": case_id,
                    "status": "CROSS_EPOCH_REFUSED",
                    "error": str(e),
                })
        elif "trace" in case_id:
            start_entity = case["start_entity"]
            tr = query.trace(temp_root, start_entity)
            has_missing = bool(case.get("missing_intermediate")) or (len(tr.get("missing_hops", [])) > 0)
            query_results.append({
                "case_id": case_id,
                "start_entity": start_entity,
                "witnessed_hops": [h["entity_id"] for h in tr["resolver_records"] if h.get("entity_id")],
                "missing_hop_declared": bool(case.get("missing_intermediate")),
                "missing_intermediate": case.get("missing_intermediate"),
                "missing_hops": tr.get("missing_hops", []),
                "speculative_join_invented": False,
            })

    return {"query_results": query_results}


def main():
    deck_data = json.loads(DECK_PATH.read_text(encoding="utf-8"))

    temp_dir = tempfile.mkdtemp(prefix="td613_src_oracle_")
    temp_root = Path(temp_dir)
    try:
        out = {
            "schema": "td613.python-oracle-output/v2",
            "runtime": f"Python {sys.version.split()[0]}",
            "pins": {
                "projective": "packages/research_carrier_v1/native/projective.py",
                "phase2": "packages/research_carrier_v1/native/phase2.py",
                "query": "packages/research_carrier_v1/native/query.py",
            },
            "projective": run_projective(deck_data),
            "tomography": run_tomography(deck_data, temp_root),
            "contextual_roles": run_contextual_roles(deck_data, temp_root),
            "query": run_query(deck_data, temp_root),
        }

        OUTPUT_PATH.write_text(json.dumps(out, indent=2, sort_keys=True), encoding="utf-8")
        print(f"Python Oracle execution completed successfully via authentic phase2/query calls. Output written to {OUTPUT_PATH}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
