#!/usr/bin/env python3
"""Source-free SRC claim-evidence tomography adapter for recipient qualification.

Preserves native Phase 2 rows verbatim (as JSON values), source file bytes,
snapshot identity, seal binding and independent UNKNOWN/null dimensions.
Only a synthetic fixture may be packaged for the qualification receiver.
No source acquisition, custody attestation, inverse reconstruction or holonomy.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

SCHEMA = "claim-evidence-tomography/v1"
RECEIVER_PACKET_SCHEMA = "td613.synthetic-research-packet/v1"


class AdapterError(ValueError):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def same_type(a, b):
    if type(a) is not type(b):
        return False
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(same_type(v, b[k]) for k, v in a.items())
    if isinstance(a, list):
        return len(a) == len(b) and all(same_type(x, y) for x, y in zip(a, b))
    return a == b


def _pairs(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise AdapterError("Duplicate method JSON key")
        out[key] = value
    return out


def _path(path):
    p = Path(path).absolute()
    if any(x.is_symlink() for x in (p, *p.parents)):
        raise AdapterError("Symlinked native source locations prohibited")
    if not p.is_file():
        raise AdapterError("Native method record absent")
    return p


def _reject_nonfinite(token):
    raise AdapterError("Non-finite JSON token is forbidden: "+token)


def load(path, *, snapshot, seal_binding, expected_sha256):
    if not snapshot or not seal_binding or not expected_sha256:
        raise AdapterError("Explicit source digest, snapshot and seal binding required")
    raw = _path(path).read_bytes()
    if sha(raw) != expected_sha256:
        raise AdapterError("Native source file digest mismatch")
    try:
        text = raw.decode("utf-8-sig")
        lines = [line for line in text.splitlines() if line.strip()]
        rows = [json.loads(line, object_pairs_hook=_pairs,
                           parse_constant=_reject_nonfinite) for line in lines]
    except AdapterError:
        raise
    except (UnicodeError, ValueError, TypeError) as exc:
        raise AdapterError("Native method rows are not valid UTF-8 JSONL") from exc
    if not rows:
        raise AdapterError("Native method rows unavailable; no completion inferred")
    for i, row in enumerate(rows):
        if not isinstance(row, dict) or row.get("schema_version") != SCHEMA:
            raise AdapterError(f"Unexpected native method schema at row {i}")
        if row.get("atelier_snapshot_id") != snapshot:
            raise AdapterError(f"Snapshot differs at row {i}")
        if row.get("seal_epoch_binding") != seal_binding:
            raise AdapterError(f"Seal binding differs at row {i}")
        if "delta_scope" not in row or "delta_evidence" not in row or (
            "delta_falsifier_granularity" not in row or
            "delta_asserted_authority" not in row or
            "composite_score" not in row
        ):
            raise AdapterError(f"Unqualified/flattened tomography dimensions at row {i}")
    return {"schema":"td613.src.native-method-readback/v1",
            "native_schema":SCHEMA, "source_sha256":sha(raw),
            "source_bytes":raw, "source_text":raw.decode("utf-8"),
            "snapshot":snapshot,"seal_binding":seal_binding,"rows":rows,
            "authority":"operator-supplied pins require external custody verification"}


def query(bundle, field, expected, *, offset=0, limit=50):
    if not isinstance(field, str) or not field or any(not key for key in field.split(".")):
        raise AdapterError("Structured field path required")
    if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100:
        raise AdapterError("Invalid pagination")
    hits = []
    missing = object()  # Absent method fields must not match an explicit JSON null.
    for i, row in enumerate(bundle["rows"]):
        value = row
        for key in field.split("."):
            if not isinstance(value, dict) or key not in value:
                value = missing
                break
            value = value[key]
        if value is not missing and same_type(value, expected):
            hits.append({"ordinal":i,"row":row,
                         "record_sha256":sha(json.dumps(row, ensure_ascii=False, sort_keys=True,
                                                       separators=(",",":")).encode("utf-8"))})
    return {"schema":"td613.src.native-method-query/v1",
            "native_schema":SCHEMA, "source_sha256":bundle["source_sha256"],
            "snapshot":bundle["snapshot"],"seal_binding":bundle["seal_binding"],
            "total":len(hits),"offset":offset,"limit":limit,
            "has_more":offset+limit<len(hits),"rows":hits[offset:offset+limit],
            "scientific_warrant":"recorded dimensions only; no composite score, empirical reconstruction or holonomy established"}


def synthetic_packet(bundle, *, packet_id, source_id, capture_id, synthetic_only=False):
    if synthetic_only is not True:
        raise AdapterError("Receiver packet construction requires explicit source-free synthetic declaration")
    if not all(isinstance(x,str) and x for x in (packet_id,source_id,capture_id)):
        raise AdapterError("Explicit packet/source/capture identities required")
    packet = {"schema":RECEIVER_PACKET_SCHEMA,"packet_id":packet_id,
              "source_class":"SYNTHETIC","source_id":source_id,"capture_id":capture_id,
              "source_text":bundle["source_text"],
              "source_sha256":sha(bundle["source_text"].encode("utf-8")),
              "method_rows":bundle["rows"],"relations":[]}
    return (json.dumps(packet,ensure_ascii=False,sort_keys=True,indent=2)+"\n").encode("utf-8")


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("jsonl")
    p.add_argument("--snapshot",required=True)
    p.add_argument("--seal-binding",required=True)
    p.add_argument("--source-sha256",required=True)
    p.add_argument("--field",required=True)
    p.add_argument("--value-json",required=True)
    p.add_argument("--offset",type=int,default=0)
    p.add_argument("--limit",type=int,default=50)
    a=p.parse_args(argv)
    bundle=load(a.jsonl,snapshot=a.snapshot,seal_binding=a.seal_binding,expected_sha256=a.source_sha256)
    print(json.dumps(query(bundle,a.field,json.loads(a.value_json),offset=a.offset,limit=a.limit),
                     ensure_ascii=False,sort_keys=True))


if __name__=="__main__":
    main()
