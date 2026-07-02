"""Ash v0.6 metadata-only Leak Challenge / Projection Firewall runtime."""
from __future__ import annotations

import re
from typing import Any, Callable

ASH_V06_OPERATIONS = {
    "ash-leak-challenge", "ash-veil", "ash-cinder", "ash-compare",
    "ash-recall", "ash-grade-gate", "ash-hcc-adapter", "ash-projection-simulate",
}
CLAIMS = {
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
CATEGORY_MARKERS = {"whistleblower", "legal", "medical", "heritage", "youth-related", "employment-complaint", "financial-audit", "safety-matter"}
ANTI_EQ = ["visibility ≠ consent", "receipt ≠ proof", "redaction ≠ safety", "custody ≠ content", "summary ≠ permission", "containment ≠ healing", "beauty ≠ verification", "arrival ≠ consent"]
AUTHORITY_RE = re.compile(r"\b(certified|verified|proof|authentic|permissioned|legally safe|sealed as fact|identity confirmed|guarantees anonymity|prevents all data leakage|defeats crawlers)\b", re.I)
DATE_RE = re.compile(r"\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})\b", re.I)
NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\b")
PROPER_RE = re.compile(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b")
EMAIL_PHONE_RE = re.compile(r"[\w.%-]+@[\w.-]+|\+?\d[\d\s().-]{7,}\d")
ROLE_RE = re.compile(r"\b(?:director|manager|attorney|doctor|officer|employee|witness|steward|custodian|operator|administrator|candidate|donor|client|patient)\b", re.I)
SEQ_RE = re.compile(r"\b(?:before|after|then|next|later|earlier|first|second|third|revision|commit|last-modified|superseded)\b", re.I)
GLYPH_RE = re.compile(r"[≠𝌋⟐米𝄐]|\u200c")
HASH_RE = re.compile(r"sha256:[a-z0-9:_-]{8,}", re.I)
PATH_RE = re.compile(r"(?:/|\\\\|[A-Za-z]:\\\\|\.pdf|\.docx|\.xlsx|\.csv|\.html|\.json|\.md)\b", re.I)


def _dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, dict):
        return " ".join(f"{k} {_text(v)}" for k, v in sorted(value.items()))
    if isinstance(value, list):
        return " ".join(_text(v) for v in value)
    return str(value)


def _bucket(score: float) -> str:
    return "high" if score >= .67 else "medium" if score >= .34 else "low"


def _metric(name: str, score: float, reason: str, **extra: Any) -> dict:
    bounded = round(max(0.0, min(1.0, score)), 2)
    return {"metric": name, "score": bounded, "bucket": _bucket(bounded), "reason": reason, **extra}


def _manifest(value: Any) -> dict:
    source = _dict(value)
    return _dict(source.get("manifest")) or source


def _rid(value: Any) -> str:
    source = _dict(value)
    return str(source.get("receipt_id") or source.get("cinder_id") or source.get("veil_id") or source.get("recall_id") or source.get("traceId") or "")


def _projection(payload: dict) -> dict:
    for key in ("projection", "receipt", "veil", "cinder", "compare", "diff", "index", "publicSurface", "public_surface"):
        if isinstance(payload.get(key), dict):
            return payload[key]
    return payload


def leakage_vector(projection: dict) -> dict:
    txt = _text(projection)
    lower = txt.lower()
    dates, nums, hashes, paths = DATE_RE.findall(txt), NUMBER_RE.findall(txt), HASH_RE.findall(txt), PATH_RE.findall(txt)
    proper = [p for p in PROPER_RE.findall(txt) if p.lower() not in {"true", "false", "none"}]
    roles, seq, glyphs = ROLE_RE.findall(txt), SEQ_RE.findall(txt), GLYPH_RE.findall(txt)
    quotes = txt.count('"') // 2
    rare = sum(1 for word in re.findall(r"\b[A-Za-z0-9_-]{13,}\b", txt) if not word.lower().startswith("sha256"))
    categories = sorted(cat for cat in CATEGORY_MARKERS if cat in lower or cat.replace("-", " ") in lower)
    authority = AUTHORITY_RE.findall(txt)
    anti_generic = bool(re.search(r"privacy concern|policy language|safe summary|permission issue|verification|proof", lower))
    anti_score = .72 if anti_generic and any(lit not in txt for lit in ANTI_EQ) else 0
    return {
        "reconstruction_pressure": _metric("reconstruction_pressure", len(dates)*.08 + len(nums)*.025 + len(hashes)*.15 + len(paths)*.12 + quotes*.04 + rare*.04 + (.14 if "source_environment" in lower else 0) + (.12 if "room_route" in lower or "route" in lower else 0), "projection exposes artifact shape, source route, chronology, hash, or phrase traces"),
        "entity_inference_pressure": _metric("entity_inference_pressure", len(proper)*.045 + len(roles)*.08 + (.22 if EMAIL_PHONE_RE.search(txt) else 0) + (.16 if "source_environment" in lower else 0), "projection contains role, proper-noun, contact, institution, or small-context markers"),
        "chronology_leakage": _metric("chronology_leakage", len(dates)*.12 + len(seq)*.07 + (.16 if "last_modified" in lower or "created_at" in lower else 0) + (.12 if "revision" in lower or "commit" in lower else 0), "projection contains date, sequence, revision, commit, or receipt-order cues"),
        "stylometric_heat": _metric("stylometric_heat", len(glyphs)*.08 + (.2 if "sealed" in lower or "claimceiling" in lower else 0) + (.12 if re.search(r"[;:—]{3,}", txt) else 0), "projection carries cadence, glyph, footer, capitalization, or ritualized syntax traces"),
        "linkage_pressure": _metric("linkage_pressure", len(hashes)*.18 + (.18 if _rid(projection) else 0) + (.18 if "path_or_ref" in lower or "source_locator" in lower else 0) + (.12 if "visual_signature" in lower else 0), "projection exposes stable identifiers, paths, hashes, visual seed, or repeated receipt patterns"),
        "custody_category_leakage": _metric("custody_category_leakage", len(categories)*.32 + (.18 if "custody_category" in lower else 0), "projection reveals or implies a sensitive category", category_hits=categories),
        "authority_drift": _metric("authority_drift", len(authority)*.22, "projection language implies proof, permission, authenticity, legality, safety, anonymity, or truth"),
        "anti_equivalence_collapse": _metric("anti_equivalence_collapse", anti_score, "projection flattens protected non-equivalence lines into generic policy language"),
    }


def verdict(vector: dict) -> str:
    high = {k for k, v in vector.items() if v.get("bucket") == "high"}
    if high & {"authority_drift", "anti_equivalence_collapse"}: return "QUARANTINE"
    if high & {"reconstruction_pressure", "custody_category_leakage"}: return "BLOCK_EXPORT"
    if high: return "WATCH"
    if any(v.get("bucket") == "medium" for v in vector.values()): return "COOL_ROUTE"
    return "OPEN"


def blocked(vector: dict) -> list[str]:
    out = []
    if vector["reconstruction_pressure"]["bucket"] != "low": out += ["raw-summary", "public-cinder"]
    if vector["linkage_pressure"]["bucket"] != "low": out += ["stable-public-hash", "universal-digest"]
    if vector["authority_drift"]["bucket"] != "low": out += ["proof-language", "verification-language"]
    if vector["anti_equivalence_collapse"]["bucket"] != "low": out += ["generic-policy-collapse"]
    return sorted(set(out))


def tending(vector: dict) -> list[str]:
    v = verdict(vector)
    if v in {"BLOCK_EXPORT", "QUARANTINE"}: return ["𝄐", "safe-harbor-buffer", "lower-projection-detail", "rotate-salt-scope"]
    if v in {"WATCH", "COOL_ROUTE"}: return ["cōl", "ash-veil", "route-scoped-digest"]
    return ["hõt", "controlled-cinder-eligible", "receipt-index-reference"]


def weather_controller(vector: dict) -> dict:
    fold = round((vector["anti_equivalence_collapse"]["score"] + vector["authority_drift"]["score"]) / 2, 2)
    heat = max(vector["reconstruction_pressure"]["score"], vector["linkage_pressure"]["score"], vector["custody_category_leakage"]["score"], fold)
    if heat >= .67:
        operator, decision, allowed, bl = ("𝄐" if fold >= .67 else "cōl"), "hard-pause-before-export", ["private-sense", "Ash Veil", "Safe Harbor buffer"], ["public Cinder", "raw summary", "Flight packet"]
    elif heat >= .34:
        operator, decision, allowed, bl = "cōl", "cool-route-before-export", ["Ash Veil", "receipt-index-reference"], ["stable public hash", "raw summary"]
    else:
        operator, decision, allowed, bl = "hõt", "controlled-projection-eligible", ["Ash Veil", "controlled Cinder", "public weather"], ["raw document export"]
    return {"schema": "flowcore.ash-weather-controller/v0.6", "operator": operator, "weather": {"reconstruction_pressure": vector["reconstruction_pressure"]["bucket"], "linkage_pressure": vector["linkage_pressure"]["bucket"], "stylometric_heat": vector["stylometric_heat"]["bucket"], "fold_density": fold}, "allowed": allowed, "blocked": bl, "decision": decision, "pattern_coherence": "米", "claimCeiling": CLAIMS["weather"]}


def ash_leak_challenge(payload: dict, aperture: dict) -> dict:
    proj = _projection(payload)
    vec = leakage_vector(proj)
    v = verdict(vec)
    return {"status": v, "schema": "td613.ash.leak-challenge/v0.6", "aperture": aperture, "mode": "metadata-only-server-projection-analysis", "raw_content_received": False, "projection_id": _rid(proj) or None, "leakageVector": vec, "reconstruction_pressure": vec["reconstruction_pressure"], "projectionVerdict": v, "recommendedTending": tending(vec), "blockedProjections": blocked(vec), "flowcore_weather": weather_controller(vec), "claimCeiling": CLAIMS["leak"], "seal": "⟐"}


def _byte_bucket(value: Any) -> str:
    try: n = int(value or 0)
    except (TypeError, ValueError): n = 0
    return "unknown" if n <= 0 else "under-1kb" if n < 1024 else "1kb-1mb" if n < 1048576 else "over-1mb"


def ash_veil(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    receipt = _dict(payload.get("receipt")) or _projection(payload)
    manifest = _manifest(receipt)
    leak = ash_leak_challenge({"projection": receipt}, aperture)
    meta, locator, posture = _dict(manifest.get("artifact_metadata")), _dict(manifest.get("source_locator")), _dict(manifest.get("ash_posture"))
    basis = {"receipt": _rid(receipt), "artifact": manifest.get("artifact_id"), "route": posture.get("room_route")}
    return {"status": leak["projectionVerdict"], "schema": "td613.ash.veil/v0.6", "veil_id": "veil_" + sha256(basis)[-16:], "created_at": now(), "artifact_id": manifest.get("artifact_id"), "content_exported": False, "surface": "structural-surrogate", "source_environment_bucket": manifest.get("source_environment") or "manual", "media_type_bucket": str(meta.get("media_type") or "unknown").split("/")[0], "byte_length_bucket": _byte_bucket(meta.get("byte_length")), "hash_scope": meta.get("hash_scope") or "withheld-or-route-scoped", "route_scoped_digest": sha256(basis), "path_or_ref_exported": bool(payload.get("allowExactPath") is True and locator.get("path_or_ref")), "exact_path_or_ref": locator.get("path_or_ref") if payload.get("allowExactPath") is True else None, "weather": {k: v["bucket"] for k, v in leak["leakageVector"].items()}, "allowed": ["public-weather", "receipt-index-reference"], "blocked": sorted(set(["raw-summary"] + leak["blockedProjections"])), "claimCeiling": CLAIMS["veil"]}


def ash_cinder(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    fragment = str(payload.get("fragment") or payload.get("candidateFragment") or "")
    receipt = _dict(payload.get("receipt"))
    source_id = str(payload.get("source_receipt_id") or payload.get("sourceReceiptId") or receipt.get("receipt_id") or "")
    approved = payload.get("operatorApproved") is True or payload.get("operator_approved") is True
    leak = ash_leak_challenge({"projection": {"fragment_class": "operator-approved-redacted-fragment", "source_receipt_id": source_id, "fragment": fragment[:220]}}, aperture)
    passed = approved and leak["projectionVerdict"] in {"OPEN", "COOL_ROUTE"} and leak["leakageVector"]["reconstruction_pressure"]["bucket"] != "high"
    return {"status": "OPEN" if passed else "HELD", "schema": "td613.ash.cinder/v0.6", "cinder_id": "cinder_" + sha256({"source": source_id, "fragment": fragment})[-16:], "created_at": now(), "source_receipt_id": source_id or None, "fragment_class": "operator-approved-redacted-fragment", "content_exported": bool(passed), "raw_document_exported": False, "redaction_level": str(payload.get("redactionLevel") or "high"), "fragment": fragment if passed else None, "export_blocked_reason": None if passed else "operator approval and passing Leak Challenge required before Cinder export", "operator_approved": approved, "leak_challenge": {"reconstruction_pressure": leak["leakageVector"]["reconstruction_pressure"]["bucket"], "linkage_pressure": leak["leakageVector"]["linkage_pressure"]["bucket"], "stylometric_heat": leak["leakageVector"]["stylometric_heat"]["bucket"], "verdict": leak["projectionVerdict"]}, "claimCeiling": CLAIMS["cinder"]}


def ash_compare(payload: dict, aperture: dict) -> dict:
    prev, curr = _dict(payload.get("previous") or payload.get("previousReceipt") or payload.get("a")), _dict(payload.get("current") or payload.get("currentReceipt") or payload.get("b"))
    a, b = ash_leak_challenge({"projection": prev}, aperture), ash_leak_challenge({"projection": curr}, aperture)
    delta = {k: round(b["leakageVector"][k]["score"] - a["leakageVector"][k]["score"], 2) for k in a["leakageVector"]}
    return {"status": "WATCH" if any(v > .15 for v in delta.values()) else "OPEN", "schema": "td613.ash.compare/v0.6", "aperture": aperture, "privacy_pressure_delta": delta, "reconstruction_pressure_delta": delta.get("reconstruction_pressure", 0), "linkage_pressure_delta": delta.get("linkage_pressure", 0), "evidence_anchor_loss": bool(prev.get("receipt_id") and not curr.get("receipt_id")), "anti_equivalence_collapse": b["leakageVector"]["anti_equivalence_collapse"]["bucket"] == "high", "authority_drift": b["leakageVector"]["authority_drift"]["bucket"] != "low", "recommended_projection": "Ash Veil" if b["projectionVerdict"] in {"OPEN", "COOL_ROUTE"} else "Safe Harbor buffer", "claimCeiling": CLAIMS["compare"]}


def ash_recall(payload: dict, aperture: dict, sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    target = str(payload.get("target_id") or payload.get("targetId") or _rid(payload.get("target")) or "")
    reason = str(payload.get("reason_class") or payload.get("reasonClass") or "projection-leakage")
    status = str(payload.get("recall_status") or payload.get("recallStatus") or "superseded")
    return {"status": "RECALLED", "schema": "td613.ash.recall/v0.6", "aperture": aperture, "recall_id": "ashrecall_" + sha256({"target": target, "reason": reason, "status": status})[-16:], "created_at": now(), "target_id": target, "recall_status": status, "reason_class": reason, "content_deleted_claimed": False, "public_export_allowed": False, "decision": "local-recall-notice-created-without-claiming-external-erasure", "claimCeiling": CLAIMS["recall"]}


def ash_grade_gate(payload: dict, aperture: dict) -> dict:
    supplied = payload.get("forceStatus") or payload.get("force_status") or payload.get("statuses") or ["OPEN"]
    statuses = [str(s).strip().upper() for s in (supplied if isinstance(supplied, list) else [supplied])]
    valid = [s for s in statuses if s in FORCE_ORDER]
    selected = min(valid or ["OPEN"], key=FORCE_ORDER.index)
    return {"status": "OPEN", "schema": "td613.ash.grade-gate/v0.6", "aperture": aperture, "declared_statuses": valid or ["OPEN"], "force_status": selected, "lower_force_wins": True, "careful_translation": "The Grade Gate records constrained acquisition context so downstream tools and analysts cannot treat the artifact as freely volunteered or context-neutral.", "third_party_enforcement_claimed": False, "claimCeiling": CLAIMS["grade"]}


def ash_hcc_adapter(payload: dict, aperture: dict) -> dict:
    who = str(payload.get("whoPolicy") or payload.get("who_policy") or "self-provided-or-withheld")
    if who not in {"self-provided-or-withheld", "withheld", "self-provided"}: who = "self-provided-or-withheld"
    return {"status": "OPEN", "schema": "td613.hcc.adapter/v0.6", "aperture": aperture, "pairs": {"WHAT": "WHO", "WHERE": "HOW", "WHEN": "WHY"}, "who_policy": who, "how_policy": "non-diagnostic", "why_policy": "non-predictive", "identity_inference_allowed": False, "diagnosis_claimed": False, "destiny_prediction_claimed": False, "claimCeiling": CLAIMS["hcc"]}


def ash_projection_simulate(payload: dict, aperture: dict) -> dict:
    leak = ash_leak_challenge(payload, aperture)
    phason = _dict(payload.get("phason"))
    return {"status": leak["projectionVerdict"], "schema": "td613.ash.projection-simulate/v0.6", "aperture": aperture, "leak_challenge": leak, "flowcore_weather_controller": leak["flowcore_weather"], "aperture_handoff": {"schema": "td613.ash.aperture-handoff/v0.6", "aperture_version": "v2.9.4", "ash_receipt_id": _rid(_projection(payload)) or None, "projection": str(payload.get("projectionType") or "Ash Veil"), "route_weather": {"occlusion": leak["leakageVector"]["reconstruction_pressure"]["score"], "coherence": round(1 - leak["leakageVector"]["anti_equivalence_collapse"]["score"], 2), "routePressure": leak["leakageVector"]["linkage_pressure"]["score"]}, "phason": {"content_invariant": bool(phason.get("content_invariant", True)), "projection_changed": bool(phason.get("projection_changed", True)), "boundary_crossed": "claim_ceiling_pressure" if leak["projectionVerdict"] != "OPEN" else "none"}, "claimCeiling": CLAIMS["aperture"]}, "claimCeiling": CLAIMS["pressure"]}


def dispatch_ash_v06(operation: str, payload: dict, aperture: dict, reject_raw_content: Callable[[dict], None], sha256: Callable[[Any], str], now: Callable[[], str]) -> dict:
    reject_raw_content(payload)
    if operation == "ash-leak-challenge": return ash_leak_challenge(payload, aperture)
    if operation == "ash-veil": return ash_veil(payload, aperture, sha256, now)
    if operation == "ash-cinder": return ash_cinder(payload, aperture, sha256, now)
    if operation == "ash-compare": return ash_compare(payload, aperture)
    if operation == "ash-recall": return ash_recall(payload, aperture, sha256, now)
    if operation == "ash-grade-gate": return ash_grade_gate(payload, aperture)
    if operation == "ash-hcc-adapter": return ash_hcc_adapter(payload, aperture)
    if operation == "ash-projection-simulate": return ash_projection_simulate(payload, aperture)
    raise ValueError("unsupported Ash v0.6 operation")
