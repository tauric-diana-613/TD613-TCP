# Phase 12 — Failure Atlas

Status: integration repair map.

Phase 12 should fail loudly and usefully. A failure should say which family broke, where to look, and what repair route belongs to it.

| Failure family | Symptom | Source phase | Repair route | Catching surface |
| --- | --- | --- | --- | --- |
| namespace collapse | SHI, provider id, mask id, or release id occupies the wrong packet lane | 1–12 | restore packet-specific identifiers | packet-chain-integrity |
| hash/replay drift | packet body or topology no longer matches declared hash | 1–8 | recompute and validate packet body | phase-local validators |
| phase-order inversion | manifest moves later phase before earlier phase | 12 | restore monotonic manifest order | suite-manifest |
| fixture/live evidence confusion | fixture-backed provider evidence presents as live | 9–11 | relabel provider mode and block promotion | release-to-drawer parity |
| runtime badge inflation | deployment readiness appears as runtime-flight-pass | 10–11 | capture required runtime artifacts | runtime evidence gate |
| boundary proof inflation | Safe Harbor or Aperture appears as proof/authority | 10–12 | restore boundary posture and non-claims | boundary-nonclaims |
| non-claim erosion | identity/authorship/legal limits disappear | 10–12 | restore non-claim payloads | boundary-nonclaims |
| raw export leak | raw sample/candidate travels through redacted export | 10–12 | block redacted export or route private backup | export-surface parity |
| drawer authority inflation | drawer state outranks packet source status | 11–12 | force Phase 10 parity | release-to-drawer parity |
| orphan action | surface registry exposes action absent from action gates | 11–12 | register action or remove surface permission | surface-registry regression |
| stale manifest | listed test missing or new packet test omitted | 12 | update manifest and runner check | suite-manifest |
| missing script | package script absent for required phase/gate | 12 | register package script | suite-manifest |

The atlas exists so future repairs do not become vibes archaeology.

Sealed ⟐
