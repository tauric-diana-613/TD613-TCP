# Portable Loom bounded model harness receipt

The actual model trials have **not run**. This tranche implements the bounded provider client, captures exact request/response bytes, prepares the frozen requests, and checks the capture/admission boundary. The final engineering run passed **11 tests, zero failures or skips** using mocked HTTP only. Its source hashes and original stdout/stderr are retained in `research/portable-loom-provider-conduit-20261009/raw/engineering-attempt-002/`. The earlier engineering attempt is retained separately.

## Why these calls

The receiver track asks whether the exact standard portable Loom's instructions survive actual model turns: authorization, rest, footer persistence, Gate invocation, honest evidence classification, and return/re-entry. The comparison asks whether four isolated Dollhouse reviews with a deterministic clerk help on the registered endpoints relative to a monolithic review and conventional code. These are separate questions.

| Work | Planned model calls | Calculation |
| --- | ---: | --- |
| First configured receiver, Gemini | 54 | 18 registered user turns across R01–R12 × 3 repetitions |
| Monolithic audit, arm A | 36 | 12 fixed cases × 3 repetitions |
| Four-role audit, arm D | 144 | 12 fixed cases × 3 repetitions × 4 isolated roles |
| Temporal Custodian and conventional arm E | 0 | Deterministic code; the retained E run is not repeated |
| First Gemini receiver plus comparison | **234** | 54 + 36 + 144 |
| Second provider receiver | 54 | Same receiver cases and repetitions |
| Full two-provider plan | **288** | 234 + 54 |

The protocol permits at most four outputs per receiver trial. That yields safety ceilings of 324 calls for the first receiver plus comparison and 468 for the full plan; it does not require inventing additional user turns. The 72 primary receiver trial coordinates are case/repetition/receiver identifiers, not 72 individual requests. Three repetitions do not create three independent cases. A second Gemini model alone does not establish cross-provider portability. The arithmetic and complete registered turn counts are retained in `CALL_COUNTS.json`.

## Existing repo Gemini route

Two actual HTTP GET responses from `https://td613.com/api/khonapolit` and its `operation=gemini-readiness` path report a configured server-side Gemini key and primary model `gemini-3.8-flash`. Exact response bodies, timestamps and digests are retained. This refines the predecessor receipt's statement about absent **local** credentials; it does not retroactively credit a model trial. The listing is not an inference, quota, price or quality witness. Equality between inspected source and live deployed bytes remains unestablished.

The inspected native handler adds product instructions, can fall back across models, can perform a structural repair, permits six provider requests per human request, and uses a 65,536-token output ceiling. The frozen comparison instead requires one request per role, 2,048 output tokens per role, 8,192 for the monolith, matched model/decoding settings, and zero primary retries. The Loom task endpoint has a 60,000-character input ceiling and a task-specific output schema. Neither existing path is an eligible unchanged transport for these prompts. The release-canary lane is not repurposed as research authority.

The repository's Gemini credential remains server-side. This tranche does not expose it, bind consumer accounts, deploy a new endpoint, alter product code, merge main, or touch issue #405. A compatible invocation path in an already configured server runtime, or a separately authorized bounded server-side route, remains to be bound. No such live route is claimed to have been installed here.

## Implemented mechanism

`assay-harness.mjs` supplies provider-neutral Gemini GenerateContent and OpenAI Chat Completions wire construction, explicit output limits, pre-request input/cost reservations, a locked call journal, zero automatic retries, non-overwriting attempts, exact raw-byte retention, response-model/usage/completeness checks, and strict role-return admission. It retains failed attempts rather than replacing them. API headers containing credentials are not retained. A response that echoes the credential is held and its raw secret-bearing bytes are excluded from releasable evidence.

Receiver continuation loads prior retained actual captures, checks trial/case/order and request/response digests, and rebuilds the next request from the frozen artifact plus those exact answers. It rejects fixture captures and altered or cross-trial predecessors. Governed synthesis admits four checked captures from the same bound trial, preserves original findings and declared HOLDs, and uses the deterministic Temporal Custodian sidecar. A fabricated in-memory capture cannot enter that path. These checks establish local byte consistency, not independent proof of provider origin.

The client is **not** a deployed repository API route. It requires a configured execution environment. `TRANSPORT_BINDING.template.json` deliberately leaves the exact protocol commit, financial ceiling, and verified prices unbound. It is a template, not execution authority. The current user instruction permits using the repository Gemini integration; it does not supply a numeric financial ceiling or install an eligible route.

## Frozen request retention

`REQUEST_INDEX.json` retains 180 comparison call coordinates and 72 receiver primary trial coordinates. Its lossless `PREPARED_PROMPT_ENVELOPES.jsonl.xz` contains 72 exact templates: 60 case/role envelopes and the first-turn messages for 12 receiver cases. Continuations require actual captured answers and are not manufactured in advance. Uncompressed JSONL: **6,117,877 bytes**, SHA-256 `d6f1ba5b1b9e09a308c4cb98c4fdb93b92d324a1d0dac856dc4b66ab2372fba5`. XZ: **46,272 bytes**, SHA-256 `9c5256fd5469bd29ae366d86a5e0a4a6f288578831466fc1a7a52941dbf803d9`. Only lossless packaging changed; prompt bytes did not.

The runner rechecks 44 predecessor source/input commitments and its own committed source before a real call. The private scoring key remains outside runner inputs and outside this repository. The standard portable artifact is unchanged. Existing local battery and E baseline results are retained without rerunning them. No historical research sequence is reopened.

## Execution entry points

Run from the repository root in the exact committed runtime with a completed premeasurement binding and an already configured provider credential. The CLI accepts one registered call at a time; the shared journal enforces the declared limits.

```text
node research/portable-loom-provider-conduit-20261009/run-model-assay.mjs call-comparison <binding> <K-case> <role|MONOLITH> <COMPARE-Kxx-repetition> <new-attempt-directory> <budget-journal>
node research/portable-loom-provider-conduit-20261009/run-model-assay.mjs call-receiver <binding> <R-case> <FIRST_CONFIGURED_RECEIVER-Rxx-repetition> <prior-capture-refs-json|EMPTY> <new-attempt-directory> <budget-journal> <output-token-limit>
node research/portable-loom-provider-conduit-20261009/run-model-assay.mjs admit-D <binding> <K-case> <four-role-capture-directory> <new-result-file>
```

**Evidence ceiling:** engineering source and `LOCAL_STRUCTURAL_TEST` only, plus two deployed metadata responses. Actual model calls: **0**. Actual receiver trials: **0**. Simulated receiver trials: **0**. No orchestration superiority, hidden-provider privacy, independent empirical witness or Golden Egg claim follows.
