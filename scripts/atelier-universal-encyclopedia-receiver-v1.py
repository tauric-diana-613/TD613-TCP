#!/usr/bin/env python3
"""TD613 source-free Universal Encyclopedia qualification receiver, v1.

An isolated synthetic-packet receiver for testing zero-state, admission, exact
return, typed relations and SRC method-row preservation. No provider access,
protected-source admission, scientific source validation or geometric inference.
"""
from __future__ import annotations

import argparse
import base64
from contextlib import closing
import hashlib
import json
from pathlib import Path
import re
import sqlite3


SCHEMA = "td613.universal-encyclopedia.receiver/v1"
PACKET_SCHEMA = "td613.synthetic-research-packet/v1"
COLUMNS = ["packet_id", "source_id", "capture_id", "source_sha256",
           "packet_sha256", "method_count", "payload"]
KEYS = {"schema", "packet_id", "source_class", "source_id", "capture_id",
        "source_text", "source_sha256", "method_rows", "relations"}
NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$")


class ReceiverError(ValueError):
    pass


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _path(path) -> Path:
    p = Path(path).absolute()
    if any(part.is_symlink() for part in (p, *p.parents)):
        raise ReceiverError("Symlinked database locations are prohibited")
    if not p.parent.is_dir():
        raise ReceiverError("Database parent must already exist")
    return p


def _open(path, *, create=False):
    p = _path(path)
    if create and p.exists():
        raise ReceiverError("Receiver exists; cannot attest a new empty state")
    if not create and not p.is_file():
        raise ReceiverError("Receiver is absent")
    db = sqlite3.connect(p.as_uri() + ("?mode=rwc" if create else "?mode=rw"),
                         uri=True, timeout=5.0, isolation_level=None)
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=5000")
    return db


def _schema(db):
    if db.execute("PRAGMA user_version").fetchone()[0] != 1:
        raise ReceiverError("Receiver schema/version mismatch")
    found = [row[1] for row in db.execute("PRAGMA table_info(packets)")]
    if found != COLUMNS:
        raise ReceiverError("Receiver packets schema drift")


def _counts(db):
    return {
        "sources": db.execute("SELECT COUNT(DISTINCT source_id) FROM packets").fetchone()[0],
        "captures": db.execute("SELECT COUNT(*) FROM packets").fetchone()[0],
        "packets": db.execute("SELECT COUNT(*) FROM packets").fetchone()[0],
        "method_rows": db.execute("SELECT COALESCE(SUM(method_count),0) FROM packets").fetchone()[0],
        "relations": db.execute("SELECT COUNT(*) FROM relations").fetchone()[0],
        "chunks": db.execute("SELECT COUNT(*) FROM chunks").fetchone()[0],
        "vectors": db.execute("SELECT COUNT(*) FROM vectors").fetchone()[0],
    }


def create(path):
    with closing(_open(path, create=True)) as db:
        db.executescript("""
            PRAGMA user_version=1;
            CREATE TABLE packets (
                packet_id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                capture_id TEXT NOT NULL,
                source_sha256 TEXT NOT NULL,
                packet_sha256 TEXT NOT NULL,
                method_count INTEGER NOT NULL CHECK(method_count >= 0),
                payload BLOB NOT NULL,
                UNIQUE(source_id,capture_id)
            );
            CREATE TABLE relations (
                packet_id TEXT NOT NULL REFERENCES packets(packet_id),
                ordinal INTEGER NOT NULL,
                edge_type TEXT NOT NULL,
                target_source_id TEXT NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY(packet_id,ordinal)
            );
            CREATE TABLE chunks (
                chunk_id TEXT PRIMARY KEY,
                packet_id TEXT NOT NULL REFERENCES packets(packet_id)
            );
            CREATE TABLE vectors (
                vector_id TEXT PRIMARY KEY,
                chunk_id TEXT NOT NULL REFERENCES chunks(chunk_id)
            );
        """)
        _schema(db)
        initial = _counts(db)
        if any(initial.values()):
            raise ReceiverError("Zero-admission invariant violated")
        return {"schema": SCHEMA, "disposition": "SOURCE_FREE_ZERO_VERIFIED",
                "counts": initial, "boundary": "single fresh SQLite receiver database"}


def state(path):
    with closing(_open(path)) as db:
        db.execute("BEGIN")
        try:
            _schema(db)
            counts = _counts(db)
            db.execute("COMMIT")
        except BaseException:
            db.execute("ROLLBACK")
            raise
    return {"schema": SCHEMA, "counts": counts,
            "scope": "local SQLite table counts, not independent external custody"}


def _pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ReceiverError("Duplicate JSON key")
        result[key] = value
    return result


def _reject_nonfinite(token):
    raise ReceiverError("Non-finite JSON token is forbidden: "+token)


def validate(raw: bytes):
    if not isinstance(raw, bytes):
        raise ReceiverError("Packet input must be exact bytes")
    try:
        item = json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs,
                          parse_constant=_reject_nonfinite)
    except ReceiverError:
        raise
    except (UnicodeDecodeError, ValueError, TypeError) as exc:
        raise ReceiverError("Invalid UTF-8/JSON packet") from exc
    if not isinstance(item, dict) or set(item) != KEYS:
        raise ReceiverError("Packet requires exact source-free schema keys")
    if item["schema"] != PACKET_SCHEMA or item["source_class"] != "SYNTHETIC":
        raise ReceiverError("Only source-free synthetic packet admission is authorized")
    for key in ("packet_id", "source_id", "capture_id"):
        if not isinstance(item[key], str) or not NAME.fullmatch(item[key]):
            raise ReceiverError("Invalid bound packet/source/capture ID")
    if not isinstance(item["source_text"], str):
        raise ReceiverError("Source text must be a string")
    if not isinstance(item["source_sha256"], str) or (
        digest(item["source_text"].encode("utf-8")) != item["source_sha256"]
    ):
        raise ReceiverError("Source text digest mismatch")
    if not isinstance(item["method_rows"], list) or any(
        not isinstance(row, dict) for row in item["method_rows"]
    ):
        raise ReceiverError("Method rows must be structured objects")
    if not isinstance(item["relations"], list):
        raise ReceiverError("Relations must be a list")
    for link in item["relations"]:
        if not isinstance(link, dict) or set(link) != {"type", "target_source_id", "status"}:
            raise ReceiverError("Relation must retain three explicit typed fields")
        if any(not isinstance(link[k], str) or not NAME.fullmatch(link[k])
               for k in ("type", "target_source_id")):
            raise ReceiverError("Invalid typed relation")
        if link["status"] not in ("declared", "unresolved"):
            raise ReceiverError("Do not promote relations into inferred or verified links")
    return item


def _checked(db, packet_id):
    row = db.execute(
        "SELECT packet_id,source_id,capture_id,source_sha256,packet_sha256,method_count,payload "
        "FROM packets WHERE packet_id=?", (packet_id,)
    ).fetchone()
    if row is None:
        return None
    pid, sid, cid, srcsha, pktsha, n, payload = row
    raw = bytes(payload)
    if digest(raw) != pktsha:
        raise ReceiverError("Packet bytes diverge from recorded SHA-256")
    packet = validate(raw)
    if (packet["packet_id"], packet["source_id"], packet["capture_id"],
        packet["source_sha256"], len(packet["method_rows"])) != (pid, sid, cid, srcsha, n):
        raise ReceiverError("Packet attribution differs from stored bindings")
    links = db.execute(
        "SELECT edge_type,target_source_id,status FROM relations WHERE packet_id=? ORDER BY ordinal",
        (pid,)
    ).fetchall()
    expected = [(x["type"], x["target_source_id"], x["status"]) for x in packet["relations"]]
    if links != expected:
        raise ReceiverError("Typed source relations diverge from original packet")
    return raw, packet


def admit(path, raw: bytes):
    packet = validate(raw)
    with closing(_open(path)) as db:
        db.execute("BEGIN IMMEDIATE")
        try:
            _schema(db)
            db.execute(
                "INSERT INTO packets VALUES(?,?,?,?,?,?,?)",
                (packet["packet_id"], packet["source_id"], packet["capture_id"],
                 packet["source_sha256"], digest(raw), len(packet["method_rows"]), raw)
            )
            for i, edge in enumerate(packet["relations"]):
                db.execute(
                    "INSERT INTO relations VALUES(?,?,?,?,?)",
                    (packet["packet_id"], i, edge["type"], edge["target_source_id"],
                     edge["status"])
                )
            # Reverify through the SAME transaction/connection: no validation-to-readback reopen.
            checked = _checked(db, packet["packet_id"])
            if checked is None or checked[0] != raw:
                raise ReceiverError("In-transaction packet return mismatch")
            db.execute("COMMIT")
        except BaseException:
            db.execute("ROLLBACK")
            raise
    return {"disposition": "SYNTHETIC_PACKET_ADMITTED", "packet_id": packet["packet_id"],
            "source_id": packet["source_id"], "capture_id": packet["capture_id"],
            "packet_sha256": digest(raw), "method_rows": len(packet["method_rows"]),
            "relations": len(packet["relations"]), "scientific_claim": "none"}


def return_packet(path, packet_id: str) -> bytes:
    with closing(_open(path)) as db:
        db.execute("BEGIN")
        try:
            _schema(db)
            result = _checked(db, packet_id)
            db.execute("COMMIT")
        except BaseException:
            db.execute("ROLLBACK")
            raise
    if result is None:
        raise ReceiverError("No admitted packet")
    return result[0]


def same_type(a, b) -> bool:
    if type(a) is not type(b):
        return False
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(same_type(v, b[k]) for k, v in a.items())
    if isinstance(a, list):
        return len(a) == len(b) and all(same_type(x, y) for x, y in zip(a, b))
    return a == b


def method_query(path, field: str, expected, *, offset=0, limit=50):
    if not isinstance(field, str) or not field or any(not x for x in field.split(".")):
        raise ReceiverError("Structured field is required")
    if not isinstance(offset, int) or offset < 0 or isinstance(offset, bool):
        raise ReceiverError("Invalid offset")
    if not isinstance(limit, int) or isinstance(limit, bool) or not 1 <= limit <= 100:
        raise ReceiverError("Invalid limit")
    matches = []
    missing = object()  # Absent evidence differs from an explicitly recorded null.
    with closing(_open(path)) as db:
        db.execute("BEGIN")
        try:
            _schema(db)
            ids = [x[0] for x in db.execute(
                "SELECT packet_id FROM packets ORDER BY source_id,capture_id,packet_id"
            )]
            for pid in ids:
                checked = _checked(db, pid)
                if checked is None:
                    raise ReceiverError("Packet disappeared within transaction")
                packet = checked[1]
                for i, row in enumerate(packet["method_rows"]):
                    value = row
                    for part in field.split("."):
                        if not isinstance(value, dict) or part not in value:
                            value = missing
                            break
                        value = value[part]
                    if value is not missing and same_type(value, expected):
                        matches.append({"packet_id":pid,"source_id":packet["source_id"],
                                        "capture_id":packet["capture_id"],"row_index":i,
                                        "method_row":row,"packet_sha256":digest(checked[0])})
            db.execute("COMMIT")
        except BaseException:
            db.execute("ROLLBACK")
            raise
    return {"schema": SCHEMA, "total":len(matches), "offset":offset,
            "limit":limit, "has_more":offset+limit<len(matches),
            "rows":matches[offset:offset+limit],
            "meaning":"Exact typed recorded method rows; no inferred geometry, empirical verification, or source admission"}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="command", required=True)
    for action in ("init", "state", "admit", "get", "query"):
        sp=sub.add_parser(action)
        sp.add_argument("database")
        if action=="admit":
            sp.add_argument("packet")
            sp.add_argument("--source-free-only",action="store_true",required=True)
        if action=="get":
            sp.add_argument("packet_id")
        if action=="query":
            sp.add_argument("field")
            sp.add_argument("expected_json")
    args=ap.parse_args(argv)
    if args.command=="init":
        obj=create(args.database)
    elif args.command=="state":
        obj=state(args.database)
    elif args.command=="admit":
        obj=admit(args.database,Path(args.packet).read_bytes())
    elif args.command=="get":
        raw=return_packet(args.database,args.packet_id)
        obj={"packet_sha256":digest(raw),"packet_bytes_b64":base64.b64encode(raw).decode("ascii")}
    else:
        obj=method_query(args.database,args.field,json.loads(args.expected_json))
    print(json.dumps(obj,ensure_ascii=False,sort_keys=True))


if __name__ == "__main__":
    main()
