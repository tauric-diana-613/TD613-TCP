# Safe Harbor custody bridge — source-free review candidate

Status: **SAFE_HARBOR_CUSTODY_BRIDGE_REQUIRES_SPECIFIC_EXTERNAL_AUTHORITY**.
Gate F HELD. This candidate has no live signing, consumption, archive or inference authority.

## Lineage and ordered investigation

Base: PR #1627 documentation HEAD `29cdad5d1b83311799902c0ce3d79be8103d8760`, above accepted implementation `a5fe1af9c539dba0ac2233ec323c69a438d3cfc5`. PR #1619–#1627 history and prior receipts remain unchanged.

Read [Amari's namespace correction](https://github.com/tauric-diana-613/TD613-TCP/pull/1627#issuecomment-6568963257) and the preceding mandatory-escrow finding. The investigation first traced Safe Harbor issuance, packet replay, signature/countersignature and hook contracts. Following operator steering, it then traced Loom's actual custody implementation, Manifest's succession contract and Dome-World's guarded context implementation before extending the reusable scope gate. The source references below identify that investigation, its findings, and resulting changes. No foreign domain is activated by the crosswalk.

## Exact public identity bindings

| Coordinate | Preserved value and meaning |
| --- | --- |
| Namespace principal | `tauric.diana.613` — non-human routing/issuance/provenance principal |
| Human authority | Tawanna C. Miller — human consent, custody and closure holder; not identical to the namespace |
| Heritage key | Tauric Diana |
| Covenant key | Khona‌lit-po — interior U+200C |
| Canonical covenant | Tauric Diana — Crimean heritage custodianship |
| Display covenant | Blood Rite 613; historical UI may prefix it with `Covenant:` |
| PUA anchor | U+10D613; UTF-16 `\uDBF5\uDE13` |
| Display ingress | 𝌋; U+1D30B, distinct from the PUA scalar |
| Binding fragment | `#9B07D8B`, first seven uppercase hex characters of the recorded canonical declaration SHA-256 |
| Operator/reviewer-designated canonical SHI | `TD613-SH-9B07D8B-78C5B2F3` — preserved reference, not a default entrant credential or secret |
| SAC literal | `SAC[X6ZNK5NO51]` — recorded link to the legacy corpus-root metadata |

The actual v2 issuer derives a badge from principal, fragment and a stylometric fingerprint using `hash64`. Its replay verifier reproduces that assignment without a private signing key. This audit did not obtain the designated SHI's original fingerprint, so it does not independently rederive its suffix. Synthetic tests use a synthetic identity instead.

`binding-provenance.js`, the canonical provenance manifest and trust profile agree on the public anchors and the unsigned binding event. This audit reproduced the ordered leaf-metadata SHA-256 root `bfb2d575ae6605bf7db3eecf8cf333e4ef78b2c673dc7647600a9d9cb20cce88` without reading corpus members. It did not freshly hash the declaration or assert private-key possession. Public HS256 test vectors and historical unverified OpenPGP overlays are not trust roots.

## Compatibility matrix

| Requirement | Classification | Actual evidence and smallest reuse pathway |
| --- | --- | --- |
| Namespace, glyphs, fragment, SAC and provenance commitments | EXISTING_AND_VERIFIED | `app/safe-harbor/app/binding-provenance.js`, `corpus/binding_provenance_manifest.json`, `reference/td613_trust_profile.json`; deterministic scalar/covenant/root checks. Paths in these three references are relative to `app/safe-harbor/`. |
| Reproducible SHI issuance/replay | EXISTING_AND_VERIFIED | `app/safe-harbor/app/main.js::badgeNumberForContext`, `app/safe-harbor/app/safe-harbor-authority-verifier.js::verifyV2Replay`; synthetic replay and changed-fingerprint refusal. This is assignment consistency, not human authorization. |
| Signature overlays and external hook handoff | EXISTING_AND_VERIFIED | Safe Harbor `docs/HOOKS.md`, `app/main.js::signatureForPacket`. Overlay metadata is transport; the browser can copy a caller's `verified` flag. The new verifier ignores that flag and requires actual signature verification. |
| Existing historical signer mandate/current key custody | EXISTING_BUT_UNATTESTED | Registry describes detached Ed25519 zone signatures and advanced detached JWS request signing. No inspected Safe Harbor route demonstrates a currently controlled real signer or a Flight mandate. No key store was inspected. |
| Cryptographic request signature to Flight dispatch ABI | MINIMAL_ADAPTER_REQUIRED | Implemented candidate `safe-harbor-dispatch-bridge.mjs`: detached JWS HS256, explicit new application/purpose/lane, frozen namespace/context/full dispatch binding, expiry and issuer lifetime checks, then external atomic consumption. No historical JWS token, key or scope is repurposed. |
| D01–D20 execution authorization | EXISTING_AND_VERIFIED | Existing `boundaries.mjs::verifyExecutionAuthorization` requires its own scoped canonical HMAC grant, all 20 decisions and frozen configuration. JWS dispatch permits do not satisfy or replace this grant. |
| Live single-use consumption | EXTERNAL_HUMAN_OR_SECRET_REQUIRED | Existing runtime invokes `authorizeAndConsume(binding)` before child start. Candidate delegates to a genuine durable consumer; synthetic Set fixtures are explicitly non-operational. No Safe Harbor-wired live consumption service was established. |
| Offline admission-only authority | EXTERNAL_HUMAN_OR_SECRET_REQUIRED | Existing `admitOnly()` requires separately controlled offline authority/consumption. Namespace invocation, UI seal, environment flags and JSON shape do not supply it. |
| Mandatory observational escrow before protected re-admission | MINIMAL_ADAPTER_REQUIRED | Implemented candidate requires an admission-only escrow and separately authenticated custodian receipt, bound to episode/experiment/escrow digest. Its broker manifest must reproduce its source digest. Refusal precedes archive I/O. |
| Authentic physical membership and legacy Flight admission | EXISTING_AND_VERIFIED | Original ZIP guards and WeakMap members remain; serialized escrow cannot create physical membership. Strict/legacy configurations retain their prior optional-escrow behavior and original grants. |
| Checkpoint integrity and supplied-anchor comparison | EXISTING_AND_VERIFIED | Existing SQLite/HMAC journal, accepted-turn identity and externally supplied minimum anchor checks; inherited offline regression evidence retained. |
| Independently controlled checkpoint key/rollback-resistant anchor retention | EXTERNAL_HUMAN_OR_SECRET_REQUIRED | A private journal does not establish independent key/anchor custody. No inspected Safe Harbor browser/session storage route provides that service. |
| Independent Stage 2 witness roots and evaluator authority | EXTERNAL_HUMAN_OR_SECRET_REQUIRED | Generator/operator namespace and credentials do not establish evaluator independence. Astra Max remains proposed; no evaluator or key is created here. |

## Historical JWS scope and resulting reuse

The registry in repository snapshot `7594bf902a4c48ae27aafbb65a5c320a8fb1eccd` already documents detached JWS request signing on April 7, 2026. The published April 8 snapshot `ab0f7982dff7292ac14ad9fc791653e21c18caa7` preserves it. The historical alias/voice probes use `core/route-2` and `alias.read`; public probes remain unsigned and overlays operator/reference-only. This establishes documented history, not live service use or an exclusive currently active allocation.

The operator subsequently authorized adapting the mechanism for this task. The candidate uses a **new explicit scope**: application `EXPERIMENT_B`, lane `experiment-b-custody/v1`, operation `EXPERIMENT_B_NATIVE_DISPATCH`, JWS type `TD613-SCOPED-AUTHORIZATION+JWS`. Historical files, keys, tokens, probes, request scopes, zone signatures and public defaults remain untouched. A canonical HMAC Flight grant is not a detached JWS: neither format is renamed into the other.

Only encoded-payload detached HS256 JWS is supported. `none`, unexpected algorithms/types/critical headers, `b64:false`, noncanonical payloads, unknown issuers, signature tampering, wrong application/namespace/context/binding, premature or expired permits, permits beyond issuer validity and excessive permit lifetimes refuse. Production lifetime values must be supplied through accepted issuer policy; synthetic test times are not recommendations or operator adoption.

## Context research → actual adaptations

The [concrete Portable Loom / nascent and speculative post-emergence Manifest / Dome-World crosswalk](SAFE_HARBOR_APPLICATION_CONTEXTS.md) records exact functions, objects, transition scopes, interposition points and failure consequences. It includes adaptive Theory Edition succession and unforeseen instruments without claiming emergence or installing those future executors. Its future integrations are explicitly distinguished from the gate changes actually implemented here.

### Safe Harbor

Read `README.md`, `docs/ARCHITECTURE.md`, `docs/HOOKS.md`, the registry/probe history, `app/main.js`, `app/safe-harbor-authority-verifier.js`, `app/safe-harbor-step1-countersignature.js`, the entrant-authorship schema and the blind-custody challenge specification. The latter remains authored/pre-implementation/human-gated, not an installed signer.

The replay hash deliberately excludes signature bytes and several overlay/authority surfaces. Consequently a valid replay hash cannot by itself bind the complete authorization overlay. **Resulting change:** the Experiment B context requires both `safeHarborPacketReplayDigest` and `safeHarborPacketRecordDigest` (SHA-256 of the exact retained packet-file bytes), alongside SHI, frozen plan/policy/source/decision/execution-grant digests. Neither digest grants permission. The external issuer must actually verify the packet's declared replay semantics and retain its complete bytes before signing; this adapter verifies that accepted binding, not an unseen packet. A synthetic regression exercises the actual replay-material function and proves why both commitments are different.

Digest fields use bare lowercase SHA-256 hex. A custodian may extract the 64-hex value from an actually verified Safe Harbor `sha256:` replay result; a prefix or supplied digest alone is not verification. The packet record predates the separate dispatch permit, avoiding a self-referential signature digest.

Countersignature code assesses packet authority-reading/replay posture. The entrant-authorship schema separately binds a custody assertion and review digests. Neither supplies a human execution signature, replay ledger, legal identity proof or automatic public promotion. The new verifier never consumes the browser's `verified:true` as authority.

### Portable Loom and the separate hosted Loom custodian

The primary portable context is `app/engine/portable-loom-reentry.js`, not just the hosted demo below. Its `stage → recordChallenge → check → admit → continuation` sequence separates local registration, captured declarations, recomputed commitments and actual process-local admission. `admit()` requires its exact locally issued candidate object, unchanged revision/head/expiry and explicit human review; exported records cannot restore that capability. The new gate adopts its plain-data-before-digest discipline. The linked application crosswalk specifies separately scoped egress, receiver attestation and exact-candidate admission permits without claiming foreign execution or global latest-state proof.

Read `app/dome-world/holonomy-loom/demo-contract.js`, `server/loom-demo-custody-client.js`, `server/loom-demo-signing.js`, `neon/functions/loom-custody/index.mjs`, `neon/migrations/20261001_loom_custody.sql` and root custody law. The production custodian verifies RS256 Vercel OIDC against owner/project/environment, signs a domain-separated stage receipt, and reserves/commits via conditional SQL on current head and pending request. Stages distinguish `ACTIVATE`/`AIA_ONLY` from `CONTINUE`/`SELECTED_FILES_BOUND`; receipts explicitly retain `authority_transferred:false`. A legacy local HMAC helper is not the production deployment route.

**Finding:** Loom contains a concrete source implementation of custody enforcement worth reusing, not a generic currently authorized Flight service. Its operations, receipt schema, key domain and tables are Loom-specific. A local Safe Harbor JWS cannot impersonate Vercel workload identity or overwrite that custodian's current head. No endpoint, database or signing function was invoked during this audit; migration history is not a fresh liveness witness.

**Prospective application:** a separately reviewed JWS intent could bind activation, predecessor, exact request, stage, input/result commitments and expiry before Loom's existing reservation transaction. Preserve OIDC, second source-sharing gesture, existing stage signatures and CAS. A Flight consumer could reuse the transaction pattern only under its own accepted operation/schema/ledger and legitimate principal. This candidate does not alter or deploy the Neon service.

### Manifest

Read `docs/research/manifest-succession/MANIFEST_RESEARCH_SUCCESSION_RECORD.md`, especially its six canonical transitions, evidence/presentation/adjudication ancestries, independent local ownership, Action Folio/Dispatch/Return Receipt, three clocks and strict Flight firebreak. It is explicitly a prospective succession contract. The bounded inspected source paths did not establish an operational Manifest Action Folio authority service.

**Finding:** unchanged source bytes do not imply unchanged permissions, route history, presentation, local compatibility or candidate relationships. A source-only signature would miss consequential changes. **Prospective application:** separate typed permits for the six transition kinds, with old/new state and three ancestry commitments; distinct first synthesis, ambiance refresh and owner-initiated theory-edition purposes. Dispatch export remains a proposal until separately authorized. Em's independently operated Manifest must be able to use its own namespace/roots without inheriting TD613 private governance. The generic verifier supports explicitly scoped independent namespaces; Flight remains fixed to TD613.

Cupola/Manifest expectations must not enter blinded Experiment B prompts or scoring, alter the strong union or become a new Flight prerequisite. None is injected here.

### Dome-World

Read `docs/DOME_WORLD_FLOW_CORE.md`, `packages/dome_world_exact/README.md`, `api/dome-world-engine-guard.py`, `packages/dome_world_exact/flowcore_context.py`, `packages/dome_world_exact/reciprocal_bridge.py` and the local round-trip auditor `app/engine/aperture-v3-reciprocal-bridge.js`. The actual guard delegates Ash custody elsewhere. Context instrumentation rejects artifact identities/raw material; reciprocal diagnostics reject execution/authority fields. It preserves named sensor status, missingness, uncertainty, DERIVED/SIMULATED/UNRESOLVED distinctions, domain-separated local digests and explicit closure.

**Finding:** putting a source-bearing JWS authorization inside the reciprocal-context payload would violate its artifact-blind/non-authority contract. **Prospective application:** a separate custodian-side JWS gate may authenticate an explicitly authorized measurement/receipt exchange, leaving the artifact-blind body and returned non-authority context unchanged. A signature can authenticate sender/scope; it cannot turn derived weather into observed truth, authorize prediction/Ash, or substitute for exact mathematical admissibility. No Dome-World route is changed or called.

### Unforeseen uses / Wild Field

The generic verifier requires an explicit application, namespace, purpose, exact scope, purpose-limited roots and finite issuer window. It has no wildcard authority or autonomous adaptation. The Flight wrapper separately requires the complete existing dispatch binding and external consumption. Tests reject cross-application/namespace reuse even when the synthetic signature is valid.

`proposeSafeHarborUse()` carries an attributed `UNANTICIPATED_CANDIDATE` with rationale and provenance, including uses outside these applications. Attribution remains declared, not authenticated; the record is unsigned and cannot pass dispatch verification. Future integration requires prospective operator authority and application-specific review; proposals cannot rewrite the frozen primary Flight or automatically install tools. This preserves unexpected mathematics, contradictions and architectural candidates without converting novelty into execution permission.

## Minimal external installation contract

The custodian can reuse an actual operator-controlled Safe Harbor issuer if its mandate and isolation are established. A new hosted KMS or separate human is not inherently required. The human authority and namespace principal remain distinct.

1. The independently permissioned custodian owns the actual purpose-limited issuer key, root policy and signed-envelope storage. No real key/signature is generated by this candidate.
2. Its accepted external module instantiates `createSafeHarborDispatchBridge({context,trustedIssuers,loadEnvelope,consumeAtomically})` and exports its real `authorizeAndConsume`. Root records specify application, namespace, lane, explicit operations, valid-from/until and maximum permit lifetime. The context binds both packet commitments and the frozen episode/grant/decision state.
3. `loadEnvelope` retrieves the genuine permit for the full dispatch binding. `consumeAtomically` transactionally enforces issuer/authorization-ID uniqueness, attempt/dispatch exclusion, expiry recheck and revocation/refusal policy, committing before returning literal `true`. No in-memory Set, supplied Boolean or hook status establishes that service. Its outages and uncertain outcomes HOLD.
4. Independently review and pin the **complete installed dependency closure**, including the bridge, not merely a mutable importing shim. Supply the existing runtime's module digest and independent acceptance digest through the legitimate custody mechanism. This candidate is not installed into a live dispatch authority.
5. Retain the original independent D01–D20 execution grant, admission-only purpose, checkpoint key/anchors and separate evaluator roots. The JWS permit does not replace any of them.

The authentic observational admission escrow receipt uses the existing canonical HMAC convention, operation `EXPERIMENT_B_ADMISSION_ESCROW`, accepted issuer, authorization ID, expiry, experiment, episode and digest of the complete `admitOnly()` escrow. Its external custodian signs only after lawful admission. The existing full execution grant binds the configuration including that escrow/receipt. Later physical re-admission still requires its original separate grant and reproduces archive/policy/intake/source commitments. Receipt attestation does not mint WeakMap members. Initial archive hashing still requires its own prior human authority; nothing here performs it.

## One-file operator setup

Use `prepare-safe-harbor-custody.mjs --prepare` with one operator-chosen new configuration filename. It creates the prefilled non-secret worksheet; `--check` with that filename lists only missing inputs and checks the explicitly supplied service module's SHA-256 **without importing it**. It refuses overwrite and undeclared/secret fields. The reviewed public template is `SAFE_HARBOR_OPERATOR_INPUT_TEMPLATE.json`. Keep the filled copy private. Do not enter keys, tokens or source contents.

```text
node scripts/experiment-b-operational/prepare-safe-harbor-custody.mjs --prepare operator-input.json
node scripts/experiment-b-operational/prepare-safe-harbor-custody.mjs --check operator-input.json
```

Existing Node suffices; no new program download is necessary. Preparation does not install a security principal or verify a supplied acceptance digest. Genuine service/key custody is the one indispensable external provision. Episode/source/schedule commitments stay missing until separately lawful inventory and freeze; do not invent them to complete the worksheet.

## Verification and remaining action

Local affected Linux suite: **55/55 PASS**, Node **24.4.0**, pinned image `sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f`, `node scripts/experiment-b-operational/run-source-free-linux-tests.mjs`. Complete source closure: 30 files, SHA-256 `b45f75a554293e1bd8f83e0047b71ca1a66191dfd9be00720e2f6ecaa0672159`.

New compatibility/gate/setup suite: **13/13 PASS**, local Node **26.7.0**, `node --test --test-concurrency=1 tests/experiment-b-safe-harbor-bridge.test.mjs`. Public Git-blob fallback was used for sparse Safe Harbor files. Final receipts are retained alongside this document. These are deterministic observations, not live-provider, independent signer or live database witnesses. CI runs both suites and the four existing focused parser regressions at the PR's exact head; CI outcome is recorded in the PR handoff after completion.

Operations in this commission comprised source inspection, synthetic/local arithmetic/signature fixtures, invented ZIP fixtures in inherited tests and offline tests. **Zero protected Em archive reads/hashes, zero model requests, zero genuine grant/key issuance, zero paid API requests, zero service endpoint calls, zero deployment or merge.** Synthetic signatures authenticate only invented test fixtures and confer no operator authority.

**Immediate external action:** Tawanna, as human authority holder, supplies or provisions the legitimately controlled Safe Harbor custodian's protected module/service interface and actual key/consumption/anchor custody for independent acceptance. The namespace identifies the route; it does not supply the private key. Existing eligible tooling can be reused once that control is established. No secret should be supplied through the review artifacts.

Separately unresolved: informed provider privacy/source-disclosure acceptance; genuinely independent Astra Max evaluator/model/credential/root and frozen complete blinded evaluation workload; lawful private corpus/schedule and finite episode/Stage 2 values; initial hashing/admission-only authority and escrow; distinct final protected inference grant; independently accepted conditional source-free witness. Previously adopted D02/D03/observational D04 v1/D13/D17 are preserved, including full comparison, candidate freedom, zero automatic retries/fallback and cumulative checkpoint continuity. Gate F remains HELD; human closure RESERVED. ⟐
