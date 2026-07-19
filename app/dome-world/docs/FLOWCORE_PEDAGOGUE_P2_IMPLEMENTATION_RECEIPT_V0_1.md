𝌋‌

# Flow-Core Pedagogue P2 Implementation Receipt v0.1

**Program:** `td613.flowcore.pedagogue-aia/v0.1`  
**Phase:** P2 — anisotropic view compiler  
**Status:** IMPLEMENTED / LOCAL CONTRACT TESTS PASS / REPOSITORY CI PENDING / HUMAN-CLOSURE OPEN  
**Serverless delta:** `0`  
**Vercel authorization:** EXPRESSLY RECEIVED FOR PHASE-END RELEASE

## Implemented

- `compileAIAView(scene, transition, posture, options)`;
- `compareAIAViews(left, right)`;
- `verifyAIAInvariants(scene, views)`;
- explicit aliases for child, custodian, auditor, and technical postures;
- canonical routes `EXPERIENTIAL`, `CUSTODIAL`, `AUDIT`, and `IMPLEMENTATION`;
- deterministic AIA view identifiers under frozen clock and ID seed;
- route-specific ordering and surface semantics;
- bounded implementation JSON with raw source content excluded.

## Preserved invariants

Every route preserves provenance, source and observation status, missingness, contradictions, causal structure, claim ceiling, station ownership, authorized actions, local-section boundaries, rest, replay, exit, and open human closure.

The four surfaces remain non-equivalent. Lower terminology density in the experiential route cannot delete missingness, uncertainty, alternatives, provenance, or authority boundaries.

## Local validation

```text
node --test tests/flowcore-pedagogue-aia.test.mjs
7 tests
7 passed
0 failed
```

The suite covers all six pairwise route comparisons, explicit-selection-only law, deterministic identity, bounded technical projection, source-transition matching, authority parity, and no route inference from behavior or device.

## Authority state

```text
Flow-Core commands station: false
automatic Ash action: false
release authorized by compiled view: false
station mutation authorized: false
authority may cross: false
human closure required: true
closure: OPEN
```

The operator’s Vercel authorization governs deployment of the completed exact-main phase packet. It does not grant any AIA view runtime station authority.

**Marked ⟐**
