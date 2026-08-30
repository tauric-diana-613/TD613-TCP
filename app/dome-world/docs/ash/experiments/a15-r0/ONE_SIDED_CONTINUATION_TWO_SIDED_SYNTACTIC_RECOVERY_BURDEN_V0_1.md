𝌋⟐

# A15-R0 · One-Sided Continuation Collapse / Two-Sided Syntactic Recovery · Execution Burden v0.1

Exact earned parent:

```text
#900 / fa1c369abe3e628a92405aef03aeb6f9e2f76087
run 2402 / 33336622536 — SUCCESS
```

Frozen before theorem implementation.

## Finite reconstruction burden

```text
all self-functions Q->Q                          3,125
order-preservation relation checks             78,125
continuous diagnostic actions                     128
ordered action composition closure checks      16,384
unordered distinct action pairs                 8,128
state-indexed action-pair cases                40,640
future actions per state-indexed pair             128
complete right-context readout comparisons  5,201,920
endpoint-alias state-indexed pairs             13,472
alias future readout comparisons            1,724,416
endpoint-separated state-indexed pairs         27,168
```

## Bounded two-sided witness construction

The implementation may not substitute an opaque `128 x 128` context-pair brute force for the structural theorem.

It must independently build:

```text
5 baseline-A access rows
10 unordered endpoint-pair suffix separators
8,128 explicit distinct-action context witnesses
```

Access construction scans all 128 actions for each target state:

```text
5 * 128 = 640 endpoint checks.
```

Suffix-separator construction scans all 128 actions for each unordered distinct state pair:

```text
C(5,2) * 128 = 1,280 Moore-readout separator checks.
```

Every distinct global action pair is scanned across all five coordinates to establish at least one differing input coordinate:

```text
8,128 * 5 = 40,640 coordinate inequality checks.
```

The selected differing coordinate determines one access action `x`; the resulting distinct endpoints determine one suffix separator `z`. The final context-witness verification burden is exactly:

```text
8,128 witness checks.
```

## Required independent hostile reconstruction

The hostile must separately:

1. reconstruct the specialization order from the inherited topology certificate;
2. enumerate all 3,125 self-functions;
3. recover all 128 order-preserving continuous endomorphisms;
4. verify the 128 actions are closed under all 16,384 ordered compositions;
5. rebuild all five endpoint-fibre distributions;
6. enumerate all 40,640 state-indexed unordered distinct-action cases;
7. evaluate every one of the 5,201,920 future-action readout comparisons;
8. prove right-context equivalence agrees exactly with endpoint equality;
9. independently construct access actions and endpoint-state suffix separators;
10. furnish and verify a bounded two-sided context witness for every one of the 8,128 distinct global action pairs;
11. compare only after reconstruction against the child certificate.

## Forbidden shortcuts

```text
NO random sampling
NO treating same immediate Moore output as residual equivalence
NO importing the parent action list as an opaque expected table
NO using serialization identity as behavioral equivalence
NO inflating state-only nonrecoverability into historical source erasure
NO calling endpoint collapse procedural memory
NO changing the inherited task topology or Moore readout
NO merge/deploy/release/publication/Vercel
```

## Pass condition

All frozen census values must match exactly; all right-context endpoint-kernel mismatches must be zero; all alias future-readout mismatches must be zero; all 8,128 distinct global action pairs must receive a valid bounded two-sided context witness; and the quotient cardinalities must close at exactly `5` versus `128`.

Frozen before implementation.

Sealed ⟐
