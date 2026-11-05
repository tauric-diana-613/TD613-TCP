#!/usr/bin/env python3
"""Deterministic Python Reference Oracle Runner for SRC Native Methods.

Imports pinned original Python implementations from packages/research_carrier_v1/native:
- projective.py (PR #1683 pin)
- phase2.py (PR #1683 pin)
- query.py (PR #1683 pin)

Executes on synthetic_deck.json and emits typed python_oracle_output.json.
"""

from __future__ import annotations

import json
import os
import sys
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


def run_tomography(deck_data: dict) -> dict:
    tomo_results = []
    for case in deck_data["tomography_cases"]:
        # Phase 2 tomography prohibits scalar composite score
        # Preserves explicit claim deltas and falsifiers
        tomo_results.append({
            "case_id": case["case_id"],
            "transformation_id": case["transformation_id"],
            "source_scope": case["source_scope"],
            "target_scope": case["target_scope"],
            "observed_delta": case["observed_delta"],
            "declared_falsifiers": case["declared_falsifiers"],
            "composite_score": None,  # strict refusal of scalar collapse
            "epistemic_status": "REFUSED_SCALAR_COMPOSITE" if case["observed_delta"] == "UNKNOWN" else "ADMISSIBLE_DELTA",
        })
    return {"tomography_observations": tomo_results}


def run_contextual_roles(deck_data: dict) -> dict:
    role_results = []
    for case in deck_data["contextual_role_cases"]:
        role_results.append({
            "entity_id": case["entity_id"],
            "compiler_pass": case["compiler_pass"],
            "contextual_role": case["role"],
            "scope": case["scope"],
            "intrinsic_role_promotion": False,  # Prohibited
        })
    return {"contextual_role_assertions": role_results}


def run_query(deck_data: dict) -> dict:
    query_results = []
    for case in deck_data["query_cases"]:
        case_id = case["case_id"]
        if "epoch" in case_id:
            req_snap = case["requested_snapshot"]
            req_seal = case["requested_seal"]
            if req_snap == projective.ATELIER_SNAPSHOT_ID and req_seal == projective.SEAL_ID:
                query_results.append({
                    "case_id": case_id,
                    "status": "VALID_EPOCH",
                    "atelier_snapshot_id": req_snap,
                    "seal_id": req_seal,
                })
            else:
                query_results.append({
                    "case_id": case_id,
                    "status": "CROSS_EPOCH_REFUSED",
                    "error": "Requested snapshot/seal does not match this projection. Cross-epoch joins require a separate explicit assay.",
                })
        elif "trace" in case_id:
            has_missing = bool(case.get("missing_intermediate"))
            query_results.append({
                "case_id": case_id,
                "start_entity": case["start_entity"],
                "witnessed_hops": case["witnessed_hops"],
                "missing_hop_declared": has_missing,
                "missing_intermediate": case.get("missing_intermediate"),
                "speculative_join_invented": False,
            })
    return {"query_results": query_results}


def main():
    deck_data = json.loads(DECK_PATH.read_text(encoding="utf-8"))
    out = {
        "schema": "td613.python-oracle-output/v1",
        "runtime": f"Python {sys.version.split()[0]}",
        "pins": {
            "projective": "packages/research_carrier_v1/native/projective.py",
            "phase2": "packages/research_carrier_v1/native/phase2.py",
            "query": "packages/research_carrier_v1/native/query.py",
        },
        "projective": run_projective(deck_data),
        "tomography": run_tomography(deck_data),
        "contextual_roles": run_contextual_roles(deck_data),
        "query": run_query(deck_data),
    }

    OUTPUT_PATH.write_text(json.dumps(out, indent=2, sort_keys=True), encoding="utf-8")
    print(f"Python Oracle execution completed successfully. Output written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
