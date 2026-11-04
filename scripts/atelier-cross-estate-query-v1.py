#!/usr/bin/env python3
"""Local source-bound cross-Atelier lexical + optional real semantic retrieval.

Only uses operator-local Wendbine DB and pinned SRC/Em native derivatives.
Source, capture, derivative, Work, candidate relation and scientific finding are
separate entities. Embedding-only proximity cannot establish genealogy, causation,
identity or scientifically validated mathematical topology.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import math
import re
import unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("td613_cross_estate_base",ROOT/"universal-atelier-sourcebound-readonly-v1.py")
u=importlib.util.module_from_spec(spec);spec.loader.exec_module(u)
MAX_ITEMS=50000
MAX_FILE=512*1024*1024
MAX_VECTOR=4096

def digest(x):return hashlib.sha256(x).hexdigest()
def normal(x):return unicodedata.normalize("NFKC",x).casefold()
def tokens(s):return set(re.findall(r"(?u)\w{2,}",normal(s)))
def check_absolute(path):
    path=Path(path)
    if not path.is_absolute() or path.is_symlink():
        raise ValueError("ABSOLUTE_PRIVATE_PATH_REQUIRED")
    if any(p.is_symlink() for p in path.parents if p.exists()):
        raise ValueError("SYMLINK_PARENT_REFUSED")
    return path

def source_chunks(source_iter,*,max_chars=1200,overlap=100):
    if not 200<=max_chars<=8000 or not 0<=overlap<max_chars:
        raise ValueError("CHUNK_WINDOW_INVALID")
    count=0
    for row in source_iter:
        for field,blob,field_hash in (
           [("body",row["bytes"],row["sha256"])] +
           ([("title",row["title"],row["title_sha256"])] if row["estate"]=="WENDBINE" else [])):
            if digest(blob)!=field_hash:raise ValueError("CHUNK_SOURCE_HASH_DISAGREES")
            text=blob.decode("utf8",errors="strict")
            for begin in range(0,len(text),max_chars-overlap):
                chunk=text[begin:begin+max_chars]
                if not chunk:break
                offset=len(text[:begin].encode("utf8"))
                uid="chunk:"+digest(json.dumps([row["estate"],row["source_id"],
                   row.get("capture_id"),field,field_hash,offset],
                   ensure_ascii=False,separators=(",",":")).encode("utf8"))
                yield {"chunk_id":uid,"estate":row["estate"],
                  "source_id":row["source_id"],"capture_id":row.get("capture_id"),
                  "source_kind":row["source_kind"],"relative_path":row.get("relative_path"),
                  "source_field":field,"source_sha256":field_hash,
                  "byte_offset":offset,"chunk_sha256":digest(chunk.encode("utf8")),
                  "chunk":chunk,"source_observation_class":
                      "OPERATOR_LOCAL_OBSERVED_CAPTURE" if row.get("capture_id")
                      else "NATIVE_DERIVATIVE_OR_PROVIDER_OBSERVATION",
                  "relation_authority":"NONE_FROM_RETRIEVAL"}
                count+=1
                if count>MAX_ITEMS:raise ValueError("CROSS_ESTATE_CHUNK_CAP_REACHED")
                if begin+max_chars>=len(text):break

def lexical(query,chunks,*,limit=20):
    if not isinstance(query,str) or not query.strip() or not 1<=limit<=100:
        raise ValueError("QUERY_OR_LIMIT_INVALID")
    q=tokens(query)
    if not q:raise ValueError("QUERY_NO_SEARCH_TERMS")
    rows=[]
    for row in chunks:
        txt=normal(row["chunk"])
        words=tokens(row["chunk"])
        common=q & words
        if not common:continue
        score=len(common)/len(q)+len(common)/(len(words)+1)
        if normal(query).strip() in txt:score+=2
        if row["source_field"]=="title":score+=0.15
        rows.append({k:v for k,v in row.items() if k!="chunk"}|{"score":round(score,6),
            "matched_query_terms":sorted(common),
            "method":"LEXICAL_LITERAL_CANDIDATE"})
    rows.sort(key=lambda x:(-x["score"],x["estate"],x["source_id"],
                           x["source_field"],x["byte_offset"]))
    return rows[:limit]

def dot(a,b):return sum(x*y for x,y in zip(a,b))
def verified_vector(v):
    if not isinstance(v,list) or not 2<=len(v)<=MAX_VECTOR or any(
        isinstance(x,bool) or not isinstance(x,(float,int)) or not math.isfinite(x) for x in v):
        raise ValueError("VECTOR_INVALID")
    magnitude=math.sqrt(dot(v,v))
    if magnitude<=0:raise ValueError("ZERO_VECTOR")
    return [float(x)/magnitude for x in v]

def semantic(query_vector,chunks,vectors,*,model_sha256,limit=20):
    """Rank locally computed vectors; source SHA and chunk SHA must still match."""
    if not isinstance(model_sha256,str) or not re.fullmatch(r"[0-9a-f]{64}",model_sha256):
        raise ValueError("MODEL_DIGEST_REQUIRED")
    if not 1<=limit<=100:raise ValueError("SEMANTIC_LIMIT_INVALID")
    q=verified_vector(query_vector)
    by_id={x["chunk_id"]:x for x in chunks}
    if len(by_id)!=len(chunks):raise ValueError("DUPLICATE_CHUNK_ID")
    out=[];seen=set()
    for record in vectors:
        if record.get("model_sha256")!=model_sha256:
            raise ValueError("MODEL_VERSION_OR_PROVENANCE_MISMATCH")
        cid=record.get("chunk_id")
        if cid in seen:raise ValueError("DUPLICATE_VECTOR_CHUNK")
        seen.add(cid)
        source=by_id.get(cid)
        if source is None or source["source_sha256"]!=record.get("source_sha256") or \
           source["chunk_sha256"]!=record.get("chunk_sha256"):
            raise ValueError("UNBOUND_OR_STALE_SEMANTIC_VECTOR")
        v=verified_vector(record.get("vector"))
        if len(v)!=len(q):raise ValueError("EMBEDDING_DIMENSION_MISMATCH")
        out.append({k:v for k,v in source.items() if k!="chunk"}|
            {"score":round(dot(q,v),8),"method":"LOCAL_EMBEDDING_CANDIDATE_ONLY",
            "embedding_model_sha256":model_sha256,
            "source_span_verified":True,
            "semantic_relation_proven":False})
    out.sort(key=lambda x:(-x["score"],x["estate"],x["chunk_id"]))
    return out[:limit]

def probe(query,chunks,*,limit=15):
    """Lexical baseline and explicit inquiry suggestions, not model-based semantics."""
    ranked=lexical(query,chunks,limit=limit)
    by_estate={e:[] for e in u.ESTATES}
    for hit in ranked:by_estate[hit["estate"]].append(hit)
    return {"schema":"td613.cross-estate-query/v1",
      "query":query,"method":"LEXICAL_SOURCE_BOUND_BASELINE",
      "ranked":ranked,"hits_by_estate":{k:len(v) for k,v in by_estate.items()},
      "alternate_queries_to_test":[
        "Which exact original source or capture supports this relation?",
        "What counterexample would separate shared motif from shared mechanism?",
        "Can a different corpus establish the same specific operator independently?",
        "Which stratigraphic role changes with scope, time or route?"],
      "automatic_crosswalk_admitted":False,
      "vague_to_specific_semantic_parity":"UNTESTED_WITHOUT_LOCAL_EMBEDDINGS_AND_HUMAN_GOLD_QUERIES",
      "scientific_promotion":False}

def read_vector_file(path):
    path=check_absolute(path)
    if not path.is_file() or path.stat().st_size>MAX_FILE:
        raise ValueError("PRIVATE_VECTOR_INDEX_REQUIRED")
    rows=[]
    for line in path.read_text("utf8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
            if len(rows)>MAX_ITEMS:raise ValueError("VECTOR_INDEX_OVERSIZE")
    return rows

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,required=True)
    p.add_argument("--wendbine-db",type=Path,required=True)
    p.add_argument("--src-checkout",type=Path,required=True)
    p.add_argument("--em-checkout",type=Path,required=True)
    sub=p.add_subparsers(dest="cmd",required=True)
    lex=sub.add_parser("lexical");lex.add_argument("query");lex.add_argument("--limit",type=int,default=15)
    sem=sub.add_parser("semantic");sem.add_argument("--query-vector-file",type=Path,required=True)
    sem.add_argument("--private-vectors",type=Path,required=True)
    sem.add_argument("--model-sha256",required=True);sem.add_argument("--limit",type=int,default=15)
    a=p.parse_args()
    rows=list(source_chunks(u.load_sources(a.wendbine_db,a.repo_root,
        native_checkouts={"SRC":a.src_checkout,"EMSTD613":a.em_checkout})))
    if a.cmd=="lexical":res=probe(a.query,rows,limit=a.limit)
    else:
        q=json.loads(check_absolute(a.query_vector_file).read_text("utf8"))
        res={"schema":"td613.cross-estate-semantic-candidates/v1",
             "hits":semantic(q["vector"],rows,read_vector_file(a.private_vectors),
                model_sha256=a.model_sha256,limit=a.limit),
             "source_bound":True,"relation_proven":False}
    print(json.dumps(res,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
