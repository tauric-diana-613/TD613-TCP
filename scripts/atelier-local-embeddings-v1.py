#!/usr/bin/env python3
"""Operator-local semantic embedding build/query for SRC, Em, and Wendbine.

No research text is sent to a remote API. A locally stored model checkpoint
must be explicitly identified and loaded offline. A model-backed similarity
score is retrieval evidence only, never proof of mechanism, lineage or identity.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parent
S=importlib.util.spec_from_file_location("td613_local_query",ROOT/"atelier-cross-estate-query-v1.py")
q=importlib.util.module_from_spec(S);S.loader.exec_module(q)

def local_model_fingerprint(folder:Path):
    folder=q.check_absolute(folder)
    if not folder.is_dir():raise ValueError("LOCAL_MODEL_DIRECTORY_REQUIRED")
    entries=[]
    for parent,dirs,files in os.walk(folder,followlinks=False):
        dirs.sort();files.sort()
        if any((Path(parent)/d).is_symlink() for d in dirs):
            raise ValueError("SYMLINK_IN_LOCAL_MODEL")
        for name in files:
            path=Path(parent)/name
            if path.is_symlink():raise ValueError("SYMLINK_MODEL_FILE_REFUSED")
            if not path.is_file():continue
            with path.open("rb") as handle:
                dig=hashlib.sha256()
                for chunk in iter(lambda:handle.read(1024*1024),b""):
                    dig.update(chunk)
            entries.append([path.relative_to(folder).as_posix(),dig.hexdigest()])
    if not entries:raise ValueError("EMPTY_LOCAL_MODEL_CHECKPOINT")
    return q.digest(json.dumps(entries,ensure_ascii=False,separators=(",",":")).encode("utf8"))

def open_model(folder):
    folder=q.check_absolute(folder)
    if not folder.is_dir():raise ValueError("LOCAL_MODEL_DIRECTORY_REQUIRED")
    # Explicit offline mode: a missing model or library causes a held state.
    os.environ["HF_HUB_OFFLINE"]="1"
    os.environ["TRANSFORMERS_OFFLINE"]="1"
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as e:raise RuntimeError("LOCAL_SENTENCE_TRANSFORMERS_DEPENDENCY_MISSING") from e
    try:
        return SentenceTransformer(str(folder),local_files_only=True,trust_remote_code=False)
    except TypeError as e:
        raise RuntimeError("LOCAL_EMBEDDING_LIBRARY_VERSION_UNSUPPORTED") from e

def encode(model,text):
    result=model.encode([text],normalize_embeddings=True,show_progress_bar=False)
    if len(result)!=1:raise ValueError("MODEL_RETURNED_MULTIPLE_VECTORS")
    vector=result[0]
    return q.verified_vector(vector.tolist() if hasattr(vector,"tolist") else list(vector))

def build_vectors(chunks,embed,model_hash,path):
    dest=q.check_absolute(path)
    if not dest.parent.is_dir():raise ValueError("PRIVATE_OUTPUT_DIRECTORY_MISSING")
    if dest.exists():raise FileExistsError("PRIVATE_EMBEDDING_INDEX_ALREADY_EXISTS")
    count=0
    try:
        with dest.open("x",encoding="utf8") as out:
            for item in chunks:
                vector=q.verified_vector(embed(item["chunk"]))
                if len(vector)>q.MAX_VECTOR:raise ValueError("EMBEDDING_DIMENSION_EXCEEDS_LIMIT")
                record={"chunk_id":item["chunk_id"],
                   "source_sha256":item["source_sha256"],
                   "chunk_sha256":item["chunk_sha256"],
                   "model_sha256":model_hash,"vector":vector}
                out.write(json.dumps(record,ensure_ascii=False,separators=(",",":"))+"\n")
                count+=1
            out.flush();os.fsync(out.fileno())
    except BaseException:
        # Failed partial output is retained as an explicit non-completion artifact;
        # never silently resume it as though all source vectors exist.
        raise
    return {"schema":"td613.local-embedding-index/v1","model_sha256":model_hash,
        "vectors_written":count,"complete_only_if_expected_chunk_count_matches":True,
        "plaintext_transmitted_to_remote_provider":False}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--model-dir",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    sub=parser.add_subparsers(dest="command",required=True)
    b=sub.add_parser("build")
    b.add_argument("--repo-root",type=Path,required=True)
    b.add_argument("--wendbine-db",type=Path,required=True)
    b.add_argument("--src-checkout",type=Path,required=True)
    b.add_argument("--em-checkout",type=Path,required=True)
    ask=sub.add_parser("query-vector");ask.add_argument("query")
    a=parser.parse_args()
    model_hash=local_model_fingerprint(a.model_dir)
    model=open_model(a.model_dir)
    if a.command=="query-vector":
        vec=encode(model,a.query)
        payload={"schema":"td613.local-query-vector/v1",
                 "model_sha256":model_hash,"vector":vec}
        path=q.check_absolute(a.output)
        if path.exists():raise FileExistsError("PRIVATE_QUERY_VECTOR_ALREADY_EXISTS")
        with path.open("x",encoding="utf8") as f:
            json.dump(payload,f,ensure_ascii=False)
        result={"query_vector_written":True,"model_sha256":model_hash}
    else:
        inputs=q.u.load_sources(a.wendbine_db,a.repo_root,native_checkouts={
            "SRC":a.src_checkout,"EMSTD613":a.em_checkout})
        result=build_vectors(q.source_chunks(inputs),
          lambda x:encode(model,x),model_hash,a.output)
    print(json.dumps(result,indent=2))
if __name__=="__main__":main()
