#!/usr/bin/env python3
"""Native-identity crosswalk for already source-verified search hits.

Produces only candidate comparative relations, never identity/authority
promotion. Particularly preserves Em Work vs manifestation vs derivative,
SRC original Zenodo entity vs derivative, and Wendbine capture vs source.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

BASE=Path("packages/dome_world_exact/fixtures/a15-r0")
EM_DERIV="03-DERIVATIVES/derivative-index.jsonl"
EM_LINKS="01-MANIFESTS/work-manifestations.jsonl"
MAX_SIZE=4_000_000

def jsonl(root,relative):
    path=Path(root)
    if not path.is_absolute() or not path.is_dir() or path.is_symlink():
        raise ValueError("NATIVE_SOURCE_ROOT_REQUIRED")
    for part in relative.split("/"):
        if part in ("",".",".."):raise ValueError("UNSAFE_REGISTRY_PATH")
        path=path/part
        if path.is_symlink():raise ValueError("REGISTRY_SYMLINK_REFUSED")
    if not path.is_file() or path.stat().st_size>MAX_SIZE:raise ValueError("REGISTRY_MISSING_OR_OVERSIZE")
    raw=path.read_bytes()
    return [json.loads(line) for line in raw.decode("utf8-sig").splitlines() if line.strip()],hashlib.sha256(raw).hexdigest()

def annotate(hits,em_root,*,limit=100):
    if not isinstance(hits,list) or not 1<=len(hits)<=limit<=100:
        raise ValueError("BOUNDED_SEARCH_HITS_REQUIRED")
    derivatives,dh=jsonl(em_root,EM_DERIV)
    manifests,mh=jsonl(em_root,EM_LINKS)
    indexed={row.get("derivative_relative_path"):row for row in derivatives if row.get("derivative_relative_path")}
    mapped={}
    for entry in manifests:
        sid=entry.get("source_file_id")
        if sid:mapped.setdefault(sid,[]).append(entry)
    out=[]
    for hit in hits:
        estate=hit.get("estate")
        sid=hit.get("source_id")
        if estate not in ("SRC","EMSTD613","WENDBINE") or not isinstance(sid,str):
            raise ValueError("UNREGISTERED_CROSSWALK_ESTATE")
        item={k:hit.get(k) for k in ("estate","source_id","capture_id",
                "source_field","source_sha256","byte_offset","method","score")}
        if estate=="EMSTD613":
            rel=sid.removeprefix("derivative:")
            native=indexed.get(rel)
            if not sid.startswith("derivative:") or native is None or native.get("derivative_sha256")!=hit.get("source_sha256"):
                raise ValueError("EM_DERIVATIVE_NOT_BOUND_TO_NATIVE_REGISTRY")
            original=native["source_file_id"]
            item["em_source_file_id"]=original
            item["candidate_works"]=[{"work_id":link.get("work_id"),
                "manifestation_relation":link.get("relation"),
                "identity_status":link.get("identity_status"),
                "human_gate_required":link.get("human_gate_required")}
                 for link in mapped.get(original,[])]
            item["identity_uncertainty_preserved"]=True
        elif estate=="SRC":
            if not sid.startswith("derivative:"):raise ValueError("SRC_DERIVATIVE_ID_REQUIRED")
            m=re.search(r"zenodo-(\d+)-",sid)
            item["candidate_native_entity_id"]="zenodo:"+m.group(1) if m else None
            item["source_attribution_status"]="DERIVATIVE_ID_PARSE_NOT_AUTHORSHIP_PROOF"
        else:
            if not re.fullmatch(r"reddit:t3_[a-z0-9]{5,12}",sid):
                raise ValueError("WENDBINE_SOURCE_ID_INVALID")
            item["capture_id"]=hit.get("capture_id")
            item["source_attribution_status"]="OPERATOR_LOCAL_CAPTURE_OR_PROVIDER_OBSERVATION"
        item["semantic_equivalence_proven"]=False
        item["lineage_or_mechanism_proven"]=False
        out.append(item)
    return {"schema":"td613.atelier-crosswalk/v1",
        "results":out,"em_registry_sha256":{"derivatives":dh,"work_manifestations":mh},
        "cross_estate_relations":"RETRIEVAL_CANDIDATES_ONLY",
        "independent_native_identity_confirmation":"REQUIRED_BEFORE_PROMOTION",
        "work_identity_may_be_human_gated":True,
        "scientific_promotion":False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--hit-json",type=Path,required=True)
    p.add_argument("--em-native-root",type=Path,required=True)
    a=p.parse_args()
    if not a.hit_json.is_absolute() or not a.hit_json.is_file():
        raise ValueError("LOCAL_HIT_JSON_REQUIRED")
    raw=json.loads(a.hit_json.read_text("utf8"))
    hits=raw if isinstance(raw,list) else raw.get("ranked",raw.get("hits",[]))
    print(json.dumps(annotate(hits,a.em_native_root),ensure_ascii=False,indent=2))
if __name__=="__main__":main()
