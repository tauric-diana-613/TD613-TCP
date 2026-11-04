#!/usr/bin/env python3
"""Manifest-grounded independent public-archive hydration for Wendbine.

Source-free in GitHub CI; only the operator-local CLI makes provider HTTP calls.
Source IDs come exclusively from the pinned public Wendbine manifest.
All provider-returned bytes, eligibility classifications and omissions stay local.
A provider record is an observation from an archive, not proof of original author
signature, native scientific topology or total archive completeness.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

MANIFEST_SHA="9ae84260dfed9d3d1b6d26ba55a41ce75e2ed0e3527cf2fb253a7ee2142e54ac"
SOURCE_COUNT=2062
SOURCE_ID=re.compile(r"^reddit:t3_([a-z0-9]{5,12})$")
API="https://arctic-shift.photon-reddit.com/api/posts/ids"
MAX_BYTES=8_000_000
MAX_MANIFEST=20_000_000
MAX_POST_BYTES=2_000_000
MAX_RECORDS=5000
AUTHOR="Upset-Ratio502"
COMMUNITY="Wendbine"

def sha(raw:bytes)->str:
    return hashlib.sha256(raw).hexdigest()

def encoded(row):
    return json.dumps(row,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf8")

def json_from(raw):
    def unique_pairs(pairs):
        out={}
        for key,value in pairs:
            if key in out:raise ValueError("DUPLICATE_PROVIDER_OR_MANIFEST_JSON_KEY")
            out[key]=value
        return out
    return json.loads(raw.decode("utf8",errors="strict"),object_pairs_hook=unique_pairs)

def local(path:Path):
    if not path.is_absolute():raise ValueError("ABSOLUTE_OPERATOR_PRIVATE_PATH_REQUIRED")
    if any(p.is_symlink() for p in (path,*path.parents) if p.exists()):
        raise ValueError("SYMLINK_LOCAL_PATH_REFUSED")
    return path

def manifest_ids(path:Path):
    local(path)
    if not path.is_file() or path.stat().st_size>MAX_MANIFEST:
        raise ValueError("PINNED_MANIFEST_REQUIRED")
    raw=path.read_bytes()
    if sha(raw)!=MANIFEST_SHA:raise ValueError("PINNED_WENDBINE_MANIFEST_SHA_MISMATCH")
    entries=[];seen=set()
    for line in raw.splitlines():
        if not line.strip():continue
        x=json_from(line)
        if not isinstance(x,dict) or x.get("schema")!="wendbine-manifestation/v1":
            raise ValueError("WENDBINE_MANIFEST_SCHEMA_MISMATCH")
        sid=x.get("source_id")
        if not isinstance(sid,str) or not SOURCE_ID.fullmatch(sid):
            raise ValueError("WENDBINE_MANIFEST_SOURCE_ID_INVALID")
        if x.get("platform_account")!=AUTHOR or x.get("subreddit")!=COMMUNITY:
            raise ValueError("MANIFEST_AUTHOR_COMMUNITY_DRIFT")
        if sid in seen:raise ValueError("DUPLICATE_PINNED_SOURCE_ID")
        seen.add(sid);entries.append(sid)
    if len(entries)!=SOURCE_COUNT:raise ValueError("EXPECTED_PINNED_MANIFEST_COUNT_DRIFT")
    return entries

def remote_bytes(url:str):
    req=urllib.request.Request(url,headers={
       "User-Agent":"TD613-Wendbine-ManifestArchiveHydration/1.0",
       "Accept":"application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=35) as response:
                raw=response.read(MAX_BYTES+1)
                if len(raw)>MAX_BYTES:raise ValueError("PROVIDER_BATCH_RESPONSE_TOO_LARGE")
                return raw
        except urllib.error.HTTPError as e:
            if e.code not in (429,500,502,503,504) or attempt==2:
                raise
            retry=e.headers.get("Retry-After","2")
            try:pause=min(30,max(1,int(retry)))
            except (ValueError,TypeError):pause=2
            time.sleep(pause)
    raise ValueError("PROVIDER_RETRIES_EXHAUSTED")

def parse_batch(raw:bytes,ids:list[str]):
    if len(raw)>MAX_BYTES:raise ValueError("PROVIDER_BATCH_RESPONSE_TOO_LARGE")
    obj=json_from(raw)
    if isinstance(obj,list):rows=obj
    elif isinstance(obj,dict) and isinstance(obj.get("data"),list):rows=obj["data"]
    elif isinstance(obj,dict) and isinstance(obj.get("posts"),list):rows=obj["posts"]
    else:raise ValueError("UNRECOGNIZED_ARCHIVE_ID_RESPONSE")
    selected=set(ids);got={}
    for row in rows:
        if not isinstance(row,dict):raise ValueError("MALFORMED_ARCHIVE_POST")
        raw_id=row.get("id")
        if not isinstance(raw_id,str):raise ValueError("PROVIDER_POST_ID_REQUIRED")
        sid="reddit:t3_"+raw_id.removeprefix("t3_")
        if sid not in selected:raise ValueError("EXTRANEOUS_ARCHIVE_SOURCE_ID_REFUSED")
        if sid in got:raise ValueError("DUPLICATE_ARCHIVE_SOURCE_ID_REFUSED")
        got[sid]=row
    return got

def observed_timestamp(clock):
    now=clock()
    if not isinstance(now,dt.datetime) or now.tzinfo is None or now.utcoffset()!=dt.timedelta(0):
        raise ValueError("UTC_AWARE_OBSERVATION_REQUIRED")
    return now.isoformat().replace("+00:00","Z")

def post_to_capture(sid,row,observed,url,batch_index):
    if str(row.get("author","")).casefold()!=AUTHOR.casefold() or \
       str(row.get("subreddit","")).casefold()!=COMMUNITY.casefold():
        return None,"AUTHOR_OR_SUBREDDIT_MISMATCH"
    created=row.get("created_utc")
    if not isinstance(created,(int,float)) or isinstance(created,bool) or created<=0:
        return None,"ARCHIVE_PUBLICATION_TIME_MISSING"
    published=dt.datetime.fromtimestamp(created,dt.timezone.utc)
    if published>dt.datetime.fromisoformat(observed.replace("Z","+00:00")):
        return None,"ARCHIVE_PUBLICATION_AFTER_CAPTURE"
    title=row.get("title");body=row.get("selftext")
    if not isinstance(title,str):return None,"ARCHIVE_TITLE_NOT_TEXT"
    state="FULL_OBSERVED_BODY"
    if body is None:
        body="";state="MISSING_BODY_FIELD_TITLE_ONLY"
    if not isinstance(body,str):return None,"ARCHIVE_BODY_NOT_TEXT"
    if body.strip() in {"[removed]","[deleted]"}:
        body="";state="REMOVAL_PLACEHOLDER_TITLE_ONLY"
    if not body and state=="FULL_OBSERVED_BODY":
        state="EMPTY_BODY_TITLE_ONLY"
    title_raw=title.encode("utf8");body_raw=body.encode("utf8")
    if max(len(title_raw),len(body_raw))>MAX_POST_BYTES:
        return None,"ARCHIVE_BODY_OVERSIZE"
    if not title and not body:return None,"NO_OBSERVED_TEXT_FIELDS"
    # _meta.was_deleted_later and removed_by_category are unverified
    # independent archive reports. Preserve the provider raw batch rather
    # than asserting author deletion, motive, or current platform visibility.
    outbound=row.get("url")
    if outbound is not None and (not isinstance(outbound,str) or len(outbound)>4096):
        return None,"ARCHIVE_OUTBOUND_URL_INVALID"
    cid="archive-id-"+observed.replace(":","").replace("-","").replace(".","")+"-"+sid.removeprefix("reddit:t3_")
    capture={
       "schema":"td613.wendbine.local-capture/v1",
       "capture_id":cid,"source_id":sid,
       "author":AUTHOR,"subreddit":COMMUNITY,
       "source_system":"ARCTIC_SHIFT_PUBLIC_POSTS_ID_ARCHIVE",
       "source_locator":url,
       "published_at_utc":published.isoformat().replace("+00:00","Z"),
       "captured_at_utc":observed,
       "later_visibility_state":"LATER_STATUS_UNKNOWN",
       "title":title,"selftext":body,
       "title_sha256":sha(title_raw),"body_sha256":sha(body_raw),
       "is_self":row.get("is_self",True) is not False,
       "is_video":row.get("is_video") is True,
       "outbound_url":outbound,
       "source_archive_capture_note":"PUBLIC_ARCHIVE_RETURN_OBSERVED_AT_REQUEST_TIME_NOT_AUTHOR_SIGNED",
       "source_archive_body_availability":state,
       "source_archive_batch_index":batch_index
    }
    return capture,state

def atomic_bytes(path:Path,raw:bytes):
    if path.exists():raise FileExistsError("PRIVATE_OUTPUT_EXCLUSIVE_NO_OVERWRITE")
    tmp=path.with_name(path.name+".tmp")
    if tmp.exists():raise ValueError("STAGED_TEMP_FILE_EXISTS_REVIEW_BEFORE_RESUME")
    with tmp.open("xb") as stream:
        stream.write(raw);stream.flush();os.fsync(stream.fileno())
    os.replace(tmp,path)

def hydrate(manifest:Path,workspace:Path,*,batch_size=25,resume=False,
            fetch=remote_bytes,clock=lambda:dt.datetime.now(dt.timezone.utc)):
    ids=manifest_ids(manifest)
    if type(batch_size) is not int or not 1<=batch_size<=100:
        raise ValueError("BOUNDED_MANIFEST_ID_BATCH_SIZE_REQUIRED")
    local(workspace)
    if resume:
        if not workspace.is_dir():raise ValueError("EXISTING_PRIVATE_WORKSPACE_REQUIRED_FOR_RESUME")
    else:
        if not workspace.parent.is_dir():raise ValueError("PRIVATE_WORKSPACE_PARENT_MISSING")
        workspace.mkdir(exist_ok=False)
    batch_dir=workspace/"archive-batches"
    if resume:
        if not batch_dir.is_dir():raise ValueError("RESUME_BATCH_DIRECTORY_REQUIRED")
    else:batch_dir.mkdir()
    if (workspace/"wendbine-captures.jsonl").exists():
        raise ValueError("FINAL_CAPTURE_MANIFEST_ALREADY_PRESENT")
    all_captures=[];held=[];receipts=[]
    for index,start in enumerate(range(0,len(ids),batch_size)):
        requested=ids[start:start+batch_size]
        query=urllib.parse.urlencode({"ids":",".join(v.removeprefix("reddit:t3_") for v in requested)})
        url=API+"?"+query
        raw_path=batch_dir/f"{index:04d}.json"
        receipt_path=batch_dir/f"{index:04d}.receipt.json"
        if raw_path.exists() or receipt_path.exists():
            if not resume or not raw_path.is_file() or not receipt_path.is_file():
                raise ValueError("INCOMPLETE_OR_UNEXPECTED_BATCH_PAIR_HELD")
            raw=raw_path.read_bytes()
            receipt=json_from(receipt_path.read_bytes())
            if receipt.get("manifest_sha256")!=MANIFEST_SHA or \
               receipt.get("requested_ids")!=requested or \
               receipt.get("response_sha256")!=sha(raw) or \
               receipt.get("batch_size")!=batch_size:
                raise ValueError("RESUMED_PROVIDER_BATCH_IDENTITY_DRIFT")
            observed=receipt["observed_utc"]
        else:
            raw=fetch(url)
            if not isinstance(raw,bytes):raise ValueError("PROVIDER_MUST_RETURN_BYTES")
            # Validate full batch response before durable save.
            parse_batch(raw,requested)
            observed=observed_timestamp(clock)
            receipt={"batch_index":index,"batch_size":batch_size,
                "manifest_sha256":MANIFEST_SHA,"requested_ids":requested,
                "response_sha256":sha(raw),"response_bytes":len(raw),
                "observed_utc":observed,"provider":API}
            atomic_bytes(raw_path,raw)
            atomic_bytes(receipt_path,encoded(receipt))
        response=parse_batch(raw,requested)
        for sid in requested:
            row=response.get(sid)
            if row is None:
                held.append({"source_id":sid,"reason":"NOT_RETURNED_BY_ARCHIVE_ID_LOOKUP"})
                continue
            capture,state=post_to_capture(sid,row,observed,url,index)
            if capture is None:
                held.append({"source_id":sid,"reason":state})
            else:
                all_captures.append(capture)
        receipts.append({"batch_index":index,"requested":len(requested),
          "returned":len(response),"raw_sha256":sha(raw),
          "observed_utc":observed})
    if len(all_captures)+len(held)!=len(ids):
        raise ValueError("MANIFEST_RECONCILIATION_FAILED")
    # Separate file holds all source text; never write to GitHub or project dir.
    if not all_captures:
        raise ValueError("NO_ELIGIBLE_ARCHIVE_TEXT_CAPTURED_NO_FINAL_MANIFEST")
    capture_bytes=b"\n".join(encoded(x) for x in all_captures)+b"\n"
    atomic_bytes(workspace/"wendbine-captures.jsonl",capture_bytes)
    counts={}
    for x in held:counts[x["reason"]]=counts.get(x["reason"],0)+1
    report={"schema":"td613.wendbine.manifest-id-hydration-receipt/v1",
       "state":"PUBLIC_ARCHIVE_ID_BYTES_CAPTURED_LOCALLY_WITH_GAPS",
       "pinned_manifest_sha256":MANIFEST_SHA,"manifest_ids":len(ids),
       "observed_archive_text_sources":len(all_captures),
       "held_or_unreturned_sources":len(held),
       "held_by_reason":dict(sorted(counts.items())),
       "body_available_sources":sum(bool(x["selftext"]) for x in all_captures),
       "title_only_sources":sum(not x["selftext"] for x in all_captures),
       "capture_jsonl_sha256":sha(capture_bytes),
       "batch_receipts":receipts,
       "source_id_coverage_complete":len(held)==0,
       "author_originals_cryptographically_attested":False,
       "provider_archive_coverage_exhaustiveness":False,
       "operator_local_private_corpus_only":True,
       "ciphertext_archives_opened":False,
       "original_native_SRC_EM_method_parity":"NOT_EVALUATED"}
    atomic_bytes(workspace/"hydrate-receipt.json",encoded(report))
    atomic_bytes(workspace/"unreturned-or-held-ids.json",encoded(held))
    return report

def main():
    p=argparse.ArgumentParser(description="Hydrate exact pinned public Wendbine source IDs from an independent archive into local plaintext.")
    p.add_argument("--public-manifest",type=Path,required=True)
    p.add_argument("--private-workspace",type=Path,required=True)
    p.add_argument("--batch-size",type=int,default=25)
    p.add_argument("--resume",action="store_true")
    args=p.parse_args()
    print(json.dumps(hydrate(args.public_manifest,args.private_workspace,
      batch_size=args.batch_size,resume=args.resume),ensure_ascii=False,indent=2))

if __name__=="__main__":main()
