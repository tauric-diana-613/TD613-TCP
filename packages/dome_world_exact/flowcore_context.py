"""TD613 Flow-Core Phase III context instrumentation.

Named measurements become artifact-blind context receipts. Source status,
sensor provenance, transformations, missingness, uncertainty, alternatives,
benign controls, and abstention remain explicit. The station does not authorize
prediction, infer suppression from ordinary failures, or trigger Ash actions.
"""
from __future__ import annotations

import math
import secrets
from datetime import datetime, timezone
from typing import Any

CONTEXT_RECEIPT_SCHEMA = "td613.flowcore.context-receipt/v0.1"
READINESS_SCHEMA = "td613.flowcore.context-readiness/v0.1"
SENSOR_REGISTRY_SCHEMA = "td613.flowcore.sensor-registry/v0.1"
OPERATION = "flowcore-context-instrument"
SOURCE_STATUSES = (
    "OBSERVED", "SUPPLIED", "DERIVED", "SIMULATED", "INFERRED",
    "ATTESTED", "UNRESOLVED",
)


def _sensor(status, authority, description):
    return {
        "default_source_status": status,
        "allowed_source_statuses": [status],
        "authority_class": authority,
        "description": description,
    }


SENSOR_REGISTRY: dict[str, dict[str, Any]] = {
    "operator-declaration": _sensor("SUPPLIED", "A1_OBSERVATIONAL", "operator-provided value without direct instrument verification"),
    "browser-performance-api": _sensor("OBSERVED", "A1_OBSERVATIONAL", "browser timing or performance measurement"),
    "http-response-log": _sensor("OBSERVED", "A1_OBSERVATIONAL", "bounded HTTP response record"),
    "retrieval-comparison": _sensor("OBSERVED", "A1_OBSERVATIONAL", "reproducible comparison between retrieval surfaces"),
    "repository-change-record": _sensor("OBSERVED", "A1_OBSERVATIONAL", "repository commit, diff, or release record"),
    "controlled-model-output-experiment": _sensor("OBSERVED", "A1_OBSERVATIONAL", "output observed under a declared controlled protocol"),
    "external-environmental-sensor": _sensor("OBSERVED", "A1_OBSERVATIONAL", "external observation with disclosed calibration posture"),
    "simulated-fixture": _sensor("SIMULATED", "A2_DERIVATIONAL", "declared fixture or hypothetical process"),
    "derived-formula": _sensor("DERIVED", "A2_DERIVATIONAL", "value computed from declared inputs and transformation"),
    "signed-witness-attestation": _sensor("ATTESTED", "A1_OBSERVATIONAL", "signed assertion; signature does not prove the asserted fact"),
    "flowcore-context-instrument": _sensor("DERIVED", "A2_DERIVATIONAL", "Phase III normalization and bounded context translation"),
    "unknown": _sensor("UNRESOLVED", "A1_OBSERVATIONAL", "sensor identity or generating process remains unresolved"),
}

REQUIRED_WEATHER_METRICS = ("omissionPressure", "coherence", "divergence")
OPTIONAL_WEATHER_METRICS = ("namingSensitivity", "rupturePressure")
WEATHER_METRICS = REQUIRED_WEATHER_METRICS + OPTIONAL_WEATHER_METRICS
FORBIDDEN_ARTIFACT_KEYS = {
    "artifact_digest", "artifactDigest", "content_hash", "contentHash",
    "manifest_digest", "manifestDigest", "receipt_digest", "receiptDigest",
    "rawBytes", "fileBytes", "fileContent", "rawText", "sensitiveText",
}
BENIGN_CONTROL_LIBRARY = {
    "OUTAGE": ("ordinary service outage or maintenance", ["suppression", "surveillance", "intent"]),
    "LATENCY": ("network, queue, compute, or rendering latency", ["suppression", "surveillance", "intent"]),
    "DRIFT": ("version, calibration, data, or environment drift", ["tampering", "suppression", "intent"]),
    "NOISE": ("measurement noise, jitter, or transient variance", ["camouflage", "surveillance", "intent"]),
    "RETRIEVAL_GAP": ("indexing, cache, query, or availability gap", ["deletion", "suppression", "intent"]),
}
CANNOT_ESTABLISH = [
    "external surveillance", "algorithmic suppression", "intent", "causation",
    "identity", "exact location", "artifact possession", "artifact relation",
    "prediction",
]


def _now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _dict(value):
    return value if isinstance(value, dict) else {}


def _list(value):
    return value if isinstance(value, list) else []


def _text_list(value):
    return [str(item).strip() for item in _list(value) if str(item).strip()]


def _finite_number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    return number if math.isfinite(number) else None


def reject_artifact_material(value, path="payload"):
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            active = child not in (None, "", False, [], {})
            if key in FORBIDDEN_ARTIFACT_KEYS and active:
                raise ValueError(
                    "Flow-Core context instrumentation is artifact-blind; prohibited field: "
                    + child_path
                )
            if key in {"artifact_reference", "artifactReference"} and active:
                raise ValueError(
                    "Flow-Core context instrumentation cannot accept an artifact reference: "
                    + child_path
                )
            reject_artifact_material(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            reject_artifact_material(child, f"{path}[{index}]")


def sensor_registry_receipt():
    return {
        "schema": SENSOR_REGISTRY_SCHEMA,
        "sensors": [
            {"sensor_id": sensor_id, **definition}
            for sensor_id, definition in SENSOR_REGISTRY.items()
        ],
        "law": "Every value names its generating sensor; unknown sensors remain UNRESOLVED.",
    }


def _default_uncertainty(status):
    classes = {
        "OBSERVED": "sensor-declared-not-independently-calibrated",
        "SUPPLIED": "operator-supplied",
        "DERIVED": "transformation-bounded",
        "SIMULATED": "simulation-bounded",
        "INFERRED": "inference-bounded",
        "ATTESTED": "attestation-bounded",
        "UNRESOLVED": "unresolved",
    }
    return {"class": classes[status], "value": None}


def _authority(status, sensor_id):
    if status == "INFERRED":
        return "A3_INFERENTIAL"
    if status in {"DERIVED", "SIMULATED"}:
        return "A2_DERIVATIONAL"
    return SENSOR_REGISTRY.get(sensor_id, SENSOR_REGISTRY["unknown"])["authority_class"]


def _normalize_measurement(source):
    name = str(source.get("name", "")).strip()
    if not name:
        raise ValueError("each Flow-Core measurement requires a name")
    declared_sensor = str(source.get("sensor_id", source.get("sensorId", "unknown"))).strip() or "unknown"
    sensor = SENSOR_REGISTRY.get(declared_sensor)
    sensor_id = declared_sensor if sensor else "unknown"
    definition = sensor or SENSOR_REGISTRY["unknown"]
    declared_status = str(source.get("source_status", source.get("sourceStatus", ""))).strip().upper()
    status = declared_status or definition["default_source_status"]
    missing = _text_list(source.get("missingness"))
    if status not in SOURCE_STATUSES:
        missing.append(f"unsupported source status: {status or '<empty>'}")
        status = "UNRESOLVED"
    if not sensor:
        missing.append(f"unknown sensor: {declared_sensor}")
        status = "UNRESOLVED"
    elif status not in definition["allowed_source_statuses"]:
        missing.append(f"sensor/source mismatch: {declared_sensor} cannot claim {status}")
        status = "UNRESOLVED"
    value = _finite_number(source.get("value"))
    if value is None:
        missing.append("finite numeric value absent")
    elif name in WEATHER_METRICS and not 0.0 <= value <= 1.0:
        missing.append("weather metric outside [0,1]")
        value = None
    history = _text_list(source.get("transformation_history", source.get("transformationHistory")))
    if status in {"DERIVED", "SIMULATED", "INFERRED"} and not history:
        missing.append(f"{status.lower()} value lacks transformation history")
    return {
        "name": name,
        "value": value,
        "unit": source.get("unit"),
        "source_status": status,
        "sensor_id": sensor_id,
        "declared_sensor_id": declared_sensor,
        "authority_class": _authority(status, sensor_id),
        "captured_at": source.get("captured_at", source.get("capturedAt")),
        "transformation_history": history,
        "missingness": list(dict.fromkeys(missing)),
        "uncertainty": _dict(source.get("uncertainty")) or _default_uncertainty(status),
        "alternatives": _text_list(source.get("alternatives")),
        "calibration": _dict(source.get("calibration")) or {"status": "UNDECLARED", "independent": False},
    }


def _legacy_measurements(payload):
    metrics = _dict(payload.get("metrics"))
    if not metrics:
        return []
    sensor = str(payload.get("sensor_id", payload.get("sensorId", "derived-formula")))
    status = str(payload.get("source_status", payload.get("sourceStatus", "DERIVED")))
    history = _text_list(payload.get("transformation_history", payload.get("transformationHistory"))) or [
        "legacy metrics object -> named Phase III measurements"
    ]
    return [
        {
            "name": name,
            "value": metrics.get(name),
            "sensor_id": sensor,
            "source_status": status,
            "transformation_history": history,
            "uncertainty": payload.get("uncertainty"),
        }
        for name in WEATHER_METRICS
        if name in metrics
    ]


def _conditions(payload):
    controls, alternatives = [], _text_list(payload.get("alternatives"))
    for raw in _list(payload.get("conditions")):
        item = raw if isinstance(raw, dict) else {"kind": raw}
        kind = str(item.get("kind", "")).strip().upper()
        if kind not in BENIGN_CONTROL_LIBRARY:
            continue
        label, nonclaims = BENIGN_CONTROL_LIBRARY[kind]
        controls.append({
            "kind": kind,
            "label": label,
            "observed_detail": item.get("detail"),
            "does_not_establish": nonclaims,
        })
        alternatives.append(label)
    return controls, list(dict.fromkeys(alternatives))


def _weather(by_name):
    omission = by_name["omissionPressure"]["value"]
    coherence = by_name["coherence"]["value"]
    divergence = by_name["divergence"]["value"]
    naming = by_name.get("namingSensitivity", {}).get("value") or 0.0
    rupture = by_name.get("rupturePressure", {}).get("value") or 0.0
    return {
        "humidity": omission,
        "visibility": coherence,
        "divergence": divergence,
        "routeHeat": naming,
        "torsion": rupture,
        "routePressure": round((omission + divergence + (1 - coherence) + rupture) / 4, 6),
        "modeled": True,
        "source_status": "DERIVED",
        "sensor_id": "flowcore-context-instrument",
        "authority_class": "A2_DERIVATIONAL",
    }


def instrument_context(payload, aperture=None):
    if not isinstance(payload, dict):
        raise ValueError("Flow-Core payload must be a JSON object")
    reject_artifact_material(payload)
    raw = _list(payload.get("measurements")) or _legacy_measurements(payload)
    measurements = [_normalize_measurement(item) for item in raw if isinstance(item, dict)]
    by_name = {item["name"]: item for item in measurements}
    missing = _text_list(payload.get("missingness"))
    for required in REQUIRED_WEATHER_METRICS:
        item = by_name.get(required)
        if not item:
            missing.append(f"required metric absent: {required}")
        elif item["value"] is None or item["source_status"] == "UNRESOLVED" or item["missingness"]:
            missing.append(f"required metric unresolved: {required}")
    unresolved = any(item["source_status"] == "UNRESOLVED" for item in measurements)
    complete = not missing and not unresolved
    controls, alternatives = _conditions(payload)
    for item in measurements:
        alternatives.extend(item["alternatives"])
    alternatives = list(dict.fromkeys(alternatives))
    diagnostic = _dict(payload.get("diagnosticReceipt"))
    reference = diagnostic.get("receipt_id", diagnostic.get("receiptId"))
    weather = _weather(by_name) if complete else None
    return {
        "status": "OPEN" if complete else "ABSTAIN",
        "schema": CONTEXT_RECEIPT_SCHEMA,
        "receipt_id": "flowctx_" + secrets.token_hex(10),
        "created_at": _now(),
        "operation": OPERATION,
        "aperture": aperture or {},
        "context_posture": "CONTEXT_READY" if complete else "ABSTAIN_INSUFFICIENT_CONTEXT",
        "source_status": "DERIVED" if complete else "UNRESOLVED",
        "input_source_statuses": sorted({item["source_status"] for item in measurements}),
        "sensor_id": "flowcore-context-instrument",
        "authority_class": "A2_DERIVATIONAL" if complete else "A1_OBSERVATIONAL",
        "diagnostic_receipt_reference": str(reference).strip() if reference else None,
        "artifact_reference": None,
        "artifact_blind": True,
        "measurements": measurements,
        "modeled_weather": weather,
        "weather": weather,
        "transformation_history": [
            "named measurements -> sensor/source validation",
            "validated weather metrics -> bounded Flow-Core context translation"
            if complete else "insufficient context -> abstention without weather translation",
        ],
        "missingness": list(dict.fromkeys(missing)),
        "uncertainty": {
            "class": "measurement-and-transformation-bounded" if complete else "insufficient-context",
            "value": None,
        },
        "alternatives": alternatives,
        "benign_controls": controls,
        "privacy": {
            "visibility": "PRIVATE_LOCAL_DEFAULT",
            "public_export": False,
            "artifact_blind": True,
            "persistent_server_storage": False,
        },
        "decision": "context-instrumented-for-aperture-audit" if complete else "abstained-insufficient-context",
        "recommendation": "return-bounded-context-for-audit" if complete else "collect-or-repair-context-before-translation",
        "recommendation_not_command": True,
        "automatic_ash_action": False,
        "prediction_authorized": False,
        "bridge_integration_status": "PHASE_4_DEFERRED",
        "cannot_establish": list(CANNOT_ESTABLISH),
        "does_not_establish": [
            "ordinary outage, latency, drift, noise, or retrieval gaps do not by themselves establish suppression, surveillance, or intent",
            "source status does not verify external-world truth",
            "context receipt does not establish an artifact relation",
        ],
    }


def readiness_receipt():
    return {
        "ok": True,
        "schema": READINESS_SCHEMA,
        "status": "phase-3-active",
        "operations": [OPERATION],
        "contextReceiptSchema": CONTEXT_RECEIPT_SCHEMA,
        "sensorRegistrySchema": SENSOR_REGISTRY_SCHEMA,
        "sourceStatuses": list(SOURCE_STATUSES),
        "sensors": sorted(SENSOR_REGISTRY),
        "requiredWeatherMetrics": list(REQUIRED_WEATHER_METRICS),
        "optionalWeatherMetrics": list(OPTIONAL_WEATHER_METRICS),
        "benignControls": sorted(BENIGN_CONTROL_LIBRARY),
        "artifactBlind": True,
        "privateByDefault": True,
        "automaticAshAction": False,
        "predictionAuthorized": False,
        "bridgeIntegrationStatus": "PHASE_4_DEFERRED",
    }
