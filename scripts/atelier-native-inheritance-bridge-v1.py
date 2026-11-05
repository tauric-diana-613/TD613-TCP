#!/usr/bin/env python3
"""Read-only native inheritance bridge: SRC actual query + multiplex maps, Em actual fixtures.

Never treats derivative text as original, a schema as an executed method, or
a projection map as empirical geometry. This does not ingest protected content.
The two estate roots are independent operator-pinned checkouts.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile

SRC_METHODS={
 "src_query":"99-ADMIN/srcquery.py",
 "src_projective_router":"99-ADMIN/run-projective-routing-grammar-assay.py",
 "src_phase2_assays":"99-ADMIN/build-phase2-assays.py",
 "src_canon_map":"05-OPERATIONS/maps/canon-map-snapshots.jsonl",
 "src_relational_topology":"05-OPERATIONS/relations/typed-edges.jsonl",
 "src_transformations":"05-OPERATIONS/relations/recompilation-edges.jsonl",
 "src_heterostrata":"05-OPERATIONS/phase2/contextual-role-assertions.jsonl",
 "src_tomography":"05-OPERATIONS/phase2/claim-evidence-tomography.jsonl",
 "src_ordinal":"05-OPERATIONS/relations/ordinal-series-observations.jsonl",
 "src_source_lineage":"05-OPERATIONS/phase2/evidence-lineage-assertions.jsonl",
}
EM_FIXTURES={
 "em_identity":"01-MANIFESTS/registry-index.json",
 "em_source_identity":"01-MANIFESTS/source-files.jsonl",
 "em_work_index":"01-MANIFESTS/work-index.jsonl",
 "em_title_candidates":"01-MANIFESTS/title-relation-candidates.json",
 "em_typed_schema":"01-MANIFESTS/SCHEMA.md",
 "em_lineage_protocol":"06-INSTRUMENTS/LINEAGE_ASSAY_PROTOCOL.md",
 "em_motif_mechanism":"06-INSTRUMENTS/MOTIF_TO_MECHANISM_TRANSLATION.md",
 "em_authority_geometry":"06-INSTRUMENTS/AUTHORITY_PROVENANCE_GEOMETRY_ASSAY_V0_1.md",
 "em_claim_ceiling":"06-INSTRUMENTS/CLAIM_CEILING_PROPAGATION_V0_1.md",
 "em_convergence":"06-INSTRUMENTS/CONVERGENCE_DIVERGENCE_EMERGENCE_MATRIX.md",
 "em_giveback":"05-OPERATIONS/EM_GIVEBACK_RESEARCH_PROGRAM_V0_1.md",
 "em_negative_control":"01-MANIFESTS/em-tic-archaeological-control.jsonl",
}
PROJECTIONS={
 "CARTOGRAPHIC":"src_canon_map",
 "RELATIONAL_TOPOLOGY":"src_relational_topology",
 "RECOMPILATION":"src_transformations",
 "HETEROSTRATIGRAPHIC_CONTEXT_ROLES":"src_heterostrata",
 "TOMOGRAPHIC_EVIDENCE":"src_tomography",
 "ORDINAL_CHRONOLOGY":"src_ordinal",
 "SOURCE_GENEALOGY":"src_source_lineage",
}
MAX_BYTES=10_000_000

# These are the files actually consumed by the unchanged native srcquery.
# Matching epoch labels alone never establish byte membership in that epoch.
QUERY_INPUTS={
 "summary":["01-MANIFESTS/phase2/acquisition-outcomes.jsonl",
   *["05-OPERATIONS/phase2/"+name+".jsonl" for name in
     ("expected-object-observations","contextual-role-assertions","compilation-passes",
      "authority-jurisdiction-assertions","evidence-lineage-assertions")],
   "04-RECEIPTS/assays/2026-08-24-phase2-kiln/coverage-ledger.jsonl"],
 "resolve":["01-MANIFESTS/phase2/entity-resolver-v2.jsonl"],
 "authority":["05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl"],
 "trace":["01-MANIFESTS/entity-index.jsonl",
   *["01-MANIFESTS/phase2/"+name+".jsonl" for name in
     ("entity-resolver-v2","capture-v2","derivative-v1")],
   "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/witnessed-evidence.jsonl",
   "05-OPERATIONS/relations/typed-edges.jsonl",
   "05-OPERATIONS/relations/recompilation-edges.jsonl",
   *["05-OPERATIONS/phase2/"+name+".jsonl" for name in
     ("contextual-role-assertions","compilation-passes","reference-assertions",
      "authority-jurisdiction-assertions")]],
}

def _query_epoch_manifest(src,snapshot,seal):
    raw,_=verified_bytes(src,"04-RECEIPTS/phase2/current-seal.json")
    current=json.loads(raw)
    if current.get("atelier_snapshot_id")!=snapshot or current.get("seal_id")!=seal:
        raise ValueError("SEAL_EPOCH_MISMATCH")
    relative=current.get("path")
    if relative!="04-RECEIPTS/phase2/projection-seal.json":
        raise ValueError("UNSUPPORTED_PROJECTION_SEAL_PATH")
    raw,digest=verified_bytes(src,relative)
    manifest=json.loads(raw)
    if manifest.get("schema_version")!="src-projection-seal/v1":
        raise ValueError("UNSUPPORTED_PROJECTION_SEAL_SCHEMA")
    for key in ("atelier_snapshot_id","seal_id","projection_seal_id","projection_profile"):
        if not current.get(key) or manifest.get(key)!=current[key]:
            raise ValueError("SEAL_POINTER_MANIFEST_MISMATCH")
    entries=manifest.get("entries")
    if not isinstance(entries,list) or any(not isinstance(e,dict) for e in entries):
        raise ValueError("SEAL_ENTRIES_INVALID")
    basis="".join(json.dumps(e,ensure_ascii=False,sort_keys=True,separators=(",",":"))+"\n" for e in entries)
    if "src-projection-seal:"+hashlib.sha256(basis.encode("utf8")).hexdigest()!=current["projection_seal_id"]:
        raise ValueError("PROJECTION_SEAL_DIGEST_MISMATCH")
    bypath={}
    for entry in entries:
        path=entry.get("path")
        if not isinstance(path,str) or Path(path).is_absolute() or ".." in Path(path).parts or path in bypath:
            raise ValueError("SEAL_ENTRY_PATH_INVALID_OR_DUPLICATE")
        bypath[path]=entry
    return current,manifest,digest,bypath

def verify_query_epoch(src,snapshot,seal,operation):
    """Verify consumed bytes only; never reseal or imply whole-tree custody."""
    _,_,digest,bypath=_query_epoch_manifest(src,snapshot,seal)
    checked=[]
    for path in [SRC_METHODS["src_query"],*QUERY_INPUTS[operation]]:
        entry=bypath.get(path)
        if entry is None:raise ValueError("QUERY_INPUT_NOT_SEALED:"+path)
        raw,h=verified_bytes(src,path)
        if len(raw)!=entry.get("bytes") or h!=entry.get("sha256"):
            raise ValueError("QUERY_INPUT_SEAL_DRIFT:"+path)
        checked.append({"path":path,"bytes":len(raw),"sha256":h})
    return {"scope":"CONSUMED_NATIVE_QUERY_FILES_ONLY","projection_seal_sha256":digest,
            "verified_inputs":checked,"whole_projection_verified":False,
            "external_custody_authenticated":False}

def replay_native_src_query(src,snapshot,seal,operation,identifier=None,scope=None,
                            expected_source_sha=None,*,allow_line_ending_replay=False):
    """Explicit read-only replay of exact seal bytes from newline variants.

    Copies into a temporary directory; never rewrites the retained source or
    weakens the ordinary strict query. Every replayed consumed file must match
    the original seal's byte count and SHA-256. Content edits remain refused.
    This is a public-projection method replay, never source admission or a new seal.
    """
    if allow_line_ending_replay is not True:
        raise ValueError("EXPLICIT_SEALED_NEWLINE_REPLAY_REQUIRED")
    if operation not in QUERY_INPUTS:
        raise ValueError("SRC_NATIVE_READONLY_OPERATION_NOT_ALLOWED")
    src=root_check(Path(src),"SRC")
    current,_,_,bypath=_query_epoch_manifest(src,snapshot,seal)
    if current["projection_profile"]!="public":
        raise ValueError("PUBLIC_PROJECTION_REPLAY_ONLY")
    script=SRC_METHODS["src_query"]
    _,h=verified_bytes(src,script)
    if not expected_source_sha or expected_source_sha!=h:
        raise ValueError("EXACT_NATIVE_SRC_QUERY_SHA256_REQUIRED")
    replacements={};transforms=[]
    for path in [script,*QUERY_INPUTS[operation]]:
        entry=bypath.get(path)
        if entry is None:raise ValueError("QUERY_INPUT_NOT_SEALED:"+path)
        raw,h=verified_bytes(src,path)
        if h==entry.get("sha256") and len(raw)==entry.get("bytes"):continue
        # Executable source is never transformed by this data replay lane.
        if path==script:raise ValueError("QUERY_INPUT_SEAL_DRIFT:"+path)
        variant=raw.replace(b"\r\n",b"\n").replace(b"\n",b"\r\n")
        vh=hashlib.sha256(variant).hexdigest()
        if vh!=entry.get("sha256") or len(variant)!=entry.get("bytes"):
            raise ValueError("UNREPLAYABLE_QUERY_INPUT_DRIFT:"+path)
        replacements[path]=variant
        transforms.append({"path":path,"retained_sha256":h,"replayed_sha256":vh,
                           "transform":"LF_TO_CRLF_EXACT_SEAL_MATCH"})
    total=0;count=0
    for path in src.rglob("*"):
        if path.is_symlink():raise ValueError("SYMLINK_IN_NATIVE_SOURCE_REFUSED")
        if path.is_file():total+=path.stat().st_size;count+=1
        if total>500_000_000 or count>20_000:raise ValueError("BOUNDED_REPLAY_COPY_EXCEEDED")
    with tempfile.TemporaryDirectory(prefix="td613-public-sealed-query-") as temp:
        replay=Path(temp)/"SRC"
        shutil.copytree(src,replay)
        for path,raw in replacements.items():(replay/path).write_bytes(raw)
        result=native_src_query(replay,snapshot,seal,operation,identifier,scope,expected_source_sha)
    return {**result,"replay":{"class":"PUBLIC_SOURCE_BOUND_SEALED_BYTE_REPLAY",
       "retained_sources_modified":False,"seal_rewritten":False,
       "transforms":transforms,"temporary_copy_destroyed":True,
       "receiver_admission":False,"external_origin_authenticated":False}}

def root_check(path, estate):
    p=Path(path)
    if not p.is_absolute() or not p.is_dir() or p.name!=estate or p.is_symlink():
        raise ValueError("PINNED_NATIVE_"+estate+"_ROOT_REQUIRED")
    return p

def verified_bytes(root, relative):
    parent=root
    for name in relative.split("/"):
        parent=parent/name
        if parent.is_symlink():raise ValueError("SYMLINK_IN_NATIVE_SOURCE_REFUSED")
    if not parent.is_file():raise ValueError("NATIVE_FIXTURE_MISSING:"+relative)
    if parent.stat().st_size>MAX_BYTES:raise ValueError("BOUNDED_NATIVE_FILE_MAX_EXCEEDED")
    raw=parent.read_bytes()
    return raw,hashlib.sha256(raw).hexdigest()

def census(src,em):
    result={}
    for label,root,manifest in (("SRC",src,SRC_METHODS),("EMSTD613",em,EM_FIXTURES)):
        entries=[]
        for name,relative in manifest.items():
            try:
                raw,h=verified_bytes(root,relative)
                state="PRESENT"
                length=len(raw)
            except ValueError as e:
                h=None;length=None;state=str(e)
            entries.append({"method_or_fixture":name,"native_relative_path":relative,
               "bytes":length,"sha256":h,"state":state,"native_software_identity":"NOT_MUTATED"})
        result[label]={"entries":entries,"present":sum(e["state"]=="PRESENT" for e in entries),
                       "expected":len(entries),
                       "source_original_parity":"NOT_EVALUATED"}
    return {"schema":"td613.native-inheritance-census/v1","estates":result,
       "native_methods_vs_documentary_assays_not_equivalent":True,
       "src_full_original_corpus_parity":"HELD",
       "em_full_original_corpus_parity":"HELD",
       "w_with_originals_integration":"NOT_IMPLIED_BY_CENSUS",
       "no_engine_copy_or_mutation":True}

def literal_match(x,term):
    if isinstance(x,str):return x==term
    if isinstance(x,list):return any(literal_match(y,term) for y in x)
    if isinstance(x,dict):return any(literal_match(y,term) for y in x.values())
    return False

def native_projection(src,projection,term=None,limit=100):
    if projection not in PROJECTIONS or type(limit) is not int or not 1<=limit<=1000:
        raise ValueError("EXPLICIT_BOUNDED_SRC_PROJECTION_REQUIRED")
    path=SRC_METHODS[PROJECTIONS[projection]]
    blob,h=verified_bytes(src,path)
    records=[]
    additional_match=False
    for n,line in enumerate(blob.decode("utf-8-sig").splitlines(),1):
        if not line.strip():continue
        row=json.loads(line)
        if term is not None and not literal_match(row,term):continue
        if len(records)<limit:records.append({"source_line":n,"record":row})
        else:additional_match=True
    return {"projection":projection,"native_registry":path,"registry_sha256":h,
       "matches":records,"returned":len(records),"truncated":additional_match,
       "query":"EXACT_NESTED_LITERAL" if term is not None else "FIRST_N_NATIVE_ROWS",
       "operator_class":"NATIVE_TYPED_REGISTRY_READBACK",
       "scientific_topology_established":False}

def native_src_query(src,snapshot,seal,operation,identifier=None,scope=None,expected_source_sha=None):
    if operation not in {"summary","trace","resolve","authority"}:
        raise ValueError("SRC_NATIVE_READONLY_OPERATION_NOT_ALLOWED")
    path=SRC_METHODS["src_query"]
    raw,h=verified_bytes(src,path)
    if expected_source_sha is None or h!=expected_source_sha:
        raise ValueError("EXACT_NATIVE_SRC_QUERY_SHA256_REQUIRED")
    binding=verify_query_epoch(src,snapshot,seal,operation)
    module_path=src/path
    spec=importlib.util.spec_from_file_location("td613_pinned_native_srcquery",module_path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    ep=module.epoch(src,snapshot,seal)
    if operation=="summary":data=module.summarize(src)
    elif operation=="trace":
        if not identifier:raise ValueError("SRC_TRACE_ID_REQUIRED")
        data=module.trace(src,identifier)
    elif operation=="resolve":
        if not identifier:raise ValueError("SRC_RESOLVE_ID_REQUIRED")
        data=module.resolve(src,identifier)
    else:
        if not identifier:raise ValueError("SRC_AUTHORITY_SUBJECT_REQUIRED")
        data=module.authority(src,identifier,scope)
    return {"method":"ORIGINAL_NATIVE_SRCQUERY_EXECUTED","method_sha256":h,
        "epoch":ep,"operation":operation,"result":data,
        "full_src_algorithmic_coverage":False,"source_binding":binding}

def em_fixture(em,key,limit=200):
    if key not in EM_FIXTURES:raise ValueError("UNKNOWN_EM_FIXTURE_REFUSED")
    blob,h=verified_bytes(em,EM_FIXTURES[key])
    if key=="em_identity":
        data=json.loads(blob.decode("utf8"))
        value={"work_identity_state":data.get("work_identity_state"),"fixture_status":data.get("status"),
               "downstream_identity_sensitivity_rule":data.get("downstream_identity_sensitivity_rule")}
    elif key=="em_title_candidates":
        obj=json.loads(blob.decode("utf8"))
        value={"identity_adjudicated":obj.get("identity_adjudicated"),
               "candidate_count":len(obj.get("relations",[])),
               "preview":obj.get("relations",[])[:min(limit,10)]}
    elif EM_FIXTURES[key].endswith(".jsonl"):
        items=[json.loads(x) for x in blob.decode("utf-8-sig").splitlines() if x.strip()]
        value={"record_count":len(items),"preview":items[:min(limit,5)]}
    else:
        value={"document_utf8":blob.decode("utf8") if len(blob)<15000 else None,
               "document_byte_count":len(blob)}
    return {"fixture":key,"native_relative_path":EM_FIXTURES[key],"sha256":h,
            "value":value,"original_method_executed":False,
            "original_protocol_document_preserved":True,
            "human_adjudication":"NOT_AUTOMATIC"}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--src-root",required=True)
    p.add_argument("--em-root",required=True)
    sub=p.add_subparsers(dest="command",required=True)
    sub.add_parser("census")
    q=sub.add_parser("src-projection");q.add_argument("projection",choices=list(PROJECTIONS));q.add_argument("--term");q.add_argument("--limit",type=int,default=100)
    for command in ("src-native-query","src-sealed-byte-replay"):
        q=sub.add_parser(command);q.add_argument("operation",choices=["summary","trace","resolve","authority"]);q.add_argument("--snapshot",required=True);q.add_argument("--seal",required=True);q.add_argument("--query-sha256",required=True);q.add_argument("--id");q.add_argument("--scope")
        if command=="src-sealed-byte-replay":q.add_argument("--allow-line-ending-replay",action="store_true",required=True)
    q=sub.add_parser("em-fixture");q.add_argument("name",choices=list(EM_FIXTURES))
    args=p.parse_args()
    src=root_check(args.src_root,"SRC");em=root_check(args.em_root,"EMSTD613")
    if args.command=="census":out=census(src,em)
    elif args.command=="src-projection":out=native_projection(src,args.projection,args.term,args.limit)
    elif args.command=="src-native-query":out=native_src_query(src,args.snapshot,args.seal,args.operation,args.id,args.scope,args.query_sha256)
    elif args.command=="src-sealed-byte-replay":out=replay_native_src_query(src,args.snapshot,args.seal,args.operation,args.id,args.scope,args.query_sha256,allow_line_ending_replay=args.allow_line_ending_replay)
    else:out=em_fixture(em,args.name)
    print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
