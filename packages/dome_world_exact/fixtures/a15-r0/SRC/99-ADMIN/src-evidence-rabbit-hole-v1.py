#!/usr/bin/env python3
"""Source-grounded SRC typed-strata exploration. Additive read-only instrument.

This executes traversal and contextual-role retrieval against the original
native SRC registries; it does not infer equivalence, causal edges, or validated
scientific topology from adjacency, chronology, lexical coincidence or paths.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from collections import deque
from pathlib import Path

EDGE_PATH="05-OPERATIONS/relations/typed-edges.jsonl"
ROLE_PATH="05-OPERATIONS/phase2/contextual-role-assertions.jsonl"
MAP_PATH="05-OPERATIONS/maps/canon-map-snapshots.jsonl"
MAX_BYTES=3_000_000

def evidence_table(root,relative):
    p=Path(root)
    if not p.is_absolute() or not p.is_dir() or p.is_symlink():
        raise ValueError("SRC_ABSOLUTE_NATIVE_ROOT_REQUIRED")
    path=p
    for part in relative.split("/"):
        if not part or part in (".",".."):raise ValueError("SRC_PATH_INVALID")
        path=path/part
        if path.is_symlink():raise ValueError("SRC_SYMLINK_REFUSED")
    if not path.is_file() or path.stat().st_size>MAX_BYTES:
        raise ValueError("SRC_PINNED_REGISTRY_MISSING_OR_OVERSIZE")
    data=path.read_bytes()
    records=[]
    for n,line in enumerate(data.decode("utf-8-sig").splitlines(),1):
        if line.strip():
            record=json.loads(line)
            if not isinstance(record,dict):raise ValueError("SRC_REGISTRY_ROW_INVALID")
            records.append({"line":n,"record":record})
    return {"path":relative,"sha256":hashlib.sha256(data).hexdigest(),"records":records}

def explore(root,entity,*,depth=2,limit=40):
    if not isinstance(entity,str) or not entity or len(entity)>200:
        raise ValueError("SRC_ENTITY_REQUIRED")
    if type(depth) is not int or not 0<=depth<=4:
        raise ValueError("SRC_DEPTH_BOUNDED")
    if type(limit) is not int or not 1<=limit<=200:
        raise ValueError("SRC_LIMIT_BOUNDED")
    edges=evidence_table(root,EDGE_PATH)
    roles=evidence_table(root,ROLE_PATH)
    maps=evidence_table(root,MAP_PATH)
    adjacency={}
    for x in edges["records"]:
        e=x["record"]
        if not e.get("edge_id") or not e.get("from_id") or not e.get("to_id"):
            raise ValueError("SRC_TYPED_EDGE_MISSING_ENDPOINT")
        if not isinstance(e.get("evidence_ids"),list):
            raise ValueError("SRC_EDGE_EVIDENCE_FIELD_REQUIRED")
        adjacency.setdefault(e["from_id"],[]).append(x)
    for key in adjacency:
        adjacency[key].sort(key=lambda x:x["record"]["edge_id"])
    frontier=deque([(entity,[],frozenset([entity]))])
    witnessed=[];unwitnessed=[];visited=set()
    while frontier and len(witnessed)+len(unwitnessed)<limit:
        cur,path,chain=frontier.popleft()
        if len(path)>=depth:continue
        for item in adjacency.get(cur,[]):
            edge=item["record"];nxt=edge["to_id"]
            if nxt in chain:continue
            newpath=path+[edge["edge_id"]]
            key=(tuple(newpath),nxt)
            if key in visited:continue
            visited.add(key)
            event={"edge_id":edge["edge_id"],"from_id":cur,"to_id":nxt,
              "relation":edge.get("relation"),"graph_kind":edge.get("graph_kind"),
              "adjudication_status":edge.get("adjudication_status"),
              "source_evidence_ids":edge["evidence_ids"],"registry_line":item["line"],
              "path":newpath,"path_length":len(newpath),
              "edge_provenance":edge.get("origin"),
              "interpretive_limit":edge.get("interpretive_limit"),
              "candidate_direct_relation_admitted":False,
              "stratum_change_requires_new_witness":len(newpath)>1}
            if edge["evidence_ids"] and edge.get("adjudication_status")=="WITNESSED":
                witnessed.append(event)
            else:unwitnessed.append(event)
            if len(newpath)<depth:frontier.append((nxt,newpath,chain|{nxt}))
            if len(witnessed)+len(unwitnessed)>=limit:break
    contextual=[]
    for item in roles["records"]:
        row=item["record"]
        if entity in (row.get("subject_id"),row.get("architecture_id")):
            contextual.append({"line":item["line"],
                "contextual_role_assertion_id":row.get("contextual_role_assertion_id"),
                "subject_id":row.get("subject_id"),"architecture_id":row.get("architecture_id"),
                "role_normalized":row.get("role_normalized"),
                "scope":row.get("scope"),"evidence_ids":row.get("evidence_ids"),
                "observation_status":row.get("observation_status"),
                "interpretive_limit":row.get("interpretive_limit")})
    matched_maps=[]
    for item in maps["records"]:
        m=item["record"]
        if entity==m.get("map_manifestation_id"):
            matched_maps.append({"line":item["line"],"snapshot_id":m.get("snapshot_id"),
              "node_count":len(m.get("nodes",[])),
              "edge_count":len(m.get("edges",[])),
              "enumeration_completeness":m.get("enumeration_completeness"),
              "evidence_ids":m.get("evidence_ids")})
    next_tests=[]
    if any(x["path_length"]>1 for x in witnessed):
        next_tests.append("SEEK_INDEPENDENT_DIRECT_EDGE_WITNESS_FOR_MULTI_HOP_CANDIDATE")
    if unwitnessed:next_tests.append("CHECK_UNWITNESSED_OR_UNRESOLVED_EDGE_AGAINST_ORIGINAL_SPAN")
    if not contextual:next_tests.append("SEEK_EXPLICIT_CONTEXTUAL_ROLE_OR_KEEP_ROLE_UNRESOLVED")
    if not witnessed and not unwitnessed:
        next_tests.append("NO_OUTGOING_EDGE_RECORDED_DO_NOT_INFER_ABSENCE_FROM_CORPUS")
    return {"schema":"td613.src.rabbithole-evidence/v1","estate":"SRC",
        "query_entity":entity,"registry_sha256":{
            "typed_edges":edges["sha256"],"contextual_roles":roles["sha256"],
            "canon_map":maps["sha256"]},
        "witnessed_typed_routes":witnessed,
        "held_typed_routes":unwitnessed,
        "contextual_roles":contextual[:limit],"canon_map_observations":matched_maps[:limit],
        "candidate_next_tests":next_tests,
        "source_evidence_class":"NATIVE_TYPED_REGISTRY_NOT_ORIGINAL_SPAN_REPLAY",
        "typed_path_is_not_direct_relation":True,
        "heterostratigraphic_synthesis_proven":False,
        "human_adjudication_reserved":True}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--src-root",type=Path,required=True)
    p.add_argument("entity")
    p.add_argument("--depth",type=int,default=2)
    p.add_argument("--limit",type=int,default=40)
    a=p.parse_args()
    print(json.dumps(explore(a.src_root,a.entity,depth=a.depth,limit=a.limit),
                     ensure_ascii=False,indent=2))
if __name__=="__main__":main()
