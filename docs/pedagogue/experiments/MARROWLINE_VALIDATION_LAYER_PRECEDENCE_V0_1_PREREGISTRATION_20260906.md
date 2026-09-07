𝌋‌⟐

# Marrowline Validation-Layer Precedence v0.1 · preregistration

**State:** FROZEN BEFORE IMPLEMENTATION — NO 𝄐 YET  
**Exact scientific parent:** PR #1064 earned head `afe2ec6eaa89dae69dda2d28f95d27929a72f3f3`  
**Source-level precursor scar:** PR #1063 held after its “unreachable suffix” premise was falsified before implementation  
**Merge / production release / Vercel / live-provider authority:** CLOSED

## Why this chamber exists

PR #1064 closed the declared finite return-schedule family and triggered the mandated post-seal inspection for any genuinely non-redundant internal coordinate.

That inspection found a source-level distinction hidden by PR #1063’s original framing.

The current `validatePocketPacket(packet)` does not begin with the sequential duplicate loop. It first applies a recursive packet-wide carrier audit:

```text
assertExactKeys(packet)
→ assertNoForbiddenTransportCarrier(packet)
→ schema / authority checks
→ sequential finding loop
   → supported rule check
   → duplicate check
   → canonical projection checks
```

Therefore a finding placed lexically after a would-be duplicate is not necessarily temporally “after the collision” in validation order. Packet-wide carrier violations in that later finding can be observed before the duplicate loop starts, while violations enforced only inside the sequential finding loop can remain masked by the earlier duplicate.

This is a validation-order question, not another packet-length/permutation census.

## Canonical findings

```text
A = EMAIL_IDENTIFIER / canonical CHANGE
B = USER_DECLARED_PROTECTED_TERM / canonical REMOVE
C = PRIVATE_KEY_BLOCK / canonical REMOVE
```

A and C have distinct rule identity. B exists only to make the later A collision prefix nontrivial.

## Fixed rejecting prefixes

Use exactly two already-understood A-duplicate prefixes:

```text
P_EARLY = [A,A]
P_LATE  = [A,B,A]
```

`P_EARLY` rejects on the second array element.
`P_LATE` admits A and B to sequential validation, then rejects on the repeated A.

The chamber does not enumerate further duplicate positions.

## Suffix validation strata

Append exactly five suffix classes to each fixed rejecting prefix.

### S0 · CLEAN_CANONICAL

Canonical `C`.

Expected role: globally clean and sequentially valid if reached.

### S1 · GLOBAL_FORBIDDEN_KEY

Start from canonical `C` and add a forbidden carrier key:

```text
raw_message: "TD613_SUFFIX_CANARY"
```

Expected role: packet-wide `assertNoForbiddenTransportCarrier()` must reject this suffix before the duplicate loop executes.

### S2 · GLOBAL_DIGEST_STRING

Start from canonical `C` and add a non-forbidden extra key whose string value is digest-like:

```text
note: "sha256:613613"
```

Expected role: packet-wide carrier audit must reject the digest-like string before the duplicate loop executes.

### S3 · SEQUENTIAL_UNSUPPORTED_RULE

Plain object with an unsupported rule identity and no forbidden carrier key/value:

```text
{ rule_id: "TD613_UNSUPPORTED_SUFFIX_RULE" }
```

Expected role: packet-wide carrier audit passes. If reachable, sequential validation rejects the unsupported rule. Behind either fixed duplicate prefix, the duplicate should throw first and mask this suffix-level sequential violation.

### S4 · SEQUENTIAL_SAFE_SHAPE_DRIFT

Start from canonical `C` and add a non-forbidden, non-digest extra key:

```text
note: "SAFE_SHAPE_DRIFT"
```

Expected role: packet-wide carrier audit passes. If reachable, sequential canonical-value comparison rejects the altered finding. Behind either fixed duplicate prefix, the duplicate should throw first and mask this suffix-level sequential violation.

## Exact finite matrix

Ten hostile packets only:

```text
EARLY + S0
EARLY + S1
EARLY + S2
EARLY + S3
EARLY + S4

LATE  + S0
LATE  + S1
LATE  + S2
LATE  + S3
LATE  + S4
```

Plus five no-duplicate reachability controls using a clean A prefix:

```text
[A,C]       for S0
[A,S1]
[A,S2]
[A,S3]
[A,S4]
```

These controls establish which suffix violations are real when not masked by a prior duplicate.

No additional suffix classes or duplicate positions may be added merely because they can be invented.

## Preregistered theorem under test

```text
LEXICAL_SUFFIX_ORDER != VALIDATION_PRECEDENCE
PACKET_WIDE_PREAUDIT != SEQUENTIAL_FINDING_SCAN
FIRST_ARRAY_COLLISION != UNIVERSAL_FIRST_REJECTION_CAUSE
GLOBAL_SUFFIX_VIOLATION_CAN_PREEMPT_LEXICALLY_EARLIER_DUPLICATE
SEQUENTIAL_SUFFIX_VIOLATION_CAN_BE_MASKED_BY_LEXICALLY_EARLIER_DUPLICATE
```

The last two lines are bounded claims about this exact compiler and finite matrix, not a universal parser theorem.

## Required observations

### Clean suffix

`EARLY+S0` and `LATE+S0` must preserve the exact duplicate rejection:

```text
duplicate portable finding: EMAIL_IDENTIFIER
```

### Packet-wide preaudit suffixes

`EARLY+S1`, `LATE+S1` must reject on the exact forbidden carrier path for the suffix `raw_message` before duplicate-loop semantics can determine the outcome.

`EARLY+S2`, `LATE+S2` must reject on the exact digest-like carrier path for the suffix string before duplicate-loop semantics can determine the outcome.

The corresponding no-duplicate controls must produce the same packet-wide rejection classes.

### Sequential-only suffixes

The no-duplicate S3 control must prove `TD613_UNSUPPORTED_SUFFIX_RULE` is rejected if reached.

The no-duplicate S4 control must prove the safe extra-key C suffix differs from the canonical Local Pocket projection if reached.

Behind `P_EARLY` and `P_LATE`, however, S3 and S4 must remain masked by the earlier A duplicate and preserve:

```text
duplicate portable finding: EMAIL_IDENTIFIER
```

### No partial transport / no poisoning

Every hostile rejection must return no Carry Case, transport receipt, Hosted finding set, return envelope, or partial prefix.

Immediately after every hostile case, canonical lawful recovery `P_AB=[A,B]` must remain identical to the #1064/#1062 lawful baseline and matching/mismatch local decisions must remain stable.

A final lawful `P_C=[C]` recovery must remain canonical, proving that hostile suffix objects do not poison later lawful C construction.

### Replay

Replay the ten hostile cases in a second deterministic order in one local-only browser context. Rejection class and lawful recovery surfaces must remain invariant.

## Portable-state prohibition

No product/compiler change may introduce any of:

```text
validation_phase
preaudit_marker
rejection_priority
first_error_index
masked_suffix
suffix_class
schedule_index
prior_rejection
completion_map
receipt_chain
nonce/history
accumulated_digest
local_binding
widened authority
```

The assay may label these concepts locally in its own report only.

## Browser contract

The generated local-only browser witness must:

- exercise the exact ten hostile cases plus reachability controls and deterministic replay;
- use one browser context;
- maintain empty localStorage/sessionStorage/cookies on the successor assay surface;
- make exactly one local document request;
- make zero unexpected page-owned requests;
- retain zero release authority;
- retain human closure;
- perform no provider call or production mutation;
- agree in Chromium, Firefox, and WebKit modulo narrowly classified inherited browser-chrome diagnostics.

## Immediate falsifiers

Any of the following is direct RED:

- a packet-wide S1/S2 violation fails to preempt duplicate outcome despite current source order;
- a sequential-only S3/S4 violation behind either duplicate prefix becomes observable before the duplicate;
- a no-duplicate reachability control fails to expose its declared suffix violation;
- any rejected packet yields partial transport;
- any hostile case changes later lawful `P_AB` or `P_C` recovery;
- primary/replay disagreement;
- hidden validation-history state in portable surfaces;
- browser persistence or auxiliary egress;
- cross-engine successor disagreement;
- compiler/policy/local-binding mutation made merely to obtain GREEN.

## Interpretation guard

A GREEN result would establish an ordering property of the current repository validation pipeline. It would not prove abstract parser precedence, transactional rollback, universal short-circuit semantics, arbitrary malformed inputs, exception atomicity, concurrency safety, cryptographic integrity, or production/provider behavior.

Most importantly:

```text
GLOBAL_PREAUDIT_SEES_LATER_ARRAY_CONTENT
```

does not mean that later content was admitted into portable transport. It means only that a packet-wide rejection layer inspects it before the sequential duplicate layer begins.

## Finite stop condition

If this exact validation-layer matrix closes under Static + Chromium + Firefox + WebKit + full exact-head convergence, STOP.

Do not enumerate more malformed suffixes merely to produce another 𝄐.

A successor would require another genuinely state-bearing validation layer, an observed counterexample, or an independent empirical degree of freedom.

## Western Horizon membrane

This remains repository-internal evidence.

```text
VALIDATION_ORDER_CLOSURE != EMPIRICAL_EXTERIORITY
THREE_ENGINE_CONVERGENCE != EXOGENOUS_WITNESS
MARROWLINE_𝄐 != GOLDEN_EGG
```

Western Horizon stays at official empirical-shore rest. Golden Egg credit remains UNEARNED.

No merge. No deployment. No Vercel mutation. No live provider call.

Preregistered ⟐
