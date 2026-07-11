# TD613 Aperture / Flow-Core / Dome-World / Ash Roadmap v0.1

**Working title:** *The Crayon Map*  
**Status:** Roadmap derived from the current Aperture v3.0-alpha and Dome-World / Ash repository surfaces.  
**Date:** 2026-07-11

## Governing laws

- **Open Field governs idea generation; review begins only at operator-requested promotion.**
- **Artifact, context, and relation are separate strata.**
- **Receipts may cross stations; authority does not.**
- **The human custodian remains the decision point for consequential Ash actions.**
- **Proof is limited to propositions whose truth conditions formally close.**
- **Prediction remains research-only until calibration, abstention, drift, and harm tests are satisfied.**
- **This roadmap introduces no new claim-ceiling mechanism.**

## The present instrument, honestly

The current architecture already contains the right bones, but several repository seams must be closed before the advanced roadmap can become live code:

1. **Local hashing promise exceeds implementation.** The Ash interface says the selected file is hashed locally, but its payload builder still permits a manual digest and falls back to `sha256:manual-placeholder`.
2. **Artifact identity and metadata identity are conflated.** The server synthesizes `content_hash` from source and metadata when no digest is provided.
3. **Reciprocity exists in Aperture, not yet in the server bridge.** The API still exposes a one-way modeled-weather `aperture-bridge`.
4. **Cinder plaintext crosses the server boundary.** The `fragment` field is accepted by the API and is not included in the raw-content denylist.
5. **Legacy claim-ceiling vocabulary remains in Dome/Ash.** It is frozen for a separate review; this roadmap neither expands nor hardens it.
6. **Version identity is intentionally plural.** Aperture v3.0-alpha, Dome-World v0.5.0, Ash v0.6, and exact substrate v0.4.3 must be connected through explicit compatibility contracts rather than flattened into one number.

## Dependency spine

```text
Phase 0  Baseline freeze and contract ledger
   ↓
Phase 1  Ash local commitment kernel
   ↓
Phase 2  Canonical digest and receipt spine
   ├───────────────┐
   ↓               ↓
Phase 3  Flow-Core context instrumentation
   ↓
Phase 4  Reciprocal receipt bridge
   ↓
Phase 5  Relation Envelope + Phason continuity
   ↓
Phase 6  Human-gated Ash derivatives
   ├───────────────┐
   ↓               ↓
Phase 7  Independent provenance adapters
   ↓
Phase 8  Advanced privacy research lane
   ↓
Phase 9  Validation, deployment, and release discipline
```

---

## Phase 0 — Baseline Freeze and Contract Ledger

**Purpose:** Freeze the current stable instrument and make every existing station contract inspectable before semantic changes.

### Deliverables
- Compatibility matrix for Aperture, Dome-World, Ash, Phason, and exact substrate.
- Machine-readable endpoint and schema inventory.
- A no-new-claim-ceiling freeze for roadmap work.
- Regression fixtures for page load, identity stability, animation clocks, and drawer affordances.
- A deployment probe for readiness, ping, and bounded POST smoke tests.

### Exit gate
- The present Aperture build loads without flicker or microtask starvation.
- Every endpoint has a documented request, response, and side-effect posture.
- Inherited modules cannot rewrite current instrument identity.
- No phase begins from undocumented behavior.

### Do not
- Begin a broad refactor before baseline fixtures exist.
- “Fix” version plurality by erasing lineage.
- Automatically remove or harden legacy boundary vocabulary.

---

## Phase 1 — Ash Local Commitment Kernel

**Purpose:** Create a true browser-local L1 artifact digest and remove the synthetic hash path.

### Deliverables
- `app/dome-world/ash/local-commitment.js`
- File-picker wiring to Web Crypto SHA-256.
- `L0_METADATA_ONLY` and `L1_BROWSER_LOCAL_ARTIFACT_DIGEST`.
- A visible file-size ceiling for the first implementation.
- Best-effort buffer overwrite with no memory-erasure claim.
- A commitment module containing no network operation.

### Exit gate
- Known fixtures produce expected SHA-256 values.
- One-byte changes produce different digests.
- Empty files hash correctly.
- Unicode remains exact bytes, not normalized text.
- No raw bytes enter a request.
- No file means `artifact_digest: null`, never a placeholder or metadata substitute.
- Oversized files fail closed and visibly.

### Do not
- Manufacture an artifact digest from metadata.
- Promise immediate or guaranteed memory erasure.
- Call `file.arrayBuffer()` terabyte-ready.

---

## Phase 2 — Canonical Digest and Receipt Spine

**Purpose:** Separate byte identity, manifest identity, and receipt identity.

### Deliverables
- `artifact_digest`: exact bytes.
- `manifest_digest`: canonicalized metadata and routing posture.
- `receipt_digest`: final receipt envelope.
- Canonical JSON specification and cross-language test vectors.
- Migration support for custody-manifest/v0.5.
- L0 and L1 assurance classes implemented; higher classes reserved.

### Exit gate
- Metadata changes leave `artifact_digest` unchanged but alter `manifest_digest`.
- Receipt changes alter `receipt_digest`.
- Browser and Python canonicalization agree.
- Legacy receipts replay without being relabeled as L1.
- Malformed L1 digests are rejected.

### Do not
- Publish a universal stable digest by default.
- Treat a digest as identity, authorship, possession, authenticity, or time proof.

---

## Phase 3 — Flow-Core Context Instrumentation

**Purpose:** Make context receipts sensor-named, source-typed, uncertainty-bearing, and calibratable.

### Deliverables
- `source_status`
- `sensor_id`
- `transformation_history`
- `missingness`
- `uncertainty`
- `alternatives`
- Benign outage, drift, latency, and noise fixtures.
- Abstention for insufficient context.
- No artifact digest field in Flow-Core context.

### Exit gate
- Every metric names its source and sensor.
- Simulated values cannot present as observed.
- Unknown sensors route to `UNRESOLVED`.
- Benign failures do not automatically become surveillance or suppression findings.
- Context receipts remain private by default.

### Do not
- Claim Flow-Core sees a total surveillance grid.
- Treat weather as prediction.
- Treat unique noise as automatic camouflage.

---

## Phase 4 — Reciprocal Receipt Bridge

**Purpose:** Bring the Aperture v3 reciprocal architecture into the Dome-World API without transferring authority.

### Sequence
```text
Aperture diagnostic receipt
→ Flow-Core contextual translation
→ Flow-Core context receipt
→ Aperture returned-receipt audit
→ recommendation
→ optional Ash human gate
```

### Deliverables
- Diagnostic receipt operation.
- Context translation operation.
- Returned-context audit operation.
- Round-trip receipt containing:
  - received
  - rejected
  - transformed
  - produced
  - missingness
  - uncertainty
  - alternatives
  - cannot_establish
  - authority_class
  - source_status
  - sensor_id
  - recommendation_not_command
- Contradiction and provenance checks.
- Open Field preserved outside promotion routes.

### Exit gate
- The round trip replays from receipts.
- Flow-Core cannot write Aperture doctrine.
- Aperture cannot execute Ash.
- Context receipts carrying artifact references are rejected.
- Missing sensors are held for repair.
- Recommendations never mutate custody.

### Do not
- Build a closed autonomous loop.
- Apply evidence grammar to Open Field content.
- Infer reciprocal authority from reciprocal communication.

---

## Phase 5 — Relation Envelope and Phason Continuity

**Purpose:** Associate artifact and context receipts without fusing them or exposing a universal tracking handle.

### Deliverables
- Local-only Relation Envelope.
- `ash_reference = HMACₖ(artifact_digest ∥ context_nonce)`
- Binding purpose and explicit operator approval.
- Visibility, withdrawal, and supersession fields.
- Phason events for relation created, revised, withdrawn, and superseded.
- Nonce/key lifecycle and linkability threat model.

### Exit gate
- Stable artifact digest is absent.
- The same artifact receives different references in different contexts.
- Withdrawal leaves the original receipts unchanged.
- Phason records change without claiming co-occurrence, identity, location, or causation.
- No relation finalizes without a human action.

### Do not
- Build `H(artifact_digest || weather || timestamp)` as a foundational commitment.
- Treat relation as co-occurrence proof.
- Auto-create a relation because two receipts are nearby.

---

## Phase 6 — Human-Gated Ash Derivatives

**Purpose:** Rebuild Veil, Cinder, Compare, Recall, and export around explicit human decisions and safer data boundaries.

### Deliverables
- Shared Human Confirmation Gate.
- Client-side Cinder construction or destination-bound encryption before transit.
- Raw-content denylist expanded to fragments and aliases.
- Veil remains structural, not a summary.
- Recall remains non-reliance/supersession, not erasure.
- Leak Challenge remains a declared heuristic model.

### Exit gate
- Plaintext Cinders never enter server requests, logs, or receipts.
- Confirmation, authorization, and execution are separate events.
- Recall cannot claim deletion of already observed copies.
- Leak Challenge false positives and benign controls are documented.
- Modeled pressure never triggers action without the human gate.

### Do not
- Promise Burn Notice erasure.
- Certify anonymity.
- Automate Cinder construction or export.

---

## Phase 7 — Independent Provenance Adapters

**Purpose:** Add optional evidence of signing, ordering, and inclusion without merging their meanings.

### Adapters
- Key-holder signature.
- RFC 3161 timestamp token.
- Git commit or release-tag anchor.
- Merkle or append-only inclusion proof.
- Independent witness countersignature.

### Exit gate
- Each adapter verifies independently.
- Failure of one leaves the L1 commitment intact.
- Local time, trusted timestamp, ordering, and independent witness remain distinct.
- No exact-second possession claim without evidence that truly supports it.
- Signatures prove keys signed, not identity, authorship, or truth.

---

## Phase 8 — Advanced Privacy Research Lane

**Purpose:** Keep ambitious research alive in Open Field and promote only narrow mechanisms that survive formalization.

### Research objects
- Predicate registry for narrow zero-knowledge proofs.
- Canonical parser and circuit-version commitments.
- Differential privacy only for defined aggregate queries.
- Threshold future-access prototypes.
- Auxiliary-information and failure threat models.

### Exit gate
- ZK proofs name witness, public inputs, predicate, parser, and circuit version.
- DP defines neighboring datasets and sensitivity.
- Unique Cinders are not called differentially private by default.
- Threshold access never claims to erase observed plaintext.
- Research surfaces cannot route directly into operational Ash actions.

### Do not
- Invoke indistinguishability obfuscation as a magic privacy label.
- Claim zero linkage probability.
- Use cryptography to “prove” broad real-world truth.

---

## Phase 9 — Validation, Deployment, and Release Discipline

**Purpose:** Earn operational status through reproducible testing and live deployment evidence.

### Deliverables
- Phase-specific npm scripts.
- Python and browser integration tests.
- Desktop, iOS, and Android parity tests.
- Live readiness and bounded endpoint smoke probes.
- Schema compatibility report.
- Review of localStorage, sessionStorage, CORS, logging, and request-size boundaries.
- Release receipt naming what is implemented and what remains research-only.

### Exit gate
- CI and clean-browser tests pass.
- Live readiness matches the repository operation registry.
- No hidden route accepts raw artifact bytes.
- Inherited code cannot rewrite current instrument identity.
- Operational and research-only surfaces are visibly and machine-readably distinct.
- A rollback path exists.

---

## Parallel station work

### Aperture
- Receipt audit grammar
- Open Field and promotion routes
- Authority classification
- Formal closure checks
- Recommendations without execution

### Flow-Core
- Sensor registry
- Context calibration
- Uncertainty and abstention
- Bounded weather translation

### Ash
- Local commitment
- Digest separation
- Derivative boundaries
- Human-gated custody action

### Phason + Receipts
- Content-invariant history
- Relation lifecycle
- Cross-station replay without custody capture

## First implementation slice

**Begin with Phase 0 + Phase 1.**

The repository currently promises local SHA-256 while still permitting a synthetic placeholder and metadata-derived fallback. Repairing that seam produces the first trustworthy object on which every later receipt, relation, timestamp, signature, or proof adapter depends.

Expected files:

```text
app/dome-world/ash/local-commitment.js
app/dome-world/ash-custody.html
api/dome-world-engine.py
app/dome-world/schemas/ash-custody-manifest.schema.json
app/dome-world/schemas/ash-custody-receipt.schema.json
tests/dome-world-ash-local-commitment.test.mjs
packages/dome_world_exact/tests/test_ash_custody_api.py
```

## Closing invariant

```text
Aperture audits.
Flow-Core contextualizes.
Dome-World holds the ecology.
Ash owns custody.
Phason records governed change.
Receipts cross the bridge.
The human decides.
```

⟐
