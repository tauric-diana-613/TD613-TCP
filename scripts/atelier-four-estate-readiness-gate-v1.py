#!/usr/bin/env python3
"""Fail-closed four-Atelier parity and two-hop reciprocal-flight readiness gate.

An evidence packet is a reviewer-checked report of independent execution,
not a tool for conferring source-admission, transfer, experiment or release authority.
Passing this gate only makes a future flight candidate for separate human closure.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

ESTATES=("SRC","EMSTD613","WENDBINE","UNIVERSAL")
TESTS=("EXACT_SOURCE_RETRIEVAL","LEXICAL_SEARCH","VAGUE_TO_SPECIFIC_SEMANTIC",
       "INDEX_AND_MANIFESTATION","SOURCE_GROUNDED_CROSSWALK",
       "MULTI_STEP_EVIDENCE_ROUTE","IDENTITY_AND_NEGATIVE_FIXTURES",
       "HETEROSTRATIGRAPHIC_RESEARCH","PROVENANCE_AND_ORIGINAL_HASH")
ALLOWED=("VERIFIED_ON_REAL_CORPUS","FAILED","UNTESTED","HELD","SOURCE_FREE_ONLY")
HEAD=re.compile(r"^[0-9a-f]{40}$")
def check_report(packet):
    if not isinstance(packet,dict) or packet.get("schema")!="td613.atelier-four-estate-evidence/v1":
        raise ValueError("PARITY_EVIDENCE_PACKET_SCHEMA_REQUIRED")
    estates=packet.get("estates")
    if not isinstance(estates,dict) or set(estates)!=set(ESTATES):
        raise ValueError("FOUR_ESTATE_EVIDENCE_REQUIRED")
    missing={}
    summary={}
    for estate in ESTATES:
        row=estates[estate]
        if not isinstance(row,dict):raise ValueError("ESTATE_ROW_REQUIRED")
        commit=row.get("git_head")
        if not isinstance(commit,str) or not HEAD.fullmatch(commit):
            raise ValueError("EXACT_PINNED_HEAD_REQUIRED:"+estate)
        checks=row.get("checks")
        if not isinstance(checks,dict) or set(checks)!=set(TESTS):
            raise ValueError("COMPLETE_PARITY_CHECKSET_REQUIRED:"+estate)
        if any(status not in ALLOWED for status in checks.values()):
            raise ValueError("UNKNOWN_CHECK_STATUS:"+estate)
        pending=[test for test in TESTS if checks[test]!="VERIFIED_ON_REAL_CORPUS"]
        if row.get("original_source_count",0)<1:pending.append("ORIGINAL_CORPUS_NOT_PRESENT")
        if not row.get("human_reviewed_evidence_ids"):pending.append("NO_INDEPENDENT_REVIEWED_EVIDENCE")
        if row.get("forensic_source_origin_proven") is True and not row.get("external_origin_witness_id"):
            raise ValueError("UNSUPPORTED_SOURCE_ORIGIN_ASSERTION")
        missing[estate]=pending
        summary[estate]={"missing":pending,"real_source_count":row.get("original_source_count",0)}
    receiver=packet.get("receivers")
    if not isinstance(receiver,dict) or set(receiver)!={"UNIVERSAL_ENCYCLOPEDIA","UNIVERSAL_ATELIER"}:
        raise ValueError("BOTH_DISTINCT_EMPTY_RECEIVERS_REQUIRED")
    for dest,record in receiver.items():
        if not isinstance(record,dict) or record.get("empty_source_admission") is not True or \
           record.get("replayable_zero_source_receipt") is not True or \
           record.get("has_auto_promote") is not False:
            missing.setdefault(dest,[]).append("EMPTY_RECEIVER_CUSTODY_OR_AUTHORITY_NOT_VERIFIED")
    extra=packet.get("reciprocal_probes")
    if not isinstance(extra,dict) or set(extra)!={"WENDBINE_TO_UNIVERSAL_ENCYCLOPEDIA",
                                                  "TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER"}:
        raise ValueError("TWO_RECIPROCAL_PROBE_CONTRACTS_REQUIRED")
    for name,record in extra.items():
        if not isinstance(record,dict) or record.get("distinct_send_return_routes") is not True or \
           record.get("preregistered_matched_control") is not True or \
           record.get("source_admission_approval") is not True:
            missing.setdefault(name,[]).append("PROSPECTIVE_RECIPROCAL_CONTRACT_HELD")
    blocked={k:v for k,v in missing.items() if v}
    return {"schema":"td613.atelier-parity-gate/v1",
        "disposition":"HELD_PARITY_NOT_REALIZED" if blocked else "CANDIDATE_FOR_SEPARATELY_AUTHORIZED_RECIPROCAL_ASSAY",
        "estate_checks":summary,"blocks":blocked,
        "operator_approval_required_for_actual_flight":True,
        "human_scientific_closure_reserved":True,
        "does_not_admit_sources_or_initialize_flight":True,
        "green_ci_is_not_real_corpus_evidence":True}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--local-evidence-packet",type=Path,required=True)
    a=p.parse_args();f=a.local_evidence_packet
    if not f.is_absolute() or not f.is_file():raise ValueError("LOCAL_PACKET_PATH_REQUIRED")
    print(json.dumps(check_report(json.loads(f.read_text("utf8"))),indent=2))
if __name__=="__main__":main()
