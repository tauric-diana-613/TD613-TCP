#!/usr/bin/env python3
"""TD613 host-only Wendbine bitemporal capture lens.

Publication clock and capture-observation clock are separately reported.
Local database timestamps and hashes support internal custody observations
only; they cannot establish the independent origin of the acquisition clock.
No source text or private source body is returned.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import re
import sqlite3
from pathlib import Path
from contextlib import closing

SOURCE_ID = re.compile(r"reddit:t3_[a-z0-9]{5,12}\Z")
def utc(raw):
    if not isinstance(raw, str) or not raw.strip():
        raise ValueError("UTC_TIMESTAMP_REQUIRED")
    try:
        value=dt.datetime.fromisoformat(raw.replace("Z","+00:00"))
        if not value.utcoffset()==dt.timedelta(0):
            raise ValueError("UTC_TIMEZONE_REQUIRED")
        return value.astimezone(dt.timezone.utc)
    except (TypeError,OverflowError) as exc:
        raise ValueError("INVALID_UTC_TIMESTAMP") from exc

def source_path(value):
    path=Path(value)
    if not path.is_absolute() or not path.is_file() or path.is_symlink():
        raise ValueError("PRIVATE_ABSOLUTE_SQLITE_FILE_REQUIRED")
    if any(p.exists() and p.is_symlink() for p in path.parents):
        raise ValueError("PRIVATE_PARENT_SYMLINK_REFUSED")
    return path

def observed_capture_at(db_path,source_id,cutoff_utc):
    if not SOURCE_ID.fullmatch(source_id or ""):
        raise ValueError("EXACT_PUBLIC_POST_SOURCE_ID_REQUIRED")
    cutoff=utc(cutoff_utc)
    path=source_path(db_path)
    with closing(sqlite3.connect(path.as_uri()+"?mode=ro",uri=True)) as con:
        con.row_factory=sqlite3.Row
        if con.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
            raise ValueError("PRIVATE_SQLITE_INTEGRITY_FAILED")
        required_tables={"sources","capture_versions"}
        tables={r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if not required_tables.issubset(tables):
            raise ValueError("CAPTURE_VERSION_TABLES_REQUIRED")
        cols={r[1] for r in con.execute("PRAGMA table_info(capture_versions)")}
        if not {"capture_id","source_id","captured_at_utc","title","selftext",
                "title_sha256","body_sha256"}.issubset(cols):
            raise ValueError("CAPTURE_HASHED_FIELD_SCHEMA_REQUIRED")
        s_cols={r[1] for r in con.execute("PRAGMA table_info(sources)")}
        if "source_id" not in s_cols:
            raise ValueError("SOURCE_ID_COLUMN_REQUIRED")
        exists=con.execute("SELECT 1 FROM sources WHERE source_id=? LIMIT 1",(source_id,)).fetchone()
        if not exists:
            raise ValueError("TARGET_NOT_IN_LOCAL_SOURCE_REGISTRY")
        pub_col=next((c for c in ("source_created_utc","created_utc","published_unix") if c in s_cols),None)
        publication=None
        if pub_col:
            row=con.execute(f"SELECT {pub_col} FROM sources WHERE source_id=?",(source_id,)).fetchone()
            if row and row[0] is not None:
                try:
                    publication=dt.datetime.fromtimestamp(int(row[0]),tz=dt.timezone.utc)
                except (ValueError,OverflowError,TypeError) as exc:
                    raise ValueError("SOURCE_PUBLICATION_CLOCK_INVALID") from exc
        query="""SELECT capture_id,source_id,captured_at_utc,title,selftext,
         title_sha256,body_sha256 FROM capture_versions
         WHERE source_id=? ORDER BY captured_at_utc,capture_id"""
        observed=[]
        seen_ids=set()
        for row in con.execute(query,(source_id,)):
            if row["capture_id"] in seen_ids:
                raise ValueError("DUPLICATE_CAPTURE_IDENTIFIER")
            seen_ids.add(row["capture_id"])
            captured=utc(row["captured_at_utc"])
            for field,expected in (("title","title_sha256"),("selftext","body_sha256")):
                raw=row[field]
                if not isinstance(raw,bytes) or hashlib.sha256(raw).hexdigest()!=row[expected]:
                    raise ValueError("CAPTURE_VERSION_FIELD_DIGEST_MISMATCH")
                raw.decode("utf8",errors="strict")
            if publication and captured < publication:
                raise ValueError("CAPTURE_BEFORE_PUBLICATION_TIME_ANOMALY")
            observed.append({"capture_id":row["capture_id"],"captured_at":captured,
              "title_sha256":row["title_sha256"],"body_sha256":row["body_sha256"]})
        observed.sort(key=lambda r:(r["captured_at"],r["capture_id"]))
        eligible=[r for r in observed if r["captured_at"]<=cutoff]
        selected=eligible[-1] if eligible else None
        return {
         "schema":"td613.wendbine.local-bitemporal-lens/v1",
         "source_id":source_id,"cutoff_utc":cutoff.isoformat().replace("+00:00","Z"),
         "source_publication_utc":publication.isoformat().replace("+00:00","Z") if publication else None,
         "publication_clock_basis":"LOCAL_SOURCE_REGISTRY_NOT_INDEPENDENTLY_ATTESTED" if publication else "NOT_AVAILABLE",
         "local_capture_versions_total":len(observed),
         "local_capture_versions_no_later_than_cutoff":len(eligible),
         "future_captures_excluded":len(observed)-len(eligible),
         "selected_capture":({"capture_id":selected["capture_id"],
              "captured_at_utc":selected["captured_at"].isoformat().replace("+00:00","Z"),
              "title_sha256":selected["title_sha256"],
              "body_sha256":selected["body_sha256"]} if selected else None),
         "state":"LOCAL_CAPTURE_PRESENT_BY_LOGGED_CUTOFF" if selected else "HELD_NOT_IN_LOCAL_CAPTURE_BY_CUTOFF",
         "observation_clock_independent_of_source":"UNVERIFIED",
         "historical_capture_origin_verified":False,
         "historical_event_realization_proven":False,
         "archive_version_not_first_publication":True,
         "private_source_bodies_returned":False,
         "identity_adjudicated":False,
         "scientific_credit":0,
         "claim_ceiling":"LOCAL_HASHED_CAPTURE_LOG_ONLY_NEEDS_EXOGENOUS_TIME_AND_ORIGIN_WITNESS"
        }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--wendbine-db",type=Path,required=True)
    p.add_argument("--source-id",required=True)
    p.add_argument("--cutoff-utc",required=True)
    args=p.parse_args()
    print(json.dumps(observed_capture_at(args.wendbine_db,args.source_id,args.cutoff_utc),
                     indent=2,ensure_ascii=False))
if __name__=="__main__":
    main()
