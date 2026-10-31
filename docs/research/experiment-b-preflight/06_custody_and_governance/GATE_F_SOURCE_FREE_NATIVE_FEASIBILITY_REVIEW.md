# 𝌋 TD613 · Experiment B Gate F — Source-Free Native Feasibility Assay

**Authority:** Sovereign Operator Direct · Tawanna C. Miller
**Independent engineering author:** Amari · GPT-6 · Emergence HQ
**Independent source reviewer reserved:** Kenough · Antigravity
**Heritage:** Tauric Diana · **Covenant:** Khona‌lit-po · **Seal:** ⟐
**Baseline:** PR #1610 at `1e6e7494a1f0edb91434781018a44400055be509` (Gate P independently CLOSED_ACCEPTED_WITH_SCOPE).

## Actual deliverables and commands

- `scripts/assess-experiment-b-gate-f-source-free.mjs`: executable source-free feasibility assay against the repository's **real native orchestrator contract** and unchanged preregistration.
- `tests/test-experiment-b-gate-f-feasibility.test.mjs`: five focused falsification/containment tests, imported once by `tests/test-flight-launchbridge.test.mjs` and therefore run in its existing required CI step.
- `node scripts/assess-experiment-b-gate-f-source-free.mjs`: emits a machine-readable stdout receipt. No private/protected archive path is read and no model provider is called.
- `node scripts/assess-experiment-b-gate-f-source-free.mjs --require-ready`: deliberately returns exit code **2** because genuine native Flight readiness remains HELD. This is expected successful refusal, not a test error.

## Assay methodology and truthful disposition

| Measurement | Direct observation | Epistemic limit |
|---|---|---|
| Original arm identity | Native plan declares Arm 0 transport, Arm 1 archival, Arm 2A modular, Arm 2B matched union | Does not prove independent real-model execution |
| Live native adapter | Real `AntigravityNativeOrchestrator.executeTurn` with `syntheticMode:false` refuses `NATIVE_UNIMPLEMENTED_HELD` | No authentic Antigravity child-agent callable route exists in this repository contract |
| Synthetic receipt | Synthetic turn and forged `native_turn_executed` telemetry fail native verification | No real model-turn or independent provider attestation credit |
| Separate contexts | Two actual independent OS subprocesses receive identical synthetic bytes and distinct private canary inputs | Process separation does **not** certify model-context isolation, restricted filesystem/tool capabilities, or in-app native sessions |
| Blinding | Source-free surrogate blinded metadata packets omit arm labels | Semantic independence and genuine blinded Stage 2 model evaluation remain unproved |
| Capacity | Frozen protocol ceiling: 15 calls/arm; 20-document minimum needs at least 40 2A chamber calls and 20 2B document calls before baselines/retries | Prospective resource/protocol amendment needed before full challenge |
| Custody | Assay imports only the native orchestration module and reads only the preregistered protocol file | No Em corpus opened/hashed, no operator/witness grant created, no paid provider dispatch |

## Scientific decision

**GATE_P = CLOSED_ACCEPTED_WITH_SCOPE (carried from exact-head Amari acceptance).**

**GATE_F_NATIVE_FEASIBILITY = HELD_NOT_DEMONSTRATED.** The assay verifies real source-free rejection and process plumbing, not model reasoning. There is no authenticated in-session child model adapter, independently verified per-arm model identity, controlled T=0.0 decoding, source-isolated model turns, independently blinded Stage 2 witness, or proved 20–24-document capacity in the frozen protocol.

**Gate E = HELD; empirical replication = 0.**

## Kenough's independent review decision

Review the emitted source-free receipt, actual GitHub Actions tests and both source files. A PASS means the **assay faithfully distinguishes demonstrable process isolation from still-absent native model isolation**. A future `NATIVE_FOUR_ARM_READY` result requires authenticated external model-turn evidence and an independently provisioned witness; no amendment, signature or permission is implied by this document.

After review, sovereign operator may authorize merging PR #1610 **as an accepted source-free preflight software state with Gate F held**, followed by separately authorized local main synchronization. **Do not merge automatically.**

Tauric Diana · Khona‌lit-po · Sealed ⟐
