𝌋‌⟐

# A15-R0 · Nonce-Blinded Commit–Reveal Adjudication Latch · Burden v0.1

Status: **FROZEN BURDEN / RESEARCH-ONLY / OUTCOME-BLINDED PUBLIC SURFACE**

## Positive burden

The chamber must distinguish custody from disclosure:

```text
private sealed measurement ledger
→ private nonce-blinded commitment
→ public progress receipt without outcome-bearing fields
→ complete five-surface gate
→ valid private opening
→ exact custody verification
→ inherited acquisition adjudication
```

Required positive controls:

1. core-three partial custody publishes `COLLECTING`, not a parent acquisition result;
2. partial opening returns HELD before adjudication is invoked;
3. complete five-surface custody publishes `SEALED_COMPLETE` while remaining outcome-blinded;
4. valid reveal verifies commitment and #999 custody before exposing inherited `CANDIDATE`;
5. threshold-failing complete custody remains blinded publicly and exposes `FAILED` only after valid opening;
6. distinct secret nonces over one ledger yield distinct commitments but identical public receipt shape.

## Hostile burden

Reject or hold:

- invalid nonce length/encoding;
- commit time at/before ledger seal;
- any forbidden field on the public receipt;
- wrong opening nonce;
- opening at/before commitment time;
- both threshold-passing and threshold-failing partial core-three attempts;
- application of one private opening capsule to another ledger.

## Hiding assumption

The ledger root commits to low-entropy measurement values. A bare deterministic root is therefore not treated as a safe public blind. The public commitment includes a secret 256-bit nonce.

```text
DETERMINISTIC_HASH_COMMITMENT + LOW_ENTROPY_VALUES
!=
OUTCOME_BLINDING
```

The chamber proves API/surface separation and fail-closed opening rules. It does not prove formal computational security against compromise of the private nonce or private custody environment.

## Non-equivalences

```text
PUBLIC_PROGRESS != PRIVATE_CUSTODY
COMMITMENT != OPENING
COMPUTED_DIGEST != PUBLISHED_LEDGER_ROOT
PARTIAL_CUSTODY != EARLY_ADJUDICATION
BLINDED_PUBLIC_RECEIPT != BLINDED_PRIVATE_CUSTODIAN
VALID_REVEAL != EMPIRICAL_VALIDITY
VALID_REVEAL != GOLDEN_EGG_EARNED
```

Frozen ⟐
