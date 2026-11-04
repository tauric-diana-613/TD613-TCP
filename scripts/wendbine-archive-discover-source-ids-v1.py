#!/usr/bin/env python3
"""Independent archive search of Wendbine posts OUTSIDE the pinned 2,062 ID registry.

Discovers candidate IDs by bounded time windows. A 100-result saturated
interval is subdivided; a saturated one-second interval is explicitly HELD.
Returned IDs are only observations from the archive search, not a proof that
all historical sources were found. No content stored outside local workspace.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
from pathlib import Path
import urllib.parse

BASE=Path(__file__).resolve().parent
SPEC=importlib.util.spec_from_file_location("td613_archive_id_hydrator",BASE/"wendbine-manifest-id-hydrator-v1.py")
h=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(h)
SEARCH_URL="https://arctic-shift.photon-reddit.com/api/posts/search"
MAX_CALLS=2500
MAX_IDS=100000
LIMIT=100

def seconds(value:str):
    stamp=dt.datetime.fromisoformat(value.replace("Z","+00:00"))
    if stamp.tzinfo is None or stamp.utcoffset()!=dt.timedelta(0):
        raise ValueError("EXPLICIT_UTC_INTERVAL_REQUIRED")
    return int(stamp.timestamp())

def stamp(sec:int):
    return dt.datetime.fromtimestamp(sec,dt.timezone.utc).isoformat().replace("+00:00","Z")

def search_response(raw:bytes):
    obj=h.json_from(raw)
    if isinstance(obj,list):return obj
    if isinstance(obj,dict) and isinstance(obj.get("data"),list):return obj["data"]
    raise ValueError("ARCHIVE_SEARCH_RESPONSE_UNRECOGNIZED")

def observed_ids(rows,start,stop):
    found=set();errors=[]
    for row in rows:
        if not isinstance(row,dict):raise ValueError("ARCHIVE_SEARCH_ROW_NOT_OBJECT")
        sid=row.get("id")
        if not isinstance(sid,str):raise ValueError("ARCHIVE_SEARCH_ID_NOT_STRING")
        sid="reddit:t3_"+sid.removeprefix("t3_")
        if not h.SOURCE_ID.fullmatch(sid):raise ValueError("ARCHIVE_SEARCH_ID_INVALID")
        pub=row.get("created_utc")
        if not isinstance(pub,(int,float)) or isinstance(pub,bool):
            raise ValueError("ARCHIVE_SEARCH_PUBLICATION_INVALID")
        if not start<=pub<stop:continue
        if str(row.get("author","")).casefold()!=h.AUTHOR.casefold() or \
           str(row.get("subreddit","")).casefold()!=h.COMMUNITY.casefold():
            errors.append({"source_id":sid,"reason":"RETURNED_AUTHOR_OR_COMMUNITY_MISMATCH"})
            continue
        found.add(sid)
    return found,errors

def discover(manifest:Path,workspace:Path,*,since:str,until:str,resume=False,
             fetch=h.remote_bytes,clock=lambda:dt.datetime.now(dt.timezone.utc)):
    pinned=set(h.manifest_ids(manifest))
    start,end=seconds(since),seconds(until)
    if not start<end:raise ValueError("INVALID_ARCHIVE_DISCOVERY_INTERVAL")
    h.local(workspace)
    if resume:
        if not workspace.is_dir():raise ValueError("DISCOVERY_RESUME_WORKSPACE_MISSING")
    else:
        if not workspace.parent.is_dir():raise ValueError("PRIVATE_WORKSPACE_PARENT_MISSING")
        workspace.mkdir(exist_ok=False)
    batches=workspace/"search-responses"
    if resume:
        if not batches.is_dir():raise ValueError("DISCOVERY_RESUME_RESPONSES_MISSING")
    else:batches.mkdir()
    if (workspace/"extra-ids.json").exists():
        raise ValueError("DISCOVERY_FINAL_OUTPUT_PRESENT")
    all_ids=set();bad=[];receipts=[];saturated=[];calls=0
    def crawl(lo,hi,depth=0):
        nonlocal calls
        if calls>=MAX_CALLS:raise ValueError("ARCHIVE_DISCOVERY_REQUEST_CEILING_REACHED")
        calls+=1
        url=SEARCH_URL+"?"+urllib.parse.urlencode({
            "author":h.AUTHOR,"subreddit":h.COMMUNITY,
            "after":stamp(lo-1),"before":stamp(hi),
            "sort":"asc","limit":LIMIT})
        request_hash=h.sha(url.encode("utf8"))
        raw_path=batches/(request_hash+".json")
        receipt_path=batches/(request_hash+".receipt.json")
        if raw_path.exists() or receipt_path.exists():
            if not resume or not raw_path.is_file() or not receipt_path.is_file():
                raise ValueError("SEARCH_BATCH_PAIR_INCOMPLETE")
            raw=raw_path.read_bytes()
            prior=h.json_from(receipt_path.read_bytes())
            if prior.get("request_sha256")!=request_hash or \
               prior.get("response_sha256")!=h.sha(raw) or \
               prior.get("window")!=[lo,hi]:
                raise ValueError("SEARCH_RESUME_IDENTITY_DRIFT")
            observed=prior.get("observed_utc")
        else:
            raw=fetch(url)
            if not isinstance(raw,bytes) or len(raw)>h.MAX_BYTES:
                raise ValueError("SEARCH_RESPONSE_TOO_LARGE_OR_INVALID")
            rows=search_response(raw)
            if len(rows)>LIMIT:raise ValueError("ARCHIVE_SEARCH_RETURN_EXCEEDS_LIMIT")
            observed=h.observed_timestamp(clock)
            receipt={"request_sha256":request_hash,"response_sha256":h.sha(raw),
                     "window":[lo,hi],"observed_utc":observed,
                     "returned_count":len(rows),"uri":url}
            h.atomic_bytes(raw_path,raw)
            h.atomic_bytes(receipt_path,h.encoded(receipt))
        rows=search_response(raw)
        if len(rows)>LIMIT:raise ValueError("ARCHIVE_SEARCH_RETURN_EXCEEDS_LIMIT")
        found,invalid=observed_ids(rows,lo,hi)
        all_ids.update(found);bad.extend(invalid)
        receipts.append({"start_utc":stamp(lo),"end_utc":stamp(hi),
            "returned":len(rows),"recognized":len(found),
            "response_sha256":h.sha(raw),"observed_utc":observed,
            "saturated":len(rows)==LIMIT,"depth":depth})
        if len(all_ids)>MAX_IDS:raise ValueError("MAX_DISCOVERY_SOURCE_IDS_EXCEEDED")
        if len(rows)==LIMIT:
            if hi-lo<=1:
                saturated.append({"start_utc":stamp(lo),"end_utc":stamp(hi),
                  "reason":"ONE_SECOND_SEARCH_RESULT_SATURATION"})
            else:
                mid=lo+(hi-lo)//2
                if not lo<mid<hi:raise ValueError("UNSPLITTABLE_SEARCH_INTERVAL")
                crawl(lo,mid,depth+1)
                crawl(mid,hi,depth+1)
    crawl(start,end)
    new=sorted(all_ids-pinned)
    report={"schema":"td613.wendbine.archive-discovered-id-set/v1",
        "pinned_manifest_sha256":h.MANIFEST_SHA,
        "start_utc":stamp(start),"end_utc_exclusive":stamp(end),
        "source_ids":new,
        "observed_ids_in_pinned_manifest":len(all_ids&pinned),
        "observed_ids_beyond_pinned_manifest":len(new),
        "search_segment_requests":calls,
        "saturated_one_second_intervals":saturated,
        "invalid_identity_observations":bad,
        "complete_historical_catalog_proven":False,
        "source_class":"ARCHIVE_SEARCH_DISCOVERED_IDS_UNVERIFIED_ORIGINAL",
        "provenance_receipts":receipts}
    h.atomic_bytes(workspace/"extra-ids.json",h.encoded(report))
    return {"status":"DISCOVERY_ID_SET_OBSERVED_NOT_COMPLETE_CORPUS",
       "source_ids_outside_manifest":len(new),
       "saturated_one_second_intervals":len(saturated),
       "provider_calls":calls,"pinned_manifest_hash":h.MANIFEST_SHA,
       "source_id_manifest_complete":False}

def main():
    p=argparse.ArgumentParser(description="Discover public archive source IDs before or after pinned Wendbine manifest interval.")
    p.add_argument("--public-manifest",type=Path,required=True)
    p.add_argument("--private-workspace",type=Path,required=True)
    p.add_argument("--since",required=True)
    p.add_argument("--until",required=True)
    p.add_argument("--resume",action="store_true")
    a=p.parse_args()
    print(json.dumps(discover(a.public_manifest,a.private_workspace,
       since=a.since,until=a.until,resume=a.resume),ensure_ascii=False,indent=2))
if __name__=="__main__":main()
