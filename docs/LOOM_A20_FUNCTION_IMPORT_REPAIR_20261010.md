# A20 credential observation: function-startup repair

Operator authority: Tawanna C. Miller's active October 10 instruction to
diagnose, repair and deploy the credential-observation failure, then resume the
previously authorized four-call A20 experiment.

The current production release `bb6d5efd9fcebe1ec1959b92f9bf543e23dc11ca`
returned HTTP 500 with `x-vercel-error: FUNCTION_INVOCATION_FAILED` on the
read-only credential operation. No authentication, reservation or provider
request was needed to reproduce the startup failure.

The API imports Loom's evidence diagnostic, whose transitive engine graph
reaches `flowcore-choreography.js`. Its browser-versioned import of
`dome-art-lattice.js?v=20261010-viewport-cadence-v1` loads in an ordinary Node
checkout but cannot be resolved by the serverless file tracer.

With `@vercel/nft` 1.11.0, the original route trace contained 85 files, reported
that unresolved dependency, and failed an isolated traced-bundle import with
`ERR_MODULE_NOT_FOUND`. Removing only the shared import's query suffix produced
86 files, zero tracing warnings and a successful isolated import. Browser entry
versioning remains on the workspace loader. Animation functions, reviewed A20
candidate, trial manifest, provider configuration, budget and scoring are
unchanged.

`tests/loom-assay-credential.test.mjs` now walks the complete route's local
import closure. The regression fails against the original query-suffixed path
and passes after the repair; it is included in the existing transport CI lane.
Factory tests alone had accepted the handler while missing this packaging seam.

The tracer reproduction establishes a local packaging defect. Production
acceptance still requires exact-head GREEN, one issue #405 release, relock,
and a fresh authenticated credential observation bound to the actual release
SHA. That observation grants no receiver-success or custody-admission claim.
No A20 policy was frozen and no call or reservation occurred during diagnosis.

The offline enrollment preparer also omitted the run ID when selecting its
manifest, so it incorrectly checked A20 against the historical candidate.
A CLI regression reproduced `ASSAY_ENROLLMENT_ARTIFACT_MISMATCH`. Passing the
already-validated run ID to the existing manifest selector fixes that second
preexecution blocker; a changed candidate digest still rejects preparation.
This only prepares inert enrollment material and performs no database write.

Seal: ⟐
