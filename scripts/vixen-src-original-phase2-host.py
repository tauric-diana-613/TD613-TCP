#!/usr/bin/env python3
"""Bounded Vixen host replay of ORIGINAL SRC Phase II functions.

The unmodified original build-phase2-assays.py supplies the executed compiler,
evidence-interface, conservation and tomography functions. Ephemeral input
registries are explicitly Vixen host constructions; they are not historical SRC
assertions. No original estate is written, sealed, imported or reclassified.
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
ORIGINAL = ROOT / "packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/build-phase2-assays.py"
WID = re.compile(r"emwork_[0-9a-f]{24}\Z")
SID = re.compile(r"emsrc_[0-9a-f]{24}\Z")
DIGEST = re.compile(r"[0-9a-f]{64}\Z")
SNAPSHOT = "VIXEN_HOST_UNSEALED_SOURCE_COMPARISON"
COMPILER = "05-OPERATIONS/relations/compiler-input-candidates.jsonl"
LIFTS = "05-OPERATIONS/relations/representation-lift-candidates.jsonl"
DERIVATIVES = "01-MANIFESTS/phase2/derivative-v1.jsonl"


def hashbytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def original_phase2():
    original_bytes = ORIGINAL.read_bytes()
    spec = importlib.util.spec_from_file_location("src_phase2_original_for_vixen", ORIGINAL)
    if spec is None or spec.loader is None:
        raise ValueError("HELD_SRC_PHASE2_ORIGINAL_UNAVAILABLE")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    for name in ("contextual_roles_and_compilers", "conservation_and_tomography", "evidence_interfaces"):
        if not callable(getattr(module, name, None)):
            raise ValueError("HELD_SRC_PHASE2_ENTRYPOINT_MISSING")
    return module, hashbytes(original_bytes)


def validate(packet):
    if not isinstance(packet, dict) or set(packet) != {"query", "catalogue", "selected"}:
        raise ValueError("HELD_PHASE2_PACKET_SCHEMA")
    query = packet["query"]
    if not isinstance(query, str) or not 9 <= len(query) <= 240 or not query.startswith("Explore "):
        raise ValueError("HELD_PHASE2_QUERY")
    catalogue = packet["catalogue"]
    selected = packet["selected"]
    if not isinstance(catalogue, list) or len(catalogue) != 32:
        raise ValueError("HELD_PHASE2_CATALOGUE_CENSUS")
    if not isinstance(selected, list) or len(selected) != 2:
        raise ValueError("HELD_PHASE2_SELECTED_PAIR")
    members, source_to_work = {}, {}
    for work in catalogue:
        if not isinstance(work, dict) or set(work) != {"work_id", "title", "protocols", "linked_sources"}:
            raise ValueError("HELD_PHASE2_WORK_SCHEMA")
        wid, title = work["work_id"], work["title"]
        if not isinstance(wid, str) or not WID.fullmatch(wid) or wid in members:
            raise ValueError("HELD_PHASE2_WORK_IDENTITY")
        if not isinstance(title, str) or not title.strip() or len(title) > 500:
            raise ValueError("HELD_PHASE2_TITLE")
        methods = work["protocols"]
        if not isinstance(methods, list) or any(not isinstance(x, str) or len(x) > 150 for x in methods):
            raise ValueError("HELD_PHASE2_PROTOCOLS")
        manifestations = work["linked_sources"]
        if not isinstance(manifestations, list):
            raise ValueError("HELD_PHASE2_SOURCE_ARRAY")
        sources = {}
        for row in manifestations:
            if not isinstance(row, dict) or set(row) != {"source_file_id", "original_sha256"}:
                raise ValueError("HELD_PHASE2_SOURCE_SCHEMA")
            sid, original_sha = row["source_file_id"], row["original_sha256"]
            if (not isinstance(sid, str) or not SID.fullmatch(sid) or sid in source_to_work
                    or not isinstance(original_sha, str) or not DIGEST.fullmatch(original_sha)):
                raise ValueError("HELD_PHASE2_SOURCE_IDENTITY")
            sources[sid] = original_sha
            source_to_work[sid] = wid
        members[wid] = {"title": title, "protocols": methods, "sources": sources}
    if len(source_to_work) != 53:
        raise ValueError("HELD_PHASE2_MANIFESTATION_CENSUS")
    verified, seen = [], set()
    for item in selected:
        if not isinstance(item, dict) or set(item) != {
            "work_id", "source_file_id", "original_sha256", "derivative_sha256", "body"
        }:
            raise ValueError("HELD_PHASE2_SELECTED_SCHEMA")
        wid, sid = item["work_id"], item["source_file_id"]
        body, digest = item["body"], item["derivative_sha256"]
        if (not isinstance(wid, str) or wid not in members or wid in seen
                or not isinstance(sid, str)
                or members[wid]["sources"].get(sid) != item["original_sha256"]
                or not isinstance(digest, str) or not DIGEST.fullmatch(digest)
                or not isinstance(body, str) or len(body) > 400000
                or hashbytes(body.encode("utf-8")) != digest):
            raise ValueError("HELD_PHASE2_SELECTED_DERIVATIVE_DIGEST")
        seen.add(wid)
        verified.append({"work_id": wid, "source_file_id": sid,
                         "original_sha256": item["original_sha256"],
                         "derivative_sha256": digest, "body": body,
                         "title": members[wid]["title"],
                         "recorded_protocols": members[wid]["protocols"]})
    return members, verified


def materialize(verified):
    compiler_candidates, lift_candidates, derivative_records = [], [], []
    for i, entry in enumerate(verified):
        wid, sid = entry["work_id"], entry["source_file_id"]
        digest = entry["derivative_sha256"]
        body = entry["body"]
        title = entry["title"]
        body_terms = set(re.findall(r"\w+", body.casefold()))
        title_terms = set(re.findall(r"\w+", title.casefold()))
        removed_terms = len(body_terms - title_terms)
        # Reader contexts are experimental, never evidence of an original historical compiler.
        compiler_candidates.append({
            "compiler_candidate_id": "vixen-host:reader-source:" + sid,
            "compiler_id": "vixen-host:reader-source-context",
            "input_slots": [
                {"slot": "REGISTERED_WORK_ID", "candidate_ids": [wid], "resolution": "UNRESOLVED"},
                {"slot": "VERIFIED_DERIVATIVE", "candidate_ids": [sid], "resolution": "UNRESOLVED"},
            ],
            "source_predicate_raw": "HOST_CONSTRUCTED_READING_CONTEXT_NOT_HISTORICAL_COMPILATION",
            "relation_provenance_mode": "VIXEN_HOST_HYPOTHESIS",
            "evidence_ids": [],
            "interpretive_limit": "A reading route proposes candidate inputs; it cannot witness historical compiler membership.",
            "origin": "VIXEN_HOST_EXPERIMENTAL",
        })
        compiler_candidates.append({
            "compiler_candidate_id": "vixen-host:reader-comparison:" + sid,
            "compiler_id": "vixen-host:reader-comparison-context",
            "input_slots": [{"slot": "COMPARATIVE_WORK", "candidate_ids": [wid], "resolution": "UNRESOLVED"}],
            "source_predicate_raw": "HOST_CONSTRUCTED_COMPARATIVE_CONTEXT_NOT_HISTORICAL_COMPILATION",
            "relation_provenance_mode": "VIXEN_HOST_HYPOTHESIS",
            "evidence_ids": [],
            "interpretive_limit": "Comparison context is a proposed interpretive role, never a historical compiler fact.",
            "origin": "VIXEN_HOST_EXPERIMENTAL",
        })
        lift_candidates.append({
            "transformation_id": "vixen-host:derivative-to-title:" + sid,
            "from_id": "vixen:verified-derivative:" + digest,
            "to_id": "vixen:catalogue-title:" + wid,
            "claim_effects": {
                "scope": "NARROWED" if removed_terms else "UNKNOWN",
                "semantic_core": "UNKNOWN",
                "falsifiers": "UNKNOWN",
                "source_representation": "SHA_VERIFIED_READABLE_DERIVATIVE",
                "target_representation": "CATALOGUE_TITLE_PROJECTION",
                "source_utf8_bytes": len(body.encode("utf-8")),
                "title_utf8_bytes": len(title.encode("utf-8")),
                "source_unique_terms_absent_from_title": removed_terms,
                "source_body_sha256": digest,
            },
            "evidence_ids": [digest],
            "adjudication_status": "VIXEN_REPRESENTATION_PROJECTION_OBSERVED",
            "interpretive_limit": "Narrowed readable vocabulary only; semantic preservation, authority, historical transformation and falsifier gains remain UNKNOWN.",
            "origin": "VIXEN_HOST_COMPUTED_REPRESENTATION",
        })
        derivative_records.append({
            "derivative_id": "vixen:verified-readable:" + sid,
            "capture_id": None,
            "parameters": {"body_text_sha256": digest},
            "output_sha256": digest,
            "source_estate": "VIXEN",
        })
    return {
        COMPILER: compiler_candidates,
        LIFTS: lift_candidates,
        DERIVATIVES: derivative_records,
    }


def write_temp_tables(root: Path, tables):
    sha = {}
    for relative, rows in tables.items():
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        encoded = "".join(json.dumps(row, sort_keys=True, ensure_ascii=False) + "\n"
                          for row in rows).encode("utf-8")
        target.write_bytes(encoded)
        sha[relative] = hashbytes(encoded)
    return sha


def execute(packet):
    members, verified = validate(packet)
    original, original_hash = original_phase2()
    tables = materialize(verified)
    with TemporaryDirectory(prefix="vixen-original-phase2-") as temporary:
        base = Path(temporary)
        registry_sha256 = write_temp_tables(base, tables)
        roles, compilers = original.contextual_roles_and_compilers(base, SNAPSHOT)
        conservation, tomography = original.conservation_and_tomography(base, SNAPSHOT)
        evidence_units, evidence_lineage = original.evidence_interfaces(base, SNAPSHOT)
        # Adverse control: withdraw only the hypothetical comparison compiler.
        control_tables = {key: list(value) for key, value in tables.items()}
        control_tables[COMPILER] = [
            row for row in tables[COMPILER]
            if row["compiler_id"] != "vixen-host:reader-comparison-context"
        ]
        control_root = base / "context-withdrawal-negative-control"
        write_temp_tables(control_root, control_tables)
        withdrawn_roles, withdrawn_compilers = original.contextual_roles_and_compilers(control_root, SNAPSHOT)
        # Directional control: inverse text projection is representationally expanded,
        # without implying any improvement in evidence or historical legitimacy.
        reverse_tables = {key: list(value) for key, value in tables.items()}
        inverse = []
        for lift in tables[LIFTS]:
            inverse.append({
                **lift,
                "transformation_id": "inverse-control:" + lift["transformation_id"],
                "from_id": lift["to_id"], "to_id": lift["from_id"],
                "claim_effects": {
                    **lift["claim_effects"],
                    "scope": "EXPANDED" if lift["claim_effects"]["source_unique_terms_absent_from_title"] else "UNKNOWN",
                    "source_representation": "CATALOGUE_TITLE_PROJECTION",
                    "target_representation": "SHA_VERIFIED_READABLE_DERIVATIVE",
                },
                "origin": "VIXEN_HOST_COUNTERFACTUAL_REPRESENTATION",
                "adjudication_status": "SYNTHETIC_DIRECTIONAL_CONTROL",
            })
        reverse_tables[LIFTS] = inverse
        reverse_root = base / "inverse-lift-negative-control"
        write_temp_tables(reverse_root, reverse_tables)
        inverse_conservation, inverse_tomography = original.conservation_and_tomography(reverse_root, SNAPSHOT)

    if not all(row["role_normalized"] == "CANDIDATE_INPUT" and
               row["adjudication_status"] == "UNRESOLVED" for row in roles):
        raise ValueError("HELD_PHASE2_CONTEXT_ROLE_PROMOTION")
    if len(roles) != 6 or len(compilers) != 2:
        raise ValueError("HELD_PHASE2_CONTEXT_COMPILER_COUNT")
    if len(withdrawn_roles) != 4 or len(withdrawn_compilers) != 1:
        raise ValueError("HELD_PHASE2_CONTEXT_WITHDRAWAL")
    if len(tomography) != 2 or len(conservation) != 2:
        raise ValueError("HELD_PHASE2_TOMOGRAPHY_COUNT")
    if any(row["delta_evidence"] != "UNKNOWN" or row["delta_asserted_authority"] != "UNKNOWN"
           or row["composite_score"] is not None for row in tomography + inverse_tomography):
        raise ValueError("HELD_PHASE2_FALSE_EPISTEMIC_LIFT")
    if len(evidence_units) != 2 or evidence_lineage:
        # Different derivative hashes alone do not prove empirical independence.
        raise ValueError("HELD_PHASE2_FINGERPRINT_COUNTS")

    return {
        "schema": "td613.vixen.original-src-phase2-host/v1",
        "native_python_executed": True,
        "original_method": "build-phase2-assays.py",
        "original_method_sha256": original_hash,
        "executed_original_functions": [
            "contextual_roles_and_compilers", "conservation_and_tomography", "evidence_interfaces"
        ],
        "input_estate": "VIXEN",
        "method_estate": "SRC",
        "original_src_historical_registries_used": False,
        "source_representations": "SHA_VERIFIED_DERIVATIVE_TO_CATALOGUE_TITLE",
        "ephemeral_registry_class": "HOST_DERIVED_VIXEN_UNSEALED_NOT_HISTORICAL_SRC",
        "ephemeral_registry_sha256": registry_sha256,
        "catalogue_work_count": len(members),
        "manifestation_count": sum(len(w["sources"]) for w in members.values()),
        "source_proofs": [
            {k: item[k] for k in ("work_id", "source_file_id", "original_sha256", "derivative_sha256")}
            for item in verified
        ],
        "selected_recorded_protocols": [
            {"work_id": item["work_id"], "registered_methods": item["recorded_protocols"],
             "historical_compiler_role_observed": False}
            for item in verified
        ],
        "observed_evidence_units": evidence_units,
        "identical_derivative_hash_lineage": evidence_lineage,
        "contextual_roles": roles,
        "compilation_passes": compilers,
        "conservation": conservation,
        "tomography": tomography,
        "controls": {
            "withdraw_hypothetical_comparison_context": {
                "role_count": len(withdrawn_roles),
                "compiler_count": len(withdrawn_compilers),
                "retained_roles": withdrawn_roles,
                "historical_compiler_effect_proven": False,
            },
            "inverse_representation_direction": {
                "conservation": inverse_conservation,
                "tomography": inverse_tomography,
                "evidence_authority_delta_remains_unknown": True,
            },
        },
        "operator_query": {
            "question": packet["query"],
            "query_used_as_source_text": False,
            "query_role": "PROPOSED_INVESTIGATION_ONLY",
        },
        "original_historical_compilation_proven": False,
        "actual_vixen_representation_projection_executed": True,
        "original_source_corpus_imported": False,
        "original_full_atelier_parity": "HELD_UNPROVEN",
        "scientific_credit": 0,
        "human_closure_required": True,
    }


def main():
    raw = sys.stdin.buffer.read(1_200_001)
    if len(raw) > 1_200_000:
        raise ValueError("HELD_PHASE2_PACKET_OVERSIZE")
    print(json.dumps(execute(json.loads(raw)), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
