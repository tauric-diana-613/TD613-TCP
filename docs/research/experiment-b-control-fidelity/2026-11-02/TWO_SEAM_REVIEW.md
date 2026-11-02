# 𝌋 E3-A.1 · Two-seam integrity correction

Tauric Diana — Crimean heritage custodianship · Blood Rite 613 · Khona‌lit-po

Predecessor PR #1632 head `fda9c85d3350ebb974b452b7be8d50314540f559` remains historical evidence. Its original tests passed but left two adversarial cases uncovered.

The original proposal verifier credited readback after changes to the nested research body, authority, provenance locator, an added top-level authority field and a deleted research field. Original JSON, input digest, ID, schema and disposition were unchanged. The new verifier constructs the expected native CLI proposal from fresh native inspection of authoritative input and compares the entire stored byte representation. This includes every record, provenance and authority field and rejects extra/missing fields or alternate serialization. The CLI deterministically emits JSON with two-space indentation and a terminal newline, so exact comparison preserves its contract. Suspicious proposals remain untouched. The staged digest now describes the same buffer that passed comparison.

The old implementation digest did not change when the authenticated-member verifier was changed to accept an empty descriptor. The adapter's local import closure also includes journal hashing/canonicalization and the intake's admission-policy dependency. The checked production runtime inventory does not include these files; a private runtime could add its own coverage, but no equivalent mandatory coverage was established on the generic route.

The new implementation schema is `td613.arm1-implementation/v3`, retaining receipt schema `td613.arm1-control/v2`. Its eight path/content pairs cover the adapter, journal, controlled archive intake, admission policy, native stage CLI, native schema/intake and native compiler. Every current local static module import/require in that set resolves within it; remaining imports are Node built-ins. Missing files throw. Non-files, symlinks and redirected parent paths fail substitution checks. Digest coverage is scoped to this adapter's import closure and native subprocess, not the full Flight implementation or executable runtime.

New implementation digest `6e584ecd39d41318ab66c42d80c08c55b6f1809b8ed126e49c52cc0a1eabac10`.
Old E3-A digest `ba9ad76f4a391f00fffb7ea448c7d581236b764d82dd09b01dccefe3dd39cc92` remains historical. It is rejected by the prospective baseline gate. Private plans/checkpoints are never rewritten. Authentic native proposal bytes remain replayable. Alternate serialization is rejected explicitly; any future serialization change needs a new reviewed implementation identity.

## Reproduction and regression

```sh
node --test --test-name-pattern='E3A1 before' tests/experiment-b-two-seam-integrity.test.mjs
node --test tests/experiment-b-two-seam-integrity.test.mjs
node --test --test-concurrency=1 tests/experiment-b-two-seam-integrity.test.mjs tests/experiment-b-archival-control.test.mjs tests/experiment-b-resumable.test.mjs tests/experiment-b-final-integration.test.mjs tests/experiment-b-private-account-receipt.test.mjs tests/experiment-b-runtime-integration.test.mjs tests/experiment-b-safe-harbor-bridge.test.mjs tests/experiment-b-custodian.test.mjs scripts/experiment-b-operational/provider-egress/tls-client-hello.test.mjs
node --test --test-name-pattern='R3-02' tests/test-flight-launchbridge.test.mjs
node --test --test-name-pattern='B-CODEX-0[1237]' tests/test-experiment-b-codex-integration.test.mjs
git diff --check
```

The original hostile fixtures execute archived predecessor source in isolated temporary trees. Regression expectations failed against the old implementation, then passed under the correction. Combined hostile replay tests dependency drift and proposal tampering against the same baseline. Exact restoration preserves a single authoritative journal event and a single proposal. Existing E3-A tests retain native positive/zero, refusals, unavailable engine, conflict, clone and legacy checkpoint controls. No independent durable-byte custody credit is introduced.

The fixed local dependency manifest is deliberately small. A static closure test detects newly added literal local imports/requires omitted from it. Runtime Node/built-in integrity, concurrent filesystem substitution, original checkout attestation and protected provider/custody authority require their separate accepted environment. The hash is a software identity under that trusted execution boundary.

Independent acceptance should inspect the exact source diff, replay both old attacks, verify all corrected negatives and old-binding refusal, and check CI against the successor head. Protected Flight remains HELD. Human scientific/release closure RESERVED. Sealed ⟐
