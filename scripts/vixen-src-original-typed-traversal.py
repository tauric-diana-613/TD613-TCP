#!/usr/bin/env python3
"""Execute original SRC typed-evidence traversal against verified Vixen source coordinates.

The original SRC function runs unchanged. The three ephemeral registry files
are a bounded, explicitly adapted Vixen research graph, never SRC source data
and never a new relation admitted into Vixen's authorial corpus.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/src-evidence-rabbit-hole-v1.py"
WORK = re.compile(r"emwork_[0-9a-f]{24}\Z")
SOURCE = re.compile(r"emsrc_[0-9a-f]{24}\Z")
SHA = re.compile(r"[0-9a-f]{64}\Z")


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_original():
    source_bytes = ORIGINAL.read_bytes()
    spec = importlib.util.spec_from_file_location("src_original_vixen_typed_route", ORIGINAL)
    if spec is None or spec.loader is None:
        raise ValueError("HELD_ORIGINAL_SRC_TYPED_TRAVERSER_UNAVAILABLE")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    if not callable(getattr(mod, "explore", None)):
        raise ValueError("HELD_ORIGINAL_SRC_TYPED_TRAVERSER_MISSING")
    return mod, digest(source_bytes)


def verify_packet(packet):
    if not isinstance(packet, dict) or set(packet) != {"catalogue", "selected", "query"}:
        raise ValueError("HELD_TYPED_INPUT_SCHEMA")
    query = packet["query"]
    if not isinstance(query, str) or not 9 <= len(query) <= 240 or not query.startswith("Explore "):
        raise ValueError("HELD_TYPED_OPERATOR_QUERY")
    catalogue, selected = packet["catalogue"], packet["selected"]
    if not isinstance(catalogue, list) or len(catalogue) != 32 or not isinstance(selected, list) or len(selected) != 2:
        raise ValueError("HELD_TYPED_VIXEN_CENSUS_OR_PAIR")
    members = {}
    source_ids = set()
    count = 0
    for work in catalogue:
        if not isinstance(work, dict) or set(work) != {"work_id", "linked_sources"}:
            raise ValueError("HELD_TYPED_WORK_SCHEMA")
        wid, manifestations = work["work_id"], work["linked_sources"]
        if not isinstance(wid, str) or not WORK.fullmatch(wid) or wid in members:
            raise ValueError("HELD_TYPED_WORK_IDENTITY")
        if not isinstance(manifestations, list):
            raise ValueError("HELD_TYPED_MANIFESTATIONS")
        source_map = {}
        for source in manifestations:
            if not isinstance(source, dict) or set(source) != {"source_file_id", "original_sha256"}:
                raise ValueError("HELD_TYPED_SOURCE_SCHEMA")
            sid, original_hash = source["source_file_id"], source["original_sha256"]
            if (not isinstance(sid, str) or not SOURCE.fullmatch(sid) or sid in source_ids
                    or not isinstance(original_hash, str) or not SHA.fullmatch(original_hash)):
                raise ValueError("HELD_TYPED_SOURCE_IDENTITY")
            source_ids.add(sid)
            source_map[sid] = original_hash
            count += 1
        members[wid] = source_map
    if count != 53:
        raise ValueError("HELD_TYPED_VIXEN_MANIFESTATION_CENSUS")
    checked, seen = [], set()
    for row in selected:
        if not isinstance(row, dict) or set(row) != {
            "work_id", "source_file_id", "original_sha256", "derivative_sha256", "body"
        }:
            raise ValueError("HELD_TYPED_SELECTED_SCHEMA")
        wid, sid = row["work_id"], row["source_file_id"]
        original_hash, derivative_hash, body = (
            row["original_sha256"], row["derivative_sha256"], row["body"]
        )
        if (wid not in members or wid in seen or members[wid].get(sid) != original_hash
                or not isinstance(derivative_hash, str) or not SHA.fullmatch(derivative_hash)
                or not isinstance(body, str) or len(body) > 400000
                or digest(body.encode("utf-8")) != derivative_hash):
            raise ValueError("HELD_TYPED_SELECTED_DERIVATIVE_INTEGRITY")
        checked.append({"work_id": wid, "source_file_id": sid,
                        "derivative_sha256": derivative_hash})
        seen.add(wid)
    return members, checked


def execute(packet):
    members, checked = verify_packet(packet)
    original, method_sha = load_original()
    verified = {row["source_file_id"]: row for row in checked}
    edges = []
    for wid, manifestations in sorted(members.items()):
        for sid, original_sha in sorted(manifestations.items()):
            is_read = sid in verified
            edge = {
                "edge_id": "vixen-membership:" + digest((wid + ":" + sid).encode())[:20],
                "from_id": wid, "to_id": sid, "relation": "RECORDED_WORK_MANIFESTATION",
                "graph_kind": "DOCUMENTARY_MEMBERSHIP",
                "adjudication_status": "WITNESSED" if is_read else "UNRESOLVED",
                "evidence_ids": ([verified[sid]["derivative_sha256"]] if is_read else []),
                "origin": "VIXEN_CATALOGUE_HOST_DERIVED",
                "interpretive_limit": (
                    "A verified readable derivative and catalogue membership; "
                    "neither original-byte identity nor intellectual influence is proved."
                    if is_read else
                    "Recorded catalogue membership; original body unread in this execution."
                ),
            }
            edges.append(edge)
            if is_read:
                # A distinct derivative-digest coordinate tests genuine two-hop
                # provenance without inventing any work-to-work scholarly edge.
                edges.append({
                    "edge_id": "vixen-digest:" + digest(sid.encode())[:20],
                    "from_id": sid,
                    "to_id": "derivative-sha256:" + verified[sid]["derivative_sha256"],
                    "relation": "REHASHED_READABLE_DERIVATIVE",
                    "graph_kind": "DIGITAL_CUSTODY",
                    "adjudication_status": "WITNESSED",
                    "evidence_ids": [verified[sid]["derivative_sha256"]],
                    "origin": "VIXEN_EXPERIMENT_A_HOST_REHASH",
                    "interpretive_limit": (
                        "Cryptographic identity of this readable text derivative only; "
                        "not physical source-file or external-origin proof."
                    ),
                })
    with TemporaryDirectory(prefix="vixen-original-src-route-") as scratch:
        root = Path(scratch)
        records = {original.EDGE_PATH: edges, original.ROLE_PATH: [], original.MAP_PATH: []}
        registry_sha = {}
        for relative, rows in records.items():
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            data = "".join(json.dumps(row, sort_keys=True, ensure_ascii=False) + "\n"
                           for row in rows).encode("utf-8")
            path.write_bytes(data)
            registry_sha[relative] = digest(data)
        routes = []
        for row in checked:
            result = original.explore(root, row["work_id"], depth=2, limit=40)
            routes.append({
                "seed_work_id": row["work_id"],
                "source_file_id": row["source_file_id"],
                "original_function_result": result,
            })
    return {
        "schema": "td613.vixen.src-original-typed-traversal/v1",
        "original_python_executed": True,
        "original_function": "src-evidence-rabbit-hole-v1.py:explore",
        "original_method_sha256": method_sha,
        "input_estate": "VIXEN",
        "method_estate": "SRC",
        "ephemeral_registry_class": "VIXEN_HOST_DERIVED_NOT_ORIGINAL_SRC_REGISTRIES",
        "ephemeral_registry_sha256": registry_sha,
        "native_original_registry_used": False,
        "vixen_original_corpus_imported_to_src": False,
        "catalogue_work_count": len(members),
        "recorded_manifestation_count": sum(map(len, members.values())),
        "selected_verified_derivatives": checked,
        "operator_query_evidence_class": "SYNTHETIC_QUERY_NOT_MANUSCRIPT",
        "query_influenced_typed_traversal": False,
        "routes": routes,
        "typed_edges_constructed_from_catalogue": len(edges),
        "automatic_scholarly_relation_admission": False,
        "full_native_method_parity": "HELD_ADAPTED_INPUT_AND_UNTESTED_READER_ROUTES",
        "scientific_credit": 0,
        "human_closure_required": True,
    }


def main():
    raw = sys.stdin.buffer.read(1_200_001)
    if len(raw) > 1_200_000:
        raise ValueError("HELD_TYPED_INPUT_OVERSIZE")
    packet = json.loads(raw)
    print(json.dumps(execute(packet), sort_keys=True, ensure_ascii=False))


if __name__ == "__main__":
    main()
