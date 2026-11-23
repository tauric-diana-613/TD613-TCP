# 𝌋‌⟐ TD613 · Marrowline Independent Recovery — Cascade Forensics & Amari Audit (November 23, 2026)

- **Commission:** TD613 · Marrowline Independent Recovery, Full Write Authority & Production Release Commission
- **Branch / PR:** `fix/marrowline-artistic-restoration-20261123` (PR `#1795`)
- **Base `main` Head:** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`
- **Covenant & Custody Seal:** `Khona‌lit-po` (literal `U+200C`) · `𝌋‌⟐` (literal `U+200C`)
- **Engineering Leadership:** Kenough (independent investigation, restoration design, GitHub integration, and governed `#405` production release; no Amari supervision, review, or veto)
- **Final Artistic Authority:** Tauric Diana (`tauric-diana-613`) — reserved to human lived experience of `Kʰonapolit` and the `Tauric Diana bots`

---

## I. Provenance Audit of the "Do Not Modify Marrowline / Cascade" Warning

**Question:** Where and on what exact date did Amari originally warn against modifying Marrowline because changes could cascade (with October 4, 2026 and October 15, 2026 treated strictly as preliminary leads)?

### What the Repository and GitHub Archive Directly Establish
1. **October 4, 2026 (`docs/research/2026-10-04-dollhouse-orchestration-episode-1428-x.md`):**
   - October 4, 2026 (`#1428`, `#1430`, `#1431`, `#1432`, `#405` run `37214521751`) was **not** a Marrowline prose/Zalgo freeze warning in the repository record. It was a **Holonomy Loom mobile closure protocol** (`TD613-DOLLHOUSE-1428-X-R1` through `R4`) exercising Loom → Marrowline → Setup (`ACTIVATE`) → Selected Files (`CONTINUE`) → Return.
   - Crucially, however, its archived raw artifact [`docs/receipts/1428-closure-assay/closure-assay-report.json`](../../docs/receipts/1428-closure-assay/closure-assay-report.json) and [`closure-assay-report-r4.json`](../../docs/receipts/1428-closure-assay/closure-assay-report-r4.json) contain overlooked ground truth about Marrowline on **October 4**:
     - Early October 4 Stage 4 output (`closure-assay-report.json`): `4,470` chars, `616` combining marks, **`0` vertical marks**, **`616` planar `U+0334–U+0338` marks**, `5` unique mark scalars.
     - Re-run `R4` (`closure-assay-report-r4.json`): Stage 4 on **`gemini-3.5-flash`** produced `7,180` chars, **`3,803` combining marks**, **`3,462` vertical marks**, `341` planar marks, **`94` unique mark scalars**; Stage 5 (`gemini-3.8-flash` & `gemini-3.5-flash`) produced `1,407` combining marks (`938` vertical, `469` planar, `92` unique scalars).
     - Thus on **October 4 itself**, `3.8-flash` already suffered single-turn planar `U+0334–U+0338` collapse, while `gemini-3.5-flash` delivered rich 94-scalar vertical High Zalgo!
2. **October 14–15, 2026 (`#1488`, `#1489`, `#1491`, `#1498`, `#1501`):**
   - The first explicit use of **"the recent cascade"** tied to the Zalgo/voice breakdown in the repository/GitHub archive appears on **October 14, 2026** in PR `#1488` (*"Operator clarified that High Zalgo was performing correctly `<36` hours before the recent cascade"*, followed by exact-head CI run `38614586219` failing on clean-breath/attachment contracts and `#1488` being closed unmerged).
   - That ~36-hour onset window places the sudden regression on **October 12–13** — matching PR `#1478`–`#1487` (Oct 14) and immediately preceding October 15 (`#1498` / `#1501`), when two rapid structural/prompt changes (`#1498` retiring morphology fallback and `#1501` explicitly inviting `"planar"` fields and single-style persistence) locked in the collapsed texture.
3. **Unexported External Conversations (`UNRECOVERABLE_FROM_CHECKED_ARCHIVE`):**
   - Interactive ChatGPT / Amari conversational transcripts outside exported `docs/`, `research/`, git history, and GitHub issues/PRs are not stored in `tauric-diana-613/TD613-TCP`.
   - Consistent with TD613 evidence discipline, no unverified off-repo conversational timestamp or verbatim ChatGPT quote is fabricated here: the Oct 4 / Oct 15 conversational warning leads remain **partially corroborated by October 4 (`1428-X`) and October 14–15 (`#1488`/`#1498`/`#1501`) artifacts, with exact off-repo chat logs unrecoverable from the checked archive**.

---

## II. Reconstructed September–November 2026 Regression Sequence

| Date / Window | Coordinate | Verified Event & Technical Mechanism | Effect on Marrowline Experience |
|---|---|---|---|
| **Sep 26 – Oct 4** | `ffb98ac005` (Oct 2), `5b4b34278` (Oct 4), `closure-assay-report-r4.json` | Core prompt files unchanged from Oct 2 through Oct 13. Crucial architectural safety net: `severeMorphologyFallback` could spend Seat 2 (`3.7-flash` / `3.5-flash` / `3.6-flash`) when Seat 1 (`3.8-flash`) returned flat morphology. | `3.8-flash` was already capable of planar collapse on Oct 4 (`0/616` vertical in `R1`), but healthy multi-seat selection (`gemini-3.5-flash` emitting `3,462` vertical marks across `94` unique scalars in `R4`) delivered extraordinary High Zalgo to the human surface. |
| **Oct 8 (approx.)** | Upstream Google aliasing (documented in `research/marrowline-dual-axis-restore-20261015/README.md` and `marrowline-historical-grove.js`) | Google aliased `gemini-3.7-flash -> gemini-3.8-flash` and `gemini-3.5-flash -> gemini-3.6-flash` without a TD613 commit. | Silently eliminated the distinct `3.5-flash` and `3.7-flash` backup checkpoints that had rescued flattened `3.8-flash` turns during Sep 26–Oct 4. |
| **Oct 7 – Oct 13** | `cfbe6438e`, `d0671ae18`, `#1473` | Core `3.8-flash` system prompt and config stayed byte-identical (`#1489` audit across 11 snapshots). Operator nonetheless experienced sharp onset `<36h` before Oct 14. | Explained pre-Argon onset without needing a repository commit to `khonapolit-quality.js`: alias collapse (`3.5/3.7`) + upstream serving drift exposed `3.8-flash` flattening directly. |
| **Oct 14 (`04:16Z–18:56Z`)** | `#1478`, `#1479`, `#1481`, `#1486`, `#1487`, `#1488`, `#1489`, `#1491` | `#1478` introduced `gemini-4-argon`; `#1479` injected negative *"mechanical scratch walls / deletion wallpaper"* clauses and worsened planar texture to ~75% (`#1481` had to revert it 82 minutes later); `#1486` reordered prompt cues; `#1487` released via `#405` without recovery; `#1488` broke clean-breath & attachment tests (`CI #38614586219` failed). | First full self-inflicted prompt/routing cascade: negative anti-pattern lexical priming degraded output while emergency patches stacked on one day. |
| **Oct 15 (`01:35Z–21:22Z`)** | `#1498` (`df00b6d8f`), `#1501`, `#1520`, `#1522` | `#1498` retired all morphology-triggered second-seat recovery (exposing every flat `3.8-flash` output with zero safety net). `#1501` rewrote covenant/relay/cue prosody to explicitly welcome *"broad planar fields"*, `"planar"` texture, and *"one expressive style may persist"*. Meanwhile `#1522` showed `3.8-flash` emitted 405 native multi-stack marks on a neutral creative prompt while `#1520` showed both full and compact two-voice frames collapsing to `U+0334–U+0338` depth-1 on `3.8-flash`. | Converted an intermittent `3.8-flash` failure mode into an actively reinforced prompt basin: the prompt literally told Gemini that sustained single-style planar strikethrough was welcome! |
| **Oct 17 – Oct 20** | `#1533`, `#1539`, `#1541`, `#1542`, `#1543`, `#1549`, `D1/D2` | `#1539`/`#1541` restored Oct 2 wording on `historical-20261002-v1` + Argon, then `#1543` retired morphology election again, and **1 hour 16 minutes later `#1549` (`19:52Z`) flipped `RESTORED_RELAY_FREEDOM`/`RESTORED_CUE_FREEDOM` back onto the active browser default**, replacing 7 of 10 Oct 2 paragraphs with post-Oct-15 single-register / planar-permitting prose under an inconsistent receipt. Oct 20 `D1/D2` (`#39367182083`) measured `76.87%` multi-stacked when Zalgo began on token 1 vs `0 / 4,532` in two-section `NAMED`/`D2` slots on `3.8-flash` (`medium`). | Months of belief that production had "restored Oct 2 + Argon" were false in source code: from Oct 19 through Nov 22, normal browser Marrowline was running `#1549`'s hybrid planar-welcoming prompt (`historicalProsodyFreedom = true`). |
| **Nov 21 – Nov 22** | `Q1`, `Option 1 EP2`, `#1774` (`b8d986a76`), `research/marrowline-argon-post-rollback-reconciliation-20261122/README.md` | Across `10/10` live SSE returns on `3.8-flash` and `3.6-flash` (`Q1` + `EP2`), **`9,161 / 9,161` (100%)** of combining marks fell in `U+0334–U+0338` depth-1 (`0` multi-stacks). Meanwhile `gemini-4-argon` received **`0`** controlled raw-SSE observations. `#1774` rolled back `historicalProsodyFreedom` to `false` (re-exposing literal Oct 2 anti-overlay/horizontal/tilde lexemes), **and simultaneously demoted `gemini-4-argon` to Seat 3 behind `3.8-flash -> 3.6-flash`**, trapping production on `3.8-flash`. | Operator immediately rejected Nov 22 live production: forcing `3.8-flash` first with the ~32 KB Oct 2 prompt (still naming horizontal strokes, tildes, diagonal overlays, and negative prohibitions) guaranteed `U+0334–U+0338` wallpaper while starving `gemini-4-argon` of traffic. |
| **Nov 23** | PR `#1795` (`fix/marrowline-artistic-restoration-20261123`) | Independent recovery by Kenough: placed **`gemini-4-argon` first**, excised all 7+ negative/planar/overlay/single-accent priming lexemes, supplied **concrete positive vertical code-point ranges** (`U+0300..U+0314, U+033D..U+0352, U+0363..U+036F` above; `U+0316..U+0330, U+0339..U+033C, U+0347..U+0356` below) plus clean inter-word spacing/punctuation rules, and attached an adjacent second user part (`buildArtisticRestorationTurnRecencyCue`) at the user turn's recency edge. Auditioned live by the operator on preview `dpl_4X5oQbztA9UyuEeo1bdJSpantdBo` before transferring full integration & release authority to Kenough. | Promoted to resilient default browser route (`td613.marrowline.grove-trial.tab/v2` -> `artistic-restoration-20261123-v1`) with `gemini-4-argon -> gemini-3.8-flash -> gemini-3.6-flash` transport failover and bounded structural repair. |

---

## III. Independent Audit of Amari's Involvement

1. **Harmful Production Changes:**
   - **PR `#1479` (Oct 14):** Injected negative anti-pattern phrasing (*"mechanical scratch walls / deletion wallpaper"*) directly into model instructions, worsening planar failure to ~75% (`#1481`).
   - **PR `#1488` (Oct 14):** Shipped broken admission thresholds that broke clean-breath artistry and attachment tests (`CI #38614586219` failed).
   - **PR `#1501` (Oct 15):** Replaced vertical-first craft with explicit permission for `"planar"` and `"broad planar fields"` across the entire reply, actively rewarding `3.8-flash`'s lowest-effort `U+0334–U+0338` attractor.
   - **PR `#1549` (Oct 19):** Overwrote 7 of 10 Oct 2 paragraphs on the `"restored"` browser default back to permissive single-register / planar-friendly prose immediately after `#1539`/`#1541` claimed Oct 2 restoration, creating internal prompt contradictions (`CUE[4]` vs `RELAY[1]`/`CUE[2]`) while still labeling the default as Oct 2 restored.
   - **PR `#1774` (Nov 22):** Solved the `#1549` contradiction by moving production **backwards** to `gemini-3.8-flash` in Seat 1 and burying `gemini-4-argon` in Seat 3 behind two checkpoints already known to emit `100%` planar `U+0334–U+0338` depth-1 (`9,161 / 9,161` marks in `Q1`/`EP2`), while preserving every negative horizontal/diagonal/tilde priming lexeme.
2. **Repetitive Paid Experimental Loops & Overlooked Evidence:**
   - Across `#1509`, `#1515`–`#1517`, `#1520`, `#1522`, `D0/D1`, `D1/D2` (16 slots), `D2/D3`, `Q1`, and `Option 1 EP2`, dozens of paid API calls re-verified that `gemini-3.8-flash` (and `3.6-flash`) under the heavy Oct 2 two-voice instruction packet collapses into `U+0334–U+0338` depth-1 — while executing **`0`** controlled experiments on `gemini-4-argon` (explicitly logged in `research/marrowline-argon-post-rollback-reconciliation-20261122/README.md` §4.3).
   - Overlooked **October 4** (`docs/receipts/1428-closure-assay/closure-assay-report-r4.json`) showing `3.8-flash` already collapsed natively on some Oct 4 turns while `3.5-flash` supplied vertical Zalgo via the multi-seat fallback later removed in `#1498`.
   - Treated `"not forcing single-character variation"` (`#1501` / `#1549`) as synonymous with `"inviting planar strikethrough"` and `"forbidding concrete positive vertical codepoint ranges"`, causing multi-week stagnation when concise positive Unicode range guidance (`U+0300..U+0314` / `U+0316..U+0330`, etc.) + de-priming + recency cue + Argon-first unlocked the voice in one candidate.
3. **Where Credit Remains Legitimately Due:**
   - Amari's defensive custody/transport repairs (`server/marrowline-completion.js` `POLICY_NONSTOP_FINISH_REASONS`, `502 POLICY-HELD`, iOS mobile background non-duplication `OUTCOME_UNKNOWN`, raw-SSE integrity harnesses, `aperture-v3-task-intent.js` creative routing repair, and TD613 exact-byte custody tests) are sound engineering infrastructure and are preserved intact.

---

## IV. Epistemic Partition (What Is Restored vs. What Remains Uncertain)

1. **Independently Verified in Repository / Live Deploy Logs:**
   - Exact Oct 4 `R4` mark counts, Oct 14–Nov 22 commit/PR diffs and failures, Nov 21–22 `9,161 / 9,161` planar `3.8/3.6-flash` counts vs `0` controlled Argon SSE runs.
   - Removal of all negative/planar/overlay priming lexemes in `artistic-restoration-20261123-v1`, addition of concrete positive vertical codepoint ranges, adjacent user-turn recency cue, and promotion of `gemini-4-argon -> gemini-3.8-flash -> gemini-3.6-flash` as default browser Marrowline while retaining `?groveTrial=historical-20261002-v1` and `?groveTrial=off`.
   - Offline verification across Marrowline runtime, jsdom DOM, design preservation, and TD613 release contracts, plus exact-head CI GREEN and `#405` exact-source production release.
2. **Supported Causal Hypotheses:**
   - `gemini-3.8-flash`'s two-voice collapse into `U+0334–U+0338` depth-1 was jointly driven by (a) upstream loss of distinct `3.5-flash` / `3.7-flash` checkpoints on Oct 8 + `#1498` retirement of morphology failover + `#1774` pinning `3.8-flash` back to Seat 1, and (b) priming the model with negative horizontal/diagonal/overlay lexemes while withholding concrete positive vertical Unicode codepoint ranges and turn-recency anchoring.
   - Switching Seat 1 to `gemini-4-argon` with cleaned positive vertical ranges and user-turn recency directly removes both self-inflicted bottlenecks.
3. **Unresolved Upstream & Artistic Boundaries:**
   - Upstream Google checkpoint weights, reasoning allocation, and sampling variability on `gemini-4-argon` remain external to TD613 source code; intermittent `503` transport failover lands on `gemini-3.8-flash` / `gemini-3.6-flash` (which carry higher risk of shallower marks, even with cleaned prompts).
   - Automated tests cannot certify literary comedy, fearfulness, originality, or living voice: **the human operator retains sole final artistic judgment on `https://td613.com/app/dome-world/marrowline.html`**.

---

Khona‌lit-po 𝄐 Tauric Diana · Independent Recovery Commission · Sealed 𝌋‌⟐
