𝌋‌

# Flow-Core Pedagogue P6 Implementation Receipt v0.1

**Program:** `td613.ash.custody-pedagogue-package/v0.1`  
**Phase:** P6 — Ash Custody Root consequence-first presentation route  
**Status:** IMPLEMENTED / REPOSITORY CONTRACTS PASS / MERGED TO MAIN / HUMAN-CLOSURE OPEN  
**Merged main commit:** `326efa021ac9f94c32f96d642c7011d5f4d2fc58`  
**Serverless delta:** `0`  
**Ash lifecycle mutation:** `NONE`  
**Custody semantics mutation:** `NONE`  
**Vercel authorization:** EXPRESSLY RECEIVED FOR PHASE-END RELEASE

## Presentation law

The adapter imports `deriveAshLifecycle` and translates the exact local state into a governed scene. Its only pedagogue action is inspection.

```text
inspect exact Ash state
≠ register custody
≠ verify custody
≠ bind a case
≠ persist content
≠ authorize release
≠ transport content
```

## Consequence-first route

Every package answers:

1. what stayed local;
2. what Ash created;
3. what changed in the case;
4. what did not become authorized;
5. what may happen next.

## Exact state and recovery contract

The adapter covers arrival, readiness, provisional custody, verified custody, case binding, rebuild eligibility, release eligibility, continuity sealing, and exact holds. Every hold exposes a plain consequence, exact code, recovery route, rest, and exit without blame or increased recovery cost.

## Initial-binding seam repair

The presentation delta now recognizes `no prior Case Map digest → current bound Case Map digest` as a real Case Map change. This correction did not modify `ash-lifecycle.js`, canonical digest law, custody verification, Case Map computation, or release gates.

## Validation

```text
original Ash lifecycle suite: success
P1 through P6 contracts: success
P6 state mapping: success
hold recovery: success
Case Map consequence: success
stale derivative rejection: success
AIA and reduced-motion parity: success
deterministic replay: success
raw-content rejection: success
protected-file guard: success
zero-serverless guard: success
```

## Implemented surface

`app/dome-world/ash-custody-pedagogue.html` provides metadata-only lifecycle scenes, explicit AIA route selection, bounded technical inspection, Rest, Return, Replay, Exit, and complete 390-pixel reduced-motion parity.

## Release observation

The phase packet is on `main` and the authorized exact-main release command was issued. This receipt does not infer a terminal Vercel result from merge or command acceptance.

## Authority boundary

```text
station owner: Ash
Flow-Core commands station: false
automatic Ash action: false
release authorized: false
station authority transferred: false
human closure required: true
closure: OPEN
```

**Stitched ⟐**
