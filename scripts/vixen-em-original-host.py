#!/usr/bin/env python3
"""Vixen host replay of unchanged TD613-derived Em source-span and identity controls.

Neither original Em prose nor original Em authorial code is imported into Vixen.
The *original TD613 archival control executables* run against a deliberately
ephemeral register derived from Vixen's own verified Work derivatives.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
METHOD_ROOT = HERE / "packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN"
MOTIF = METHOD_ROOT / "em-motif-mechanism-control-v1.py"
IDENTITY = METHOD_ROOT / "em-identity-sensitivity-v1.py"
WORK = re.compile(r"emwork_[0-9a-f]{24}\Z")
SOURCE = re.compile(r"emsrc_[0-9a-f]{24}\Z")
SHA = re.compile(r"[0-9a-f]{64}\Z")
STATES = {"SINGLETON_WORK_SURFACE", "SAME_WORK_CONFIRMED", "SAME_WORK_SUPPORTED"}


def need(test, message):
    if not test:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def import_original(path, name, method):
    need(path.is_file() and not path.is_symlink(), "HELD_EM_NATIVE_METHOD_MISSING")
    spec = importlib.util.spec_from_file_location(name, path)
    need(spec is not None and spec.loader is not None, "HELD_EM_NATIVE_METHOD_IMPORT")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    need(callable(getattr(module, method, None)), "HELD_EM_NATIVE_ENTRYPOINT_MISSING")
    return module, digest(path.read_bytes())


def validate(packet):
    need(isinstance(packet, dict) and set(packet) == {"schema", "catalogue", "selected"},
         "HELD_EM_HOST_PACKET_SCHEMA")
    need(packet["schema"] == "td613.vixen.em-original-host-input/v1", "HELD_EM_HOST_SCHEMA")
    works = packet["catalogue"]
    selected = packet["selected"]
    need(isinstance(works, list) and len(works) == 32, "HELD_EM_WORK_CENSUS")
    need(isinstance(selected, list) and len(selected) == 2, "HELD_EM_SELECTED_PAIR")
    all_work_ids, all_source_ids, gated = set(), set(), 0
    checked_works = []
    by_work = {}
    for work in works:
        need(isinstance(work, dict) and set(work) == {
            "work_id", "identity_status", "human_gate_required",
            "manifestation_source_file_ids", "minimum_independent_work_contribution",
            "maximum_independent_work_contribution", "original_sources"
        }, "HELD_EM_WORK_REGISTER_SCHEMA")
        wid = work["work_id"]
        members = work["manifestation_source_file_ids"]
        status = work["identity_status"]
        gate = work["human_gate_required"]
        lo, hi = work["minimum_independent_work_contribution"], work["maximum_independent_work_contribution"]
        original = work["original_sources"]
        need(isinstance(wid, str) and WORK.fullmatch(wid) and wid not in all_work_ids,
             "HELD_EM_WORK_DUPLICATE_OR_UNREGISTERED")
        need(isinstance(members, list) and members and
             all(isinstance(x, str) and SOURCE.fullmatch(x) for x in members) and
             len(members) == len(set(members)) and not all_source_ids.intersection(members),
             "HELD_EM_MANIFESTATION_PARTITION")
        need(isinstance(original, dict) and set(original) == set(members) and
             all(isinstance(k, str) and SHA.fullmatch(v) for k,v in original.items()),
             "HELD_EM_ORIGINAL_SOURCE_DIGEST_REGISTRY")
        need(status in STATES and type(gate) is bool, "HELD_EM_IDENTITY_CLASS")
        if status == "SAME_WORK_SUPPORTED":
            need(gate and len(members) == 2 and (lo, hi) == (1,2),
                 "HELD_EM_HUMAN_GATE_NOT_RESOLVED")
            gated += 1
        elif status == "SINGLETON_WORK_SURFACE":
            need(not gate and len(members) == 1 and (lo, hi) == (1,1),
                 "HELD_EM_SINGLETON_IDENTITY_DRIFT")
        else:
            need(not gate and lo == 1 and hi == 1, "HELD_EM_CONFIRMED_IDENTITY_DRIFT")
        all_work_ids.add(wid)
        all_source_ids.update(members)
        by_work[wid] = work
        checked_works.append({
            "work_id":wid, "identity_status":status,
            "manifestation_source_file_ids":members,
            "human_gate_required":gate,
            "minimum_independent_work_contribution":lo,
            "maximum_independent_work_contribution":hi
        })
    need(len(all_source_ids) == 53 and gated == 8, "HELD_EM_MANIFESTATION_OR_GATE_CENSUS")
    seen=set()
    proof=[]
    for s in selected:
        need(isinstance(s,dict) and set(s)=={
            "work_id", "source_file_id", "declared_original_source_sha256",
            "verified_derivative_sha256", "body"
        }, "HELD_EM_SELECTED_PROOF_SCHEMA")
        wid, sid, body = s["work_id"], s["source_file_id"], s["body"]
        need(wid in by_work and wid not in seen, "HELD_EM_SELECTED_WORK_UNREGISTERED")
        need(sid in by_work[wid]["original_sources"] and
             by_work[wid]["original_sources"][sid] == s["declared_original_source_sha256"],
             "HELD_EM_SELECTED_MANIFESTATION_MISMATCH")
        need(isinstance(body,str) and 16 <= len(body) <= 400000 and
             SHA.fullmatch(s["verified_derivative_sha256"]) and
             digest(body.encode("utf8")) == s["verified_derivative_sha256"],
             "HELD_EM_DERIVATIVE_BYTES_UNVERIFIED")
        seen.add(wid)
        proof.append((s,body.encode("utf8")))
    return checked_works, proof


def prefix_span(body):
    # This is a deterministic locator, not evidence of user reading or motif
    # interpretation. Choose the first complete UTF-8 codepoints.
    raw = body[:min(160,len(body))]
    while raw:
        try:
            raw.decode("utf8")
            break
        except UnicodeDecodeError:
            raw=raw[:-1]
    need(len(raw)>=12,"HELD_EM_SOURCE_SPAN_TOO_SHORT")
    return raw


def run(packet):
    works, source_proofs = validate(packet)
    firewall, firewall_hash = import_original(MOTIF,"em_vixen_original_firewall","assess")
    sensitivity, sensitivity_hash = import_original(IDENTITY,"em_vixen_restored_sensitivity","qualify")
    spans=[]
    observed={}
    for s,raw in source_proofs:
        sid=s["source_file_id"]
        piece=prefix_span(raw)
        expected=digest(raw)
        locator={"source_id":sid,"sha256":expected,"byte_offset":0,
                 "length_utf8":len(piece),"span_sha256":digest(piece)}
        actual=firewall.assess({"spans":[locator]},{sid:raw})
        need(actual["classification"]=="MOTIF_MATCH" and
             actual.get("mechanism_supported") is False and
             actual.get("automatic_promotion") is False,
             "HELD_EM_MOTIF_PROMOTED")
        altered=raw + b"intentional-auditor-contamination"
        try:
            firewall.assess({"spans":[locator]},{sid:altered})
        except ValueError as exc:
            need("EM_SOURCE_ANATOMY_DIGEST_MISMATCH" in str(exc),
                 "HELD_EM_WRONG_HOSTILE_REFUSAL")
        else:
            raise ValueError("HELD_EM_TAMPER_NOT_REJECTED")
        spans.append({
            "work_id":s["work_id"],"source_file_id":sid,
            "declared_original_source_sha256":s["declared_original_source_sha256"],
            "verified_derivative_sha256":s["verified_derivative_sha256"],
            "utf8_offset":0,"utf8_length":len(piece),"span_sha256":digest(piece),
            "original_firewall_returned":actual["classification"],
            "source_digest_mutation_rejected":True,
            "exact_source_locator_not_operator_citation":True
        })
        observed[sid]=True
    identity_result=sensitivity.qualify(works,occurrence=observed,minimum_support=3)
    need(identity_result["partition_count"]==256 and
         identity_result["work_count_lower"]==32 and
         identity_result["work_count_upper"]==40 and
         identity_result["threshold_classification"]=="IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED" and
         identity_result["human_gates_resolved"] is False and
         identity_result["scientific_classification_promoted"] is False,
         "HELD_EM_IDENTITY_CONTROL_NOT_ADVERSE")
    return {
        "schema":"td613.vixen.em-original-controls-execution/v1",
        "source_regime":"VIXEN_EXPERIMENT_A_VERIFIED_DERIVATIVES_NOT_HISTORICAL_EM_ORIGINAL_BYTES",
        "original_author_executable_present":False,
        "method_creator":"TD613_DERIVED_NATIVE_RESEARCH_CONTROLS",
        "unchanged_firewall_path":MOTIF.relative_to(HERE).as_posix(),
        "unchanged_firewall_sha256":firewall_hash,
        "restored_identity_path":IDENTITY.relative_to(HERE).as_posix(),
        "restored_identity_sha256":sensitivity_hash,
        "original_control_python_executed":True,
        "vixen_work_count":len(works),
        "vixen_manifestation_count":sum(len(w["manifestation_source_file_ids"]) for w in works),
        "human_gated_work_count":sum(w["human_gate_required"] for w in works),
        "source_span_witnesses":spans,
        "identity_sensitivity":{
            "partition_count":identity_result["partition_count"],
            "work_count_lower":identity_result["work_count_lower"],
            "work_count_upper":identity_result["work_count_upper"],
            "support_lower":identity_result["support_lower"],
            "support_upper":identity_result["support_upper"],
            "threshold_classification":identity_result["threshold_classification"],
            "non_selected_manifestations_status":"ABSENT_UNOBSERVED_NOT_NEGATIVE",
            "all_256_results_computed_but_not_auto_admitted":True
        },
        "motif_match_is_not_proven_motif":True,
        "motif_is_not_mechanism":True,
        "original_em_author_intent_inferred":False,
        "foreign_source_bodies_imported":0,
        "original_source_registry_bytes_authenticated_by_this_program":False,
        "human_identity_gates_resolved":False,
        "comparative_lineage_proven":False,
        "scientific_credit":0,"research_release_authority":False,
        "full_native_method_equivalence":"HELD_UNPROVEN",
        "human_closure_required":True
    }


if __name__ == "__main__":
    try:
        packet=json.load(sys.stdin)
        print(json.dumps(run(packet),ensure_ascii=False,separators=(",",":")))
    except Exception as exc:
        print(json.dumps({"state":"HELD","reason":str(exc)[:250]},ensure_ascii=False),file=sys.stderr)
        sys.exit(2)
