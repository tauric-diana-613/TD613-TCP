#!/usr/bin/env python3
"""Operator-local source-bound reference index across SRC, Em and Wendbine.

Comparably exposes source lookup, citation, lexical/BM25 search, provenance
facets, typed neighbors and bounded route traversal. It is NOT the published
TD613 Encyclopedia, a source admission surface, or scientific equivalence.
"""
from __future__ import annotations
import argparse
from collections import deque
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sqlite3

HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location("td613_reference_cross_query",
    HERE/"atelier-cross-estate-query-v1.py")
q=importlib.util.module_from_spec(s);s.loader.exec_module(q)
VERSION="td613.atelier-reference-index/v1"

def source_tag(chunk):
    return (chunk["estate"],chunk["source_id"],chunk.get("capture_id"))

def build(dest,source_chunks,edges=()):
    dest=q.check_absolute(dest)
    if dest.exists():raise FileExistsError("REFERENCE_INDEX_NEW_PATH_REQUIRED")
    if not dest.parent.is_dir():raise ValueError("REFERENCE_INDEX_PARENT_MISSING")
    con=sqlite3.connect(dest);count=0;refs=set();manifest=hashlib.sha256()
    try:
        con.execute("PRAGMA journal_mode=DELETE")
        con.executescript("""CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
          CREATE TABLE records(doc_id TEXT PRIMARY KEY,estate TEXT NOT NULL,
            source_id TEXT NOT NULL,capture_id TEXT,source_kind TEXT NOT NULL,
            source_field TEXT NOT NULL,source_sha256 TEXT NOT NULL,
            chunk_sha256 TEXT NOT NULL,byte_offset INTEGER NOT NULL,text TEXT NOT NULL);
          CREATE VIRTUAL TABLE fts USING fts5(doc_id UNINDEXED,text,
            tokenize='unicode61 remove_diacritics 0');
          CREATE TABLE relations(edge_id TEXT PRIMARY KEY,src TEXT NOT NULL,
            dst TEXT NOT NULL,relation_type TEXT NOT NULL,
            projection TEXT NOT NULL,evidence_id TEXT NOT NULL,
            evidence_status TEXT NOT NULL,authority TEXT NOT NULL);""")
        con.execute("BEGIN IMMEDIATE")
        for obj in source_chunks:
            blob=obj["chunk"].encode("utf8")
            if hashlib.sha256(blob).hexdigest()!=obj["chunk_sha256"]:
                raise ValueError("SOURCE_CHUNK_HASH_CONFLICT")
            cid=obj["chunk_id"]
            con.execute("INSERT INTO records VALUES(?,?,?,?,?,?,?,?,?,?)",
              (cid,obj["estate"],obj["source_id"],obj.get("capture_id"),
               obj["source_kind"],obj["source_field"],obj["source_sha256"],
               obj["chunk_sha256"],obj["byte_offset"],obj["chunk"]))
            con.execute("INSERT INTO fts(doc_id,text) VALUES(?,?)",(cid,obj["chunk"]))
            manifest.update(json.dumps([cid,obj["source_sha256"],obj["chunk_sha256"]],
                ensure_ascii=False,separators=(",",":")).encode("utf8")+b"\n")
            refs.add(source_tag(obj));count+=1
        if count==0:raise ValueError("REFERENCE_SOURCE_CORPUS_EMPTY")
        for edge in edges:
            if edge.get("authority")!="RESEARCH_ONLY" or not edge.get("evidence_id") or \
              edge.get("evidence_status") not in ("ARCHIVE_OBSERVATION","SOURCE_WITNESSED","CANDIDATE"):
                raise ValueError("UNBOUND_OR_PROMOTED_RELATION")
            con.execute("INSERT INTO relations VALUES(?,?,?,?,?,?,?,?)",
                (edge["edge_id"],edge["src"],edge["dst"],edge["relation_type"],
                 edge["projection"],edge["evidence_id"],edge["evidence_status"],
                 edge["authority"]))
        metadata={"schema":VERSION,"record_count":str(count),
            "source_instance_count":str(len(refs)),
            "source_digest":manifest.hexdigest(),"status":"COMPLETE_OPERATOR_LOCAL_INDEX"}
        con.executemany("INSERT INTO meta VALUES(?,?)",list(metadata.items()))
        con.commit()
    except BaseException:
        con.rollback();raise
    finally:con.close()
    return {"record_count":count,"source_instances":len(refs),
        "source_digest":manifest.hexdigest(),
        "index_status":"CREATED_NOT_INDEPENDENTLY_SEMANTICALLY_VALIDATED"}

def connect(db):
    db=q.check_absolute(db)
    if not db.is_file():raise ValueError("REFERENCE_INDEX_MISSING")
    return sqlite3.connect(db.as_uri()+"?mode=ro",uri=True)

def cite(con,record):
    return {"doc_id":record[0],"estate":record[1],"source_id":record[2],
      "capture_id":record[3],"source_kind":record[4],
      "source_field":record[5],"source_sha256":record[6],
      "chunk_sha256":record[7],"byte_offset":record[8],
      "evidence_class":"SOURCE_BOUND_RETRIEVAL_NOT_SCIENTIFIC_PROOF"}

def get(con,doc_id,*,include_text=False):
    r=con.execute("SELECT * FROM records WHERE doc_id=?",(doc_id,)).fetchone()
    if r is None:return {"state":"SOURCE_CHUNK_NOT_IN_INDEX","doc_id":doc_id}
    if hashlib.sha256(r[9].encode("utf8")).hexdigest()!=r[7]:
        raise ValueError("LOCAL_REFERENCE_TEXT_CORRUPTED")
    out=cite(con,r)
    if include_text:out["text"]=r[9]
    return out

def search(con,text,*,estate="ALL",limit=25,offset=0):
    if not isinstance(text,str) or not text or not 1<=limit<=100 or not 0<=offset<=5000:
        raise ValueError("REFERENCE_SEARCH_LIMIT_OR_TEXT")
    if estate!="ALL" and estate not in ("SRC","EMSTD613","WENDBINE"):
        raise ValueError("REFERENCE_SEARCH_ESTATE_UNKNOWN")
    tokens=re.findall(r"(?u)\w+",text)
    if not tokens:raise ValueError("SEARCH_TERMS_REQUIRED")
    query=" OR ".join('"'+v.replace('"','""')+'"' for v in tokens[:16])
    sql="""SELECT r.*,bm25(fts) FROM fts JOIN records r ON r.doc_id=fts.doc_id
        WHERE fts MATCH ?"""
    params=[query]
    if estate!="ALL":sql+=" AND r.estate=?";params.append(estate)
    sql+=" ORDER BY bm25(fts),r.doc_id LIMIT ? OFFSET ?";params.extend([limit,offset])
    data=con.execute(sql,params).fetchall()
    return {"query":text,"estate":estate,"limit":limit,"offset":offset,
        "results":[cite(con,r)|{"bm25_score":r[10],
          "rank_evidence":"LEXICAL_RELEVANCE_NOT_SCIENTIFIC_VALIDITY"} for r in data]}

def facets(con):
    counts=con.execute("SELECT estate,COUNT(*),COUNT(DISTINCT source_id) FROM records GROUP BY estate").fetchall()
    return {"by_estate":[{"estate":r[0],"indexed_chunks":r[1],"unique_source_ids":r[2]} for r in counts],
      "provenance":list(map(list,con.execute(
        "SELECT source_kind,COUNT(*) FROM records GROUP BY source_kind ORDER BY source_kind")))}

def neighbors(con,source_id,*,projection=None):
    rows=con.execute("""SELECT edge_id,src,dst,relation_type,projection,evidence_id,
       evidence_status FROM relations WHERE src=? OR dst=? ORDER BY edge_id""",
       (source_id,source_id)).fetchall()
    return [{"edge_id":e[0],"from":e[1],"to":e[2],"relation_type":e[3],
       "projection":e[4],"evidence_id":e[5],"evidence_status":e[6],
       "causal_relation_inferred":False}
       for e in rows if projection is None or e[4]==projection]

def route(con,start,goal,*,projection=None,max_depth=4):
    if not 1<=max_depth<=6:raise ValueError("ROUTE_DEPTH_BOUNDED")
    graph={}
    sql="SELECT src,dst,edge_id,projection FROM relations ORDER BY edge_id"
    for src,dst,eid,p in con.execute(sql):
        if projection is None or projection==p:graph.setdefault(src,[]).append((dst,eid))
    frontier=deque([(start,[],{start})])
    while frontier:
        node,path,seen=frontier.popleft()
        if node==goal:return {"route":path,"status":"TYPED_EDGE_PATH_ONLY_NOT_NEW_DIRECT_RELATION"}
        if len(path)>=max_depth:continue
        for nxt,eid in graph.get(node,[]):
            if nxt not in seen:frontier.append((nxt,path+[eid],seen|{nxt}))
    return {"route":[],"status":"NO_RECORDED_PATH_NOT_SOURCE_ABSENCE"}

def verify(con):
    if con.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
        raise ValueError("REFERENCE_SQLITE_CORRUPT")
    meta=dict(con.execute("SELECT key,value FROM meta"))
    if meta.get("schema")!=VERSION or meta.get("status")!="COMPLETE_OPERATOR_LOCAL_INDEX":
        raise ValueError("REFERENCE_INDEX_UNSEALED")
    manifest=hashlib.sha256();count=0
    for cid,source_hash,chunk_hash,text in con.execute(
       "SELECT doc_id,source_sha256,chunk_sha256,text FROM records ORDER BY rowid"):
        if hashlib.sha256(text.encode("utf8")).hexdigest()!=chunk_hash:
            raise ValueError("REFERENCE_TEXT_DIGEST_MISMATCH")
        manifest.update(json.dumps([cid,source_hash,chunk_hash],
             ensure_ascii=False,separators=(",",":")).encode("utf8")+b"\n");count+=1
    if manifest.hexdigest()!=meta["source_digest"] or count!=int(meta["record_count"]):
        raise ValueError("REFERENCE_MANIFEST_DIGEST_MISMATCH")
    return {"state":"INDEX_BYTES_VERIFIED_NOT_EXTERNAL_ORIGIN","records":count,
            "source_digest":manifest.hexdigest()}
def main():
    p=argparse.ArgumentParser();p.add_argument("--index",type=Path,required=True)
    sub=p.add_subparsers(dest="command",required=True)
    b=sub.add_parser("build");b.add_argument("--repo-root",type=Path,required=True)
    b.add_argument("--wendbine-db",type=Path,required=True)
    b.add_argument("--src-checkout",type=Path,required=True)
    b.add_argument("--em-checkout",type=Path,required=True)
    s=sub.add_parser("search");s.add_argument("text");s.add_argument("--estate",default="ALL")
    g=sub.add_parser("get");g.add_argument("doc_id");g.add_argument("--include-text",action="store_true")
    n=sub.add_parser("neighbors");n.add_argument("source_id")
    v=sub.add_parser("route");v.add_argument("start");v.add_argument("goal")
    sub.add_parser("facets");sub.add_parser("verify")
    args=p.parse_args()
    if args.command=="build":
        rows=q.source_chunks(q.u.load_sources(args.wendbine_db,args.repo_root,
          native_checkouts={"SRC":args.src_checkout,"EMSTD613":args.em_checkout}))
        out=build(args.index,rows)
    else:
        with connect(args.index) as con:
            if args.command=="search":out=search(con,args.text,estate=args.estate)
            elif args.command=="get":out=get(con,args.doc_id,include_text=args.include_text)
            elif args.command=="neighbors":out=neighbors(con,args.source_id)
            elif args.command=="route":out=route(con,args.start,args.goal)
            elif args.command=="facets":out=facets(con)
            else:out=verify(con)
    print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
