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

The source baseline is main `d684d61c8c73e8d79a30167de9af51f5454c40ff`. A local 60-file dependency closure was compared to exact Git blob hashes before editing; it is not a full repository checkout. Validation is offline and source-bound. New Gemini calls, reservations, result admissions, merges, releases and deployments are zero. Existing a19 release and the 88/$10 shared reservation policy are preserved. A prospective export is not frozen, enrolled, executed or empirically validated.
