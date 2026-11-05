#!/usr/bin/env python3
"""Read-only identity-sensitive Em work route over native registries."""
import argparse, hashlib, json
from pathlib import Path
TABLES={"work":"01-MANIFESTS/work-index.jsonl","links":"01-MANIFESTS/work-manifestations.jsonl","sources":"01-MANIFESTS/source-files.jsonl","derivatives":"03-DERIVATIVES/derivative-index.jsonl"}
def load(root,rel):
    root=Path(root)
    if not root.is_absolute() or not root.is_dir() or root.is_symlink():
        raise ValueError("EM_PINNED_ROOT_REQUIRED")
    path=root
    for part in rel.split("/"):
        path=path/part
        if path.is_symlink():raise ValueError("EM_SYMLINK_REFUSED")
    if not path.is_file() or path.stat().st_size>4_000_000:raise ValueError("EM_REGISTRY_REQUIRED")
    raw=path.read_bytes()
    return [json.loads(line) for line in raw.decode("utf-8-sig").splitlines() if line.strip()],hashlib.sha256(raw).hexdigest()
def route(root,work_id):
    if not isinstance(work_id,str) or not work_id.startswith("emwork_"):raise ValueError("EM_WORK_ID_REQUIRED")
    source={};digest={}
    for key,rel in TABLES.items():source[key],digest[key]=load(root,rel)
    for key,field in (("work","work_id"),("sources","source_file_id"),("links","source_file_id"),("derivatives","source_file_id")):
        ids=[row.get(field) for row in source[key]]
        if any(not isinstance(value,str) for value in ids) or len(ids)!=len(set(ids)):
            raise ValueError("EM_DUPLICATE_OR_INVALID_REGISTRY_ID:"+key)
    works=[w for w in source["work"] if w.get("work_id")==work_id]
    if len(works)!=1:return {"work_id":work_id,"status":"UNRESOLVED_WORK_ID"}
    work=works[0]
    identities=set(work.get("manifestation_source_file_ids") or [])
    if len(identities)!=len(work.get("manifestation_source_file_ids") or []):raise ValueError("EM_DUPLICATE_MANIFESTATION_ID")
    bysource={v["source_file_id"]:v for v in source["sources"]}
    members=[]
    for link in source["links"]:
        if link.get("work_id")!=work_id:continue
        sid=link.get("source_file_id")
        if sid not in identities or sid not in bysource:raise ValueError("EM_WORK_SOURCE_MISMATCH")
        file=bysource[sid]
        if link.get("evidence",{}).get("source_sha256")!=file.get("sha256"):raise ValueError("EM_SOURCE_HASH_MISMATCH")
        members.append({"source_id":sid,"sha256":file["sha256"],"identity_status":link.get("identity_status"),"human_gated":link.get("human_gate_required"),"extractions":[x.get("extraction_status") for x in source["derivatives"] if x.get("source_file_id")==sid]})
    if set(m["source_id"] for m in members)!=identities:raise ValueError("EM_MANIFESTATION_INCOMPLETE")
    return {"schema":"td613.em.work-route/v1","work_id":work_id,"title":work.get("display_title"),"identity_status":work.get("identity_status"),"manifestations":members,"registry_sha256":digest,"next_tests":["SPLIT_COLLAPSE_IDENTITY_SENSITIVITY","MOTIF_VS_MECHANISM_CONTROL","INDEPENDENT_LINEAGE_WITNESS"],"lineage_proven":False}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--em-root",type=Path,required=True);p.add_argument("work_id");a=p.parse_args()
    print(json.dumps(route(a.em_root,a.work_id),ensure_ascii=False,indent=2))
