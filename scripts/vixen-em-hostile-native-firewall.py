#!/usr/bin/env python3
"""A hostile executable wrapper around the unchanged TD613 Em documentary
motif firewall, operating on exactly two current SHA-verified Vixen derivatives.
It is NOT original scholarly author code, source-archive external observation,
human mechanism adjudication, or independent empirical replication.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN"
NATIVE = BASE / "em-motif-mechanism-control-v1.py"
HOST = ROOT / "scripts/vixen-em-original-host.py"
TOKEN = re.compile(r"[a-z][a-z0-9]{2,23}\Z")
DIGEST = re.compile(r"[a-f0-9]{64}\Z")


def load(path, name):
    if not path.is_file() or path.is_symlink():
        raise ValueError("HELD_EM_ORIGINAL_EXECUTABLE_MISSING")
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise ValueError("HELD_EM_NATIVE_MODULE_UNAVAILABLE")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def hash_bytes(raw):
    return hashlib.sha256(raw).hexdigest()


def require(check, code):
    if not check:
        raise ValueError(code)


def run(request):
    require(isinstance(request, dict) and set(request) == {"schema", "packet", "candidate"},
            "HELD_EM_HOSTILE_ENVELOPE_SCHEMA")
    require(request["schema"] == "td613.vixen.em-hostile-python-input/v1",
            "HELD_EM_HOSTILE_SCHEMA")
    packet = request["packet"]
    native_host = load(HOST, "td613_vixen_em_existing_validation_host")
    # Reuse the established STRICT catalogue/manifestation/byte validator.
    works, selected = native_host.validate(packet)
    require(len(selected) == 2, "HELD_EM_HOSTILE_TWO_VERIFIED_SOURCE_BODIES")
    candidate = request["candidate"]
    require(isinstance(candidate, dict) and set(candidate) == {"token", "locators"},
            "HELD_EM_HOSTILE_CANDIDATE_SCHEMA")
    token = candidate["token"]
    require(isinstance(token, str) and TOKEN.fullmatch(token),
            "HELD_EM_HOSTILE_INVALID_LEXICAL_CANDIDATE")
    locators = candidate["locators"]
    require(isinstance(locators, list) and len(locators) == 2,
            "HELD_EM_HOSTILE_SOURCE_SPAN_COUNT")
    source_bytes = {}
    for i, ((record, raw), locator) in enumerate(zip(selected, locators)):
        sid = record["source_file_id"]
        require(isinstance(locator, dict) and set(locator) ==
                {"source_id", "sha256", "byte_offset", "length_utf8", "span_sha256"},
                "HELD_EM_HOSTILE_LOCATOR_SCHEMA")
        require(locator["source_id"] == sid and
                locator["sha256"] == record["verified_derivative_sha256"] and
                type(locator["byte_offset"]) is int and
                type(locator["length_utf8"]) is int and
                locator["length_utf8"] == len(token.encode("utf8")),
                "HELD_EM_HOSTILE_LOCATOR_CUSTODY")
        pos = locator["byte_offset"]
        require(pos >= 0 and pos + locator["length_utf8"] <= len(raw) and
                raw[pos:pos + locator["length_utf8"]].lower() == token.encode("utf8"),
                "HELD_EM_HOSTILE_TOKEN_NOT_AT_EXACT_SOURCE_SPAN")
        # ASCII token boundaries in the UTF-8 source.
        left = raw[pos - 1:pos] if pos else b""
        right = raw[pos + locator["length_utf8"]:pos + locator["length_utf8"] + 1]
        def word_char(c):
            return c and ((65 <= c[0] <= 90) or (97 <= c[0] <= 122) or
                          (48 <= c[0] <= 57) or c == b"_")
        require(not word_char(left) and not word_char(right),
                "HELD_EM_HOSTILE_SUBSTRING_NOT_WHOLE_TERM")
        require(hash_bytes(raw[pos:pos + locator["length_utf8"]]) ==
                locator["span_sha256"], "HELD_EM_HOSTILE_SPAN_DIGEST_MISMATCH")
        source_bytes[sid] = raw

    firewall = load(NATIVE, "td613_em_unchanged_firewall")
    native_path_sha256 = hash_bytes(NATIVE.read_bytes())
    # Source-backed candidate with no mechanistic structure furnished.
    first = firewall.assess({"spans": locators}, source_bytes)
    require(first["classification"] == "MOTIF_MATCH" and not first["mechanism_supported"] and
            not first["automatic_promotion"], "HELD_EM_BASELINE_PROMOTED")

    # Strong-looking structured FORM is deliberately a HOSTILE SYNTHETIC SPOOF.
    # Those claims were not extracted or validated against the original text.
    synthetic_structural = {
        "spans": locators,
        "structural_mapping": {
            "entities": "unverified two-text common-token hypothesis",
            "operators": "asserted operator without exact source-to-rule trace",
            "boundary_conditions": "synthetic boundary without source witness",
            "predicted_consequences": "invented, unobserved prediction"
        },
        "field_generic_alternatives": ["generic field terminology",
                                       "independent convergence",
                                       "post-hoc researcher selection"],
        "non_metaphorical_mechanism": "proposed but unverified causal operation",
        "discriminating_observation": "no independently observed discriminator",
        "work_identity_sensitivity": "eight unresolved supported Work IDs"
    }
    form = firewall.assess(synthetic_structural, source_bytes)
    require(form["classification"] == "STRUCTURAL_ANALOGY_CANDIDATE" and
            form["mechanism_supported"] is False and
            form["automatic_promotion"] is False,
            "HELD_EM_SYNTHETIC_STRUCTURAL_FORM_PROMOTED")

    # The original source-digest membrane must detect tampering, even if
    # the attacker supplies an otherwise perfectly structured claim.
    tampered = dict(source_bytes)
    tampered[locators[0]["source_id"]] += b"\nHOSTILE_APPEND"
    try:
        firewall.assess(synthetic_structural, tampered)
    except ValueError as exc:
        require("EM_SOURCE_ANATOMY_DIGEST_MISMATCH" in str(exc),
                "HELD_EM_TAMPER_WRONG_ERROR")
    else:
        raise ValueError("HELD_EM_SOURCE_TAMPER_WAS_ACCEPTED")

    # A source-key substitution is likewise not a valid independent citation.
    swapped = [dict(x) for x in locators]
    swapped[0]["source_id"] = locators[1]["source_id"]
    try:
        firewall.assess({"spans": swapped}, source_bytes)
    except ValueError:
        pass
    else:
        raise ValueError("HELD_EM_SWAPPED_SOURCE_KEY_WAS_ACCEPTED")

    return {
        "schema": "td613.vixen.em-hostile-native-firewall/v1",
        "source_class": "CURRENT_VIXEN_VERIFIED_DERIVATIVE_NOT_EXTERNAL_ORIGINAL_EM",
        "native_authority": "UNCHANGED_TD613_ARCHIVAL_FIREWALL",
        "native_method_sha256": native_path_sha256,
        "native_python_executed": True,
        "selected_original_vixen_derivatives": [
            {"work_id": s["work_id"], "source_file_id": s["source_file_id"],
             "derivative_sha256": s["verified_derivative_sha256"]}
            for s, _ in selected
        ],
        "token": token,
        "exact_source_locators": locators,
        "baseline_source_verified_classification": first["classification"],
        "synthetic_structural_form_classification": form["classification"],
        "synthetic_structural_fields_not_validated_against_text": True,
        "synthetic_form_requires_independent_human_review": True,
        "original_method_mechanism_supported": False,
        "original_method_automatic_promotion": False,
        "source_digest_tamper_rejected": True,
        "swapped_source_key_rejected": True,
        "field_generic_null_still_available": True,
        "original_historical_author_executable_authenticated": False,
        "human_em_identity_gates_resolved": False,
        "scientific_credit": 0,
        "full_original_method_parity": "HELD_UNPROVEN"
    }


if __name__ == "__main__":
    try:
        result = run(json.load(sys.stdin))
        sys.stdout.write(json.dumps(result, separators=(",", ":"), ensure_ascii=False) + "\n")
    except Exception as exc:
        # Intentionally never print source bodies, source excerpts, or a traceback.
        sys.stderr.write(json.dumps({"state": "HELD", "reason": str(exc)[:180]}) + "\n")
        sys.exit(2)
