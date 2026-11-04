#!/usr/bin/env python3
"""TD613 Wendbine Atelier v1: local exact-source database and grounded graph.

- Live historical import uses a bounded, observable public provider request.
- Original archive versions are NOT read, decrypted, restored or retained.
- Local SQLite stores observed UTF-8 text, not a synthetic metadata summary.
- Fulltext availability and measured coverage are never inferred from counts.
- The publicly published repository gets source-free code/tests, never real posts.
- Semantic embeddings and verified author intent are explicitly UNEARNED.
"""
from __future__ import annotations

import argparse
from contextlib import ExitStack, closing
import datetime as dt
import hashlib
import json
import os
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

AUTHOR = "Upset-Ratio502"
COMMUNITY = "Wendbine"
BASE = "https://arctic-shift.photon-reddit.com/api/posts/search"
# Earliest VERIFIED Git engineering commit creating Wendbine public Atelier.
ATELIER_START_UTC = "2026-09-11T09:50:25Z"
# Existing 48h baseline contains Sept 9, so default backfills before engineering.
DEFAULT_SINCE = "2026-01-01T00:00:00Z"
MAX_JSON_BYTES = 8_000_000
MAX_POST_UTF8 = 2_000_000
STOP = {"the","and","for","to","with","from","this","that","are","into","not","was","were"}
POST_LINK = re.compile(r"https?://(?:www\.)?reddit\.com/r/Wendbine/comments/([a-z0-9]{5,12})(?:/[^\s\)\]]*)?",re.I)
POST_ID = re.compile(r"^[a-z0-9]{5,12}$")

def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def utc(value: str) -> float:
    stamp = dt.datetime.fromisoformat(value.replace("Z","+00:00"))
    if stamp.tzinfo is None:
        raise ValueError("UTC_AWARE_TIMESTAMP_REQUIRED")
    return stamp.timestamp()

def ensure_local(path: Path) -> Path:
    if not path.is_absolute():
        raise ValueError("ABSOLUTE_OPERATOR_LOCAL_PATH_REQUIRED")
    # Fail if any existing component is a symbolic link.
    for part in (path,*path.parents):
        if part.exists() and part.is_symlink():
            raise ValueError("SYMLINK_OR_REPARSE_PATH_HELD")
    return path

def prepare_db(dest: Path) -> sqlite3.Connection:
    ensure_local(dest)
    if dest.exists():
        raise FileExistsError("EXCLUSIVE_NEW_DB_REQUIRED_NO_OVERWRITE")
    if not dest.parent.exists() or not dest.parent.is_dir():
        raise FileNotFoundError("EXISTING_LOCAL_PRIVATE_DIRECTORY_REQUIRED")
    # Never chmod a caller-owned existing directory as a side effect.
    conn=sqlite3.connect(str(dest))
    if os.name!="nt":os.chmod(dest,0o600)
    conn.executescript("""
    PRAGMA journal_mode=DELETE;
    PRAGMA foreign_keys=ON;
    CREATE TABLE sources(
      source_id TEXT PRIMARY KEY,
      author TEXT NOT NULL, subreddit TEXT NOT NULL,
      canonical_url TEXT NOT NULL, published_unix INTEGER NOT NULL,
      observed_utc TEXT NOT NULL, title BLOB NOT NULL, selftext BLOB NOT NULL,
      title_sha256 TEXT NOT NULL, body_sha256 TEXT NOT NULL,
      title_bytes INTEGER NOT NULL, body_bytes INTEGER NOT NULL,
      body_state TEXT NOT NULL, outbound_url TEXT, media_kind TEXT NOT NULL,
      archive_copy_version TEXT NOT NULL, provider TEXT NOT NULL);
    CREATE VIRTUAL TABLE text_fts USING fts5(title,selftext,
      tokenize='unicode61 remove_diacritics 0');
    CREATE TABLE versions (
      source_id TEXT NOT NULL REFERENCES sources(source_id),
      capture_ordinal INTEGER NOT NULL,
      observed_utc TEXT NOT NULL,
      title_sha256 TEXT NOT NULL,body_sha256 TEXT NOT NULL,
      PRIMARY KEY(source_id,capture_ordinal));
    CREATE TABLE links(
      src TEXT NOT NULL REFERENCES sources(source_id),
      dst TEXT NOT NULL,
      relation TEXT NOT NULL,
      source_field TEXT NOT NULL,
      offset_utf8 INTEGER NOT NULL,
      evidence_span TEXT NOT NULL,
      evidence_class TEXT NOT NULL,
      PRIMARY KEY(src,dst,source_field,offset_utf8));
    CREATE TABLE audit(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    """)
    return conn

def validate_post(x: Any) -> dict:
    if not isinstance(x,dict): raise ValueError("NOT_A_POST_OBJECT")
    pid=str(x.get("id","")).removeprefix("t3_")
    if not POST_ID.fullmatch(pid):raise ValueError("INVALID_POST_ID")
    if str(x.get("author","")).lower()!=AUTHOR.lower():raise ValueError("WRONG_AUTHOR")
    if str(x.get("subreddit","")).lower()!=COMMUNITY.lower():raise ValueError("WRONG_COMMUNITY")
    title=x.get("title")
    body=x.get("selftext")
    if not isinstance(title,str) or not isinstance(body,str):raise ValueError("MISSING_OR_NON_STRING_BODY")
    try:
        title_bytes=title.encode("utf-8",errors="strict")
        body_bytes=body.encode("utf-8",errors="strict")
    except UnicodeEncodeError as e: raise ValueError("INVALID_UTF8_SOURCE") from e
    if max(len(title_bytes),len(body_bytes))>MAX_POST_UTF8:raise ValueError("OVERSIZE_POST")
    created=x.get("created_utc")
    if not isinstance(created,(int,float)) or created<=0:raise ValueError("INVALID_PUBLICATION_DATE")
    if x.get("removed_by_category") or body.strip() in {"[removed]","[deleted]"}:
        raise ValueError("REMOVED_OR_DELETED_SOURCE_REFUSED")
    is_media=(x.get("is_self") is False or x.get("is_video") is True)
    state=("EMPTY_MEDIA_LINK_POST" if is_media else "EMPTY_TEXT_POST") if body=="" else "OBSERVED_ARCHIVE_TEXT"
    outgoing=x.get("url")
    if outgoing is not None and (not isinstance(outgoing,str) or len(outgoing)>4096):
        raise ValueError("INVALID_EXTERNAL_URL")
    kind="VIDEO" if x.get("is_video") is True else ("LINK_OR_MEDIA" if is_media else "SELF")
    source_id="reddit:t3_"+pid
    return {"source_id":source_id,"outbound_url":outgoing,"media_kind":kind,"canonical_url":f"https://www.reddit.com/r/Wendbine/comments/{pid}/",
            "published_unix":int(created),"title":title_bytes,"selftext":body_bytes,
            "title_sha256":sha(title_bytes),"body_sha256":sha(body_bytes),
            "title_bytes":len(title_bytes),"body_bytes":len(body_bytes),
            "body_state":state,"archive_copy_version":"OBSERVED_NOT_EARLIEST_OR_LIVE_AUTHOR_SIGNED"}

def import_rows(conn:sqlite3.Connection, posts:list[dict], start:str, end:str,
                observed:str, *, allow_existing:bool=False, commit:bool=True,
                provider:str="ARCTIC_SHIFT") -> dict:
    if provider not in {"ARCTIC_SHIFT","INVENTED_SYNTHETIC_FIXTURE","OPERATOR_LOCAL_CAPTURE"}:
        raise ValueError("UNREGISTERED_LOCAL_CAPTURE_SOURCE_PROVIDER")
    floor,ceil=utc(start),utc(end)
    if not floor<ceil: raise ValueError("INVALID_INTERVAL")
    good=[]
    held=[]
    for original in posts:
        try:post=validate_post(original)
        except ValueError as e:
            held.append({"reason":str(e),"source_id":str(original.get("id","")) if isinstance(original,dict) else None})
            continue
        if not floor<=post["published_unix"]<ceil:continue
        good.append(post)
    good.sort(key=lambda x:(x["published_unix"],x["source_id"]))
    unique={}
    for p in good:
        previous=unique.get(p["source_id"])
        if previous and (previous["title_sha256"],previous["body_sha256"])!=(p["title_sha256"],p["body_sha256"]):
            raise ValueError("SAME_BATCH_SOURCE_ID_DIFFERENT_BODY_HELD")
        unique[p["source_id"]]=p
    if not allow_existing and conn.execute("select count(*) from sources").fetchone()[0]:
        raise ValueError("NONEMPTY_DATABASE_REQUIRES_EXPLICIT_INCREMENTAL_MODE")
    for p in unique.values():
        row=conn.execute("select rowid,title_sha256,body_sha256 from sources where source_id=?",
                         (p["source_id"],)).fetchone()
        if row is not None:
            if (row[1],row[2])!=(p["title_sha256"],p["body_sha256"]):
                raise ValueError("VERSION_DRIFT_REQUIRES_EXPLICIT_ADJUDICATION")
            continue
        conn.execute("""insert into sources(source_id,author,subreddit,canonical_url,published_unix,
          observed_utc,title,selftext,title_sha256,body_sha256,title_bytes,body_bytes,
          body_state,outbound_url,media_kind,archive_copy_version,provider)
          values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
          (p["source_id"],AUTHOR,COMMUNITY,p["canonical_url"],p["published_unix"],
           observed,p["title"],p["selftext"],p["title_sha256"],p["body_sha256"],
           p["title_bytes"],p["body_bytes"],p["body_state"],p["outbound_url"],p["media_kind"],p["archive_copy_version"],provider))
        rid=conn.execute("select last_insert_rowid()").fetchone()[0]
        conn.execute("insert into text_fts(rowid,title,selftext) values(?,?,?)",
                     (rid,p["title"].decode("utf8"),p["selftext"].decode("utf8")))
        conn.execute("insert into versions values(?,?,?,?,?)",
                     (p["source_id"],1,observed,p["title_sha256"],p["body_sha256"]))
        for field in ("selftext","title"):
            text=p[field].decode("utf8")
            for m in POST_LINK.finditer(text):
                dst="reddit:t3_"+m.group(1).lower()
                offset=len(text[:m.start()].encode("utf8"))
                conn.execute("""insert or ignore into links
                  (src,dst,relation,source_field,offset_utf8,evidence_span,evidence_class)
                  values(?,?,?,?,?,?,?)""",
                  (p["source_id"],dst,"EXPLICIT_WENDBINE_POST_LINK",field,offset,
                   m.group(0),"OBSERVED_TEXTUAL_LINK_NOT_DEPENDENCY_PROOF"))
    if commit:conn.commit()
    summary={"unique_sources":len(unique),
             "nonempty_bodies":sum(bool(p["body_bytes"]) for p in unique.values()),
             "empty_bodies":sum(not p["body_bytes"] for p in unique.values()),
             "removed_or_invalid_held":len(held),
             "held_counts":dict(sorted({s:sum(h["reason"]==s for h in held) for s in set(h["reason"] for h in held)}.items())),
             "date_start_utc":start,"date_end_exclusive_utc":end,
             "atelier_engineering_first_commit_utc":ATELIER_START_UTC,
             "original_publication_signed":False,
             "archive_completeness_proven":False,
             "semantic_embedding_parity":"NOT_IMPLEMENTED",
             "rights_verified":"NOT_BY_THIS_PROGRAM",
             "original_private_archives_used":0}
    return summary

def fetch_history(start:str,end:str,max_pages:int=50,page_size:int=100,fetch=None)->tuple[list[dict],dict]:
    if max_pages<1 or max_pages>150 or page_size<1 or page_size>100:
        raise ValueError("FINITE_PROVIDER_PAGE_CEILINGS_REQUIRED")
    floor,ceil=utc(start),utc(end)
    if not floor<ceil:raise ValueError("INVALID_INTERVAL")
    fetch=fetch or _http_fetch
    after=dt.datetime.fromtimestamp(floor-1,dt.timezone.utc).isoformat()
    observed=set();posts=[];page_receipts=[]
    for page in range(max_pages):
        query=urllib.parse.urlencode({"author":AUTHOR,"subreddit":COMMUNITY,
         "after":after,"before":end,"sort":"asc","limit":str(page_size)})
        payload=fetch(BASE+"?"+query)
        if not isinstance(payload,bytes) or len(payload)>MAX_JSON_BYTES:
            raise ValueError("PROVIDER_PAGE_OVERSIZE_OR_NOT_BYTES")
        parsed=json.loads(payload.decode("utf8",errors="strict"))
        objs=parsed if isinstance(parsed,list) else parsed.get("data")
        if not isinstance(objs,list):raise ValueError("UNRECOGNIZED_PROVIDER_RESPONSE")
        page_receipts.append({"page":page,"sha256":sha(payload),"bytes":len(payload),
                              "count":len(objs),"contents_retained_in_receipts":False})
        if not objs:break
        times=[float(x["created_utc"]) for x in objs if isinstance(x,dict) and isinstance(x.get("created_utc"),(int,float))]
        if len(times)!=len(objs):raise ValueError("PROVIDER_NONCHRONOLOGICAL_PAGE_HELD")
        if times!=sorted(times):raise ValueError("PROVIDER_SORT_ASC_MISMATCH")
        new_this_page=0
        for p in objs:
            sid=p.get("id")
            if sid not in observed:
                observed.add(sid);posts.append(p);new_this_page+=1
        if len(objs)<page_size:break
        if new_this_page==0:raise ValueError("PROVIDER_PAGINATION_NO_PROGRESS")
        last=max(times)
        if last<floor:raise ValueError("PROVIDER_TIMESTAMP_BEFORE_START")
        next_after=dt.datetime.fromtimestamp(last-1,dt.timezone.utc).isoformat()
        if utc(next_after)<=utc(after):raise ValueError("PROVIDER_CURSOR_STALLED")
        after=next_after
    else:
        raise ValueError("PROVIDER_MAX_PAGES_REACHED_NOT_COMPLETE")
    return posts,{"provider":"ARCTIC_SHIFT","pages":page_receipts,
                  "returned_unique":len(posts),"search_coverage":"ARCHIVE_OBSERVED_ONLY",
                  "live_reddit_completeness":"UNVERIFIED","zero_results_not_inception_proof":True}

def _http_fetch(url:str)->bytes:
    req=urllib.request.Request(url,headers={"User-Agent":"TD613-Atelier-LocalResearchIndex/1.0",
                                            "Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=30) as response:
        raw=response.read(MAX_JSON_BYTES+1)
        if len(raw)>MAX_JSON_BYTES:raise ValueError("RESPONSE_TOO_LARGE")
        return raw

def exact_search(conn:sqlite3.Connection,phrase:str,limit:int=20)->list[dict]:
    if not phrase or len(phrase)>1024 or limit<1 or limit>200: raise ValueError("QUERY_LIMITS")
    needle=phrase.encode("utf8")
    hits=[]
    for sid,url,body,title,bhash,thash in conn.execute(
        "select source_id,canonical_url,selftext,title,body_sha256,title_sha256 from sources order by published_unix,source_id"):
        for field,content,h in (("selftext",body,bhash),("title",title,thash)):
            start=0
            while len(hits)<limit:
                pos=content.find(needle,start)
                if pos<0:break
                hits.append({"source_id":sid,"url":url,"field":field,
                 "byte_offset":pos,"length_utf8":len(needle),
                 "exact_utf8_sha256":h,
                 "observed_quote":content[pos:pos+len(needle)].decode("utf8",errors="strict")})
                start=pos+max(1,len(needle))
        if len(hits)>=limit:break
    return hits

def fts_search(conn:sqlite3.Connection,query:str,limit:int=20)->list[dict]:
    if not query or limit<1 or limit>200:raise ValueError("QUERY_LIMITS")
    words=[w for w in re.findall(r"(?u)\w+",query) if w.lower() not in STOP][:15]
    if not words:raise ValueError("NO_NONSTOP_QUERY_TOKENS")
    fts=" OR ".join('"'+w.replace('"','""')+'"' for w in words)
    rows=conn.execute("""select s.source_id,s.canonical_url,bm25(text_fts) as score,
      s.title_sha256,s.body_sha256 from text_fts
      join sources s on s.rowid=text_fts.rowid where text_fts match ?
      order by score limit ?""",(fts,limit)).fetchall()
    return [{"source_id":r[0],"url":r[1],"bm25":r[2],
             "title_sha256":r[3],"body_sha256":r[4],
             "retrieval_kind":"LEXICAL_FTS_NOT_VECTOR_SEMANTIC"} for r in rows]

def enumerate_day(conn: sqlite3.Connection, day: str, limit: int=100, offset: int=0, include_text:bool=True) -> dict:
    """Exact observed-date enumeration, explicitly separated from completeness of the provider."""
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}",day):
        raise ValueError("STRICT_UTC_DAY_REQUIRED")
    try:
        date=dt.date.fromisoformat(day)
        start=dt.datetime.combine(date,dt.time.min,tzinfo=dt.timezone.utc)
        stop=start+dt.timedelta(days=1)
    except (ValueError, OverflowError) as e:
        raise ValueError("INVALID_UTC_DATE") from e
    if not isinstance(limit,int) or limit<1 or limit>1000 or not isinstance(offset,int) or offset<0:
        raise ValueError("BOUNDED_DATE_PAGINATION_REQUIRED")
    lo,hi=int(start.timestamp()),int(stop.timestamp())
    total=conn.execute("select count(*) from sources where published_unix>=? and published_unix<?",(lo,hi)).fetchone()[0]
    rows=conn.execute("""select source_id,canonical_url,published_unix,title,selftext,title_sha256,body_sha256,
       body_state,outbound_url,media_kind from sources where published_unix>=? and published_unix<?
       order by published_unix,source_id limit ? offset ?""",(lo,hi,limit,offset)).fetchall()
    out=[]
    for sid,url,created,title,body,th,bh,state,external,kind in rows:
        if sha(title)!=th or sha(body)!=bh:
            raise ValueError("INDEXED_DAY_SOURCE_HASH_MISMATCH")
        row={"source_id":sid,"canonical_url":url,"published_utc":dt.datetime.fromtimestamp(created,dt.timezone.utc).isoformat(),
             "title":title.decode("utf8"),"title_sha256":th,"body_sha256":bh,
             "body_state":state,"media_kind":kind,"external_media_url":external,
             "media_transcript_observed":False,"source_body_observed":bool(body)}
        if include_text:row["selftext"]=body.decode("utf8")
        out.append(row)
    return {"schema":"td613.wendbine.utc-day-source-enumeration/v1",
      "utc_day":day,"observed_total":total,"returned":len(out),"offset":offset,
      "next_offset":offset+len(out) if offset+len(out)<total else None,
      "entries":out,"observed_source_db_only":True,
      "provider_and_inception_completeness":"UNVERIFIED",
      "media_transcripts_or_link_contents_inferred":0}

def explicit_graph(conn: sqlite3.Connection, source_id:str, max_depth:int=3) -> dict:
    """Only actual source-cited explicit hyperlink edges; no inferred conceptual equivalence."""
    if not source_id.startswith("reddit:t3_") or not POST_ID.fullmatch(source_id[10:]):
        raise ValueError("EXACT_WENDBINE_SOURCE_ID_REQUIRED")
    if max_depth<0 or max_depth>8:raise ValueError("BOUNDED_GRAPH_DEPTH_REQUIRED")
    if conn.execute("select 1 from sources where source_id=?",(source_id,)).fetchone() is None:
        raise ValueError("SOURCE_NOT_INDEXED")
    seen={source_id};frontier=[source_id];edges=[]
    for depth in range(max_depth):
        if not frontier:break
        q="select src,dst,relation,source_field,offset_utf8,evidence_span from links where src in ("+",".join("?" for _ in frontier)+") order by src,offset_utf8"
        next_frontier=[]
        for src,dst,relation,field,offset,span in conn.execute(q,frontier):
            stored=conn.execute("select "+("title" if field=="title" else "selftext")+" from sources where source_id=?",(src,)).fetchone()
            if not stored or stored[0][offset:offset+len(span.encode("utf8"))]!=span.encode("utf8"):
                raise ValueError("GRAPH_EDGE_SOURCE_SPAN_INVALID")
            dst_present=conn.execute("select 1 from sources where source_id=?",(dst,)).fetchone() is not None
            edges.append({"from":src,"to":dst,"relation":relation,"source_field":field,
              "evidence_utf8_byte_offset":offset,"evidence_span":span,"target_indexed":dst_present,
              "status":"OBSERVED_TEXT_LINK_NOT_TOPOLOGICAL_INFERENCE"})
            if dst_present and dst not in seen:
                seen.add(dst);next_frontier.append(dst)
        frontier=next_frontier
    return {"schema":"td613.wendbine.explicit-link-graph/v1","start_source":source_id,
      "max_depth":max_depth,"indexed_nodes_reached":len(seen),"edges":edges,
      "mathematical_relational_geometry":"NOT_ESTABLISHED",
      "unindexed_target_nodes_not_silently_created":True}

def status(conn:sqlite3.Connection)->dict:
    audit=dict(conn.execute("select key,value from audit order by key").fetchall())
    return {"last_successful_until_utc":audit.get("last_successful_until_utc"),
      "index_source_class":audit.get("source_class","UNATTESTED"),"schema":"td613.wendbine.local-research-index/v1",
      "integrity_check":conn.execute("pragma integrity_check").fetchone()[0],
      "sources":conn.execute("select count(*) from sources").fetchone()[0],
      "nonempty_bodies":conn.execute("select count(*) from sources where body_bytes>0").fetchone()[0],
      "fulltext_rows":conn.execute("select count(*) from text_fts").fetchone()[0],
      "explicit_textual_edges":conn.execute("select count(*) from links").fetchone()[0],
      "source_bytes_present":conn.execute("select coalesce(sum(title_bytes+body_bytes),0) from sources").fetchone()[0],
      "original_fulltext_state":"ARCHIVE_OBSERVED_TEXT_LOCAL_ONLY",
      "vector_semantic_state":"NOT_AVAILABLE",
      "inference_graph_state":"NOT_AVAILABLE",
      "embeddings_or_external_model_calls":0,"new_archived_ciphertext_used":False}

def main():
    p=argparse.ArgumentParser(description="Wendbine source-body local research Atelier; no private archive access.")
    p.add_argument("--db",required=True,help="EXISTING private directory / new SQLite path for import; existing for read")
    sub=p.add_subparsers(dest="command",required=True)
    s=sub.add_parser("sync")
    s.add_argument("--since",default=DEFAULT_SINCE)
    s.add_argument("--until",required=True,help="UTC exclusive cutoff")
    s.add_argument("--max-pages",type=int,default=50)
    s.add_argument("--page-size",type=int,default=100)
    s.add_argument("--resume",action="store_true",help="Continue from immutable successful UTC cutoff in an existing genuine-source index")
    s.add_argument("--overlap-days",type=int,default=2,help="Recompare 0–7 days of earlier observed records by hash when resuming")
    s.add_argument("--operator-confirmed-rights",action="store_true",
        help="Operator has separately reviewed lawful local post retrieval/use and deletion handling")
    t=sub.add_parser("import-fixture")
    t.add_argument("--fixture",required=True)
    t.add_argument("--since",default=DEFAULT_SINCE)
    t.add_argument("--until",required=True)
    for mode in ("exact","lexical"):
        q=sub.add_parser(mode);q.add_argument("query");q.add_argument("--limit",type=int,default=20)
    sub.add_parser("status")
    q=sub.add_parser("day")
    q.add_argument("date_utc")
    q.add_argument("--offset",type=int,default=0)
    q.add_argument("--limit",type=int,default=100)
    q.add_argument("--metadata-only",action="store_true")
    q=sub.add_parser("graph")
    q.add_argument("source_id")
    q.add_argument("--depth",type=int,default=3)
    q=sub.add_parser("source");q.add_argument("source_id")
    q=sub.add_parser("links");q.add_argument("--source-id",default=None)
    args=p.parse_args()
    with ExitStack() as stack:
        location=Path(args.db)
        if args.command in ("sync","import-fixture"):
            if args.command=="sync" and not args.operator_confirmed_rights:
                raise ValueError("HUMAN_RIGHTS_CONFIRMATION_REQUIRED_BEFORE_LIVE_SOURCE_ACQUISITION")
            source_class="ARCTIC_SHIFT" if args.command=="sync" else "INVENTED_SYNTHETIC_FIXTURE"
            if args.command=="sync" and args.overlap_days not in range(0,8):
                raise ValueError("FINITE_OVERLAP_DAYS_REQUIRED")
            if args.command=="sync" and args.resume:
                ensure_local(location)
                if not location.is_file() or location.is_symlink():
                    raise ValueError("EXISTING_GENUINE_SOURCE_DB_REQUIRED")
                db=stack.enter_context(closing(sqlite3.connect(location)))
                if db.execute("pragma integrity_check").fetchone()[0]!="ok":
                    raise ValueError("RESUME_DB_INTEGRITY_FAILURE")
                prior=dict(db.execute("select key,value from audit").fetchall())
                if prior.get("source_class")!="ARCTIC_SHIFT":
                    raise ValueError("RESUME_SYNTHETIC_OR_UNATTESTED_DB_REFUSED")
                prior_end=prior.get("last_successful_until_utc")
                if not prior_end or utc(args.until)<=utc(prior_end):
                    raise ValueError("RESUME_REQUIRES_NEW_LATER_EXCLUSIVE_CUTOFF")
                actual_since=dt.datetime.fromtimestamp(utc(prior_end)-86400*args.overlap_days,
                   tz=dt.timezone.utc).isoformat().replace("+00:00","Z")
            else:
                if args.command=="import-fixture" and getattr(args,"resume",False):
                    raise ValueError("SYNTHETIC_TO_REAL_RESUME_REFUSED")
                actual_since=args.since
                db=None
            if args.command=="sync":
                posts,receipt=fetch_history(actual_since,args.until,args.max_pages,args.page_size)
            else:
                posts=json.loads(Path(args.fixture).read_text("utf8"))
                receipt={"provider":"INVENTED_SYNTHETIC_FIXTURE"}
            if db is None:db=stack.enter_context(closing(prepare_db(location)))
            with db:
                report=import_rows(db,posts,actual_since,args.until,
                    dt.datetime.now(dt.timezone.utc).isoformat(),allow_existing=(args.command=="sync" and args.resume),
                    commit=False,provider=source_class)
                db.execute("insert or replace into audit(key,value) values(?,?)",("source_class",source_class))
                db.execute("insert or replace into audit(key,value) values(?,?)",("last_successful_until_utc",args.until))
                db.execute("insert or replace into audit(key,value) values(?,?)",("recomparison_start_utc",actual_since))
                db.execute("insert or replace into audit(key,value) values(?,?)",("last_import_summary_sha256",
                  sha(json.dumps(report,sort_keys=True).encode("utf8"))))
                report["provider_receipt"]=receipt
            print(json.dumps({"report":report,"status":status(db)},ensure_ascii=False,indent=2))
        else:
            ensure_local(location)
            db=stack.enter_context(closing(sqlite3.connect(location.as_uri()+"?mode=ro",uri=True)))
            if args.command=="status":report=status(db)
            elif args.command=="day":report=enumerate_day(db,args.date_utc,args.limit,args.offset,not args.metadata_only)
            elif args.command=="graph":report=explicit_graph(db,args.source_id,args.depth)
            elif args.command=="exact":report=exact_search(db,args.query,args.limit)
            elif args.command=="lexical":report=fts_search(db,args.query,args.limit)
            elif args.command=="source":
                row=db.execute("""select source_id,canonical_url,published_unix,title,selftext,
                   title_sha256,body_sha256,body_state from sources where source_id=?""",
                   (args.source_id,)).fetchone()
                if row is None:raise ValueError("SOURCE_NOT_INDEXED")
                report={"source_id":row[0],"canonical_url":row[1],"published_unix":row[2],
                 "title":row[3].decode("utf8"),"selftext":row[4].decode("utf8"),
                 "title_sha256":row[5],"body_sha256":row[6],"body_state":row[7],
                 "authenticity":"EXACT_ARCHIVE_OBSERVED_UTF8_NOT_VERIFIED_AUTHOR_ORIGINAL"}
            else:
                where="where src=?" if args.source_id else ""
                values=(args.source_id,) if args.source_id else ()
                report=[dict(zip(("src","dst","relation","field","byte_offset","evidence_span","evidence_class"),row))
                   for row in db.execute(f"""select src,dst,relation,source_field,offset_utf8,
                   evidence_span,evidence_class from links {where} order by src,offset_utf8 limit 500""",values)]
            print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=="__main__":
    main()
