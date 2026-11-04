#!/usr/bin/env python3
"""Offline, operator-supplied historical Wendbine capture importer.

No external API calls, no encrypted-archive read, no attribution of legal rights.
Historical custody, subsequent platform visibility, and author action are different
questions. Source text stays in an operator-local SQLite database.
"""
from __future__ import annotations

import argparse
from contextlib import closing
import datetime as dt
import hashlib
import importlib.util
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SPEC=importlib.util.spec_from_file_location("td613_wendbine_capture_index",ROOT/"wendbine-live-research-index-v1.py")
INDEX=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(INDEX)
MAX_MANIFEST_BYTES=256*1024*1024
MAX_LINE_BYTES=4*1024*1024
MAX_CAPTURES=20000
SOURCE_ID=re.compile(r"^reddit:t3_([a-z0-9]{5,12})$")
DIGEST=re.compile(r"^[0-9a-f]{64}$")
STATES={
    "LATER_STATUS_UNKNOWN",
    "VISIBLE_AT_CAPTURE_REPORTED",
    "PLATFORM_FILTERED_REPORTED",
    "PLATFORM_REMOVED_REPORTED",
    "AUTHOR_DELETED_REPORTED",
    "OTHER_UNAVAILABLE_REPORTED",
}

def sha(raw:bytes)->str:
    return hashlib.sha256(raw).hexdigest()

def parse_json(raw:bytes):
    def unique_pairs(pairs):
        out={}
        for key,value in pairs:
            if key in out:raise ValueError("DUPLICATE_CAPTURE_JSON_KEY")
            out[key]=value
        return out
    return json.loads(raw.decode("utf8",errors="strict"),
      object_pairs_hook=unique_pairs,
      parse_constant=lambda _v: (_ for _ in ()).throw(ValueError("NONFINITE_JSON_NUMBER")))

def required(row,key,max_len=4096):
    value=row.get(key)
    if not isinstance(value,str) or not value or len(value)>max_len:
        raise ValueError("CAPTURE_FIELD_REQUIRED:"+key)
    return value

def utc_seconds(text):
    if not isinstance(text,str):raise ValueError("UTC_TIMESTAMP_REQUIRED")
    try:instant=dt.datetime.fromisoformat(text.replace("Z","+00:00"))
    except (ValueError,OverflowError) as err:raise ValueError("UTC_TIMESTAMP_INVALID") from err
    if instant.tzinfo is None or instant.utcoffset()!=dt.timedelta(0):
        raise ValueError("UTC_TIMESTAMP_OFFSET_REQUIRED")
    return instant.timestamp()

def parse_capture(raw:bytes,line:int):
    if len(raw)>MAX_LINE_BYTES:raise ValueError("CAPTURE_RECORD_OVERSIZE")
    row=parse_json(raw)
    if not isinstance(row,dict) or row.get("schema")!="td613.wendbine.local-capture/v1":
        raise ValueError("CAPTURE_SCHEMA_REQUIRED")
    sid=required(row,"source_id",64)
    match=SOURCE_ID.fullmatch(sid)
    if not match:raise ValueError("CAPTURE_SOURCE_ID_INVALID")
    author=required(row,"author",100)
    subreddit=required(row,"subreddit",100)
    if author.casefold()!=INDEX.AUTHOR.casefold() or subreddit.casefold()!=INDEX.COMMUNITY.casefold():
        raise ValueError("CAPTURE_AUTHOR_OR_COMMUNITY_MISMATCH")
    capture_id=required(row,"capture_id",200)
    source_system=required(row,"source_system",200)
    source_locator=required(row,"source_locator",4096)
    captured_at=required(row,"captured_at_utc",80)
    published_at=required(row,"published_at_utc",80)
    captured=utc_seconds(captured_at)
    published=utc_seconds(published_at)
    if captured<published:raise ValueError("CAPTURE_PRECEDES_PUBLICATION")
    state=required(row,"later_visibility_state",100)
    if state not in STATES:raise ValueError("CAPTURE_STATE_UNREGISTERED")
    title=row.get("title")
    body=row.get("selftext")
    if not isinstance(title,str) or not isinstance(body,str):
        raise ValueError("CAPTURE_TEXT_FIELDS_REQUIRED")
    title_bytes=title.encode("utf8",errors="strict")
    body_bytes=body.encode("utf8",errors="strict")
    if max(len(title_bytes),len(body_bytes))>INDEX.MAX_POST_UTF8:
        raise ValueError("CAPTURE_TEXT_EXCEEDS_LIMIT")
    title_hash=required(row,"title_sha256",64)
    body_hash=required(row,"body_sha256",64)
    if not DIGEST.fullmatch(title_hash) or not DIGEST.fullmatch(body_hash) or (
       sha(title_bytes),sha(body_bytes))!=(title_hash,body_hash):
        raise ValueError("CAPTURE_HASH_MISMATCH")
    if body.strip() in ("[removed]","[deleted]"):
        raise ValueError("PLACEHOLDER_IS_NOT_PRESERVED_TEXT")
    is_self=row.get("is_self",True)
    is_video=row.get("is_video",False)
    if type(is_self) is not bool or type(is_video) is not bool:
        raise ValueError("INVALID_MEDIA_FLAGS")
    outbound=row.get("outbound_url")
    if outbound is not None and (not isinstance(outbound,str) or len(outbound)>4096):
        raise ValueError("CAPTURE_OUTBOUND_URL_INVALID")
    post={
        "id":match.group(1),"author":author,"subreddit":subreddit,
        "created_utc":published,"title":title,"selftext":body,
        "is_self":is_self,"is_video":is_video,"url":outbound
    }
    INDEX.validate_post(post)
    receipt={
        "capture_id":capture_id,"source_id":sid,"source_system":source_system,
        "source_locator":source_locator,"captured_at_utc":captured_at,
        "published_at_utc":published_at,"captured_unix":captured,
        "later_visibility_state":state,"title_sha256":title_hash,
        "body_sha256":body_hash,"title":title_bytes,"selftext":body_bytes,
        "line_number":line,"record_sha256":sha(raw)
    }
    return post,receipt

def read_manifest(path:Path):
    INDEX.ensure_local(path)
    if not path.is_file() or path.is_symlink():
        raise ValueError("LOCAL_PLAINTEXT_CAPTURE_FILE_REQUIRED")
    if path.suffix.casefold() not in (".jsonl",".ndjson"):
        raise ValueError("JSONL_CAPTURE_ONLY_NO_ENCRYPTED_ARCHIVE")
    if path.stat().st_size>MAX_MANIFEST_BYTES:raise ValueError("CAPTURE_FILE_TOO_LARGE")
    raw=path.read_bytes()
    if len(raw)>MAX_MANIFEST_BYTES:raise ValueError("CAPTURE_FILE_TOO_LARGE")
    captures=[];used=set()
    for line,blob in enumerate(raw.splitlines(),1):
        if not blob.strip():continue
        post,receipt=parse_capture(blob,line)
        if receipt["capture_id"] in used:raise ValueError("DUPLICATE_CAPTURE_ID")
        used.add(receipt["capture_id"])
        captures.append((post,receipt))
        if len(captures)>MAX_CAPTURES:raise ValueError("CAPTURE_COUNT_LIMIT")
    if not captures:raise ValueError("EMPTY_CAPTURE_MANIFEST")
    return captures,sha(raw)

def import_local(manifest:Path,dest:Path,start:str,end:str,declared_basis:str):
    if not isinstance(declared_basis,str) or not declared_basis.strip() or len(declared_basis)>600:
        raise ValueError("LOCAL_CUSTODY_BASIS_REQUIRED")
    lo,hi=utc_seconds(start),utc_seconds(end)
    if lo>=hi:raise ValueError("INVALID_CAPTURE_INTERVAL")
    captures,manifest_hash=read_manifest(manifest)
    for _post,r in captures:
        if not lo<=utc_seconds(r["published_at_utc"])<hi:
            raise ValueError("CAPTURE_OUTSIDE_DECLARED_RANGE")
    # A primary document is chosen deterministically; every other observed
    # version remains independently queryable in capture_versions below.
    ordered=sorted(captures,key=lambda pair:(
        pair[1]["source_id"],pair[1]["captured_unix"],pair[1]["capture_id"]))
    initial={}
    original_publication={}
    for post,r in ordered:
        prior=original_publication.setdefault(r["source_id"],r["published_at_utc"])
        if utc_seconds(prior)!=utc_seconds(r["published_at_utc"]):
            raise ValueError("CONFLICTING_SOURCE_PUBLICATION_TIME")
        initial.setdefault(r["source_id"],post)
    with closing(INDEX.prepare_db(dest)) as db:
        with db:
            report=INDEX.import_rows(db,list(initial.values()),start,end,
               dt.datetime.now(dt.timezone.utc).isoformat(),
               allow_existing=False,commit=False,provider="OPERATOR_LOCAL_CAPTURE")
            if report["removed_or_invalid_held"] or report["unique_sources"]!=len(initial):
                raise ValueError("LOCAL_CAPTURE_PRIMARY_INSERT_INCOMPLETE")
            db.execute("""CREATE TABLE capture_versions (
               capture_id TEXT PRIMARY KEY,
               source_id TEXT NOT NULL REFERENCES sources(source_id),
               source_system TEXT NOT NULL,source_locator TEXT NOT NULL,
               captured_at_utc TEXT NOT NULL,published_at_utc TEXT NOT NULL,
               later_visibility_state TEXT NOT NULL,
               title BLOB NOT NULL,selftext BLOB NOT NULL,
               title_sha256 TEXT NOT NULL,body_sha256 TEXT NOT NULL,
               jsonl_line INTEGER NOT NULL,capture_record_sha256 TEXT NOT NULL,
               manifest_sha256 TEXT NOT NULL,custody_basis TEXT NOT NULL)""")
            db.execute("""CREATE VIRTUAL TABLE capture_fts USING fts5(
                capture_id UNINDEXED,title,selftext,
                tokenize='unicode61 remove_diacritics 0')""")
            for _post,r in ordered:
                db.execute("INSERT INTO capture_fts(capture_id,title,selftext) VALUES(?,?,?)",
                  (r["capture_id"],r["title"].decode("utf8"),r["selftext"].decode("utf8")))
                db.execute("""INSERT INTO capture_versions VALUES
                    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (r["capture_id"],r["source_id"],r["source_system"],
                     r["source_locator"],r["captured_at_utc"],r["published_at_utc"],
                     r["later_visibility_state"],r["title"],r["selftext"],
                     r["title_sha256"],r["body_sha256"],r["line_number"],
                     r["record_sha256"],manifest_hash,declared_basis.strip()))
            for key,value in {
              "source_class":"OPERATOR_LOCAL_CAPTURE",
              "source_custody":"OPERATOR_DECLARED_NOT_EXTERNAL_ORIGIN_PROOF",
              "manifest_sha256":manifest_hash,
              "historical_visibility":"OBSERVED_AS_REPORTED_AT_CAPTURE",
              "later_visibility":"SEPARATE_REPORTED_STATES_NOT_PLATFORM_VETO",
              "source_rights":"NOT_ESTABLISHED_BY_HASH",
              "source_completeness":"UNVERIFIED",
              "source_media":"NO_CIPHERTEXT_OR_NETWORK_ACCESS",
              "local_capture_since_utc":start,
              "local_capture_until_utc":end
            }.items():
                db.execute("INSERT INTO audit(key,value) VALUES(?,?)",(key,value))
        status=INDEX.status(db)
    return {
      "schema":"td613.wendbine.local-capture-intake-receipt/v1",
      "status":"LOCAL_SOURCE_TEXT_IMPORTED_FROM_OPERATOR_CAPTURE",
      "unique_sources":len(initial),"capture_versions":len(captures),
      "primary_bodies":status["nonempty_bodies"],"fts_rows":status["fulltext_rows"],
      "all_capture_fts_rows":len(captures),
      "explicit_links":status["explicit_textual_edges"],
      "manifest_sha256":manifest_hash,
      "reported_visibility_counts":{s:sum(r["later_visibility_state"]==s for _,r in ordered)
                                    for s in sorted(STATES)},
      "current_platform_status_verified":False,
      "original_platform_or_author_signature_verified":False,
      "copyright_or_reuse_rights_inferred":False,
      "encrypted_archives_read":False,
      "historical_inception_completeness":"UNVERIFIED"
    }

def history_exact(db:Path,phrase:str,limit:int=30):
    if not phrase or len(phrase)>1024 or not 1<=limit<=200:
        raise ValueError("CAPTURE_EXACT_QUERY_LIMITS")
    INDEX.ensure_local(db)
    needle=phrase.encode("utf8")
    hits=[]
    with closing(__import__("sqlite3").connect(db.as_uri()+"?mode=ro",uri=True)) as con:
        rows=con.execute("""SELECT capture_id,source_id,captured_at_utc,
            later_visibility_state,title,selftext,title_sha256,body_sha256
            FROM capture_versions ORDER BY captured_at_utc,capture_id""")
        for cid,sid,captured,state,title,body,th,bh in rows:
            for field,raw,dig in (("title",title,th),("selftext",body,bh)):
                if sha(raw)!=dig:raise ValueError("CAPTURE_VERSION_DIGEST_CONFLICT")
                start=0
                while len(hits)<limit:
                    at=raw.find(needle,start)
                    if at<0:break
                    hits.append({"capture_id":cid,"source_id":sid,"captured_at_utc":captured,
                        "later_visibility_state":state,"source_field":field,
                        "source_sha256":dig,"byte_offset":at,
                        "exact_match":phrase,"source_class":"OPERATOR_LOCAL_CAPTURE"})
                    start=at+max(1,len(needle))
            if len(hits)>=limit:break
    return hits

def history_lexical(db:Path,query:str,limit:int=30):
    """Search ALL captured versions, including those with reported later filtering."""
    if not isinstance(query,str) or not query or not 1<=limit<=200:
        raise ValueError("CAPTURE_LEXICAL_QUERY_LIMITS")
    words=re.findall(r"(?u)\\w+",query)[:12]
    if not words:raise ValueError("CAPTURE_NO_SEARCH_WORDS")
    term=" OR ".join('"'+w.replace('"','""')+'"' for w in words)
    INDEX.ensure_local(db)
    with closing(__import__("sqlite3").connect(db.as_uri()+"?mode=ro",uri=True)) as con:
        result=con.execute("""SELECT v.capture_id,v.source_id,v.captured_at_utc,
             v.later_visibility_state,v.title_sha256,v.body_sha256,bm25(capture_fts)
             FROM capture_fts JOIN capture_versions v ON v.capture_id=capture_fts.capture_id
             WHERE capture_fts MATCH ? ORDER BY bm25(capture_fts),v.capture_id LIMIT ?""",
             (term,limit)).fetchall()
    return [{"capture_id":r[0],"source_id":r[1],"captured_at_utc":r[2],
             "later_visibility_state":r[3],"title_sha256":r[4],"body_sha256":r[5],
             "score":r[6],"retrieval_kind":"LEXICAL_FTS_ALL_CAPTURE_VERSIONS"}
            for r in result]

def main():
    parser=argparse.ArgumentParser(description="Offline historical source-text custody intake")
    sub=parser.add_subparsers(dest="command",required=True)
    imp=sub.add_parser("import")
    imp.add_argument("--manifest",type=Path,required=True)
    imp.add_argument("--db",type=Path,required=True)
    imp.add_argument("--since",required=True)
    imp.add_argument("--until",required=True)
    imp.add_argument("--custody-basis",required=True)
    lex=sub.add_parser("history-lexical")
    lex.add_argument("--db",type=Path,required=True)
    lex.add_argument("query")
    lex.add_argument("--limit",type=int,default=30)
    q=sub.add_parser("history-exact")
    q.add_argument("--db",type=Path,required=True)
    q.add_argument("phrase")
    q.add_argument("--limit",type=int,default=30)
    args=parser.parse_args()
    if args.command=="import":
        result=import_local(args.manifest,args.db,args.since,args.until,args.custody_basis)
    elif args.command=="history-exact":
        result=history_exact(args.db,args.phrase,args.limit)
    else:
        result=history_lexical(args.db,args.query,args.limit)
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
