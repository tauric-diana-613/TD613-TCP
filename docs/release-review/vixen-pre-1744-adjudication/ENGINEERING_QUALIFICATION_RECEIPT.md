# Vixen · Pre-#1744 engineering qualification ledger
**STATE: INCOMPLETE ENGINEERING QUALIFICATION; NO FINAL SCREENSHOT ARCHIVE ADMITTED.**
**Snapshot:** 2026-11-23 (a point-in-time ledger; always re-read live branch HEADs).

## Custody refs
- Product PR [#1730](https://github.com/tauric-diana-613/TD613-TCP/pull/1730): `b90ae99559b21e1561229cdc8e1d873cfaf6f43a`, unmerged to `main`.
- Witness and repair draft PR [#1784](https://github.com/tauric-diana-613/TD613-TCP/pull/1784): `d1cb3651b36d3220fb5bed1092e611914392e64e`; source branch `fix/vixen-prehydration-redpens-full-surface-20261123`.
- Review branch: `review/vixen-pre-1744-release-adjudication-20261123` is NOT the product branch.
- Earlier independent review: [comment 7098889539](https://github.com/tauric-diana-613/TD613-TCP/pull/1784#issuecomment-7098889539).
- Scope from PR #1784 is source-first `tests/vixen-full-surface-witness.mjs` and `app/encyclopedia/vixen-estate/research-chamber.css`; no private 7+1 sources.

## Failed / retained historical CI findings
- [45154875162](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45154875162): early RED; 937 screenshot images; unobservable nested panes and source UI selectors.
- [45156140417](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45156140417): early RED; 953 screenshot images; not admitted.
- [45159259785](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45159259785): RED at `8b88ac18…`, 978 images, 100 route states, 19 browser/test errors; independent screenshot archive check reported 34 failures/completion gaps while SHA/length checks passed.
- [45159877402](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45159877402): RED at `678ad612…`, 993 images, 121 route states; two remaining: 390px Podium notes UI and 428px Observatory proof toggle.
- [45160442654](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45160442654): RED at `7664d54f…`, 1,001 images, 129 route states; same two state failures. All historical RED artifacts remain in Actions, outside the review branch's final evidence directory.

## Engineering repairs staged after the failed screenshots
- `091d3ad4022015da27a717836ec9c20786af9b8a`: browser console error and crash recording.
- `8eb3896bc73a34d1f127051d80e4ebedb570ff41`: hard opaque black-chrome reading plane for Folios heading, steps, status and Work selector. Earlier z-index correction alone still let optical lines cross source text in actual desktop screenshot. **New visual inspection is mandatory.**
- `da24f12f506604e0ea35dd7b6c73129622c3abad`: mandatory per-viewport route surface matrix before GREEN.
- `d1cb3651b36d3220fb5bed1092e611914392e64e`: from known CLOSED proof state, exercise proof open/close; await genuine Podium session activation and record failure diagnostics rather than bypass.
- CI run for latest `d1cb3651…`: [45164763788](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45164763788), in progress when this ledger was authored. Earlier runs stay immutable.

## Concurrent witness continuation (2026-11-23, post-snapshot)
- New fast-forward commit `86664aecaa00951ffd085004c3db99ee256aa36b` was independently compared against `d1cb3651…`: one additional commit, exclusively modifying the witness JS.
- It distinguishes a truly visible **arriving** loading veil from transitional/absent state, captures decoded frontispiece separately, and raises a failure if two phases have identical image SHA. Preserve it; this supersedes the older `d1cb3651…` exact-head candidate once qualified.
- New exact-head CI: [45166406492](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45166406492), IN_PROGRESS at this receipt. **Full independent screenshot audit still required.**
- The operator-authorized engineering branch may evolve: always re-read PR #1784 HEAD before any integration gesture.

## Adjudication and integration conditions
1. Re-read both PR heads, compare source ancestry, inspect non-skipped required Vixen jobs, and obtain exact-head GREEN.
2. Fetch newest exact-head `vixen-full-surface-<SHA>` Actions artifact. Run [independent ZIP auditor](audit_final_surface.py), inspect representative screenshots at all four profiles and full-resolution corrected Folios text. Require missing routes / console / HTTP / page errors to be zero.
3. If anything fails, narrowly fix on #1784, preserving RED receipts. Do NOT promote partial artifacts.
4. Only after quality and image evidence pass, integrate #1784 into #1730's existing product branch (merge with expected SHA), preserve ancestry, and run fresh non-skipped exact-head consolidated CI at **the new #1730 HEAD**.
5. Stage complete stack and HTTP payload from final product HEAD using [source-scoped packager wrapper](stage_vixen_archives.py); record digest and all sources. The final authoritative HTTPS screenshot ZIP is **post-#1744 only** after actual served-revision verification.
6. Return to Emergence HQ before any #1744 PREPARE or DEPLOY gesture.

**Limits:** Local Chromium engineering is not live HTTPS capture or physical-device acceptance. Integrity is not source origin. Human artistic and scientific authority RESERVED. No production #405, provider synchronization, 7+1 hydration, or Experiment B.

OPERAHOUSE ≠ OPERA ≠ PERFORMER. Khona‌lit-po · ⟐SAC[X6ZNK5NO51].
