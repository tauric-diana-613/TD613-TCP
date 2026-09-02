𝌋‌⟐

# A15-R0 · Nonce-Blinded Commit–Reveal Adjudication Latch · Preregistration v0.1

Status: **PREREGISTERED / RESEARCH-ONLY / OUTCOME-BLINDED PUBLIC PROGRESS / GOLDEN EGG UNEARNED**

## Exact parent

`#999 / 78443279853b95ab0bf54eed1decd1b5eeadf78c / TD613 Consolidated Validation run 2481 / 33621668351 SUCCESS`.

#999 established append-only source-bound measurement custody. That creates a new receiver-separation problem: a deterministic ledger root commits to low-entropy L/R/J values. If exposed during collection, an observer may enumerate plausible values and compare hashes, recovering an early threshold signal even though no field named `thresholds_pass` is published.

## Commit–reveal law

After any sealed custody ledger, the private custodian generates a unique high-entropy 256-bit nonce and computes a blinded commitment over:

```text
schema
exact parent
ledger root
ledger seal time
entry count
private nonce
commit time
```

The public progress receipt exposes only:

- schema / parent;
- `COMMITTED` or `INADMISSIBLE`;
- phase `COLLECTING` or `SEALED_COMPLETE`;
- entry count;
- nonce-blinded commitment;
- closed authority fields.

It MUST NOT expose the ledger root, nonce, source IDs, measurement IDs, values, measurement/recording times, envelope digests, threshold state, or parent acquisition status.

## Early-opening law

An incomplete ledger exits before custody verification or parent acquisition adjudication is invoked. Its opening result is generic `HELD` with:

```text
outcome_revealed = false
adjudication_invoked = false
acquisition_status = null
thresholds_pass = null
```

A complete opening requires:

1. all five exact operational surfaces;
2. opening time after commitment time;
3. correct private nonce;
4. correct ledger root;
5. recomputed commitment match;
6. exact #999 custody verification.

Only then may inherited #992/#998 acquisition status be exposed.

## Canonical controls

- partial core-three ledger → blinded `COLLECTING` receipt → opening HELD without adjudication;
- complete five-surface ledger → blinded `SEALED_COMPLETE` receipt → valid reveal → inherited `CANDIDATE`;
- same ledger + distinct private nonces → distinct public commitments with identical receipt shape;
- complete threshold-failing episode remains publicly blinded until valid opening, then reveals inherited `FAILED` honestly.

## Hostile controls

Reject or hold:
- short/invalid nonce;
- commitment before ledger seal;
- public receipt carrying nonce/root or other forbidden payload;
- wrong nonce at opening;
- opening at/before commit time;
- partial core-pass and partial core-fail attempts alike;
- opening capsule applied to a different ledger.

## Candidate theorem

`A_NONCE_BLINDED_COMMIT_REVEAL_LATCH_CAN_WITHHOLD_LEDGER_ROOT_SOURCE_MEASUREMENT_VALUE_THRESHOLD_AND_PARENT_STATUS_FROM_PUBLIC_PROGRESS_AND_REFUSE_EARLY_ADJUDICATION_UNTIL_COMPLETE_FIVE_SURFACE_CUSTODY_IS_SEALED_VERIFIED_AND_VALIDLY_OPENED_WITHOUT_ADDING_EMPIRICAL_CREDIT_OR_EARNING_THE_GOLDEN_EGG`

## Claim ceiling

The hiding claim assumes a private, unique, high-entropy nonce. The public receipt is outcome-blinded; the private custodian holding raw measurement custody is not thereby blinded.

`PUBLIC_PROGRESS_BLINDING != PRIVATE_CUSTODIAN_BLINDING`
`HASH_COMMITMENT_WITHOUT_SECRET_NONCE != SAFE_LOW_ENTROPY_BLINDING`
`COMMIT_REVEAL != EMPIRICAL_VALIDITY`
`VALID_OPENING != GOLDEN_EGG_EARNED`.

No merge, deploy, release, publication, production, Vercel, live Loom mutation, actual empirical acquisition, human-observation substitution, A16 authority, or Golden Egg completion authority.

Preregistered ⟐
