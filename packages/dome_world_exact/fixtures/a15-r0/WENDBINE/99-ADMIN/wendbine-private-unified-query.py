#!/usr/bin/env python3
"""Local-only source-text search across the 60 archived Wendbine post objects.

An untrusted source-shaped SQLite file does not qualify: all 60 exact title/body
field hashes must reconcile against public v06 and v07 source receipts first.
Never run this against a database committed to the public repository.
"""
import argparse
import hashlib
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P0 = ROOT / "01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json"
P12 = ROOT / "01-MANIFESTS/p1p2-archived-source-field-receipts-20260922-v07.json"
SHA = lambda text: hashlib.sha256(text.encode("utf-8")).hexdigest()

def verify_index(db_path, p0_path=P0, secondary_path=P12):
    p0=json.loads(Path(p0_path).read_text(encoding="utf8"))
    p12=json.loads(Path(secondary_path).read_text(encoding="utf8"))
    if p0.get("source_count")!=33 or p12.get("source_count")!=27:
        raise ValueError("REQUIRED_P0_AND_SECONDARY_RECEIPTS_MISSING")
    manifest={}
    for r in p0["records"]:
        manifest[r["source_id"]] = dict(r,body_state="ARCHIVED_TEXT_BODY_PRESENT")
    for r in p12["records"]:
        if r["source_id"] in manifest or len(r.get("archive_copies",[]))!=1:
            raise ValueError("DUPLICATE_OR_AMBIGUOUS_SOURCE_RECEIPT")
        copy=r["archive_copies"][0]
        manifest[r["source_id"]]=dict(r,**copy)
    if len(manifest)!=60:
        raise ValueError("EXPECTED_60_UNIQUE_RECEIPTS")
    db=Path(db_path).resolve(strict=True)
    con=sqlite3.connect(db.as_uri()+"?mode=ro",uri=True)
    con.row_factory=sqlite3.Row
    if con.execute("pragma integrity_check").fetchone()[0]!="ok":
        raise ValueError("SQLITE_INTEGRITY_ERROR")
    columns={r[1] for r in con.execute("pragma table_info(sources)").fetchall()}
    required={"source_id","canonical_url","title","selftext","body_state"}
    if not required.issubset(columns) or not ({"created_utc","source_created_utc"}&columns):
        raise ValueError("PRIVATE_INDEX_SOURCE_SCHEMA_MISMATCH")
    date_field="source_created_utc" if "source_created_utc" in columns else "created_utc"
    rows=con.execute("select rowid,* from sources").fetchall()
    if len(rows)!=60 or con.execute("select count(*) from source_fts").fetchone()[0]!=60:
        raise ValueError("PRIVATE_INDEX_60_SOURCE_CARDINALITY_MISMATCH")
    seen=set();text_count=0;media_count=0
    for row in rows:
        r=manifest.get(row["source_id"])
        if not r or row["source_id"] in seen or row["canonical_url"]!=r["canonical_url"]:
            raise ValueError("SOURCE_ID_OR_URL_MISMATCH")
        seen.add(row["source_id"])
        if SHA(row["title"])!=r["title_sha256_utf8"] or SHA(row["selftext"])!=r["body_sha256_utf8"]:
            raise ValueError("SOURCE_FIELD_HASH_MISMATCH")
        if "body_utf8_bytes" in r and len(row["selftext"].encode("utf8"))!=r["body_utf8_bytes"]:
            raise ValueError("SOURCE_BODY_BYTE_LENGTH_MISMATCH")
        if int(row[date_field])!=int(r["source_created_utc"]):
            raise ValueError("SOURCE_PUBLICATION_TIMESTAMP_MISMATCH")
        if row["body_state"] != r["body_state"]:
            raise ValueError("SOURCE_BODY_STATE_MISMATCH")
        if row["selftext"]: text_count+=1
        else: media_count+=1
    if seen!=set(manifest) or (text_count,media_count)!=(58,2):
        raise ValueError("SOURCE_SET_OR_MEDIA_CLASSIFICATION_MISMATCH")
    return con, {"status":"PRIVATE_FIELD_HASH_VERIFIED_ARCHIVED_SNAPSHOT",
                 "source_objects":60,"nonempty_text_bodies":58,"empty_media_link_selftext":2,
                 "source_version_ceiling":"ARCHIVE_COPY_NOT_UNEDITED_FIRST_PUBLICATION_OR_LIVE_REDDIT"}

def query(con, phrase, mode="exact", limit=30):
    if not phrase or not phrase.strip() or limit<1 or limit>100:
        raise ValueError("NONEMPTY_PHRASE_AND_BOUNDED_LIMIT_REQUIRED")
    hits=[]
    if mode=="fts":
        # Always phrase-quote untrusted tokens; do not expose FTS operators.
        match='"'+phrase.replace('"','""')+'"'
        rows=con.execute("""select s.* from source_fts f join sources s on s.rowid=f.rowid
                           where source_fts match ? order by bm25(source_fts) limit ?""",
                         (match,limit)).fetchall()
    elif mode=="exact":
        date_field="source_created_utc" if "source_created_utc" in {r[1] for r in con.execute("pragma table_info(sources)").fetchall()} else "created_utc"
        rows=con.execute(f"select * from sources order by {date_field},source_id").fetchall()
    else: raise ValueError("UNKNOWN_QUERY_MODE")
    pattern=re.compile(re.escape(phrase),re.IGNORECASE)
    for row in rows:
        for field in ("title","selftext"):
            text=row[field]
            m=pattern.search(text)
            if m is None:
                if mode=="fts" and field=="selftext":
                    # Match was tokenized rather than an exact substring.
                    hits.append({"source_id":row["source_id"],"canonical_url":row["canonical_url"],
                        "match_type":"FTS_TOKEN_MATCH_NO_EXACT_SPAN",
                        "body_sha256_utf8":SHA(row["selftext"]),"archive_version":True})
                continue
            i=m.start()
            hits.append({"source_id":row["source_id"],"canonical_url":row["canonical_url"],
                "field":field,"offset_utf8":len(text[:i].encode("utf8")),"offset_characters":i,
                "body_sha256_utf8":SHA(row["selftext"]),
                "snippet":text[max(0,i-45):min(len(text),m.end()+75)],
                "archive_version":True})
            if len(hits)>=limit:return hits
    return hits[:limit]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--db",required=True,help="Private source index outside Git checkout")
    ap.add_argument("action",choices=["status","search"])
    ap.add_argument("phrase",nargs="?")
    ap.add_argument("--mode",choices=["exact","fts"],default="exact")
    ap.add_argument("--limit",type=int,default=30)
    args=ap.parse_args()
    con,status=verify_index(args.db)
    if args.action=="status":print(json.dumps(status,indent=2));return
    results=query(con,args.phrase,mode=args.mode,limit=args.limit)
    print(json.dumps({**status,"query_mode":args.mode,"hits":results},ensure_ascii=False,indent=2))
if __name__=="__main__":main()
