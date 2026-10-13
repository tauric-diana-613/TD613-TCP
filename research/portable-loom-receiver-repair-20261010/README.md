# Receiver repair candidate

The frozen c3eff42 assay exposed missing footers and receipts, scalar/null receipt missingness, unsupported host identity, incomplete Gate fields and method/nomenclature omissions. The source repair carries clearer output obligations in fresh v0.4 roots. It does not rewrite the measured v0.3 artifact or convert the original captures into passing results.

The candidate artifact is generated from source commit `983c957e989676fed7525be3835f8b8b06957e76`. Its root, packet digest and file hashes are recorded in `candidate-artifact/MANIFEST.json`. No source documents, Gate outcomes or admitted work are seeded. The receiver transport manifest points to this candidate for a future exact-source release; the historical artifact remains at its original path. This manifest selection does not itself authorize deployment or a provider call.

Local validation: the existing session/challenge suite and four captured-receipt/label regressions pass (18 tests). These are local structural checks; revised prompt efficacy is NOT_RUN. The new candidate independently recomputes its canonical core, matches the root packet digest, and contains no seeded results.

The original R06-2 continuation remains incomplete. a10 was held at budget preflight because predecessors are scoped to the same run, with zero provider requests and zero reservations. The separately frozen a11 fresh trial captured turn 0, then stopped on a provider HTTP 503 at turn 1; turn 2 was not attempted. The original a7 provider 503 remains separate. No predecessor rows were fabricated or copied to bypass the ledger.

The program now has 60 reserved calls and $6.93081 reserved cost, with no ACTIVE runs. This is a reservation ledger, not actual billing. The prospective 16-call targeted retest stays inside the existing 80-call/$10 ceiling, even reserving the full $0.18072 per-call bound. Its plan is `RETEST_PLAN.json`. Runtime policy must be separately frozen against the exact reviewed deployment commit and enrolled only after the issue #405 release gate is satisfied. It stops on the first HOLD, has no automatic retries, and grants no custody admission.

Reach assessment: this repair clarifies the existing output/receipt contract and preserves task, review, sending, Check, Admit and Rest order. It adds no custody capability or new product route. The Pedagogue shortcut's material route-redesign gate is therefore not invoked. Aperture's observation boundary is retained: only captured visible replies are adjudicated; no hidden-host identity, retention or process measurement is inferred. The retest samples the same declared cases with a new, explicitly separate source artifact. No shared core mechanism is promoted from these observations.

Production acceptance requires exact-source GREEN validation, the reviewed issue #405 release, fresh bounded provider captures, and separate browser witnesses where applicable. This candidate has no merge or release grant. ⟐
