# Portable Loom receipt conformance repair — 2026-10-10

The selected receiver corpus contains five Receipt labels that omit the required unverified/unadmitted qualification. One a18 R06-2 answer also summarizes an unnamed inline source while declaring no used IDs and no missing information. This prospective patch makes the status instruction concrete and supplies an offline declaration inspector with separate origin source accounting.

Receiver-created receipts now use `DECLARED_UNVERIFIED_UNADMITTED`. A source without a supplied origin-registered ID records `SOURCE_IDENTIFIER_UNREGISTERED` in `missing_information` and keeps its source-accounting HOLD. The existing nine-field receipt schema remains intact. The inspector compares root, policy, anchor and an independently supplied task; its source context separately supplies registered IDs, observed used IDs and an unidentified-source count. Missing context stays unobserved. Neither an inline alias nor a receiver assertion creates registration.

`QUALIFIED_DECLARATION` means only that these bounded presentation/schema/reference/accounting comparisons passed. It supplies no receipt authentication, semantic truth, exclusive source-use, hidden-host enforcement or admission authority. This inspector is an offline review tool; it does not modify the existing custody admission path or install enforcement in a foreign receiver. Historical answers, frozen policies, failed runs and replacement states remain separate and immutable.

## Reproduction

```sh
node --test tests/portable-loom-core.test.mjs tests/portable-loom-receiver-receipt-regression.test.mjs tests/portable-loom-receiver-conformance.test.mjs
node scripts/check-portable-loom-receiver-conformance.mjs tests/fixtures/portable-loom-conformance-captures-20261010.json fresh-review.json
```

The second command deliberately exits 1 after writing the historical HOLD review. It checks all 16 answer hashes, detects the five footer omissions and preserves eight task receipts as unadmitted. Their origin task bindings and source mappings are not reconstructed from receiver prose. R06-2 turn 1 retains an explicit prior manual observation of one unidentified selected source; no historical ID is invented. Output creation is exclusive. The tests include valid registered-source/no-source controls, unresolved IDs, source omissions/aliases, overclaims, malformed schemas, altered hashes, accessors, sparse arrays and custody non-advancement.

The source baseline is main `d684d61c8c73e8d79a30167de9af51f5454c40ff`. A local 60-file dependency closure was compared to exact Git blob hashes before editing; it is not a full repository checkout. Validation is offline and source-bound. New Gemini calls, reservations, result admissions, merges, releases and deployments are zero. Existing a19 release and the 88/$10 shared reservation policy are preserved. Prospective exports are not frozen, enrolled, executed or empirically validated.

## Substantive review correction

Review of the green `440843b` checkpoint reproduced false qualification of detached receipts and clean sidecars contradicting the actual answer. Body checks defaulted off, and the CLI inferred receipt applicability from whether a receipt was present. The revised inspector parses a unique receipt from captured prose JSON fences or a strict JSON task result, rejects duplicate keys/multiple receipts, compares any supplied sidecar, and checks body qualification by default. The CLI requires a task receipt by default; activation/Gate/strict-schema exemptions are explicit input declarations taken from the frozen case scope. Disabling body inspection yields `PARTIAL_DECLARATION_INSPECTION`.

Current focused validation: **55 passed, 0 failed**, including ten new boundary regressions. The original 45-test receipt and earlier green CI remain historical. `review-addendum/reproduce-boundary.mjs` compares the exact preserved prior inspector against the correction using local synthetic counterexamples. All 16 historical answer hashes remain identical; all eight parsed task receipts match their sidecars. Five footer omissions and the R06 source HOLD remain visible. Seven body texts lack the narrow literal qualification signal; those flags require semantic review. In particular, R02 turn 1 already describes downstream verification before admission, so seven detector flags must not be presented as seven new empirical failures.

The prior candidate remains under `candidate/`; `candidate-reviewed/` binds the corrected inspector source separately. Both remain prospective and unexecuted. The source-accounting context still requires independently supplied origin evidence. The checker cannot establish the truth of caller-supplied context or identify hidden source use.
