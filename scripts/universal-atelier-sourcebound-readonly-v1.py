#!/usr/bin/env python3
"""Universal Atelier v1 · source-labeled read-only query across three estates.

Wendbine original observed bodies: operator-local SQLite created by direct sync.
SRC and Em: repository derivative texts, never misrepresented as originals.
No 'semantic' mode until actual source-verified embeddings/relations are supplied.
"""
from __future__ import annotations
import argparse
import importlib.util
import hashlib
import json
import os
import sqlite3
import sys
import subprocess
from pathlib import Path

ESTATES=("WENDBINE","SRC","EMSTD613")
BASE=Path("packages/dome_world_exact/fixtures/a15-r0")
NATIVE_PINNED_HEADS={
    "SRC":"b3e69acf587d534eeef2e01d0bb5bdbdecdbd320",
    "EMSTD613":"70b5a0f9e94626cba6068f41c6117e7978800bbd",
}
def verify_native_checkout(path, estate):
    if estate not in NATIVE_PINNED_HEADS:
        raise ValueError("UNSUPPORTED_NATIVE_ESTATE")
    if not path.is_absolute() or not path.is_dir() or path.is_symlink():
        raise ValueError("ABSOLUTE_NATIVE_CHECKOUT_REQUIRED")
    try:
        head=subprocess.run(["git","-C",str(path),"rev-parse","HEAD"],
            check=True,capture_output=True,text=True,timeout=12).stdout.strip()
    except (OSError,subprocess.CalledProcessError,subprocess.TimeoutExpired) as exc:
        raise ValueError("NATIVE_CHECKOUT_GIT_IDENTITY_UNAVAILABLE") from exc
    if head!=NATIVE_PINNED_HEADS[estate]:
        raise ValueError("NATIVE_CHECKOUT_HEAD_DRIFT")
    native=path/BASE/estate
    if not native.is_dir() or native.is_symlink():
        raise ValueError("NATIVE_ESTATE_MISSING_AT_PINNED_HEAD")
    return native

MAX_FILE_BYTES=8*1024*1024
MAX_CUMULATIVE_BYTES=120*1024*1024

def sha(b):return hashlib.sha256(b).hexdigest()

def repo_files(repository,estate,*,native_checkout=None):
    if estate not in ("SRC","EMSTD613"): raise ValueError("UNSUPPORTED_SOURCE_ESTATE")
    root=verify_native_checkout(native_checkout,estate) if native_checkout is not None else repository/BASE/estate
    if not root.is_dir() or root.is_symlink(): raise ValueError("NATIVE_ESTATE_ROOT_MISSING_OR_SYMLINK")
    top=root/"03-DERIVATIVES"/"text"
    if not top.is_dir() or top.is_symlink():raise ValueError("NATIVE_TEXT_DERIVATIVES_MISSING")
    total=0
    for parent,dirs,files in os.walk(top,followlinks=False):
        dirs.sort();files.sort()
        if any((Path(parent)/p).is_symlink() for p in dirs):
            raise ValueError("NATIVE_TREE_SYMLINK_REFUSED")
        for name in files:
            f=Path(parent)/name
            if f.suffix.lower() not in (".txt",".md"):continue
            if f.is_symlink() or not f.is_file() or f.stat().st_size>MAX_FILE_BYTES:
                raise ValueError("NATIVE_DERIVATIVE_INVALID")
            body=f.read_bytes()
            total+=len(body)
            if total>MAX_CUMULATIVE_BYTES:raise ValueError("NATIVE_DERIVATIVES_OVERSIZE")
            text=body.decode("utf8",errors="strict")
            relative=f.relative_to(root).as_posix()
            yield {"estate":estate,"source_id":f"derivative:{relative}",
                 "source_kind":"NATIVE_RESEARCH_DERIVATIVE_UNVERIFIED_ORIGINAL",
                 "relative_path":relative,"sha256":sha(body),"bytes":body,
                 "text":text,"original_source_bytes_verified":False}

def load_sources(dbpath,repository,*,native_checkouts=None):
    if not dbpath.is_absolute() or not dbpath.is_file() or dbpath.is_symlink():
        raise ValueError("OPERATOR_LOCAL_WENDBINE_DB_REQUIRED")
    if not repository.is_absolute() or not repository.is_dir():
        raise ValueError("EXISTING_REPOSITORY_REQUIRED")
    if native_checkouts is not None:
        if set(native_checkouts)!={"SRC","EMSTD613"}:
            raise ValueError("BOTH_NATIVE_CHECKOUTS_REQUIRED")
    for estate in ESTATES[1:]:
        native=native_checkouts[estate] if native_checkouts is not None else None
        for row in repo_files(repository,estate,native_checkout=native):yield row
    con=sqlite3.connect(dbpath.as_uri()+"?mode=ro",uri=True)
    try:
        if con.execute("pragma integrity_check").fetchone()[0]!="ok":
            raise ValueError("LOCAL_WENDBINE_SQLITE_CORRUPT")
        for sid,url,body,title,bhash,thash in con.execute(
          "select source_id,canonical_url,selftext,title,body_sha256,title_sha256 from sources order by published_unix,source_id"):
            if sha(body)!=bhash or sha(title)!=thash:
                raise ValueError("SOURCE_BODY_HASH_CONFLICT")
            yield {"estate":"WENDBINE","source_id":sid,
                "source_kind":"OBSERVED_PUBLIC_PROVIDER_TEXT_NOT_AUTHOR_SIGNED",
                "canonical_url":url,"relative_path":None,
                "sha256":bhash,"bytes":body,"title":title,"title_sha256":thash,
                "text":body.decode("utf8",errors="strict"),
                "original_source_bytes_verified":True}
    finally:con.close()

def exact_query(source_iter,phrase,limit=30,estate="ALL"):
    """Field-bound UTF-8 retrieval with a bounded, equitable per-estate result round."""
    if not isinstance(phrase,str) or not phrase or len(phrase)>1024 or limit<1 or limit>100:
        raise ValueError("BOUNDED_EXACT_QUERY_REQUIRED")
    if estate!="ALL" and estate not in ESTATES:
        raise ValueError("UNREGISTERED_QUERY_ESTATE")
    needle=phrase.encode("utf8")
    # Prevent a common phrase in one native estate from hiding all Wendbine
    # or Em hits merely because the generator happened to enumerate it first.
    buckets={name:[] for name in ESTATES}
    for row in source_iter:
        origin=row["estate"]
        if origin not in buckets:
            raise ValueError("UNREGISTERED_SOURCE_ESTATE")
        if estate!="ALL" and origin!=estate:continue
        hits=buckets[origin]
        fields=[("selftext" if origin=="WENDBINE" else "derivative_text",
                 row["bytes"],row["sha256"])]
        if origin=="WENDBINE":
            fields.append(("title",row["title"],row["title_sha256"]))
        for field,body,digest in fields:
            start=0
            while len(hits)<limit:
                idx=body.find(needle,start)
                if idx<0:break
                hits.append({"estate":origin,"source_id":row["source_id"],
                  "source_kind":row["source_kind"],"source_sha256":digest,
                  "source_field":field,"byte_offset":idx,"length_utf8":len(needle),
                  "exact_match":phrase,"path":row["relative_path"],
                  "original_source_bytes_verified":row["original_source_bytes_verified"],
                  "canonical_url":row.get("canonical_url")})
                start=idx+max(1,len(needle))
    order=ESTATES if estate=="ALL" else (estate,)
    merged=[]
    for index in range(limit):
        for origin in order:
            if index<len(buckets[origin]):
                merged.append(buckets[origin][index])
                if len(merged)>=limit:return merged
    return merged

def state(source_iter):
    stats={}
    for row in source_iter:
        st=stats.setdefault(row["estate"],{"count":0,"body_bytes":0,
           "original_observed":0,"native_derivatives":0})
        st["count"]+=1;st["body_bytes"]+=len(row["bytes"])
        st["original_observed"]+=int(row["original_source_bytes_verified"])
        st["native_derivatives"]+=int(not row["original_source_bytes_verified"])
    return {"schema":"td613.universal-ateliers.source-labeled-readonly/v1",
      "estates":stats,"SRC_original_blob_parity":"UNVERIFIED",
      "Em_original_pdf_parity":"UNVERIFIED",
      "Wendbine_exact_retrieval":"ONLY_WHEN_OPERATOR_LOCAL_DB_PRESENT",
      "Wendbine_semantic_embedding_parity":"UNVERIFIED",
      "original_mathematical_topology":"UNVERIFIED",
      "source_text_reconstruction_from_summaries":False,
      "paid_or_private_provider_access":0}

def native_dispatch(src_root,em_root,command,*,projection=None,term=None,
                    fixture=None,operation=None,snapshot=None,seal=None,
                    identifier=None,scope=None,source_sha256=None,limit=100):
    """Callable Universal native-method route; original SRC/Em checkouts unchanged."""
    source=Path(__file__).resolve().parent/"atelier-native-inheritance-bridge-v1.py"
    if not source.is_file() or source.is_symlink():
        raise ValueError("UNIVERSAL_NATIVE_BRIDGE_NOT_INSTALLED")
    spec=importlib.util.spec_from_file_location("td613_native_frozen_bridge",source)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    src=module.root_check(src_root,"SRC")
    em=module.root_check(em_root,"EMSTD613")
    if command=="native-census":return module.census(src,em)
    if command=="src-projection":return module.native_projection(src,projection,term,limit)
    if command=="src-native-query":
        return module.native_src_query(src,snapshot,seal,operation,identifier,scope,source_sha256)
    if command=="em-fixture":return module.em_fixture(em,fixture,limit)
    raise ValueError("UNSUPPORTED_NATIVE_OPERATION")

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--wendbine-db")
    a.add_argument("--repo-root")
    a.add_argument("--src-checkout",required=True,help="Independent git worktree at pinned SRC HEAD")
    a.add_argument("--em-checkout",required=True,help="Independent git worktree at pinned Em HEAD")
    sub=a.add_subparsers(dest="command",required=True)
    sub.add_parser("audit")
    q=sub.add_parser("exact");q.add_argument("phrase");q.add_argument("--limit",type=int,default=30);q.add_argument("--estate",choices=["ALL",*ESTATES],default="ALL")
    sub.add_parser("native-census")
    q=sub.add_parser("src-projection");q.add_argument("projection");q.add_argument("--term");q.add_argument("--limit",type=int,default=100)
    q=sub.add_parser("src-native-query");q.add_argument("operation")
    q.add_argument("--snapshot",required=True);q.add_argument("--seal",required=True)
    q.add_argument("--query-sha256",required=True);q.add_argument("--id");q.add_argument("--scope")
    q=sub.add_parser("em-fixture");q.add_argument("fixture");q.add_argument("--limit",type=int,default=100)
    args=a.parse_args()
    roots={"SRC":Path(args.src_checkout),"EMSTD613":Path(args.em_checkout)}
    native_src=verify_native_checkout(roots["SRC"],"SRC")
    native_em=verify_native_checkout(roots["EMSTD613"],"EMSTD613")
    if args.command in {"audit","exact"}:
        if not args.wendbine_db or not args.repo_root:
            raise ValueError("SOURCEBOUND_QUERY_REQUIRES_WENDBINE_DB_AND_REPO_ROOT")
        it=load_sources(Path(args.wendbine_db),Path(args.repo_root),native_checkouts=roots)
        result=state(it) if args.command=="audit" else exact_query(it,args.phrase,args.limit,args.estate)
    else:
        result=native_dispatch(native_src,native_em,args.command,
           projection=getattr(args,"projection",None),term=getattr(args,"term",None),
           fixture=getattr(args,"fixture",None),operation=getattr(args,"operation",None),
           snapshot=getattr(args,"snapshot",None),seal=getattr(args,"seal",None),
           identifier=getattr(args,"id",None),scope=getattr(args,"scope",None),
           source_sha256=getattr(args,"query_sha256",None),limit=getattr(args,"limit",100))
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":main()
