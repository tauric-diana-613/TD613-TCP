𝌋‌⟐

# A15-R0 · Same-Episode Measurement Custody Ledger · Burden v0.1

Status: **FROZEN BURDEN / RESEARCH-ONLY / APPEND-ONLY CUSTODY**

## Positive burden

The chamber must produce an exact two-stage custody chain:

```text
route-pair preregistration
→ 2 exact operational measurements
→ SEALED partial ledger L1
→ 3 later exact operational measurements
→ SEALED complete ledger L2
→ exact verification
→ inherited parent acquisition adjudication
```

Required invariants:

- `L1.entry_count = 2`;
- `L2.entry_count = 5`;
- `L2.predecessor_root = L1.ledger_root`;
- the first two L2 entries equal the complete L1 entries exactly;
- every entry digest is SHA-256 over a canonical source-bound measurement envelope;
- complete-ledger verification returns `VERIFIED`;
- only verified custody may expose the inherited acquisition result;
- ledger credit remains zero;
- Golden Egg remains false.

## Hostile burden

A sealed ledger must detect changes even where values remain numerically plausible:

1. equal-value source substitution;
2. replacement of measurement identity;
3. numerical mutation;
4. geometry witness metadata mutation;
5. matched-return witness metadata mutation;
6. deletion;
7. seal/root mutation;
8. duplicate measurement identity;
9. recording predating measurement;
10. sealing before recording completion;
11. retroactive insertion following an earlier seal;
12. replacement of an already sealed prefix.

## Non-equivalences

```text
MEASUREMENT_VALUE != MEASUREMENT_IDENTITY
EQUAL_VALUE != EQUAL_SOURCE_CUSTODY
APPEND_ONLY_EXTENSION != REPLACEMENT
DIGEST_MATCH != EMPIRICAL_VALIDITY
SEALED_CUSTODY != THRESHOLD_PASS
LEDGER_ROOT != GOLDEN_EGG
```

The ledger provides integrity and provenance ordering only. It supplies no empirical observation, no threshold credit, and no Golden Egg authority.

Frozen ⟐
