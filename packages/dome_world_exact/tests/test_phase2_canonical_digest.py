from __future__ import annotations

import json
from pathlib import Path

import pytest

from packages.dome_world_exact.ash_canonical_json import (
    CANONICAL_JSON_PROFILE,
    MANIFEST_DIGEST_DOMAIN,
    RECEIPT_DIGEST_DOMAIN,
    canonical_digest,
    canonical_json,
    compute_manifest_digest,
    compute_receipt_digest,
    strict_json_loads,
)


ROOT = Path(__file__).resolve().parents[3]
VECTORS = json.loads(
    (ROOT / "app" / "dome-world" / "fixtures" / "ash-canonical-json-vectors.json").read_text(
        encoding="utf-8"
    )
)


def test_python_vectors_match_frozen_canonical_forms_and_digests():
    assert VECTORS["profile"] == CANONICAL_JSON_PROFILE
    for vector in VECTORS["vectors"]:
        assert canonical_json(vector["value"]) == vector["canonical_json"]
        assert canonical_digest(vector["domain"], vector["value"]) == vector["digest"]


def test_manifest_and_receipt_domains_are_distinct_and_self_fields_are_excluded():
    manifest = {
        "schema": "td613.ash.custody-manifest/v0.8",
        "artifact_id": "ash_artifact_fixture",
        "aperture": {"volatile": "context"},
    }
    first_manifest = compute_manifest_digest(manifest)
    manifest["manifest_digest"] = first_manifest
    manifest["aperture"] = {"volatile": "changed-context"}
    assert compute_manifest_digest(manifest) == first_manifest

    receipt = {
        "schema": "td613.ash.custody-receipt/v0.8",
        "manifest": manifest,
        "manifest_digest": first_manifest,
    }
    first_receipt = compute_receipt_digest(receipt)
    receipt["receipt_digest"] = first_receipt
    receipt["receipt_id"] = "ashc_" + first_receipt[-20:]
    assert compute_receipt_digest(receipt) == first_receipt
    assert first_manifest != first_receipt
    assert MANIFEST_DIGEST_DOMAIN != RECEIPT_DIGEST_DOMAIN


@pytest.mark.parametrize(
    "payload, message",
    [
        ('{"a":1,"a":2}', "duplicate JSON object key"),
        ('{"a":1.5}', "floating-point JSON number"),
        ('{"a":-0}', "negative zero"),
        ('{"a":9007199254740992}', "safe-integer"),
        ('{"é":1}', "non-ASCII object key"),
    ],
)
def test_strict_parser_rejects_cross_language_ambiguity(payload, message):
    with pytest.raises((TypeError, ValueError), match=message):
        strict_json_loads(payload)


def test_canonicalizer_preserves_unicode_bytes_without_normalization():
    nfc = {"value": "é"}
    nfd = {"value": "e\u0301"}
    assert canonical_json(nfc) != canonical_json(nfd)
    assert canonical_digest("fixture", nfc) != canonical_digest("fixture", nfd)


def test_unpaired_surrogate_and_float_objects_are_rejected():
    with pytest.raises(ValueError, match="surrogate"):
        canonical_json({"value": "\ud800"})
    with pytest.raises(TypeError, match="floating-point"):
        canonical_json({"value": 1.0})
