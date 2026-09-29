# Finite observer chamber — implementation and handoff

Continuation date: 2026-09-28 ET. Base: `eb558b0e9297ab6d2f0df9a59b3f14a3691b53f1`.
Branch: `feat/loom-observer-chamber-20260928`.

## Decision and bounded contract

The operator authorized continued building, testing and governed releases after #1386 deployed, then directed this session to preserve work in a PR for 5.6 Chat because of remaining usage limits. This tranche implements document 03's first legitimate path: a declared finite synthetic population. It does not resolve or default the empirical episode, G, or inherited threshold questions.

The chamber is in the existing Loom laboratory, reachable at `/dome-world/holonomy-loom.html#loomObserverChamber`. Its ES modules read only six authored synthetic cases. They do not consume the composer, conversation, provider route, storage or credentials. Mounting calculates nothing. Run is an explicit gesture; observer/case changes invalidate the prior result; Rest clears the result. No animation clock, network transport, export, capture hook or enforcement adapter is added.

## Mathematical implementation

Each bounded model declares positive safe-integer probability masses on at most 1024 rows and at most six channels. A row retains secret H, prior B, auxiliary K, permitted projection P, expected authorized answer, and separate control/candidate answers and traces. Both routes share that row's population state. P is never silently added to observer knowledge. Primitive value types remain distinguishable in the tuple encoding.

The calculation enumerates I(H;B,K), I(H;B,K,Z), their difference I(H;Z|B,K), remaining entropy, Bayes-optimal recovery probability, exact-match authorized-task accuracy, all captured channel subsets, and ordered conditional increments. Signed excess is the joint additional information minus the sum of single-channel additional contributions. It is retained as a diagnostic, never a privacy verdict. This conditional diagnostic is not a silent replacement for historical Golden Egg J.

Integer masses define a complete finite law; logarithms use floating-point arithmetic. This is finite enumeration, not sampling, exact symbolic arithmetic, a population estimator, differential privacy, or an attack benchmark. These modeled answers are not empirical C; simple answer accuracy is not inherited R. No L/R/J historical threshold is applied.

Missing selected channels produce HELD and a null complete-view result. Captured subsets remain separately inspectable. Declaring a channel CAPTURED only asserts a value exists in the synthetic table; it does not prove capture completeness in any actual system. Narrowing selection changes the question and does not repair an omitted channel. Malformed or empirical-class inputs are INADMISSIBLE. Every result retains zero empirical credit, UNEARNED Golden Egg and false release authority.

## Cases and falsifiers

1. Already-known bit: zero additional information, one total bit.
2. Length channel: identical correct answers, one leaked bit until fixed-length transformation.
3. Three-share parity: every proper subset has zero information; triple has one bit.
4. Duplicate disclosure: signed excess is minus one bit while total disclosure remains one bit.
5. Missing error channel: complete candidate view is HELD, never filled with zero.
6. Task requires the bit: removing disclosure reduces authorized-task accuracy to one half.

## Pedagogue and Aperture audit

The design fixture preserves NOTICE → ACT → WORLD_ANSWERS → NAME → REST. Its baseline/proposed burden descriptors are intentionally equal: PASS establishes retained declared constraints, not a measured usability improvement or comprehension study. Human closure remains necessary for scientific claims.

The Aperture-relevant observation geometry is the finite equivalence partition induced by selected values. Subset and coarsening tests ensure information and optimal recovery cannot improve by forgetting data. No linear/Gaussian rank or covariance was invented to invoke an unrelated Aperture engine. Missing empirical geometry remains missing. This is a direct mathematical audit, not an independently executed Aperture certification.

## Verified here

- 18 new kernel/DOM tests passed, plus existing theater DOM and hosted-product integration: 20 passing test entries.
- Pedagogue Design Gate passed with zero burden deltas, preserved AIA invariants and rest/exit.
- Tests cover weighted priors, auxiliary knowledge, type distinctions, row duplication/permutation, channel order, subset monotonicity, missingness, malformed inputs, immutability, no authority promotion, stale-result invalidation and composer isolation.
- No whitespace errors in the changed diff.

## Outstanding work for 5.6 Chat

1. Read current AGENTS and release law, then inspect the live PR head, diff and CI. Fix genuine reds without weakening assertions. New tests and the design fixture are included in the fast contract job.
2. **Finish rendered UI verification.** Agent-browser could not start its daemon; local Playwright lacked its Chromium executable. DOM tests are not visual verification. Use an available browser or install the supported browser dependency; check 390px and desktop, keyboard/focus, long subset labels, contrast, no page overflow, all six cases, case/observer invalidation and Rest. Inspect the actual Loom context, not just a detached screenshot.
3. The operator specifically requested tidy UI/UX. Current styling uses Loom's plum/gold palette, bounded tables and optional inspection. Refine spacing/hierarchy after looking at it; keep primary disclosure and utility clear. Raw JSON stays behind inspection. Do not claim the visual pass is complete.
4. Re-run the 18 focused tests and applicable repository contracts after changes. Verify the final merge result, merge only a current green head, and release through #405 under the operator's explicit continued deployment authorization.
5. Verify the exact-source production receipt, served application bytes, stability guards and closed Git auto-deploy lock. Browser-check the new chamber on the deployed Loom page. Marrowline is unchanged by this tranche.

Superdesign's CLI analytics request was blocked by automatic approval review because its payload was unknown; no canvas draft was obtained. Do not retry by evading that rejection. Local code styling and ordinary browser verification remain available alternatives.

No deployment occurred in this implementation session. Golden Egg remains UNEARNED; Western Horizon remains 𝄐.

⟐

## Operator's final UX scope and production inspection

The operator explicitly identified **Marrowline Gate only** and **Holonomy Loom** as needing UX repair; they described the rest of Marrowline as amazing. Preserve the conversation surface and its existing design. This tranche does not fix those existing surfaces.

A desktop cloud-browser inspection of both production pages succeeded after the local-browser failures above. In Marrowline, opening Gate reveals a narrow right drawer with three simultaneous, text-heavy comparison columns. Each column is roughly a hundred pixels wide, producing excessive wrapping and a long introductory scroll before the actual controls. The drawer overlays the conversation. In Loom's initial desktop viewport, an oversized hero, repeated instructional blocks and nested panels dominate; the task editor competes with a tall route panel. These are observed layout problems, not a completed usability study. Mobile and the new chamber remain unverified visually.

Next UI work: make Gate a readable single-column sequence within its drawer, with a concise mode choice, nearby inputs/action, then outcome; put detailed comparison prose and raw evidence behind optional disclosure. Preserve explicit distinctions between local control, public boundary and authorized operator control. For Loom, shorten the hero and consolidate instructions, reduce nested framing, prioritize the task and its next action, and keep the route explanation and optional laboratory subordinate. Preserve existing behavior and scientific limits. Verify actual renders at desktop and 390px, keyboard access, scroll/overflow and relevant end-to-end flows before declaring UX finished. Do not equate this implementation's passing mathematical tests with completion of either redesign.


## 2026-09-29 continuation — targeted UX implementation

The operator-authorized continuation now changes only the previously identified weak surfaces:

- **Marrowline Gate** is rendered as one vertical sequence: choose one declared condition, use its nearby action, read the observed outcome, then open comparison prose or matrix/raw receipt only when needed. Local seed and operator token fields are contextual to their selected condition. Public and operator fires remain the same declared endpoint experiment; local remains no-network.
- **Holonomy Loom** now gives the task editor the primary vertical position. The living route remains visible and inspectable rather than disappearing, but it is visually subordinate beneath the task. The hero, demo invitation, laboratory entry, observer chamber and repeated supporting chrome are compacted. The 420px/760px CSS contracts keep controls one-column where needed and preserve 16px task input text.
- **Finite observer chamber** remains optional inside the laboratory, synthetic-only, explicit Run/Rest, stale-invalidating, and zero empirical credit.

Static/DOM contract tests are part of the normal PR validation lane. They establish source behavior and declared responsive constraints only. No claim of human-comprehension improvement, pixel-perfect physical-device rendering, empirical privacy, Golden Egg acquisition or Western Horizon reopening follows from those tests. If the repository's current release policy scope-skips deep browser estates, that skipped diagnostic remains a limitation rather than a fabricated witness.

Golden Egg remains UNEARNED; Western Horizon remains 𝄐.
