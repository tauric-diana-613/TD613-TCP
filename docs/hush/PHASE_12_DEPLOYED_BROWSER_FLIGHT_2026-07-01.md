# Hush Deployed Browser Flight - 2026-07-01

## Scope

Target: `https://td613.com/adversarial-bench.html`

The flight covered:

- all 13 active masks, twice each, through the strict Vercel provider;
- forensic, technical, relational, forum, high-pressure, minimal, and conversational probes;
- protected identifiers, dates, timestamps, configuration keys, negations, and caveats;
- Customizer clear/log/edit/save/undo/reset/persistence behavior;
- Phase 39 reader, lockbox, clean receipt, report, packet, provider-log, profile, swap, and ledger exports;
- Recognition Field route changes;
- Transform error recovery;
- desktop and 390 x 844 mobile layouts.

No private operator text was used. All probes were synthetic.

## Deployed Findings

### Strict provider mask collapse

Twenty-six transforms completed and the Transform run lock recovered after every response. Blackstar Sheree and Dromological Paul were visibly differentiated most often. The remaining masks frequently converged on polished, formal assistant prose. Glitching Pixie, Rex Fractura, and Blooping Blip were the clearest failures because their intended chat, fracture, and low-signature surfaces were not present.

Root cause: the browser contract carried the full mask object but reduced `flightPacket.mask_style_vector` to id, display name, sample seed, and layout policy. The budgeted API primarily read that reduced vector, leaving surface, architecture, grammar, desired moves, and avoid moves blank.

### Protected literal truncation

The synthetic literal `HUSH-613.42` repeatedly returned as `HUSH-613`. The former identifier regex did not admit periods. The provider prompt also referred to protected literals without enumerating them, and neither the server nor browser independently rejected a candidate that dropped one.

### Premature quiet status

The immediate provider result displayed quiet claim/literal/source indicators. Manual Review later detected missing protected literals, low mask fit, and restore/repair routes. Provider acceptance and local review were separate, but the status surface did not make that separation legible.

### Duplicate strict bridge ownership

Local boot inspection found five strict/capture script elements. The page declared the strict bridge directly while both the run-lock and housekeeping layers injected older cache-token copies. Because the bind guard included the bridge version, a stale version could attach after the current version.

### Stale cross-mask reference

The light bench populated the first selected mask's hidden reference seed but did not replace it on later mask changes. A later contract could therefore combine the current mask identity with another mask's reference evidence, increasing holds and flattening mask differentiation.

### Historical baseline contamination

The first message can become Hush's protected comparison baseline. The strict bridge combined literals from that historical baseline with the current message, so later unrelated transforms inherited old identifiers and dates as invisible mandatory obligations.

## Patch

- Added shared exact protected-literal extraction and integrity checks.
- Preserved composite identifiers, ISO/slash dates, timestamps with seconds/zones, and snake-case configuration keys.
- Added full mask anatomy to the strict flight vector and provider prompt.
- Enumerated exact protected literals in the provider instruction.
- Added server and browser rejection gates for literal loss, reported dropped propositions, and reported new claims.
- Marked accepted provider output as review-required while keeping full local analysis behind the operator's Review action.
- Removed duplicate strict bridge injection from run-lock and housekeeping layers.
- Synchronizes the hidden mask reference whenever the operator changes masks.
- Scopes strict protected literals to the current message while retaining the baseline for local comparison and review.
- Added a cache token and a regression test for bridge ownership, mask anatomy, and literal integrity.

## Verified Behavior

- Customizer utility row aligns above the textarea on mobile with no overlap.
- Clear affects only the draft and resets its counter.
- A single Log Sample click creates one entry and clears the draft.
- Logged samples persist across reload; Undo and Reset persist their removals.
- The edit carousel fully loads arbitrary corpus slides and horizontal scrolling updates its active index.
- Masks mode collapses Customizer space.
- Transform recovers after empty-input and provider-error receipts.
- Export surfaces exclude private text by default and include it only after the explicit private-text toggle.
- Mobile document width remains within the viewport.

## Validation Boundary

The full local Hush test suite passed after the patch. Local browser boot and failure recovery passed, but the local static server has no configured Gemini endpoint, so remote generation correctly held without releasing a fallback. Final mask-quality and exact-literal confirmation requires a production deployment of this patch.
