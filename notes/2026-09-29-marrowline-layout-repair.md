# Marrowline layout repair — active checkpoint

Base: d96052d1e195e39d16953485e8d316cc422049f7. Operator-direct authorization covers this repair, PR, verified merge and one #405 production release.

## Bounded changes

- Desktop: persistent adjacent instrument panel; Gate / Keys / Stories / Receipts; Gate initially selected. Existing explicit Run and Send actions retain their authority.
- Mobile: Keys / Gate / Chat / Stories / Receipts, preserving Chat landing behavior.
- Compact desktop conversation header; transcript yields height to composer and utilities; independent instrument scroll.
- Existing Gate disclosure and Receipt focus fixes on main retained.

## Evidence and remaining gates

User screenshots show clipped composer utilities on shorter desktop screens, excess header height, and Keys overlay occluding conversation. Production browser access retried successfully on 2026-09-29. Local branch URL remains ERR_BLOCKED_BY_CLIENT in cloud browser. Local Chromium installation previously failed with invalid download archive; escalation rejected by environment policy. No visual branch verification claimed.

`node --test tests/marrowline-instrument-panel.test.mjs`: two DOM behavior tests pass: Gate default, tab order, active-tab persistence, arrow/End focus, viewport-mode transition, single tab stop, no form submission.

Existing desktop contract suite and mobile suite contain stale baseline assertions. Baseline run at exact d96052d recorded seven failing tests before this change in /tmp/marrowline-baseline-tests.log. Mobile suite first expected obsolete tab order; correcting that exposes another preexisting assertion expecting enterkeyhint=send where main uses enter. Reconcile against current intended behavior, without weakening authority contracts.

Pending: desktop contract reconciliation, current Pedagogue validation, browser screenshots and geometry at desktop + 390px, exact-head CI, merge, ONE #405 release and receipt/relock verification. Draft PR must remain unmerged until these gates are met.

Deeper Loom import/continuation/export semantics are a subsequent packet. This change does not establish governed context continuity, provider quality, empirical Golden Egg, or a new Gate authority.

## Validation update

26 focused Marrowline checks PASS. Pedagogue suite: 52 PASS, 1 existing skip. Reconciled stale assertions against main: current Send aria-label, 44px composer grid, explicit reply seal label, exact provider-byte copy wording, multiline status reset, manual-only provider observation policy, enterkeyhint=enter, and corrected an overescaped telemetry regex. No provider execution or release contracts changed.

Prepared a scoped offline CI browser witness (desktop 1440×900, 1024×650, 900×550 and simulated mobile 390×844). It blocks /api/ calls, visits instruments, checks overlap/overflow/composer geometry, and saves screenshots for visual review. Screenshot review remains required; geometric PASS alone does not certify UX.

## Browser and onward-action update

At remote head eb21479d19f2f15f24e3874331875565f8fe9c29, the offline layout browser job passed all four viewport sizes; screenshots/geometry are artifact 11060765108 from run 36625150742. Inspected 1024×650 Keys, 900×550 Gate and 390×844 Chat screenshots. Desktop utility clipping and overlay overlap are repaired in this witness. The mobile screenshot exposed a preexisting 34px header-button width combined with restored text; widths now expand to fit labels. Recheck pending on next head.

Operator added a pink “Continue Loom demo: Gate” result action. It appears only after admitted imported Loom continuation returns, outside technical disclosures; arrival and ordinary chat do not manufacture it. Clicking closes the imported pocket and selects the existing Gate navigation control with focus, without submitting either form or transporting additional material. The explanation says the Loom answer stays in its workspace and nothing is sent. Future replacement of the imported pocket with fully integrated Chat remains the deeper seam packet.

55 focused tests PASS including Loom handoff and result-action timing/navigation. Latest CI failure was a workflow-text parser treating all trailing jobs as Gemini observation steps; layout job moved before the final Gemini observation job. Both workflow-estate and Gemini-observation-dispatch tests PASS. Existing broader design-preservation suite also has inherited stale assertions (SHI inversion and added Branch/Attachments choices); not represented as passing.
