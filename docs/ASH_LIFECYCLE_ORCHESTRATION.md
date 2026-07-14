# Ash Lifecycle Orchestration

Status: `IMPLEMENTED_VALIDATION_GATED` on candidate branch

Date: `2026-07-14`

## Product correction

Ash is one governed workflow, not three adjacent pages.

The prior public route staged **Ash Readiness** as the product, linked **Ash Keep** as one button among several, and left **Ash Custody** as a detached registration surface. That arrangement inverted the authority and labor of the system.

The repaired lifecycle is:

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_PROVISIONAL / CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

The lifecycle does not merge the meanings of its stages.

```text
arrival ≠ consent
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
rebuild eligibility ≠ release authority
continuity ≠ transport
```

## Human-facing surfaces

### Ash threshold

`/dome-world/ash-threshold.html`

The Dome-World Ash tab routes to an art-forward threshold rather than a readiness form. The three-step clearing rite records only that the operator acknowledged arrival, boundary, and custody as distinct laws.

The threshold:

- accepts no raw content;
- writes no persistent local storage;
- performs no network request;
- places a bounded readiness receipt in `sessionStorage` only after the clearing gesture;
- redirects into Ash Keep.

### Ash Keep

`/dome-world/ash-keep.html`

Ash Keep remains the primary product and orchestrator. A lifecycle rail now shows the current state across Arrival, Quick Scan, Custody Root, Case Bound, Rebuild, Release, and Continuity.

The injected Custody workspace is not an annex. It changes the current case:

1. Quick Scan compiles a readiness receipt without raw content.
2. Artifact registration creates an L0 metadata-only or L1 browser-local exact-byte commitment.
3. The v0.8 custody route returns the canonical manifest and receipt digest spine.
4. Browser verification is required before binding.
5. Binding creates or identifies a custody-root artifact node.
6. The Case Map is recompiled with:
   - `custody_reference`;
   - the custody-root node;
   - custody evidence basis;
   - a binding observation;
   - a new `case_map_digest`.

The digest change is deliberate. Every Rebuild Test tied to the former Case Map becomes stale by construction.

## Workflow effects

### Case Map

Custody becomes a root artifact node rather than a detached receipt. Raw bytes remain outside the Case Map.

### Rooms and Route Memory

Rooms and Routes open after the custody root is case-bound. This prevents a detached metadata receipt from impersonating an integrated case.

### Rebuild Test

A current Rebuild Test must reference the custody-bound `case_map_digest`. Quick Scan remains a declared Reader class, now labeled `Quick Scan · readiness receipt` on the human surface.

### Draft and local release

Drafting opens after case binding. Local release remains held until:

- the custody root is verified and case-bound;
- the Rebuild Test is current for the custody-bound Case Map;
- the exact draft review is ready.

The existing `validCustody` review checkbox becomes an observed gate rather than a free operator assertion.

### Save Point and Capsule

The Case Map included in continuity already carries the custody reference and custody-root node. The Save Point commits to the Case Map digest; the encrypted Capsule carries the full custody-bound Case Map. Custody therefore travels into continuity without copying artifact bytes.

## Machine compatibility

The machine operation `ash-readiness` remains valid for API and historical receipt compatibility. Human-facing product text uses **Quick Scan** for the readiness operation and **Ash** for the complete lifecycle.

Aperture and diagnostics may continue to reference `ash-readiness` as a contract name. They must not present it as the product name or imply that readiness is custody.

## Claim ceiling

This integration proves workflow wiring and state transitions under focused validation. It does not production-demonstrate the new threshold route, live custody registration, mobile behavior, or production release gates until a deployed browser probe and sealed receipt exist.

Validation trigger: second branch event issued after workflow installation.
