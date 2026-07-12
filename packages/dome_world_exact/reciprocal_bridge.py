"""TD613 Phase IV reciprocal receipt bridge.

The bridge validates an Aperture diagnostic receipt, converts only declared
metrics into named Flow-Core measurements, and returns the production
``td613.flowcore.context-receipt/v0.1`` contract. It never accepts artifact
material, grants reciprocal authority, predicts, or activates Ash.
"""

from __future__ import annotations

import math
import re
from typing import Any

from packages.dome_world_exact.flowcore_context import (
    CONTEXT_RECEIPT_SCHEMA,
    instrument_context,
    reject_artifact_material,
)

APERTURE_VERSION = "v3.0-alpha"
APERTURE_SCHEMA = "td613-aperture/v3.0-alpha"
DIAGNOSTIC_RECEIPT_SCHEMA = "td613.aperture.diagnostic-receipt/v3.0-alpha"
RETURNED_CONTEXT_AUDIT_SCHEMA = "td613.aperture.returned-context-audit/v0.1"
ROUND_TRIP_RECEIPT_SCHEMA = "td613.aperture.round-trip-receipt/v3.0-alpha"
BRIDGE_CONTRACT_SCHEMA = "td613.phase4.reciprocal-bridge/v0.1"
LEGACY_CONTEXT_SCHEMA = "td613.flowcore.context-receipt/vNext"
LEGACY_MIGRATION_SCHEMA = "td613.flowcore.context-receipt-migration/v0.1"

CONTEXTUALIZE_OPERATION = "aperture-bridge-contextualize"
LEGACY_OPERATION_ALIAS = "aperture-bridge"
MIGRATE_OPERATION = "aperture-bridge-migrate-vnext"
READINESS_OPERATION = "aperture-bridge-readiness"

RECEIPT_ID_RE = re.compile(r"^apdiag_[A-Za-z0-9_-]{6,128}$")
METRIC_NAMES = (
    "omissionPressure",
    "coherence",
    "divergence",
    "namingSensitivity",
    "rupturePressure",
)
REQUIRED_METRICS = ("omissionPressure", "coherence", "divergence")

FORBIDDEN_AUTHORITY_KEYS = {
    "automatic_ash_action",
    "automaticAshAction",
    "prediction_authorized",
    "predictionAuthorized",
    "reciprocal_authority",
    "reciprocalAuthority",
    "artifact_relation",
    "artifactRelation",
    "doctrine_writeback",
    "doctrineWriteback",
    "execute",
    "mandatory",
    "binding",
}


def _dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _active(value: Any) -> bool:
    return value not in (None, "", False, [], {})


def _reject_authority_material(value: Any, path: str = "diagnostic") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key in FORBIDDEN_AUTHORITY_KEYS and _active(child):
                raise ValueError(
                    "Phase IV reciprocal receipts cannot carry execution or authority: "
                    + child_path
                )
            _reject_authority_material(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _reject_authority_material(child, f"{path}[{index}]")


def _finite_metric(value: Any, name: str) -> float | int | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"diagnostic metric {name} must be a finite number")
    number = float(value)
    if not math.isfinite(number):
        raise ValueError(f"diagnostic metric {name} must be finite")
    return value


def _task_intent(receipt: dict[str, Any]) -> dict[str, Any]:
    task = _dict(receipt.get("taskIntent")) or _dict(receipt.get("task_intent"))
    route = str(task.get("primary_route", task.get("primaryRoute", ""))).strip()
    if not route:
        raise ValueError("Aperture diagnostic receipt requires a task-intent route")
    runtime = str(task.get("runtime_materiality", task.get("runtimeMateriality", "BACKGROUND"))).upper()
    if runtime not in {"NONE", "BACKGROUND", "MATERIAL", "DISPOSITIVE"}:
        raise ValueError("Aperture diagnostic receipt has unsupported runtime materiality")
    if task.get("automatic_redirect") is True or task.get("automaticRedirect") is True:
        raise ValueError("Aperture task intent cannot request automatic redirect")
    return task


def _metric_source(receipt: dict[str, Any]) -> dict[str, Any]:
    produced = _dict(receipt.get("produced"))
    request = _dict(produced.get("context_request")) or _dict(produced.get("contextRequest"))
    metrics = _dict(request.get("metrics")) or _dict(request.get("source_metrics"))
    if metrics:
        return metrics
    return {name: request[name] for name in METRIC_NAMES if name in request}


def validate_diagnostic_receipt(receipt: Any) -> dict[str, Any]:
    if not isinstance(receipt, dict):
        raise ValueError("Phase IV requires an Aperture diagnostic receipt object")
    reject_artifact_material(receipt, "diagnostic")
    _reject_authority_material(receipt)

    if receipt.get("schema") != DIAGNOSTIC_RECEIPT_SCHEMA:
        raise ValueError("unsupported Aperture diagnostic receipt schema")
    receipt_id = str(receipt.get("receipt_id", receipt.get("receiptId", ""))).strip()
    if not RECEIPT_ID_RE.fullmatch(receipt_id):
        raise ValueError("Aperture diagnostic receipt_id is missing or malformed")
    if receipt.get("instrument") not in (None, "TD613 Aperture"):
        raise ValueError("diagnostic instrument identity mismatch")
    if receipt.get("version") not in (None, APERTURE_VERSION):
        raise ValueError("diagnostic Aperture version mismatch")
    firmware = receipt.get("firmwareSchema", receipt.get("firmware_schema"))
    if firmware not in (None, APERTURE_SCHEMA):
        raise ValueError("diagnostic Aperture firmware schema mismatch")
    if receipt.get("posture") not in (None, "recommendation-not-command"):
        raise ValueError("diagnostic posture must remain recommendation-not-command")

    _task_intent(receipt)
    metrics = _metric_source(receipt)
    if not metrics:
        raise ValueError("diagnostic receipt contains no context-request metrics")
    for name in METRIC_NAMES:
        if name in metrics:
            _finite_metric(metrics[name], name)
    return receipt


def diagnostic_measurements(receipt: dict[str, Any]) -> list[dict[str, Any]]:
    metrics = _metric_source(receipt)
    measurements = []
    for name in METRIC_NAMES:
        if name not in metrics:
            continue
        value = _finite_metric(metrics[name], name)
        measurements.append(
            {
                "name": name,
                "value": value,
                "sensor_id": "aperture-diagnostic-receipt",
                "source_status": "DERIVED",
                "authority_class": "A2_DERIVATIONAL",
                "transformation_history": [
                    "Aperture diagnostic metric -> named Phase III context measurement"
                ],
                "uncertainty": {
                    "class": "diagnostic-and-transformation-bounded",
                    "value": None,
                },
                "calibration": {"status": "DECLARED_NOT_INDEPENDENT", "independent": False},
            }
        )
    return measurements


def contextualize_diagnostic(
    receipt: Any,
    aperture: dict[str, Any] | None = None,
    conditions: list[Any] | None = None,
    alternatives: list[Any] | None = None,
) -> dict[str, Any]:
    diagnostic = validate_diagnostic_receipt(receipt)
    task = _task_intent(diagnostic)
    payload = {
        "diagnosticReceipt": {
            "receipt_id": diagnostic.get("receipt_id", diagnostic.get("receiptId")),
            "schema": DIAGNOSTIC_RECEIPT_SCHEMA,
        },
        "measurements": diagnostic_measurements(diagnostic),
        "conditions": conditions or [],
        "alternatives": alternatives or [],
    }
    context = instrument_context(
        payload,
        aperture or {},
        bridge_mode="PHASE_4_RECIPROCAL",
    )
    context["task_intent"] = task
    context["bridge_contract"] = BRIDGE_CONTRACT_SCHEMA
    context["reciprocal_receipts"] = True
    context["reciprocal_authority"] = False
    context["operator_closure_required"] = True
    return context


def migrate_vnext_receipt(receipt: Any) -> dict[str, Any]:
    if not isinstance(receipt, dict) or receipt.get("schema") != LEGACY_CONTEXT_SCHEMA:
        raise ValueError("legacy migration requires a vNext Flow-Core context receipt")
    reject_artifact_material(receipt, "legacy_context")
    if _active(receipt.get("artifact_reference")):
        raise ValueError("legacy context receipt contains an artifact relation")
    return {
        "schema": LEGACY_MIGRATION_SCHEMA,
        "legacy_schema": LEGACY_CONTEXT_SCHEMA,
        "migration_status": "LEGACY_PROVISIONAL_NORMALIZED",
        "native_v01": False,
        "source_status": str(receipt.get("source_status", "DERIVED")),
        "diagnostic_receipt_reference": receipt.get("diagnostic_receipt_reference"),
        "legacy_receipt": receipt,
        "calibration": {"status": "UNDECLARED", "independent": False},
        "bridge_integration_status": "LEGACY_PHASE_4_MIGRATION",
        "recommendation_not_command": True,
        "automatic_ash_action": False,
        "prediction_authorized": False,
        "artifact_reference": None,
        "cannot_establish": [
            "native v0.1 provenance",
            "external-world truth",
            "artifact relation",
            "prediction",
            "Ash authority",
        ],
    }


def readiness_receipt() -> dict[str, Any]:
    return {
        "ok": True,
        "schema": "td613.phase4.reciprocal-bridge-readiness/v0.1",
        "status": "phase-4-implemented-validation-gated",
        "operations": [CONTEXTUALIZE_OPERATION, LEGACY_OPERATION_ALIAS, MIGRATE_OPERATION],
        "bridgeContract": BRIDGE_CONTRACT_SCHEMA,
        "diagnosticReceiptSchema": DIAGNOSTIC_RECEIPT_SCHEMA,
        "contextReceiptSchema": CONTEXT_RECEIPT_SCHEMA,
        "returnedContextAuditSchema": RETURNED_CONTEXT_AUDIT_SCHEMA,
        "roundTripReceiptSchema": ROUND_TRIP_RECEIPT_SCHEMA,
        "legacyContextSchema": LEGACY_CONTEXT_SCHEMA,
        "legacyMigrationSchema": LEGACY_MIGRATION_SCHEMA,
        "reciprocalReceipts": True,
        "reciprocalAuthority": False,
        "artifactBlind": True,
        "artifactRelation": False,
        "automaticAshAction": False,
        "predictionAuthorized": False,
        "operatorClosureRequired": True,
        "runtimeDefault": "BACKGROUND",
        "openFieldAutoPromotion": False,
        "serverlessBoundary": "shared-guarded-dome-world-boundary",
    }
