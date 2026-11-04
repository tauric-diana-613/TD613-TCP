#!/usr/bin/env python3
"""Wendbine source-grounded exploratory routes over operator-local observed text.

This engine finds explicitly observed research cues and post links across capture
versions. It never promotes a discovered route into a verified author intention,
causal relationship, protected-system topology or external scientific finding.
"""
from __future__ import annotations
import argparse
from contextlib import closing
import hashlib
import json
import re
import sqlite3
from pathlib import Path

LINK=re.compile(r"https?://(?:www\.)?reddit\.com/r/Wendbine/comments/([a-z0-9]{5,12})(?:/[^\s\)\]]*)?",re.I)
EXPLORE=re.compile(r"\bExplore\s+([^.!?\n]{2,100})\.",re.I)
MAX_SCAN=10000
def sha(raw):return hashlib.sha256(raw).hexdigest()
def ensure_path(db):
    db=Path(db)
    if not db.is_absolute() or db.is_symlink() or not db.is_file():
        raise ValueError("WENDBINE_OPERATOR_LOCAL_DB_REQUIRED")
    for p in db.parents:
        if p.exists() and p.is_symlink():raise ValueError("PARENT_SYMLINK_REFUSED")
    return db
def observation_routes(db,source_id,*,limit=100):
    if not re.fullmatch(r"reddit:t3_[a-z0-9]{5,12}",source_id):
        raise ValueError("WENDBINE_EXACT_SOURCE_ID_REQUIRED")
    if type(limit) is not int or not 1<=limit<=100:raise ValueError("BOUNDED_ROUTE_LIMIT")
    p=ensure_path(db)
    found=[];versions=0
    with closing(sqlite3.connect(p.as_uri()+"?mode=ro",uri=True)) as con:
        if con.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
            raise ValueError("WENDBINE_DB_INTEGRITY_FAILED")
        if not con.execute("SELECT name FROM sqlite_master WHERE name='capture_versions'").fetchone():
            raise ValueError("HISTORICAL_CAPTURES_REQUIRED")
        target_ids={row[0] for row in con.execute("SELECT source_id FROM sources")}
        rows=con.execute("""SELECT capture_id,source_id,captured_at_utc,
            title,selftext,title_sha256,body_sha256
            FROM capture_versions WHERE source_id=? ORDER BY captured_at_utc,capture_id""",
            (source_id,))
        for cid,sid,observed,title,body,th,bh in rows:
            versions+=1
            for field,raw,digest in (("title",title,th),("selftext",body,bh)):
                if sha(raw)!=digest:raise ValueError("SOURCE_CAPTURE_HASH_CHANGED")
                text=raw.decode("utf8",errors="strict")
                for regex,relation in ((LINK,"EXPLICIT_POST_LINK"),(EXPLORE,"EXPLICIT_EXPLORE_CUE")):
                    for match in regex.finditer(text):
                        at=len(text[:match.start()].encode("utf8"))
                        destination=("reddit:t3_"+match.group(1).lower()) if relation=="EXPLICIT_POST_LINK" else None
                        found.append({"source_id":sid,"capture_id":cid,"captured_at_utc":observed,
                            "source_field":field,"source_field_sha256":digest,"byte_offset":at,
                            "span_sha256":sha(match.group(0).encode("utf8")),
                            "relation_type":relation,"relation_evidence_class":"SOURCE_TEXT_OBSERVATION",
                            "destination_id":destination,"destination_in_local_index":
                                (destination in target_ids) if destination else None,
                            "explore_token":match.group(1).strip() if relation=="EXPLICIT_EXPLORE_CUE" else None,
                            "inferred_causal_relation":False,"author_intent_proven":False,
                            "direct_relation_promotion":False})
                        if len(found)>MAX_SCAN:raise ValueError("BOUNDED_ROUTE_SCAN_EXCEEDED")
    return {"schema":"td613.wendbine.exploration-routes/v1",
        "source_id":source_id,"observed_capture_versions":versions,
        "observed_routes":found[:limit],"routes_total":len(found),
        "truncated":len(found)>limit,
        "next_tests":[
            "CHECK_DESTINATION_SOURCE_TEXT_AND_CAPTURE_DATE",
            "SEEK_EXPLICIT_ROLE_ASSERTION_BEFORE_TOPOLOGICAL_LIFT",
            "SHUFFLE_AND_DECOY_CONTROL_BEFORE_SYNTHESIS",
            "DO_NOT_CONFLATE_MULTIPLE_POST_LINKS_WITH_CAUSATION"],
        "native_src_heterostratigraphic_parity":"UNTESTED",
        "graph_kind":"PUBLIC_TEXTUAL_REFERENCE_NOT_SEMANTIC_TOPOLOGY",
        "scientific_promotion":False}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--wendbine-db",type=Path,required=True)
    p.add_argument("source_id");p.add_argument("--limit",type=int,default=100)
    a=p.parse_args()
    print(json.dumps(observation_routes(a.wendbine_db,a.source_id,limit=a.limit),
                     ensure_ascii=False,indent=2))
if __name__=="__main__":main()
