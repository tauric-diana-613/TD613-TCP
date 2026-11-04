#!/usr/bin/env python3
"""Standalone native source-derivative search without Universal dependency.

Read-only source tree, separately built operator-local SQLite search index.
No author/original-byte attestation from text extraction alone; no semantic model.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3

MAX_FILE=16*1024*1024
MAX_TOTAL=512*1024*1024
def sha(x):return hashlib.sha256(x).hexdigest()
def local(p):
    p=Path(p)
    if not p.is_absolute() or p.is_symlink():raise ValueError("NATIVE_ABSOLUTE_NONLINK_PATH_REQUIRED")
    if any(x.is_symlink() for x in p.parents if x.exists()):raise ValueError("PARENT_SYMLINK_REFUSED")
    return p

def scan(root):
    root=local(root);folder=root/"03-DERIVATIVES"/"text"
    if not folder.is_dir() or folder.is_symlink():raise ValueError("NATIVE_TEXT_FOLDER_REQUIRED")
    total=0
    for parent,dirs,files in os.walk(folder,followlinks=False):
        dirs.sort();files.sort()
        if any((Path(parent)/d).is_symlink() for d in dirs):
            raise ValueError("NATIVE_DERIVATIVE_SYMLINK_REFUSED")
        for name in files:
            p=Path(parent)/name
            if p.suffix.lower() not in (".txt",".md"):continue
            if p.is_symlink() or not p.is_file() or p.stat().st_size>MAX_FILE:
                raise ValueError("NATIVE_TEXT_FILE_INVALID")
            b=p.read_bytes();total+=len(b)
            if total>MAX_TOTAL:raise ValueError("NATIVE_TEXT_CUMULATIVE_BOUND")
            text=b.decode("utf8",errors="strict")
            yield {"source_id":"derivative:"+p.relative_to(root).as_posix(),
                   "relative_path":p.relative_to(root).as_posix(),
                   "source_sha256":sha(b),"text":text}
def build(root,dest,estate):
    if estate not in ("SRC","EMSTD613"):raise ValueError("NATIVE_ESTATE_REQUIRED")
    dest=local(dest)
    if dest.exists():raise FileExistsError("NATIVE_INDEX_ALREADY_EXISTS")
    if not dest.parent.is_dir():raise ValueError("PRIVATE_INDEX_DIRECTORY_REQUIRED")
    con=sqlite3.connect(dest);h=hashlib.sha256();count=0
    try:
        con.executescript("""CREATE TABLE records(source_id TEXT PRIMARY KEY,
           relative_path TEXT NOT NULL,source_sha256 TEXT NOT NULL,text TEXT NOT NULL);
           CREATE VIRTUAL TABLE fts USING fts5(source_id UNINDEXED,text,
              tokenize='unicode61 remove_diacritics 0');
           CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);""")
        con.execute("BEGIN IMMEDIATE")
        for x in scan(root):
            con.execute("INSERT INTO records VALUES(?,?,?,?)",
                        (x["source_id"],x["relative_path"],x["source_sha256"],x["text"]))
            con.execute("INSERT INTO fts(source_id,text) VALUES(?,?)",
                        (x["source_id"],x["text"]))
            h.update(json.dumps([x["source_id"],x["source_sha256"]],
                ensure_ascii=False,separators=(",",":")).encode("utf8")+b"\n")
            count+=1
        if count==0:raise ValueError("NATIVE_SOURCE_FILES_NOT_FOUND")
        con.executemany("INSERT INTO meta VALUES(?,?)",
          [("estate",estate),("source_count",str(count)),("source_manifest_sha256",h.hexdigest()),
           ("status","COMPLETED_NATIVE_DERIVATIVE_INDEX")])
        con.commit()
    except BaseException:
        con.rollback();raise
    finally:con.close()
    return {"estate":estate,"indexed_derivatives":count,"source_manifest_sha256":h.hexdigest(),
            "origin_authentication":"NOT_ESTABLISHED","semantic_parity":"NOT_TESTED"}
def verify(root,db,estate):
    with sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True) as con:
        meta=dict(con.execute("SELECT key,value FROM meta"))
        if meta.get("estate")!=estate or meta.get("status")!="COMPLETED_NATIVE_DERIVATIVE_INDEX":
            raise ValueError("NATIVE_INDEX_STATUS_OR_ESTATE_CONFLICT")
        rows=list(con.execute("SELECT source_id,source_sha256,text FROM records ORDER BY rowid"))
        for sid,digest,text in rows:
            if sha(text.encode("utf8"))!=digest:raise ValueError("NATIVE_INDEX_TEXT_TAMPERED")
        original=list(scan(root))
        if len(rows)!=len(original):raise ValueError("NATIVE_INDEX_INCOMPLETE")
        byid={x["source_id"]:x["source_sha256"] for x in original}
        if any(byid.get(sid)!=digest for sid,digest,_ in rows):
            raise ValueError("NATIVE_SOURCE_CHECKOUT_DRIFT")
    return {"verified":True,"indexed_sources":len(rows),"source_origin_inferred":False}
def search(db,phrase,limit=30):
    if not isinstance(phrase,str) or not phrase.strip() or not 1<=limit<=100:
        raise ValueError("NATIVE_BOUNDED_QUERY_REQUIRED")
    words=re.findall(r"(?u)\w+",phrase)
    if not words:raise ValueError("NATIVE_QUERY_NO_WORDS")
    term=" OR ".join('"'+x.replace('"','""')+'"' for x in words[:16])
    with sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True) as con:
        rows=con.execute("""SELECT r.source_id,r.relative_path,r.source_sha256,
              bm25(fts) FROM fts JOIN records r ON r.source_id=fts.source_id
              WHERE fts MATCH ? ORDER BY bm25(fts),r.source_id LIMIT ?""",(term,limit)).fetchall()
    return {"method":"NATIVE_LEXICAL_BM25_NOT_SEMANTIC",
       "results":[{"source_id":sid,"path":path,"sha256":digest,"score":score,
                   "source_class":"EXTRACTED_NATIVE_DERIVATIVE"} for sid,path,digest,score in rows]}
def main():
    p=argparse.ArgumentParser();p.add_argument("--root",type=Path,required=True)
    p.add_argument("--index",type=Path,required=True)
    p.add_argument("--estate",choices=["SRC","EMSTD613"],required=True)
    sub=p.add_subparsers(dest="command",required=True)
    sub.add_parser("build");sub.add_parser("verify")
    find=sub.add_parser("search");find.add_argument("phrase");find.add_argument("--limit",type=int,default=30)
    a=p.parse_args()
    if a.command=="build":result=build(a.root,a.index,a.estate)
    elif a.command=="verify":result=verify(a.root,a.index,a.estate)
    else:result=search(a.index,a.phrase,a.limit)
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
