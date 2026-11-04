#!/usr/bin/env python3
"""Universal Atelier v1 · source-labeled read-only query across three estates.

Wendbine original observed bodies: operator-local SQLite created by direct sync.
SRC and Em: repository derivative texts, never misrepresented as originals.
No 'semantic' mode until actual source-verified embeddings/relations are supplied.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import sqlite3
import sys
from pathlib import Path

ESTATES=("WENDBINE","SRC","EMSTD613")
BASE=Path("packages/dome_world_exact/fixtures/a15-r0")
MAX_FILE_BYTES=8*1024*1024
MAX_CUMULATIVE_BYTES=120*1024*1024

def sha(b):return hashlib.sha256(b).hexdigest()

def repo_files(repository,estate):
    if estate not in ("SRC","EMSTD613"): raise ValueError("UNSUPPORTED_SOURCE_ESTATE")
    root=repository/BASE/estate
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

def load_sources(dbpath,repository):
    if not dbpath.is_absolute() or not dbpath.is_file() or dbpath.is_symlink():
        raise ValueError("OPERATOR_LOCAL_WENDBINE_DB_REQUIRED")
    if not repository.is_absolute() or not repository.is_dir():
        raise ValueError("EXISTING_REPOSITORY_REQUIRED")
    for estate in ESTATES[1:]:
        for row in repo_files(repository,estate):yield row
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
                "sha256":bhash,"bytes":body,"title":title,
                "text":body.decode("utf8",errors="strict"),
                "original_source_bytes_verified":True}
    finally:con.close()

def exact_query(source_iter,phrase,limit=30):
    if not isinstance(phrase,str) or not phrase or len(phrase)>1024 or limit<1 or limit>100:
        raise ValueError("BOUNDED_EXACT_QUERY_REQUIRED")
    needle=phrase.encode("utf8")
    hits=[]
    for row in source_iter:
        b=row["bytes"];start=0
        while len(hits)<limit:
            idx=b.find(needle,start)
            if idx<0:break
            hits.append({"estate":row["estate"],"source_id":row["source_id"],
              "source_kind":row["source_kind"],"source_sha256":row["sha256"],
              "byte_offset":idx,"length_utf8":len(needle),"exact_match":phrase,
              "path":row["relative_path"],"original_source_bytes_verified":row["original_source_bytes_verified"],
              "canonical_url":row.get("canonical_url")})
            start=idx+max(1,len(needle))
        if len(hits)>=limit:break
    return hits

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

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--wendbine-db",required=True)
    a.add_argument("--repo-root",required=True)
    sub=a.add_subparsers(dest="command",required=True)
    sub.add_parser("audit")
    q=sub.add_parser("exact")
    q.add_argument("phrase");q.add_argument("--limit",type=int,default=30)
    args=a.parse_args()
    it=load_sources(Path(args.wendbine_db),Path(args.repo_root))
    result=state(it) if args.command=="audit" else exact_query(it,args.phrase,args.limit)
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":main()
