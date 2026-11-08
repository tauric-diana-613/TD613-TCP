#!/usr/bin/env python3
"""Wendbine real historical source-coverage reconciliation: no silent omissions.

Compare operator-local actual source-body SQLite index with sealed GitHub
public manifest (metadata only). Missing IDs stay HELD rather than filled
from encrypted/private content or invented source text.
"""
import argparse
import datetime as dt
import json
import sqlite3
from pathlib import Path

def timestamp(s):
    d=dt.datetime.fromisoformat(s.replace("Z","+00:00"))
    if not d.tzinfo:raise ValueError("UTC_AWARE_TIME_REQUIRED")
    return d.timestamp()

def reconcile(db_path:Path,manifest:Path,since:str,until:str):
    lo,hi=timestamp(since),timestamp(until)
    if hi<=lo:raise ValueError("INVALID_EXCLUSIVE_WINDOW")
    if not db_path.is_file() or db_path.is_symlink():raise ValueError("WENDBINE_DB_UNAVAILABLE")
    if not manifest.is_file() or manifest.is_symlink():raise ValueError("PUBLIC_MANIFEST_UNAVAILABLE")
    expected={}
    for i,line in enumerate(manifest.read_text("utf8").splitlines(),1):
        if not line.strip():continue
        obj=json.loads(line)
        source_id=obj.get("source_id")
        date=obj.get("published_at")
        if not isinstance(source_id,str) or not isinstance(date,str):
            raise ValueError(f"PUBLIC_MANIFEST_ROW_MISSING_FIELDS_{i}")
        moment=timestamp(date)
        if lo<=moment<hi:
            if source_id in expected:raise ValueError("PUBLIC_MANIFEST_DUPLICATE_SOURCE")
            expected[source_id]=date
    con=sqlite3.connect(db_path.as_uri()+"?mode=ro",uri=True)
    try:
        rows=con.execute("""select source_id,title_sha256,body_sha256,title,selftext
          from sources where published_unix>=? and published_unix<?
          order by source_id""",(lo,hi)).fetchall()
        import hashlib
        for sid,th,bh,t,b in rows:
            if hashlib.sha256(t).hexdigest()!=th or hashlib.sha256(b).hexdigest()!=bh:
                raise ValueError("LOCAL_SOURCE_UTF8_HASH_MISMATCH")
        actual={row[0] for row in rows}
    finally:con.close()
    missing=sorted(set(expected)-actual)
    extra=sorted(actual-set(expected))
    return {"schema":"td613.wendbine.actual-vs-public-ids/v1",
       "scope_from_inclusive":since,"scope_until_exclusive":until,
       "public_expected_ids":len(expected),
       "actual_locally_retrievable_original_observations":len(actual),
       "shared_ids":len(set(expected)&actual),
       "missing_public_ids":missing,"locally_found_not_in_public_manifest":extra,
       "source_body_coverage_complete_against_public_registry":not missing,
       "historical_before_manifest_completeness":"NOT_ESTABLISHED_BY_THIS_COMPARISON",
       "semantic_original_topology":"UNVERIFIED",
       "removed_unavailable_originals_reconstructed":0,
       "auto_promote_to_science":False}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--db",required=True)
    p.add_argument("--public-manifest",required=True)
    p.add_argument("--since",default="2026-01-01T00:00:00Z")
    p.add_argument("--until",required=True)
    p.add_argument("--require-complete",action="store_true")
    args=p.parse_args()
    result=reconcile(Path(args.db),Path(args.public_manifest),args.since,args.until)
    print(json.dumps(result,indent=2))
    if args.require_complete and result["missing_public_ids"]:
        raise SystemExit(2)
