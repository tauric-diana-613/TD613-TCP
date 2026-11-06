#!/usr/bin/env python3
"""Standalone native source-derivative search without Universal dependency.

Read-only source tree, separately built operator-local SQLite search index.
No author/original-byte attestation from text extraction alone; no semantic model.
"""
from __future__ import annotations
from contextlib import closing
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
    with closing(sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True)) as con:
        meta=dict(con.execute("SELECT key,value FROM meta"))
        if meta.get("estate")!=estate or meta.get("status")!="COMPLETED_NATIVE_DERIVATIVE_INDEX":
            raise ValueError("NATIVE_INDEX_STATUS_OR_ESTATE_CONFLICT")
        rows=list(con.execute("SELECT source_id,source_sha256,text FROM records ORDER BY rowid"))
        for sid,digest,text in rows:
            if sha(text.encode("utf8"))!=digest:raise ValueError("NATIVE_INDEX_TEXT_TAMPERED")
        fts=list(con.execute("SELECT source_id,text FROM fts ORDER BY rowid"))
        if fts!=[(sid,text) for sid,digest,text in rows]:raise ValueError("NATIVE_FTS_MIRROR_TAMPERED")
        h=hashlib.sha256()
        for sid,digest,_ in rows:h.update(json.dumps([sid,digest],ensure_ascii=False,separators=(",",":")).encode("utf8")+b"\n")
        if meta.get("source_manifest_sha256")!=h.hexdigest() or meta.get("source_count")!=str(len(rows)):raise ValueError("NATIVE_MANIFEST_TAMPERED")
        original=list(scan(root))
        if len(rows)!=len(original):raise ValueError("NATIVE_INDEX_INCOMPLETE")
        byid={x["source_id"]:x["source_sha256"] for x in original}
        if any(byid.get(sid)!=digest for sid,digest,_ in rows):
            raise ValueError("NATIVE_SOURCE_CHECKOUT_DRIFT")
    return {"verified":True,"indexed_sources":len(rows),"source_origin_inferred":False}
def search(db,phrase,limit=30,*,offset=0,mode="lexical"):
    if not isinstance(phrase,str) or not phrase.strip() or type(limit) is not int or not 1<=limit<=100 or type(offset) is not int or not 0<=offset<=1000000:
        raise ValueError("NATIVE_BOUNDED_QUERY_REQUIRED")
    if mode not in ("lexical","phrase","exact"):raise ValueError("NATIVE_QUERY_MODE")
    with closing(sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True)) as con:
        if mode=="exact":
            where="instr(r.text,?)>0";term=phrase
            base="FROM records r WHERE "+where
            sql="SELECT r.source_id,r.relative_path,r.source_sha256,0 "+base+" ORDER BY r.source_id LIMIT ? OFFSET ?"
        else:
            words=re.findall(r"(?u)\w+",phrase)
            if not words:raise ValueError("NATIVE_QUERY_NO_WORDS")
            term=('"'+phrase.replace('"','""')+'"') if mode=="phrase" else " OR ".join('"'+x.replace('"','""')+'"' for x in words[:16])
            base="FROM fts JOIN records r ON r.source_id=fts.source_id WHERE fts MATCH ?"
            sql="SELECT r.source_id,r.relative_path,r.source_sha256,bm25(fts) "+base+" ORDER BY bm25(fts),r.source_id LIMIT ? OFFSET ?"
        total=con.execute("SELECT COUNT(*) "+base,(term,)).fetchone()[0]
        rows=con.execute(sql,(term,limit,offset)).fetchall()
    return {"method":"NATIVE_"+mode.upper()+"_NOT_SEMANTIC","total":total,"offset":offset,"limit":limit,"truncated":offset+len(rows)<total,
       "results":[{"source_id":sid,"path":path,"sha256":digest,"score":score,
                   "source_class":"EXTRACTED_NATIVE_DERIVATIVE"} for sid,path,digest,score in rows]}


def get(db,source_id,*,include_text=False):
    with closing(sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True)) as con:
        row=con.execute("SELECT source_id,relative_path,source_sha256,text FROM records WHERE source_id=?",(source_id,)).fetchone()
        if row is None:return {"state":"SOURCE_NOT_IN_INDEX","source_id":source_id}
        if sha(row[3].encode("utf8"))!=row[2]:raise ValueError("NATIVE_INDEX_TEXT_TAMPERED")
        out={"source_id":row[0],"relative_path":row[1],"source_sha256":row[2],"source_class":"EXTRACTED_NATIVE_DERIVATIVE","source_origin_inferred":False}
        if include_text:out["text"]=row[3]
        return out

def facets(db):
    with closing(sqlite3.connect(local(db).as_uri()+"?mode=ro",uri=True)) as con:
        return {"metadata":dict(con.execute("SELECT key,value FROM meta")),"indexed_derivatives":con.execute("SELECT COUNT(*) FROM records").fetchone()[0]}

def context(db,source_id,*,byte_offset=0,length=600):
    if type(byte_offset) is not int or byte_offset<0 or type(length) is not int or not 1<=length<=4000:raise ValueError("NATIVE_CONTEXT_BOUNDS")
    out=get(db,source_id,include_text=True)
    if "text" not in out:return out
    body=out.pop("text").encode("utf8")
    if byte_offset>len(body):raise ValueError("NATIVE_CONTEXT_OFFSET")
    # An exact source locator must start on a UTF-8 boundary.
    body[:byte_offset].decode("utf8")
    span=body[byte_offset:byte_offset+length]
    while span:
        try:text=span.decode("utf8");break
        except UnicodeDecodeError:span=span[:-1]
    else:text=""
    return out|{"byte_offset":byte_offset,"length_utf8":len(span),"span_sha256":sha(span),"text":text}

def cite(db,source_id):
    return get(db,source_id)

def main():
    p=argparse.ArgumentParser();p.add_argument("--root",type=Path,required=True)
    p.add_argument("--index",type=Path,required=True)
    p.add_argument("--estate",choices=["SRC","EMSTD613"],required=True)
    sub=p.add_subparsers(dest="command",required=True)
    sub.add_parser("build");sub.add_parser("verify")
    find=sub.add_parser("search");find.add_argument("phrase");find.add_argument("--limit",type=int,default=30);find.add_argument("--offset",type=int,default=0);find.add_argument("--mode",choices=["lexical","phrase","exact"],default="lexical")
    for op in ("get","cite","context"):
        sub.add_parser(op).add_argument("source_id")
    sub.add_parser("facets")
    a=p.parse_args()
    if a.command=="build":result=build(a.root,a.index,a.estate)
    elif a.command=="verify":result=verify(a.root,a.index,a.estate)
    elif a.command=="search":result=search(a.index,a.phrase,a.limit,offset=a.offset,mode=a.mode)
    elif a.command=="facets":result=facets(a.index)
    else:result=globals()[a.command](a.index,a.source_id)
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
