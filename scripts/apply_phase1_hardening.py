#!/usr/bin/env python3
"""Apply the narrow TD613 Ash Phase 1 post-review hardening patch.

This script is intentionally idempotent. It closes only the three seams named in
PHASE_1_HARDENING_RECEIPT.md and writes focused regression coverage.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one replacement target, found {count}")
    return text.replace(old, new, 1)


# 1. Legacy Dome-World engine may no longer own custody registration/replay.
engine_path = "api/dome-world-engine.py"
engine = read(engine_path)
engine = replace_once(
    engine,
    '''ASH_V06_OPERATION_NAMES = {
    "ash-leak-challenge",
    "ash-veil",
    "ash-cinder",
    "ash-compare",
    "ash-recall",
    "ash-grade-gate",
    "ash-hcc-adapter",
    "ash-projection-simulate",
}
POST_OPERATIONS = {''',
    '''ASH_V06_OPERATION_NAMES = {
    "ash-leak-challenge",
    "ash-veil",
    "ash-cinder",
    "ash-compare",
    "ash-recall",
    "ash-grade-gate",
    "ash-hcc-adapter",
    "ash-projection-simulate",
}
LEGACY_CUSTODY_OPERATIONS = {
    "ash-custody-register",
    "ash-custody-replay",
}
POST_OPERATIONS = {''',
    "add legacy custody operation guard set",
)
engine = replace_once(
    engine,
    '''    "ash-readiness",
    "ash-custody-register",
    "ash-custody-replay",
    "phason-custody-diff",''',
    '''    "ash-readiness",
    "phason-custody-diff",''',
    "remove custody operations from legacy registry",
)
engine = replace_once(
    engine,
    '''    operation = str(envelope.get("operation", "")).strip()
    if operation not in POST_OPERATIONS:
        raise ValueError("unsupported or missing operation")''',
    '''    operation = str(envelope.get("operation", "")).strip()
    if operation in LEGACY_CUSTODY_OPERATIONS:
        raise ValueError(
            "Ash custody registration/replay is owned exclusively by "
            "api/ash-local-commitment.py"
        )
    if operation not in POST_OPERATIONS:
        raise ValueError("unsupported or missing operation")''',
    "reject direct legacy custody dispatch",
)
engine = replace_once(
    engine,
    '''    elif operation == "ash-custody-register":
        result = _ash_custody_register(payload, aperture)
    elif operation == "ash-custody-replay":
        result = _ash_custody_replay(payload, aperture)
    elif operation == "phason-custody-diff":''',
    '''    elif operation == "phason-custody-diff":''',
    "remove unreachable legacy custody branches",
)
write(engine_path, engine)


# 2. L1 client boundary claims must be validated, never sanitized into safety.
commitment_path = "api/ash-local-commitment.py"
commitment = read(commitment_path)
commitment = replace_once(
    commitment,
    '''        if local.get("raw_bytes_returned") is not False:
            raise ValueError("L1 local commitment must declare raw_bytes_returned=false")
        if local.get("memory_erasure_guaranteed") is not False:
            raise ValueError("L1 local commitment may not claim guaranteed memory erasure")''',
    '''        if local.get("raw_bytes_returned") is not False:
            raise ValueError("L1 local commitment must declare raw_bytes_returned=false")
        if local.get("network_operation_performed_by_module") is not False:
            raise ValueError(
                "L1 local commitment must declare "
                "network_operation_performed_by_module=false"
            )
        if local.get("raw_bytes_persisted_by_module") is not False:
            raise ValueError(
                "L1 local commitment must declare "
                "raw_bytes_persisted_by_module=false"
            )
        if local.get("memory_erasure_guaranteed") is not False:
            raise ValueError("L1 local commitment may not claim guaranteed memory erasure")''',
    "validate contradictory L1 boundary flags",
)
write(commitment_path, commitment)


# 3. Bind every in-flight browser hash to the active file-selection generation.
html_path = "app/dome-world/ash-custody-v07.html"
html = read(html_path)
html = replace_once(
    html,
    '''      let localCommitment = null;
      let commitmentPending = false;''',
    '''      let localCommitment = null;
      let commitmentPending = false;
      let fileSelectionGeneration = 0;''',
    "add file-selection generation state",
)
old_handler = '''      async function handleFileSelection() {
        const file = $("fileInput").files?.[0];
        resetCommitment();
        if (!file) return;
        commitmentPending=true;
        $("registerArtifact").disabled=true;
        setCommitmentStatus("PENDING", "HASHING · exact bytes are being digested locally.");
        try {
          localCommitment=await generateLocalCommitment(file);
          $("contentHash").value=localCommitment.artifact_digest;
          $("mediaType").value=localCommitment.media_type;
          $("byteLength").value=String(localCommitment.byte_length);
          $("lastModified").value=localCommitment.last_modified_claim ?? "";
          $("sourceEnvironment").value="local_file";
          setCommitmentStatus("L1", `${L1_ASSURANCE} · ${localCommitment.artifact_digest}`);
        } catch (error) {
          localCommitment=null;
          $("contentHash").value="";
          setCommitmentStatus("ERROR", `LOCAL COMMITMENT HELD · ${error.message}`);
        } finally {
          commitmentPending=false;
          $("registerArtifact").disabled=false;
        }
      }'''
new_handler = '''      async function handleFileSelection() {
        const generation = ++fileSelectionGeneration;
        const file = $("fileInput").files?.[0];
        resetCommitment();
        if (!file) return;
        commitmentPending=true;
        $("registerArtifact").disabled=true;
        setCommitmentStatus("PENDING", "HASHING · exact bytes are being digested locally.");
        try {
          const commitment = await generateLocalCommitment(file);
          if (
            generation !== fileSelectionGeneration ||
            $("fileInput").files?.[0] !== file
          ) return;
          localCommitment=commitment;
          $("contentHash").value=localCommitment.artifact_digest;
          $("mediaType").value=localCommitment.media_type;
          $("byteLength").value=String(localCommitment.byte_length);
          $("lastModified").value=localCommitment.last_modified_claim ?? "";
          $("sourceEnvironment").value="local_file";
          setCommitmentStatus("L1", `${L1_ASSURANCE} · ${localCommitment.artifact_digest}`);
        } catch (error) {
          if (generation !== fileSelectionGeneration) return;
          localCommitment=null;
          $("contentHash").value="";
          setCommitmentStatus("ERROR", `LOCAL COMMITMENT HELD · ${error.message}`);
        } finally {
          if (generation === fileSelectionGeneration) {
            commitmentPending=false;
            $("registerArtifact").disabled=false;
          }
        }
      }'''
html = replace_once(html, old_handler, new_handler, "guard stale local commitment promises")
html = replace_once(
    html,
    '''      $("clearForm").onclick=()=>{ document.querySelectorAll("input,textarea").forEach((node)=>{ if(node.type!=="checkbox") node.value=""; else node.checked=false; }); $("claimCeiling").value="ash-custody-receipt-not-content-custody-or-permission-proof"; $("fileInput").value=""; resetCommitment(); };''',
    '''      $("clearForm").onclick=()=>{ fileSelectionGeneration+=1; document.querySelectorAll("input,textarea").forEach((node)=>{ if(node.type!=="checkbox") node.value=""; else node.checked=false; }); $("claimCeiling").value="ash-custody-receipt-not-content-custody-or-permission-proof"; $("fileInput").value=""; resetCommitment(); };''',
    "invalidate in-flight commitments on clear",
)
write(html_path, html)


# Focused JavaScript source-contract regression.
write(
    "tests/dome-world-phase1-hardening.test.mjs",
    '''import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const engine = read("api/dome-world-engine.py");
const commitment = read("api/ash-local-commitment.py");
const html = read("app/dome-world/ash-custody-v07.html");

const registry = engine.match(/POST_OPERATIONS = \{([\s\S]*?)\n\} \| ASH_V06_OPERATION_NAMES/)?.[1] || "";
assert.doesNotMatch(registry, /ash-custody-register/);
assert.doesNotMatch(registry, /ash-custody-replay/);
assert.match(engine, /operation in LEGACY_CUSTODY_OPERATIONS/);
assert.match(engine, /owned exclusively by/);

assert.match(commitment, /network_operation_performed_by_module=false/);
assert.match(commitment, /raw_bytes_persisted_by_module=false/);
assert.match(commitment, /local\.get\("network_operation_performed_by_module"\) is not False/);
assert.match(commitment, /local\.get\("raw_bytes_persisted_by_module"\) is not False/);

assert.match(html, /let fileSelectionGeneration = 0/);
assert.match(html, /const generation = \+\+fileSelectionGeneration/);
assert.match(html, /generation !== fileSelectionGeneration/);
assert.match(html, /files\?\.\[0\] !== file/);
assert.match(html, /fileSelectionGeneration\+=1/);

console.log("Ash Phase 1 hardening source contract: PASS");
''',
)


# Focused dynamic Python regression.
write(
    "packages/dome_world_exact/tests/test_phase1_hardening.py",
    '''from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]


def load(name: str, relative: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


engine = load("td613_dome_world_engine_hardening", "api/dome-world-engine.py")
commitment = load("td613_ash_local_commitment_hardening", "api/ash-local-commitment.py")


def l1_envelope(**local_overrides):
    digest = "sha256:" + "ab" * 32
    local = {
        "schema": commitment.LOCAL_SCHEMA,
        "assurance_class": commitment.L1_ASSURANCE,
        "digest_algorithm": "SHA-256",
        "artifact_digest": digest,
        "byte_length": 3,
        "media_type": "text/plain",
        "last_modified_claim": 613,
        "hash_execution": "browser-local",
        "network_operation_performed_by_module": False,
        "raw_bytes_transmitted": False,
        "raw_bytes_returned": False,
        "raw_bytes_persisted_by_module": False,
        "memory_erasure_guaranteed": False,
    }
    local.update(local_overrides)
    return {
        "operation": "ash-custody-register",
        "traceId": "phase1-hardening",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": {
            "sourceEnvironment": "local_file",
            "sourceLocator": {"label": "fixture"},
            "artifactMetadata": {
                "artifactDigest": digest,
                "assuranceClass": commitment.L1_ASSURANCE,
                "byteLength": 3,
                "localCommitment": local,
            },
        },
    }


@pytest.mark.parametrize("operation", ["ash-custody-register", "ash-custody-replay"])
def test_legacy_engine_rejects_custody_operations(operation):
    with pytest.raises(ValueError, match="owned exclusively"):
        engine.dispatch_post({"operation": operation, "payload": {}}, {})


@pytest.mark.parametrize(
    "field",
    ["network_operation_performed_by_module", "raw_bytes_persisted_by_module"],
)
def test_l1_rejects_contradictory_boundary_flags(field):
    with pytest.raises(ValueError, match=f"{field}=false"):
        commitment.dispatch_post(l1_envelope(**{field: True}))


def test_l1_accepts_explicit_false_boundary_flags():
    result = commitment.dispatch_post(l1_envelope())
    assert result["result"]["assurance_class"] == commitment.L1_ASSURANCE
''',
)


# Permanent CI gate for the hardening contract.
write(
    ".github/workflows/dome-world-phase1-hardening.yml",
    '''name: Dome-World Phase 1 Hardening

on:
  pull_request:
    paths:
      - "api/dome-world-engine.py"
      - "api/ash-local-commitment.py"
      - "app/dome-world/ash-custody-v07.html"
      - "app/dome-world/docs/PHASE_1_HARDENING_RECEIPT.md"
      - "tests/dome-world-phase1-hardening.test.mjs"
      - "packages/dome_world_exact/tests/test_phase1_hardening.py"
      - ".github/workflows/dome-world-phase1-hardening.yml"
  push:
    branches: [main]
    paths:
      - "api/dome-world-engine.py"
      - "api/ash-local-commitment.py"
      - "app/dome-world/ash-custody-v07.html"
      - "tests/dome-world-phase1-hardening.test.mjs"
      - "packages/dome_world_exact/tests/test_phase1_hardening.py"
      - ".github/workflows/dome-world-phase1-hardening.yml"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  hardening:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: npm ci
      - run: python -m pip install --disable-pip-version-check pytest sympy
      - name: Validate hardening source contract
        run: node tests/dome-world-phase1-hardening.test.mjs
      - name: Validate hardening runtime contract
        run: python -m pytest packages/dome_world_exact/tests/test_phase1_hardening.py -q
      - name: Re-run full Phase 1 browser contract
        run: node tests/dome-world-ash-custody.test.mjs
      - name: Re-run Phase 1 API integration
        run: python -m pytest packages/dome_world_exact/tests/test_api_integration.py -q
''',
)

# The one-shot writer removes itself after the patch is materialized.
(ROOT / ".github/workflows/apply-phase1-hardening.yml").unlink(missing_ok=True)

print("TD613 Ash Phase 1 hardening patch materialized.")
