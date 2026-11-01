# Resource and capacity reconciliation

**Current prospective ceiling: 720,000 per reasoning arm**, interpreted conservatively as the entire commission across all orders/cells/replications plus allocated review and retries, pending scope confirmation. Earlier 180k and historical 60k remain distinct. The transient 540k instruction was corrected to 4 × 180k. No cap is applied retroactively.

## Accounting and formulas

Count reported input plus output once. Cached input is a subset, not a discount from scientific resource use; record it separately. Verify whether reasoning is nested in output, otherwise add its disjoint count. Missing usage is unknown, not zero. Charge an independently conservative reservation for failed/uncertain calls; if no enforceable upper bound is available, stop. All hidden harness calls, tool-model calls, compaction calls, retries and evaluator calls must be included. Subscription quota/rate windows are separate from token totals; no price or monetary cap is inferred from token accounting.

From #1616, mean input+output per successful turn is 12,034.333 (2A) / 12,357.333 (2B), not a measurement of pure harness overhead. Source sizes and history growth differ in Flight. The model uses these means only as conditional projections, not lower bounds, guarantees, High-effort observations or a powered sample.

For D documents and K = orders × RCA cells × run replications, proposed generation calls per arm are K × (2D + 2). The two extra calls are t0 and final synthesis. Attempt reserve is ceil(20% × base calls) per arm. A maximum of three transient retries per logical call does not override the smaller aggregate reserve. The hard envelope is reserved attempts × (64,000 total input + 4,096 total output) and remains hypothetical until enforced.

A separate growing-replay sensitivity calculation assumes H=11,000 harness tokens, I=512 instructions, Q=1,500 tokens per source, S=512 per earlier output and V=512 new output. For zero-based document d: 2A combined stage input is 2(H+I)+Q(d+1)+(4d+1)S; 2B is 2(H+I)+2Q(d+1)+(4d+1)S. Add both new outputs, t0, and final synthesis; then a 20% token sensitivity reserve. 2A current raw-source bottleneck and 2B full raw prefix are preserved. H/Q/S/V are hypotheses, not protected-corpus measurements. For a hard history envelope replace output history S with the enforced maximum and retokenize every actual prompt; no static byte/token heuristic proves a bound.

Stage 2 assumes at most five candidates per arm per condition; three independent calls per candidate at 8,000 total tokens each, plus one 8,000-token blinding audit per condition shared equally. Each pool receives a separate 20% attempt reserve. These are planned caps, not demonstrated service limits. Candidate overflow holds all unreviewed claims and requires a decision; never discard excess discoveries selectively. Human mathematical review and literature competence require separate time/access budgets.

## Numerical alternatives

| Scenario | Base gen calls A/B | Reserved attempts A/B | Mean gen tokens with reserve A/B | Review tokens per arm with reserve | Mean + review per arm A/B |
|---|---:|---:|---:|---:|---:|
| HISTORICAL_PLANNER_24x3 | 144 / 72 | 173 / 87 | 2,081,940 / 1,075,088 | 448,000 | 2,529,940 / 1,523,088 |
| FULL_20 | 1512 / 1512 | 1815 / 1815 | 21,842,315 / 22,428,560 | 5,360,000 | 27,202,315 / 27,788,560 |
| FULL_24 | 1800 / 1800 | 2160 / 2160 | 25,994,160 / 26,691,840 | 5,360,000 | 31,354,160 / 32,051,840 |
| FACTORIAL_ONE_ORDER | 200 / 200 | 240 / 240 | 2,888,240 / 2,965,760 | 596,000 | 3,484,240 / 3,561,760 |
| SINGLE_PASS_24 | 50 / 50 | 60 / 60 | 722,060 / 741,440 | 152,000 | 874,060 / 893,440 |
| MINIMAL_LONGITUDINAL_3 | 8 / 8 | 10 / 10 | 120,344 / 123,574 | 152,000 | 272,344 / 275,574 |

FULL_20 and FULL_24 each use four RCA cells × three orders × three run replications = 36 conditions per architecture. Neither three replications nor four cells proves power. Adding both Medium and High blocks doubles those example counts; High actual token demand is unknown, so no measured multiplier is asserted. Held-out or fresh withdrawal-counterfactual lanes and additional candidate controls are NOT free: add their exact schedule through a new approved assumption set.

The historical planner row preserves its 144/72 generation-call arithmetic without t0/final calls; it does not inherit this package’s primary matched comparison. Its source planner assumed only three review calls and a 50% reserve over 219 base calls (329 high-water). Our review workload is separately explicit and cannot be replaced by that three-call shorthand. Its input-only observed-mean projection is 1,689,072 / 869,316; input+output is 1,732,944 / 889,728 before retries.

## Bounded finding and smallest defensible alternative

The complete 20–24-document scientific design does not fit 720k per arm under any full-design projection here. Even SINGLE_PASS_24 exceeds 720k with its retry and independent-review forecast and omits the original factorial/order/replication questions. Authorizing a per-condition reset would change the total budget and must be an explicit new decision, not a bookkeeping trick.

The smallest proposition/contradiction/revision sequence is D=3, one order, one condition, one run. Its full five-candidate review forecast is approximately 272,344 / 275,574 total per arm including reserves (see machine results). A conditional hard envelope under the NEW 720k cap is: ten generation attempts × (52,000 input + 4,096 output) = 560,960; candidate-review reserve of eighteen calls × 8,000 = 144,000 per arm; two shared blinding attempts × 8,000 / 2 = 8,000 per arm; total **712,960 per arm**, leaving 7,040. Stage 2 has 38 maximum shared attempts. This requires effective bounds for both generators and reviewers and at most five reviewable candidates per arm. It cannot promise future evidence fits and permits no truncation.

This is a limited longitudinal microstudy proposal, NOT the original protected Flight, not a powered architecture comparison, and not coverage of all seven dimensions. It must have separate explicit scope/source-selection approval, retain nulls and unreviewed candidates, and confer no empirical replication or emergence advantage credit. The earlier 180k illustrative envelope is preserved in assumptions only; its reduced review workload was not adequate for the fuller candidate forecast.

## Reproduction

Run node capacity-model.mjs to print arithmetic or node capacity-model.mjs --write to regenerate capacity-results.json. No model, CLI, protected source, network or grant operation is invoked. Input assumptions and every generated result are bound in the reproducibility manifest.

Context sensitivity: with the stated growing-replay assumptions, FULL_24 reaches peak total inputs of 71,064 / 72,088 per call, exceeding the proposed 64,000 cap. FULL_20 peaks at 60,968 / 61,992. These are hypothetical content-length scenarios, not observed protected lengths. A source prefix that fails the frozen limit must hold; the model does not silently raise the cap or truncate.
