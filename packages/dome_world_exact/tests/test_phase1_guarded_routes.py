from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]


def load(name: str, relative: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


engine_guard = load(
    "td613_dome_world_engine_guard_test",
    "api/dome-world-engine-guard.py",
)
ash_guard = load(
    "td613_ash_local_commitment_guard_test",
    "api/ash-local-commitment-guard.py",
)


@pytest.mark.parametrize("operation", ["ash-custody-register", "ash-custody-replay"])
def test_direct_legacy_engine_custody_routes_fail_closed(operation):
    with pytest.raises(ValueError, match="owned exclusively"):
        engine_guard.validate_envelope({"operation": operation, "payload": {}})


def test_non_custody_engine_operation_remains_available():
    envelope = {"operation": "aperture-bridge", "payload": {}}
    assert engine_guard.validate_envelope(envelope) is envelope


def l1_envelope(**local_overrides):
    digest = "sha256:" + "ab" * 32
    local = {
        "schema": "td613.ash.local-commitment/v0.7",
        "assurance_class": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
        "artifact_digest": digest,
        "network_operation_performed_by_module": False,
        "raw_bytes_transmitted": False,
        "raw_bytes_returned": False,
        "raw_bytes_persisted_by_module": False,
        "memory_erasure_guaranteed": False,
    }
    local.update(local_overrides)
    return {
        "operation": "ash-custody-register",
        "payload": {
            "artifactMetadata": {
                "artifactDigest": digest,
                "assuranceClass": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
                "localCommitment": local,
            }
        },
    }


@pytest.mark.parametrize(
    "field",
    ["network_operation_performed_by_module", "raw_bytes_persisted_by_module"],
)
def test_contradictory_l1_boundary_flags_are_rejected(field):
    with pytest.raises(ValueError, match=f"{field}=false"):
        ash_guard.validate_l1_boundary_flags(l1_envelope(**{field: True}))


@pytest.mark.parametrize(
    "field",
    ["network_operation_performed_by_module", "raw_bytes_persisted_by_module"],
)
def test_missing_l1_boundary_flags_are_rejected(field):
    envelope = l1_envelope()
    del envelope["payload"]["artifactMetadata"]["localCommitment"][field]
    with pytest.raises(ValueError, match=f"{field}=false"):
        ash_guard.validate_l1_boundary_flags(envelope)


def test_explicit_false_l1_boundary_flags_are_accepted():
    envelope = l1_envelope()
    assert ash_guard.validate_l1_boundary_flags(envelope) is envelope


def test_l0_metadata_only_route_does_not_require_l1_flags():
    envelope = {
        "operation": "ash-custody-register",
        "payload": {
            "artifactMetadata": {
                "artifactDigest": None,
                "assuranceClass": "L0_METADATA_ONLY",
                "localCommitment": None,
            }
        },
    }
    assert ash_guard.validate_l1_boundary_flags(envelope) is envelope
