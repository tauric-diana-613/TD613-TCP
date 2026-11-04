#!/usr/bin/env python3
"""Bounded offline semantic sidecar for all three source estates.

Pretrained model is loaded from an existing local directory with offline flags.
Builds a new immutable SQLite vector index with exact native source fingerprint.
No network API, no source admission, no assumption that similarity proves lineage.
"""
from __future__ import annotations
import argparse
import hashlib
import heapq
import importlib.util
import json
import math
import os
from pathlib import Path
import sqlite3
import struct

ROOT=Path(__file__).resolve().parent
def module(name,filename):
    s=importlib.util.spec_from_file_location(name,ROOT/filename)
    m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
q=module("td613_semantic_query", "atelier-cross-estate-query-v1.py")
e=module("td613_semantic_local", "atelier-local-embeddings-v1.py")
VERSION="td613.atelier.semantic-sqlite/v1"

def corpus_rows(wendbine_db,repo,src,em):
    return q.source_chunks(q.u.load_sources(wendbine_db,repo,
        native_checkouts={"SRC":src,"EMSTD613":em}),max_chars=1200,overlap=100)

def json_line(item):
    return json.dumps(item,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf8")+b"\n"

def snapshot_step(hasher,item):
    hasher.update(json_line([item["chunk_id"],item["estate"],item["source_id"],
        item["capture_id"],item["source_sha256"],item["chunk_sha256"]]))
def pack(v):
    values=q.verified_vector(v)
    return struct.pack("<"+str(len(values))+"f",*values)
def unpack(raw,n):
    if len(raw)!=n*4:raise ValueError("VECTOR_BLOB_DIMENSION_CONFLICT")
    values=struct.unpack("<"+str(n)+"f",raw)
    return q.verified_vector(list(values))

def build(destination,rows,embed,model_hash,*,embed_batch=None,batch_size=24):
    dest=q.check_absolute(destination)
    if dest.exists():raise FileExistsError("EXCLUSIVE_NEW_SEMANTIC_INDEX_REQUIRED")
    if not dest.parent.is_dir():raise ValueError("PRIVATE_INDEX_PARENT_MISSING")
    if not isinstance(model_hash,str) or len(model_hash)!=64:raise ValueError("MODEL_SHA_REQUIRED")
    if type(batch_size) is not int or not 1<=batch_size<=128:raise ValueError("SEMANTIC_BATCH_SIZE_INVALID")
    con=sqlite3.connect(dest)
    count=0;states={};finger=hashlib.sha256();dimension=None
    try:
        con.execute("PRAGMA journal_mode=DELETE")
        con.executescript("""CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
            CREATE TABLE vectors(chunk_id TEXT PRIMARY KEY,estate TEXT NOT NULL,
              source_id TEXT NOT NULL,capture_id TEXT,source_kind TEXT NOT NULL,
              source_field TEXT NOT NULL,source_sha256 TEXT NOT NULL,
              chunk_sha256 TEXT NOT NULL,byte_offset INTEGER NOT NULL,
              dims INTEGER NOT NULL,vector BLOB NOT NULL);""")
        con.execute("BEGIN IMMEDIATE")
        def add(item,vector):
            nonlocal count,dimension
            raw=pack(vector);dim=len(raw)//4
            if dimension is None:dimension=dim
            if dim!=dimension:raise ValueError("INCONSISTENT_MODEL_EMBEDDING_DIMENSIONS")
            con.execute("INSERT INTO vectors VALUES(?,?,?,?,?,?,?,?,?,?,?)",
               (item["chunk_id"],item["estate"],item["source_id"],item.get("capture_id"),
                item["source_kind"],item["source_field"],item["source_sha256"],
                item["chunk_sha256"],item["byte_offset"],dim,raw))
            snapshot_step(finger,item)
            states[item["estate"]]=states.get(item["estate"],0)+1
            count+=1
        if embed_batch is None:
            for item in rows:add(item,embed(item["chunk"]))
        else:
            pending=[]
            def flush():
                if not pending:return
                vectors=embed_batch([item["chunk"] for item in pending])
                if len(vectors)!=len(pending):
                    raise ValueError("SEMANTIC_BATCH_VECTOR_COUNT_CONFLICT")
                for item,vector in zip(pending,vectors):add(item,vector)
                pending.clear()
            for item in rows:
                pending.append(item)
                if len(pending)>=batch_size:flush()
            flush()
        if count==0 or any(states.get(estate,0)==0 for estate in q.u.ESTATES):
            raise ValueError("THREE_NONEMPTY_SOURCE_ESTATES_REQUIRED")
        meta={"schema":VERSION,"model_sha256":model_hash,
             "corpus_chunk_count":str(count),"corpus_manifest_sha256":finger.hexdigest(),
             "vector_dimensions":str(dimension),
             "estate_chunk_counts_json":json.dumps(states,sort_keys=True),
             "state":"COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION"}
        con.executemany("INSERT INTO metadata VALUES(?,?)",list(meta.items()))
        con.commit()
    except BaseException:
        con.rollback();con.close()
        raise
    finally:
        try:con.close()
        except Exception:pass
    return {"state":"COMPLETE_SOFTWARE_INDEX_WITH_SOURCE_BINDING",
      "source_chunk_count":count,"chunks_by_estate":states,
      "corpus_manifest_sha256":finger.hexdigest(),
      "model_sha256":model_hash,"scientific_semantic_parity":"NOT_EVALUATED"}

def audit(db,source_rows):
    db=q.check_absolute(db)
    if not db.is_file():raise ValueError("LOCAL_VECTOR_DATABASE_REQUIRED")
    con=sqlite3.connect(db.as_uri()+"?mode=ro",uri=True)
    try:
        if con.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
            raise ValueError("SEMANTIC_VECTOR_SQLITE_CORRUPT")
        meta=dict(con.execute("SELECT key,value FROM metadata"))
        if meta.get("schema")!=VERSION or meta.get("state")!="COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION":
            raise ValueError("SEMANTIC_VECTOR_INDEX_UNSEALED")
        finger=hashlib.sha256();count=0
        for item in source_rows:
            snapshot_step(finger,item);count+=1
        if finger.hexdigest()!=meta["corpus_manifest_sha256"] or count!=int(meta["corpus_chunk_count"]):
            raise ValueError("SEMANTIC_INDEX_SOURCE_SNAPSHOT_DRIFT")
        return meta
    finally:con.close()

def search(db,query_vector,*,model_hash,limit=20,estate="ALL"):
    if estate!="ALL" and estate not in q.u.ESTATES:raise ValueError("UNKNOWN_SEMANTIC_ESTATE")
    if not 1<=limit<=100:raise ValueError("SEMANTIC_QUERY_LIMIT")
    vector=q.verified_vector(query_vector)
    with sqlite3.connect(q.check_absolute(db).as_uri()+"?mode=ro",uri=True) as con:
        meta=dict(con.execute("SELECT key,value FROM metadata"))
        if meta.get("state")!="COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION" or \
           meta.get("schema")!=VERSION or meta.get("model_sha256")!=model_hash:
            raise ValueError("SEMANTIC_MODEL_OR_INDEX_STATE_DRIFT")
        if len(vector)!=int(meta["vector_dimensions"]):
            raise ValueError("QUERY_VECTOR_DIMENSION_CONFLICT")
        sql="""SELECT chunk_id,estate,source_id,capture_id,source_kind,source_field,
            source_sha256,chunk_sha256,byte_offset,dims,vector FROM vectors"""
        params=[]
        if estate!="ALL":sql+=" WHERE estate=?";params=[estate]
        rows=[]
        for cid,est,sid,cap,kind,field,s_hash,c_hash,offset,dims,blob in con.execute(sql,params):
            score=sum(a*b for a,b in zip(vector,unpack(blob,dims)))
            rows.append((score,cid,est,sid,cap,kind,field,s_hash,c_hash,offset))
        top=heapq.nlargest(limit,rows,key=lambda x:(x[0],x[1]))
    return [{"score":round(r[0],8),"chunk_id":r[1],"estate":r[2],
       "source_id":r[3],"capture_id":r[4],"source_kind":r[5],
       "source_field":r[6],"source_sha256":r[7],
       "chunk_sha256":r[8],"byte_offset":r[9],
       "retrieval_class":"LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION",
       "model_sha256":model_hash} for r in top]

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,required=True)
    p.add_argument("--wendbine-db",type=Path,required=True)
    p.add_argument("--src-checkout",type=Path,required=True)
    p.add_argument("--em-checkout",type=Path,required=True)
    p.add_argument("--model-dir",type=Path,required=True)
    p.add_argument("--index",type=Path,required=True)
    sub=p.add_subparsers(dest="cmd",required=True)
    sub.add_parser("build")
    s=sub.add_parser("query");s.add_argument("text");s.add_argument("--estate",default="ALL")
    s.add_argument("--limit",type=int,default=20)
    a=p.parse_args()
    model_hash=e.local_model_fingerprint(a.model_dir)
    if a.cmd=="query":
        audit(a.index,corpus_rows(a.wendbine_db,a.repo_root,a.src_checkout,a.em_checkout))
    model=e.open_model(a.model_dir)
    if a.cmd=="build":
        result=build(a.index,corpus_rows(a.wendbine_db,a.repo_root,a.src_checkout,a.em_checkout),
                     lambda t:e.encode(model,t),model_hash,
                     embed_batch=lambda texts:model.encode(texts,batch_size=24,
                       normalize_embeddings=True,show_progress_bar=False),
                     batch_size=24)
    else:
        result={"model_sha256":model_hash,
          "results":search(a.index,e.encode(model,a.text),
                           model_hash=model_hash,limit=a.limit,estate=a.estate),
          "scientific_semantic_parity":"REQUIRES_RELEVANCE_BENCHMARK"}
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
