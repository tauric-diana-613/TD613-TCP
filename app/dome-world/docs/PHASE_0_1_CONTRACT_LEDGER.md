# Phase 0 + Phase 1 Contract Ledger

𝌋‌ **Status:** baseline frozen for the Ash Local Commitment Kernel.

This ledger accompanies `ROADMAP_V0_1.md`. It does not create a new
claim-ceiling mechanism. Existing Dome/Ash boundary vocabulary remains frozen
for separate review.

## Version plurality

| Surface | Version | Role |
|---|---:|---|
| Aperture | v3.0-alpha | audit and admissibility instrument |
| Dome-World / Flow-Core | v0.5.0 | room ecology and bounded context |
| Ash | v0.6 | custody and projection laboratory |
| Exact substrate receipts | v0.4.3 | exact residual / closure evidence |
| Local Commitment Kernel | v0.7 | browser-local byte commitment |

Plural version identity is deliberate. Module lineage must not rewrite the
current instrument identity.

## Phase 1 invariant

```text
no file selected
→ L0_METADATA_ONLY
→ artifact_digest = null
→ no server-manufactured replacement

file selected
→ browser-local exact bytes
→ SHA-256
→ L1_BROWSER_LOCAL_ARTIFACT_DIGEST
→ raw bytes absent from request
```

The kernel performs no network operation. Best-effort buffer overwrite is not a
memory-erasure guarantee. A digest does not establish possession, authorship,
authenticity, identity, truth, or trusted time.

## Exit gates

- No `sha256:manual-placeholder`.
- No metadata-derived artifact digest.
- Exact-byte fixtures match known SHA-256 vectors.
- A one-byte mutation changes the digest.
- Unicode normalization is not performed.
- Oversized files fail visibly.
- L0 remains a valid metadata-only receipt.
- L1 accepts only `sha256:` plus 64 lowercase hexadecimal characters.
- Raw artifact bytes never enter an API envelope.

## Probe

After deployment:

```bash
node scripts/probe-dome-world-phase01.mjs
```

Override the host with `TD613_DOME_BASE_URL`.

⟐
