𝌋

# Aperture × Pedagogue Bilinear Program Synthesis Receipt v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-bilinear-program-synthesis-receipt/v0.1`  
**PR:** #706  
**Scientific parent:** #705 receipt `da115526bdf2932dd0cacc93fc2b5efd879b6b8d`  
**Status:** EVIDENTIARY CLOSURE / DRAFT STACKED / STATIC-OPERATOR ONLY

## 1. Historical witness coordinate — pre-repair architecture

```text
run_number = 2060
run_id = 32672358323
witnessed_head = d8bca72e17ac5003a7d7fb99344ed90fefe2af02
static_job_id = 97274998499
conclusion = success
A15-R0_static_execution = success
browser/full-repository/self-hosted lanes = skipped
literal_stdout = NOT_RETRIEVED_BY_CONNECTOR
```

Run 2060 remains a valid historical witness of the pre-repair implementation at `d8bca72e...`.

A later architecture audit found that the then-current `programSelector()` traversed `synthesizeProgram()`, which computed synthetic responses using frozen hidden operator `T` even though the selector's score did not consume those response values. That dependency violated H6's oracle-isolation membrane.

Therefore:

```text
run_2060_success != witness_of_repaired_selector_architecture
later_repair != retroactive_reclassification_of_run_2060
```

## 2. Oracle-isolation repair

```text
repair_commit = 0dc43a4776db87a2e47ef291c5a91774f5e54f59
hardened_test_commit = e7dc0318ffe90b0329d5285d8452bf52ebdecfdd
```

The repair separates:

```text
program geometry used for selection
!=
fixture response execution used by the synthetic evaluator
```

`programSelector()` now receives the declared current null direction explicitly, operates only on coefficient geometry/action cost, rejects hidden operator/future-response/synthetic-oracle fields, and does not traverse response-generation code.

The scientific target, operator covenant, target functional, component probes, action costs, efficiency objective, order control, and claim ceiling remain unchanged.

## 3. Closure witness — repaired architecture

```text
run_number = 2061
run_id = 32672528502
witnessed_head = e182a0188266bcaac857591e06a9f59e9dd7330b
static_job_id = 97275437401
conclusion = success
A15-R0_static_execution = success
browser_shards = skipped
full_repository_validation = skipped
self_hosted_calibration = skipped
literal_stdout = NOT_RETRIEVED_BY_CONNECTOR
```

The exact repaired head survived the existing consolidated A15-R0 static gate. #706 was restored to its true #705 scientific parent before this receipt amendment.

```text
receipt_document_commit != witnessed_head
```

The later documentation coordinate does not rewrite witness time.

## 4. Bounded result

Under the explicit frozen-operator covenant, the one-shot-inadmissible trace functional

```text
H_trace = [[1,0],[0,1]]
```

is exactly synthesized by the two admissible rank-one actions

```text
H1 = [[1,0],[0,0]]
H2 = [[0,0],[0,1]]
H1 + H2 = H_trace.
```

For the authored hidden operator, component responses are computed by the fixture evaluator and sum to the trace response. Selection itself remains response-oracle isolated.

The program costs 2 actions; the rank-2 target cannot equal any one rank-one bilinear coefficient matrix in this fixture.

The assay-local cost-normalized nullspace objective prefers the single informative legal action over the cost-2 trace program even though the trace direction is program-realizable.

Under the frozen operator and scalar-addition aggregation:

```text
P1 then P2 = P2 then P1
```

This is retained as a negative control only.

## 5. Earned anti-equivalences

```text
inadmissible as one action != unrealizable as multi-action program
program-level reachability != one-action reachability
program-realizable != cost-optimal
selector geometry != fixture response oracle
historical pre-repair pass != repaired-architecture witness
order-independence under frozen operator != order-independence under endogenous operator transitions
```

## 6. Canonical bounded claim

```text
A_LINEAR_FUNCTIONAL_INADMISSIBLE_AS_ONE_DECLARED_BILINEAR_ACTION_CAN_BE_EXACTLY_REALIZED_AS_A_HIGHER_ACTION_COUNT_SUM_OF_ADMISSIBLE_RANK_ONE_BILINEAR_PROBES_IN_THE_AUTHORED_STATIC_2X2_FIXTURE_WHILE_PROGRAM_REALIZABILITY_DOES_NOT_IMPLY_COST_OPTIMALITY
```

## 7. Claim ceiling

Still false / unauthorized:

```text
general minimal-rank decomposition theorem promotion
canonical operator tomography promotion
blind / physical tomography
endogenous sequential transport
path category / path groupoid
holonomy / curvature
Berry / quantum
Proto-Loom
A16 reopening
merge / production / Vercel authority
```

## 8. Next bounded seam

The static control now permits one sharper question:

> If the component questions have declared operator transitions, can two programs contain the same actions, reach the same final operator, and nevertheless produce different cumulative observation transcripts because each scalar response is sampled at a different point along the route?

That assay would distinguish:

```text
same endpoint operator
!=
same route-conditioned observation transcript
```

without requiring noncommuting transition operators and without earning holonomy.

𝌋

Sealed ⟐
