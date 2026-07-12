"""TD613 canonical JSON and digest profile for Ash Phase 2.

The profile deliberately accepts a narrow JSON subset so browser and Python
produce byte-identical canonical forms without importing floating-point or
Unicode-normalization ambiguity into custody receipts.
"""

from __future__ import annotations

import hashlib
import json
import re
from typing import Any

CANONICAL_JSON_PROFILE = "td613.ash.canonical-json/v0.1"
MANIFEST_DIGEST_DOMAIN = "td613.ash.manifest-digest/v0.1"
RECEIPT_DIGEST_DOMAIN = "td613.ash.receipt-digest/v0.1"
MAX_SAFE_INTEGER = 9_007_199_254_740_991
ASCII_KEY_RE = re.compile(r"^[\x20-\x7e]+$")


def _validate_string(value: str, path: str) -> None:
    for character in value:
        codepoint = ord(character)
        if 0xD800 <= codepoint <= 0xDFFF:
            raise ValueError(f"{path} contains an unpaired Unicode surrogate")


def _validate(value: Any, path: str = "$") -> None:
    if value is None or isinstance(value, bool):
        return
    if isinstance(value, str):
        _validate_string(value, path)
        return
    if isinstance(value, int):
        if abs(value) > MAX_SAFE_INTEGER:
            raise ValueError(f"{path} exceeds the canonical safe-integer range")
        return
    if isinstance(value, float):
        raise TypeError(
            f"{path} contains a floating-point number; canonical profile accepts integers only"
        )
    if isinstance(value, list):
        for index, item in enumerate(value):
            _validate(item, f"{path}[{index}]")
        return
    if isinstance(value, dict):
        for key, item in value.items():
            if not isinstance(key, str):
                raise TypeError(f"{path} contains a non-string object key")
            if not ASCII_KEY_RE.fullmatch(key):
                raise ValueError(f"{path} contains a non-ASCII object key: {key!r}")
            _validate_string(key, f"{path}.<key>")
            _validate(item, f"{path}.{key}")
        return
    raise TypeError(
        f"{path} contains unsupported canonical JSON type {type(value).__name__}"
    )


def canonical_json(value: Any) -> str:
    """Return TD613-CJ-1 canonical JSON without Unicode normalization."""

    _validate(value)
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    )


def canonical_bytes(value: Any) -> bytes:
    return canonical_json(value).encode("utf-8")


def canonical_digest(domain: str, value: Any) -> str:
    if not isinstance(domain, str) or not ASCII_KEY_RE.fullmatch(domain):
        raise ValueError("digest domain must be a printable ASCII string")
    material = domain.encode("ascii") + b"\n" + canonical_bytes(value)
    return "sha256:" + hashlib.sha256(material).hexdigest()


def manifest_digest_subject(manifest: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(manifest, dict):
        raise TypeError("manifest must be an object")
    return {
        key: value
        for key, value in manifest.items()
        if key not in {"manifest_digest", "aperture"}
    }


def receipt_digest_subject(receipt: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(receipt, dict):
        raise TypeError("receipt must be an object")
    return {
        key: value
        for key, value in receipt.items()
        if key not in {"receipt_digest", "receipt_id"}
    }


def compute_manifest_digest(manifest: dict[str, Any]) -> str:
    return canonical_digest(MANIFEST_DIGEST_DOMAIN, manifest_digest_subject(manifest))


def compute_receipt_digest(receipt: dict[str, Any]) -> str:
    return canonical_digest(RECEIPT_DIGEST_DOMAIN, receipt_digest_subject(receipt))


def _reject_duplicate_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON object key: {key}")
        out[key] = value
    return out


def _parse_int(value: str) -> int:
    if value == "-0":
        raise ValueError("negative zero is outside the canonical profile")
    parsed = int(value)
    if abs(parsed) > MAX_SAFE_INTEGER:
        raise ValueError("JSON integer exceeds canonical safe-integer range")
    return parsed


def _reject_float(value: str) -> None:
    raise ValueError(
        f"floating-point JSON number is outside the canonical profile: {value}"
    )


def strict_json_loads(data: str | bytes) -> Any:
    parsed = json.loads(
        data,
        object_pairs_hook=_reject_duplicate_pairs,
        parse_int=_parse_int,
        parse_float=_reject_float,
        parse_constant=_reject_float,
    )
    _validate(parsed)
    return parsed
