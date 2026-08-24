# Temporary witness routing note

Routing-only metadata for #729 exact-head consolidated validation. Scientific head before routing: `c6fdcd3987950cff7ef98ba5e26917f71047b9d6`.

PR #729 is temporarily targeted at fresh `main` solely to register the exact-head static witness.

## Preserved run-2124 diagnostic scar

Run `2124 / 32725332014` failed at A15-R0 step 19 before any success classification. The failure is preserved. Inspection identified a test-shape mismatch in the transition-locality control: the concrete `K_period4` projection was compared byte-for-byte against the same symbolic target carrying the additional wrapper field:

```text
status = SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED
```

This wrapper field is not part of `K_period4` operational equality.

## Pre-repair boundary

Before executable repair, the only authorized change is:

```text
compare the symbolic target's K_period4 payload
against the concrete K_period4 projection
rather than comparing the symbolic status wrapper itself.
```

Frozen and unchanged:

```text
#729 theorem statement
parity-twisted star law
source-relative jurisdiction
associativity obligation
congruence obligations
hostile controls
claim ceiling
human stop
workflow timeout
```

No failed theorem assertion is to be rewritten as success. Run 2124 remains diagnostic provenance.
