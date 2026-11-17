#!/usr/bin/env python3
"""Index explicit observed URL spans from local capture versions, without inference."""
import argparse
import hashlib
import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path

URL = re.compile(r"https?://[^\s<>\)\]\}\"']+", re.IGNORECASE)


def index_urls(path: Path):
    if not path.is_absolute() or not path.is_file() or any(p.is_symlink() for p in (path, *path.parents) if p.exists()):
        raise ValueError("ABSOLUTE_LOCAL_DATABASE_REQUIRED")
    with closing(sqlite3.connect(path.as_uri() + "?mode=rw", uri=True)) as con:
        if con.execute("pragma integrity_check").fetchone()[0] != "ok":
            raise ValueError("DATABASE_INTEGRITY_FAILURE")
        if con.execute("select 1 from sqlite_master where name='observed_url_spans'").fetchone():
            raise ValueError("URL_INDEX_ALREADY_EXISTS")
        con.execute("BEGIN IMMEDIATE")
        try:
            con.execute("""CREATE TABLE observed_url_spans (
                capture_id TEXT NOT NULL, source_id TEXT NOT NULL, source_field TEXT NOT NULL,
                field_sha256 TEXT NOT NULL, byte_offset INTEGER NOT NULL,
                length_utf8 INTEGER NOT NULL, observed_span TEXT NOT NULL,
                relation TEXT NOT NULL, evidence_class TEXT NOT NULL,
                PRIMARY KEY(capture_id, source_field, byte_offset),
                FOREIGN KEY(capture_id) REFERENCES capture_versions(capture_id))""")
            count = 0
            rows = con.execute("select capture_id,source_id,title,selftext,title_sha256,body_sha256 from capture_versions")
            for cid, sid, title, body, title_sha, body_sha in rows:
                for field, raw, digest in (("title", title, title_sha), ("selftext", body, body_sha)):
                    if hashlib.sha256(raw).hexdigest() != digest:
                        raise ValueError("CAPTURE_VERSION_DIGEST_CONFLICT")
                    text = raw.decode("utf8", errors="strict")
                    for match in URL.finditer(text):
                        span = match.group(0)
                        offset = len(text[:match.start()].encode("utf8"))
                        encoded = span.encode("utf8")
                        if raw[offset:offset + len(encoded)] != encoded:
                            raise ValueError("URL_BYTE_OFFSET_CONFLICT")
                        con.execute("insert into observed_url_spans values (?,?,?,?,?,?,?,?,?)",
                            (cid, sid, field, digest, offset, len(encoded), span,
                             "EXPLICIT_URL_SPAN", "OBSERVED_CAPTURE_NOT_SEMANTIC_RELATION"))
                        count += 1
            con.commit()
        except BaseException:
            con.rollback()
            raise
    return {"status": "OBSERVED_URL_SPANS_INDEXED", "url_spans": count,
            "semantic_topology_claim": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(index_urls(args.db)))


if __name__ == "__main__":
    main()
