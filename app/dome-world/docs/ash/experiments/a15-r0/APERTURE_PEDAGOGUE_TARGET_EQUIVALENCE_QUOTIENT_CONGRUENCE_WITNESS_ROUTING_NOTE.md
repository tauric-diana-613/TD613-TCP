# Temporary witness routing note

Routing-only metadata for #729 exact-head consolidated validation. Original scientific head before routing: `c6fdcd3987950cff7ef98ba5e26917f71047b9d6`.

PR #729 is temporarily targeted at fresh `main` solely to register the exact-head static witness.

## Preserved run-2124 diagnostic scar

Run `2124 / 32725332014` failed at A15-R0 step 19 before any success classification. The failure is preserved. Inspection identified a test-shape mismatch in the transition-locality control: the concrete `K_period4` projection was compared byte-for-byte against the same symbolic target carrying the additional wrapper field:

```text
status = SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED
```

This wrapper field is not part of `K_period4` operational equality.

Wrapper-only repair commit:

```text
2c2dff6425eb3e26244259da2ac60eab85515dc8
```

## Preserved run-2128 diagnostic scar

After the wrapper repair, same-head registration produced run `2127 / 32725767354` cancelled by concurrency and surviving run `2128 / 32725803225`. Run 2128 failed at A15-R0 step 19 before any success classification and remains preserved.

Inspection identified a representative-control defect in `congruenceCertificate()`. The typed-composition premise requires the second-stage representative words to belong to the same quotient class, but the authored control used:

```text
q = T Q Q   -> c(q) = (1,0,2)
r = Q Q T   -> c(r) = (1,2,0)
```

Therefore `sameCoordinate(cq,cr)` was false by construction and the control never instantiated the theorem premise.

## Pre-second-repair boundary

Before executable repair, the only authorized change is:

```text
replace q = TQQ and r = QQT
with the distinct equal-class representatives
q = TTQ and r = QTT
```

because:

```text
c(TTQ) = (2,1,0)
c(QTT) = (2,1,0)
TTQ != QTT
```

Frozen and unchanged:

```text
#729 theorem statement
parity-twisted star law
source-relative jurisdiction
associativity obligation
right-congruence statement
typed-composition statement
all hostile controls
claim ceiling
human stop
workflow timeout
```

No failed assertion is rewritten as success. Runs 2124 and 2128 remain diagnostic provenance; run 2127 remains concurrency provenance.
