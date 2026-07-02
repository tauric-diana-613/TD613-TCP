"""Ash v0.6 metadata-only leak challenge and projection firewall helpers."""

from __future__ import annotations

import re
from typing import Any, Callable

ASH_V06_OPERATIONS = {
    "ash-leak-challenge",
    "ash-veil",
    "ash-cinder",
    "ash-compare",
    "ash-recall",
    "ash-grade-gate",
    "ash-hcc-adapter",
    "ash-projection-simulate",
}

CLAIM_CEILINGS = {
    "leak": "ash-leak-challenge-risk-estimate-not-anonymity-certification",
    "pressure": "ash-reconstruction-pressure-not-proof-of-external-leakage",
    "veil": "ash-veil-structure-not-content-summary",
    "cinder": "ash-cinder-fragment-not-full-document",
    "compare": "ash-compare-delta-not-legal-redaction-certification",
    "recall": "ash-recall-not-erasure-proof",
    "grade": "ash-grade-gate-context-record-not-third-party-enforcement",
    "hcc": "hcc-context-routing-not-identity-proof",
    "weather": "weather-controller-not-safety-certification",
    "aperture": "aperture-handoff-not-aperture-execution-or-ash-custody-proof",
}

FORCE_ORDER = ["OPEN", "SELECTED", "CONSTRUCTION", "FORCED_UNDER_CONSTRAINT", "FORCED_IN_CONTEXT", "FORCED"]
SENSITIVE_CATEGORIES = {
    "whistleblower", "legal", "medical", "indigenous-language", "minor-related",
    "employment-complaint", "financial-audit", "sexual-misconduct", "family-safety",
}
ANTI_EQUIVALENCE = [
    "visibility ≠ consent",
    "receipt ≠ proof",
    "redaction ≠ safety",
    "custody ≠ content",
    "summary ≠ permission",
    "containment ≠ healing",
    "beauty ≠ verification",
    "arrival ≠ consent",
]
AUTHORITY_WORDS = re.compile(r"\b(certified|verified|proof|authentic|permissioned|legally safe|sealed as fact|identity confirmed|guarantees anonymity|prevents all data leakage|defeats crawlers)\b", re.I)
DATE_RE = re.compile(r"\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})\b", re.I)
NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\b")
PROPER_RE = re.compile(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b")
EMAIL_PHONE_RE = re.compile(r"[\w.%-]+@[\w.-]+|\+?\d[\d\s().-]{7,}\d")
ROLE_RE = re.compile(r"\b(?:director|manager|attorney|doctor|officer|employee|witness|steward|custodian|operator|administrator|candidate|donor|client|minor|patient)\b", re.I)
SEQUENCE_RE = re.compile(r"\b(?:before|after|then|next|later|earlier|first|second|third|revision|commit|last-modified|superseded)\b", re.I)
GLYPH_RE = re.compile(r"[≠𝌋⟐米𝄐]|\u200c")
HASH_RE = re.compile(r"sha256:[a-z0-9:_-]{8,}", re.I)
PATH_RE = re.compile(r"(?:/|\\\\|[A-Za-z]:\\\\|\.pdf|\.docx|\.xlsx|\.csv|\.html|\.json|\.md)\b", re.I)


def _stable_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, dict):
        return " ".join(f"{key} {_stable_text(val)}" for key, val in sorted(value.items()))
    if isinstance(value, list):
        return " ".join(_stable_text(item) for item in value)
    return str(value)


def _copy_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _bucket(score: float) -> str:
    if score >= 0.67:
        return "high"
    if score >= 0.34:
        return "medium"
    return "low"


def _metric(metric: str, raw_score: float, reason: str) -> dict:
    score = round(max(0.0, min(1.0, raw_score)), 2)
    return {"metric": metric, "score": score, "bucket": _bucket(score), "reason": reason}


def _extract_manifest(value: Any) -> dict:
    source = _copy_dict(value)
    return _copy_dict(source.get("manifest")) or source


def _content_hash(value: Any) -> str:
    manifest = _extract_manifest(value)
    metadata = _copy_dict(manifest.get("artifact_metadata") or manifest.get("artifactMetadata"))
    return str(metadata.get("content_hash") or metadata.get("contentHash") or "")


def _receipt_id(value: Any) -> str:
    source = _copy_dict(value)
    return str(source.get("receipt_id") or source.get("cinder_id") or source.get("veil_id") or source.get("recall_id") or source.get("traceId") or "")


def _projection_from_payload(payload: dict) -> dict:
    for key in ("projection", "receipt", "veil", "cinder", "compare", "diff", "index", "publicSurface", "public_surface"):
        if isinstance(payload.get(key), dict):
            return payload[key]
    return payload


def _leakage_vector(projection: dict) -> dict:
    text = _stable_text(projection)
    lower = text.lower()
    dates = DATE_RE.findall(text)
    numbers = NUMBER_RE.findall(text)
    proper = [item for item in PROPER_RE.findall(text) if item.lower() not in {"true", "false", "none"}]
    roles = ROLE_RE.findall(text)
    seq = SEQUENCE_RE.findall(text)
    glyphs = GLYPH_RE.findall(text)
    hashes = HASH_RE.findall(text)
    paths = PATH_RE.findall(text)
    quotes = text.count('"') // 2
    rare_phrase = sum(1 for word in re.findall(r"\b[A-Za-z0-9_-]{13,}\b", text) if not word.lower().startswith("sha256"))
    category_hits = sorted(cat for cat in SENSITIVE_CATEGORIES if cat.replace("-", " ") in lower or cat in lower)
    authority = AUTHORITY_WORDS.findall(text)
    anti_missing = [literal for literal in ANTI_EQUIVALENCE if literal not in text]
    anti_generic = bool(re.search(r"privacy concern|policy language|safe summary|permission issue|verification|proof", lower))

    reconstruction_score = min(1.0, (len(dates) * .08) + (len(numbers) * .025) + (len(hashes) * .15) + (len(paths) * .12) + (quotes * .04) + (rare_phrase * .04) + (0.14 if "source_environment" in lower else 0) + (0.12 if "route" in lower or "room_route" in lower else 0))
    entity_score = min(1.0, (len(proper) * .045) + (len(roles) * .08) + (.22 if EMAIL_PHONE_RE.search(text) else 0) + (.16 if "source_environment" in lower else 0))
    chronology_score = min(1.0, (len(dates) * .12) + (len(seq) * .07) + (.16 if "last_modified" in lower or "created_at" in lower else 0) + (.12 if "revision" in lower or "commit" in lower else 0))
    stylometric_score = min(1.0, (len(glyphs) * .08) + (.2 if "sealed" in lower or "claimceiling" in lower else 0) + (.12 if re.search(r"[;:—]{3,}", text) else 0))
    linkage_score = min(1.0, (len(hashes) * .18) + (.18 if _receipt_id(projection) else 0) + (.18 if "path_or_ref" in lower or "source_locator" in lower else 0) + (.12 if "visual_signature" in lower else 0))
    category_score = min(1.0, len(category_hits) * .32 + (.18 if "custody_category" in lower else 0))
    authority_score = min(1.0, len(authority) * .22)
    anti_score = .72 if anti_generic and anti_missing else 0.0

    return {
        "reconstruction_pressure": _metric("reconstruction_pressure", reconstruction_score, "projection exposes artifact shape, source route, chronology, hash, or phrase traces"),
        "entity_inference_pressure": _metric("entity_inference_pressure", entity_score, "projection contains role, proper-noun, contact, institution, or small-context markers"),
        "chronology_leakage": _metric("chronology_leakage", chronology_score, "projection contains date, sequence, revision, commit, or receipt-order cues"),
        "stylometric_heat": _metric("stylometric_heat", stylometric_score, "projection carries cadence, glyph, footer, capitalization, or ritualized syntax traces"),
        "linkage_pressure": _metric("linkage_pressure", linkage_score, "projection exposes stable identifiers, paths, hashes, visual seed, or repeated receipt patterns"),
        "custody_category_leakage": _metric("custody_category_leakage", category_score, "projection reveals or implies a sensitive category", "category_hits", category_hits),
        "authority_drift": _metric("authority_drift", authority_score, "projection language implies proof, permission, authenticity, legality, safety, anonymity, or truth"),
        "anti_equivalence_collapse": _metric("anti_equivalence_collapse", anti_score, "projection flattens protected non-equivalence lines into generic policy language"),
    }


def _max_bucket(vector: dict) -> str:
    scores = [metric.get("score", 0) for metric in vector.values() if isinstance(metric, dict)]
    return _bucket(max(scores or [0]))


def _verdict(vector: dict) -> str:
    high = [name for name, metric in vector.items() if isinstance(metric, dict) and metric.get("bucket") == "high"]
    if "anti_equivalence_collapse" in high or "authority_drift" in high:
        return "QUARANTINE"
    if "reconstruction_pressure" in high or "custody_category_leakage" in high:
        return "BLOCK_EXPORT"
    if high:
        return "WATCH"
    if any(isinstance(metric, dict) and metric.get("bucket") == "medium" for metric in vector.values()):
        return "COOL_ROUTE"
    return "OPEN"


def _blocked_for(vector: dict) -> list[str]:
    blocked = []
    if vector["reconstruction_pressure"]["bucket"] in {"medium", "high"}:
        blocked += ["raw-summary", "public-cinder"]
    if vector["linkage_pressure"]["bucket"] in {"medium", "high"}:
        blocked += ["stable-public-hash", "universal-digest"]
    if vector["authority_drift"]["bucket"] in {"medium", "high"}:
        blocked += ["proof-language", "verification-language"]
    if vector["anti_equivalence_collapse"]["bucket"] in {"medium", "high"}:
        blocked += ["generic-policy-collapse"]
    return sorted(set(blocked))


def _recommended_tending(vector: dict) -> list[str]:
    verdict = _verdict(vector)
    if verdict in {"BLOCK_EXPORT", "QUARANTINE"}:
        return ["𝄐", "safe-harbor-buffer", "lower-projection-detail", "rotate-salt-scope"]
    if verdict in {"WATCH", "COOL_ROUTE"}:
        return ["cōl", "ash-veil", "route-scoped-digest"]
    return ["hõt", "controlled-cinder-eligible", "receipt-index-reference"]


def _weather_controller(vector: dict) -> dict:
    fold_density = round((vector["anti_equivalence_collapse"]["score"] + vector["authority_drift"]["score"]) / 2, 2)
    heat = max(vector["reconstruction_pressure"]["score"], vector["linkage_pressure"]["score"], vector["custody_category_leakage"]["score"], fold_density)
    if heat >= .67:
        operator = "𝄐" if fold_density >= .67 else "cōl"
        decision = "hard-pause-before-export" if operator == "𝄐" else "cool-route-before-export"
        allowed = ["private-sense", "Ash Veil", "Safe Harbor buffer"]
        blocked = ["public Cinder", "raw summary", "Flight packet"]
    elif heat >= .34:
        operator = "cōl"
        decision = "lower-projection-detail-before-export"
        allowed = ["Ash Veil", "receipt-index-reference"]
        blocked = ["stable public hash", "raw summary"]
    else:
        operator = "hõt"
        decision = "controlled-projection-eligible"
        allowed = ["Ash Veil", "controlled Cinder", "public weather"]
        blocked = ["raw document export"]
    return {
        "schema": "flowcore.ash-weather-controller/v0.6",
        "operator": operator,
        "weather": {
            "reconstruction_pressure": vector["reconstruction_pressure"]["bucket"],
            "linkage_pressure": vector["linkage_pressure"]["bucket"],
            "stylometric_heat": vector["stylometric_heat"]["bucket"],
            "fold_density": fold_density,
        },
        "allowed": allowed,
        "blocked": blocked,
        "decision": decision,
        "pattern_coherence": "米",
        "claimCeiling": CLAIM_CEILINGS["weather"],
    }


def ash_leak_challenge(payload: dict, aperture: dict) -> dict:
    projection = _projection_from_payload(payload)
    vector = _leakage_vector(projection)
    verdict = _verdict(vector)
    return {
        "status": verdict,
        "schema": "td613.ash.leak-challenge/v0.6",
        "aperture": aperture,
        "mode": "metadata-only-server-projection-analysis",
        "raw_content_received": False,
        "projection_id": _receipt_id(projection) or None,
        "leakageVector": vector,
        "reconstruction_pressure": vector["reconstruction_pressure"],
        "projectionVerdict": verdict,
        "recommendedTending": _recommended_tending(vector),
        "blockedProjections": _blocked_for(vector),
        "flowcore_weather": _weather_controller(vector),
        "claimCeiling": CLAIM_CEILINGS["leak"],
        "seal": "⟐",
    }


def ash_veil(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    receipt = _copy_dict(payload.get("receipt")) or _projection_from_payload(payload)
    manifest = _extract_manifest(receipt)
    leak = ash_leak_challenge({"projection": receipt}, aperture)
    metadata = _copy_dict(manifest.get("artifact_metadata"))
    source_locator = _copy_dict(manifest.get("source_locator"))
    source_environment = str(manifest.get("source_environment") or "manual")
    digest_basis = {"receipt": _receipt_id(receipt), "artifact": manifest.get("artifact_id"), "route": _copy_dict(manifest.get("ash_posture")).get("room_route")}
    return {
        "status": leak["projectionVerdict"],
        "schema": "td613.ash.veil/v0.6",
        "veil_id": "veil_" + sha256(digest_basis)[-16:],
        "created_at": now(),
        "artifact_id": manifest.get("artifact_id"),
        "content_exported": False,
        "surface": "structural-surrogate",
        "source_environment_bucket": source_environment,
        "media_type_bucket": str(metadata.get("media_type") or metadata.get("mediaType") or "unknown").split("/")[0],
        "byte_length_bucket": _byte_bucket(metadata.get("byte_length") or metadata.get("byteLength")),
        "hash_scope": metadata.get("hash_scope") or metadata.get("hashScope") or "withheld-or-route-scoped",
        "route_scoped_digest": sha256(digest_basis),
        "path_or_ref_exported": bool(payload.get("allowExactPath") is True and source_locator.get("path_or_ref")),
        "exact_path_or_ref": source_locator.get("path_or_ref") if payload.get("allowExactPath") is True else None,
        "weather": {key: val["bucket"] for key, val in leak["leakageVector"].items() if isinstance(val, dict)},
        "allowed": ["public-weather", "receipt-index-reference"],
        "blocked": sorted(set(["raw-summary", "public-cinder"] + leak["blockedProjections"])),
        "claimCeiling": CLAIM_CEILINGS["veil"],
    }


def _byte_bucket(value: Any) -> str:
    try:
        n = int(value or 0)
    except (TypeError, ValueError):
        n = 0
    if n <= 0:
        return "unknown"
    if n < 1024:
        return "under-1kb"
    if n < 1024 * 1024:
        return "1kb-1mb"
    return "over-1mb"


def ash_cinder(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    fragment = str(payload.get("fragment") or payload.get("candidateFragment") or "")
    receipt = _copy_dict(payload.get("receipt"))
    source_receipt_id = str(payload.get("source_receipt_id") or payload.get("sourceReceiptId") or receipt.get("receipt_id") or "")
    approved = payload.get("operatorApproved") is True or payload.get("operator_approved") is True
    leak_payload = {"projection": {"fragment_class": "operator-approved-redacted-fragment", "source_receipt_id": source_receipt_id, "fragment": fragment[:220]}}
    leak = ash_leak_challenge(leak_payload, aperture)
    passed = approved and leak["projectionVerdict"] in {"OPEN", "COOL_ROUTE"} and leak["leakageVector"]["reconstruction_pressure"]["bucket"] != "high"
    return {
        "status": "OPEN" if passed else "HELD",
        "schema": "td613.ash.cinder/v0.6",
        "cinder_id": "cinder_" + sha256({"source": source_receipt_id, "fragment": fragment})[-16:],
        "created_at": now(),
        "source_receipt_id": source_receipt_id or None,
        "fragment_class": "operator-approved-redacted-fragment",
        "content_exported": bool(passed),
        "raw_document_exported": False,
        "redaction_level": str(payload.get("redactionLevel") or payload.get("redaction_level") or "high"),
        "fragment": fragment if passed else None,
        "export_blocked_reason": None if passed else "operator approval and low/medium leak challenge required before Cinder export",
        "operator_approved": approved,
        "leak_challenge": {
            "reconstruction_pressure": leak["leakageVector"]["reconstruction_pressure"]["bucket"],
            "linkage_pressure": leak["leakageVector"]["linkage_pressure"]["bucket"],
            "stylometric_heat": leak["leakageVector"]["stylometric_heat"]["bucket"],
            "verdict": leak["projectionVerdict"],
        },
        "claimCeiling": CLAIM_CEILINGS["cinder"],
    }


def ash_compare(payload: dict, aperture: dict) -> dict:
    previous = _copy_dict(payload.get("previous") or payload.get("previousReceipt") or payload.get("a"))
    current = _copy_dict(payload.get("current") or payload.get("currentReceipt") or payload.get("b"))
    prev = ash_leak_challenge({"projection": previous}, aperture)
    curr = ash_leak_challenge({"projection": current}, aperture)
    delta = {}
    for key in prev["leakageVector"]:
        delta[key] = round(curr["leakageVector"][key]["score"] - prev["leakageVector"][key]["score"], 2)
    anti_fail = curr["leakageVector"]["anti_equivalence_collapse"]["bucket"] == "high"
    authority = curr["leakageVector"]["authority_drift"]["bucket"] in {"medium", "high"}
    return {
        "status": "WATCH" if any(val > 0.15 for val in delta.values()) or anti_fail or authority else "OPEN",
        "schema": "td613.ash.compare/v0.6",
        "aperture": aperture,
        "privacy_pressure_delta": delta,
        "reconstruction_pressure_delta": delta.get("reconstruction_pressure", 0),
        "linkage_pressure_delta": delta.get("linkage_pressure", 0),
        "evidence_anchor_loss": previous.get("receipt_id") and not current.get("receipt_id"),
        "anti_equivalence_collapse": anti_fail,
        "authority_drift": authority,
        "recommended_projection": "Ash Veil" if _verdict(curr["leakageVector"]) in {"OPEN", "COOL_ROUTE"} else "Safe Harbor buffer",
        "claimCeiling": CLAIM_CEILINGS["compare"],
    }


def ash_recall(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    target_id = str(payload.get("target_id") or payload.get("targetId") or _receipt_id(payload.get("target")) or "")
    reason = str(payload.get("reason_class") or payload.get("reasonClass") or "projection-leakage")
    status = str(payload.get("recall_status") or payload.get("recallStatus") or "superseded")
    return {
        "status": "RECALLED",
        "schema": "td613.ash.recall/v0.6",
        "aperture": aperture,
        "recall_id": "ashrecall_" + sha256({"target": target_id, "reason": reason, "status": status})[-16:],
        "created_at": now(),
        "target_id": target_id,
        "recall_status": status,
        "reason_class": reason,
        "content_deleted_claimed": False,
        "public_export_allowed": False,
        "decision": "local-recall-notice-created-without-claiming-external-erasure",
        "claimCeiling": CLAIM_CEILINGS["recall"],
    }


def ash_grade_gate(payload: dict, aperture: dict) -> dict:
    supplied = payload.get("forceStatus") or payload.get("force_status") or payload.get("statuses") or ["OPEN"]
    statuses = [str(s).strip().upper() for s in (supplied if isinstance(supplied, list) else [supplied])]
    valid = [s for s in statuses if s in FORCE_ORDER]
    selected = min(valid or ["OPEN"], key=FORCE_ORDER.index)
    return {
        "status": "OPEN",
        "schema": "td613.ash.grade-gate/v0.6",
        "aperture": aperture,
        "declared_statuses": valid or ["OPEN"],
        "force_status": selected,
        "lower_force_wins": True,
        "careful_translation": "The Grade Gate records coercive acquisition context so downstream tools and analysts cannot honestly treat the artifact as freely volunteered or context-neutral.",
        "third_party_enforcement_claimed": False,
        "claimCeiling": CLAIM_CEILINGS["grade"],
    }


def ash_hcc_adapter(payload: dict, aperture: dict) -> dict:
    who = str(payload.get("whoPolicy") or payload.get("who_policy") or "self-provided-or-withheld")
    if who not in {"self-provided-or-withheld", "withheld", "self-provided"}:
        who = "self-provided-or-withheld"
    return {
        "status": "OPEN",
        "schema": "td613.hcc.adapter/v0.6",
        "aperture": aperture,
        "pairs": {"WHAT": "WHO", "WHERE": "HOW", "WHEN": "WHY"},
        "who_policy": who,
        "how_policy": "non-diagnostic",
        "why_policy": "non-predictive",
        "identity_inference_allowed": False,
        "diagnosis_claimed": False,
        "destiny_prediction_claimed": False,
        "claimCeiling": CLAIM_CEILINGS["hcc"],
    }


def ash_projection_simulate(payload: dict, aperture: dict) -> dict:
    leak = ash_leak_challenge(payload, aperture)
    phason = _copy_dict(payload.get("phason"))
    return {
        "status": leak["projectionVerdict"],
        "schema": "td613.ash.projection-simulate/v0.6",
        "aperture": aperture,
        "leak_challenge": leak,
        "flowcore_weather_controller": leak["flowcore_weather"],
        "aperture_handoff": {
            "schema": "td613.ash.aperture-handoff/v0.6",
            "aperture_version": "v2.9.4",
            "ash_receipt_id": _receipt_id(_projection_from_payload(payload)) or None,
            "projection": str(payload.get("projectionType") or "Ash Veil"),
            "route_weather": {
                "occlusion": leak["leakageVector"]["reconstruction_pressure"]["score"],
                "coherence": round(1 - leak["leakageVector"]["anti_equivalence_collapse"]["score"], 2),
                "routePressure": leak["leakageVector"]["linkage_pressure"]["score"],
            },
            "phason": {
                "content_invariant": bool(phason.get("content_invariant", True)),
                "projection_changed": bool(phason.get("projection_changed", True)),
                "boundary_crossed": "claim_ceiling_pressure" if leak["projectionVerdict"] != "OPEN" else "none",
            },
            "claimCeiling": CLAIM_CEILINGS["aperture"],
        },
        "claimCeiling": CLAIM_CEILINGS["pressure"],
    }


def dispatch_ash_v06(operation: str, payload: dict, aperture: dict, reject_raw_content: Callable[[dict], None], sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    reject_raw_content(payload)
    if operation == "ash-leak-challenge":
        return ash_leak_challenge(payload, aperture)
    if operation == "ash-veil":
        return ash_veil(payload, aperture, sha256, now)
    if operation == "ash-cinder":
        return ash_cinder(payload, aperture, sha256, now)
    if operation == "ash-compare":
        return ash_compare(payload, aperture)
    if operation == "ash-recall":
        return ash_recall(payload, aperture, sha256, now)
    if operation == "ash-grade-gate":
        return ash_grade_gate(payload, aperture)
    if operation == "ash-hcc-adapter":
        return ash_hcc_adapter(payload, aperture)
    if operation == "ash-projection-simulate":
        return ash_projection_simulate(payload, aperture)
    raise ValueError("unsupported Ash v0.6 operation")
