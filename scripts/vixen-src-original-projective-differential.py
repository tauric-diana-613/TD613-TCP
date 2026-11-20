#!/usr/bin/env python3
"""Bounded replay of original SRC projective functions on Vixen source derivatives.

Input comes from the independently verified Vixen body reader. This program
imports the original SRC algorithm module as executable code, never its archive
documents. All outputs are advisory and have no publication authority.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

def main():
    raw = sys.stdin.buffer.read(1200001)
    if len(raw) > 1200000:
        raise ValueError("HELD_OVERSIZE_NATIVE_INPUT")
    packet = json.loads(raw)
    if not isinstance(packet, dict) or set(packet) != {"documents", "query"}:
        raise ValueError("HELD_NATIVE_INPUT_SCHEMA")
    rows, query = packet["documents"], packet["query"]
    if not isinstance(rows, list) or len(rows) != 2:
        raise ValueError("HELD_DISTINCT_VIXEN_PAIR_REQUIRED")
    if not isinstance(query, str) or not query.startswith("Explore ") or len(query) > 240:
        raise ValueError("HELD_NATIVE_OPERATOR_QUERY")
    source = (Path(__file__).resolve().parents[1] /
        "packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/run-projective-routing-grammar-assay.py")
    method_sha256 = hashlib.sha256(source.read_bytes()).hexdigest()
    spec = importlib.util.spec_from_file_location("src_original_projective_vixen", source)
    if spec is None or spec.loader is None:
        raise ValueError("HELD_SRC_ORIGINAL_METHOD_MISSING")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    docs, manifests, seen = [], [], set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != {
            "record_id", "title", "body", "body_sha256", "created"
        }:
            raise ValueError("HELD_VIXEN_DERIVATIVE_INPUT_SHAPE")
        rid, title, body, digest = (
            row["record_id"], row["title"], row["body"], row["body_sha256"]
        )
        if (not isinstance(rid, str) or not rid.startswith("emwork_")
            or rid in seen or not isinstance(title, str) or not 0 < len(title) <= 500
            or not isinstance(body, str) or len(body) > 400000
            or not isinstance(digest, str)
            or hashlib.sha256(body.encode("utf8")).hexdigest() != digest):
            raise ValueError("HELD_NATIVE_VIXEN_SOURCE_INTEGRITY")
        if row["created"] is not None and not isinstance(row["created"], str):
            raise ValueError("HELD_NATIVE_DATE_SHAPE")
        seen.add(rid)
        docs.append(module.Document(
            record_id=rid, entity_id=rid, title=title, created=row["created"],
            publication_date=None, body_path="VIXEN_DERIVATIVE_ONLY",
            metadata_path=None, body=body, normalized_body=module.normalize_space(body)
        ))
        manifests.append({"work_id": rid, "sha256": digest})
    observations = module.explore_observations(docs)
    edges = sorted([
        "|".join((obs["source_id"], obs["normalized_token"],
                  hit["target_id"], hit["match_kind"], hit["temporal_relation"]))
        for obs in observations for hit in obs["machine_candidates"]
    ])
    # The operator query is a separate synthetic control, not found manuscript prose.
    probe = module.lexical_candidates(query[8:].rstrip(" .!?"), docs[0], docs)
    print(json.dumps({
        "schema": "td613.vixen.src-original-python-replay/v1",
        "native_python_executed": True,
        "original_method_sha256": method_sha256,
        "executed_functions": ["explore_observations", "lexical_candidates"],
        "verified_vixen_derivatives": manifests,
        "real_body_observation_count": len(observations),
        "real_body_edge_count": len(edges),
        "real_body_edges": edges[:64],
        "real_body_edges_truncated": len(edges) > 64,
        "operator_query_probe": {
            "evidence_class": "SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT",
            "candidates": [
                {"work_id": hit["target_id"], "match_type": hit["match_kind"]}
                for hit in probe
            ]
        },
        "original_src_archive_loaded": False,
        "authorship_promotion": False,
        "scientific_credit": 0,
        "empirical_replication_credit": 0
    }, sort_keys=True, ensure_ascii=False))

if __name__ == "__main__":
    main()
