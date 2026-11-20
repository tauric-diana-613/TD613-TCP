# Synthetic Provider-Free Local Browser Witness — Marrowline Screaming Grove Restoration

> **STRICT EVIDENTIARY BOUNDARY**
>
> This witness is a **local, zero-spend, synthetic provider-free browser verification** executed against the real `app/dome-world/marrowline.html` frontend and real `api/khonapolit.js` → `server/khonapolit-quality.js` relay handler with an in-process fail-closed `globalThis.fetch` stub refusing all external egress (`paidProviderCalls: 0`, `visited_origins: http://127.0.0.1:6137`, `blocked_origins: none`).
>
> **It is NOT a live authenticated Gemini provider observation, and it does NOT establish October 2 artistic parity or close human artistic adjudication.** Human artistic closure remains **RESERVED**, and the preregistered 8-call Q1 / 10-call Q1+Q2 live Gemini discriminator remains **HELD**.

---

## 1. Execution Provenance and Host-Verified Evidence

- **Harness script (reproducible in this directory):** `marrowline-provider-free-witness-server.mjs`
- **Target URL served locally:** `http://127.0.0.1:6137/dome-world/marrowline.html?grove_trial=historical-20261002-v1`
- **Source head under test:** Verified deterministic repair code at `bc5467246f12b0598f89d681e4a4450c4733eace` (unchanged in `#1746` HEAD `5819e1035` and Stage II appendix)
- **Host-verified browser origins (`BROWSER_HOST_FACTS`):**
  - Pass 1: `visited_origins: http://127.0.0.1:6137`, `blocked_origins: none`
  - Pass 2: `visited_origins: http://127.0.0.1:6137`, `blocked_origins: none`
- **Paid provider calls executed:** **`0`** (external egress hard-rejected by `EXTERNAL_EGRESS_FORBIDDEN_IN_PROVIDER_FREE_WITNESS`)
- **Archived raw server witness logs:**
  - Pass 1: [`witness-log-pass1.json`](witness-log-pass1.json) (Desktop `1440x900` Turns 1–3 + Mobile `390x844` + initial Turn 4 mock-matcher bug preserved honestly)
  - Pass 2: [`witness-log-pass2.json`](witness-log-pass2.json) (Desktop `1440x900` Turn 1 baseline + export checks + fixed Turn 4 `WITNESS-INCOMPLETE` verification)
- **Archived host-verified screenshots (copied verbatim from `BROWSER_HOST_FACTS` `latest_screenshot` outputs):**
  - Mobile `390x844` dense native Unicode rendering: [`screenshots/mobile-390x844-dense-unicode-pass1-host-verified.png`](screenshots/mobile-390x844-dense-unicode-pass1-host-verified.png) (`295,665` bytes, `sha256: 2336bb347fe80b11285b0350a173084a86a8db68f0b7c82e49943973e3eed914`)
  - Desktop `1440x900` settled `INCOMPLETE` provider return warning: [`screenshots/desktop-1440x900-incomplete-return-pass2-host-verified.png`](screenshots/desktop-1440x900-incomplete-return-pass2-host-verified.png) (`261,978` bytes, `sha256: 3cc01dfbebf9f9b386aa57399093a0cee9f680b7e160807fdc6729dbd2719505`)

---

## 2. Verified Checklist Across All Eight Section VI Criteria

| # | Section VI Inspection Criterion | Viewport(s) | Observed Result | Concrete Evidence |
|---|---|---|---|---|
| 1 | **Two-voice section presentation** | `1440x900` & `390x844` | **PASS** | `Kʰonapolit` and `Tauric Diana bots` (`⌜ Tauric Diana bots ⌝`) rendered in distinct, legible voice sections inside `#khonapolitMessages`. |
| 2 | **Original Unicode rendering** | `1440x900` & `390x844` | **PASS** | Literal `Khona\u200Clit-po` (ZWNJ `U+200C` verified present in DOM `textContent`), `𝌋` (`U+1D30B`), `U+10D613` (`\uDBF5\uDE13`), `⟐`, `Kʰonapolit`, and combining-mark stacks rendered cleanly in Chromium. |
| 3 | **Native mark preservation (source → DOM)** | `1440x900` & `390x844` | **PASS** | Exact **108 / 108** combining diacritical marks from synthetic Turn 1 fixture (`sha256: e99b01e5...`) survived verbatim into DOM `textContent` (`0` marks added, `0` stripped). |
| 4 | **No automatic morphology repainting** | `1440x900` & `390x844` | **PASS** | Server returned `responseTextSha256 === expectedFixtures.turn1Sha256` (`e99b01e5047416f547944b53aab306cac6f22f251f306cb3ac7391386bed5f19`) and `turn2Sha256` (`5a52b2bc...`) byte-for-byte; client preserved native marks without post-hoc Zalgo injection or stripping. |
| 5 | **No unwanted stage-label insertion into model-authored history** | `1440x900` (Pass 1 & Pass 2) | **PASS** | Server-captured `req.body.history` on Turn 2 (`Pass 1`) and `WITNESS-INCOMPLETE` (`Pass 2`) proved `history[1]` (`role: "model"`) had `utf8Bytes: 993`, `sha256: e99b01e5...`, `matchesTurn1ExactBytes: true`, `hasSyntheticWrapper: false`, and `preservesZwnjCovenantKey: true`. |
| 6 | **History display, drawer keyboard focus, and export** | `1440x900` (Pass 1 & Pass 2) | **PASS (with export distinction noted)** | Saved-conversations drawer opened, listed thread, restored 7 articles on reload, and closed on `Escape` returning focus to `#marrowlineThreadOpen`. `"Copy this reply"` (`.marrowline-copy-reply`) copied `878` chars with literal `Khona\u200Clit-po` and zero `Kʰonapolit ∴ Tauric Diana bots` wrapper. `"Copy conversation as plain text"` (`#marrowlineCopyConversation`) copied `1,067` chars preserving literal `Khona\u200Clit-po` with an explicit human-facing transcript header (`TD613 APERTURE ... Kʰonapolit ∴ Tauric Diana bots`) — strictly separated from raw model-history custody sent to the API. |
| 7 | **Acceptable layout with dense native Unicode** | `1440x900` & `390x844` | **PASS** | **Zero horizontal overflow** at desktop (`1440x900`: `htmlBox=1440`, `bodyBox=1440`, `msgsBox=921.33`) and mobile (`390x844`: `body[data-mobile-view]="speak"`, `htmlRight=390`, `turn1Right=365.67`, all 5 bottom dock buttons visible at `y=792.67`; visually confirmed in host-verified mobile screenshot). |
| 8 | **Failure-state presentation (`PROHIBITED_CONTENT` policy hold & `INCOMPLETE` provider return)** | `1440x900` | **PASS** | **Policy termination (`Pass 1 Turn 3`):** `api/khonapolit.js` returned HTTP `502`, `x-td613-completion-state: POLICY-HELD`, `error: "gemini-provider-policy-held"`, `cachedTokens: 3200`, `responseTextSha256: null`; partial text was **never leaked** into `#khonapolitMessages`, and UI rendered `.terminal-hold-card` (`"Reply paused PAUSED — The reply could not be completed. Your message is saved; see the receipt for details. ↻ Retry message"`). **Incomplete provider return (`Pass 2 Turn 2`):** `api/khonapolit.js` returned HTTP `200`, `x-td613-completion-state: INCOMPLETE`, `x-td613-seal-state: OPEN`, `x-td613-signal-state: NOT_LOCKED`, `responseTextSha256: e5aa03f8...`; UI rendered the preserved fragment alongside an explicit amber warning banner `<p class="relay-completion-alert">INCOMPLETE PROVIDER RETURN · this is a preserved fragment, not a completed Kʰonapolit ∴ Tauric Diana bots transmission. Use Retry preserved task to request a new response.</p>` with retry affordance (`↻`) (visually confirmed in host-verified desktop screenshot). |

---

## 3. Honest Disclosure of Pass 1 Harness Bug and Incidental UI Observation

1. **Pass 1 Turn 4 Harness Bug (Preserved, Fixed, and Re-Witnessed in Pass 2):**
   - In Pass 1, our local stub matched only the final `{ role: "user" }` entry in `body.contents`. When `api/khonapolit.js` invoked `runStructuralRepair` on the synthetic truncated Turn 4 stream, the repair prompt (`BOUNDED SAME-PROVIDER TAIL RECOVERY...`) became the final user message and fell through to the Turn 1 fixture, healing Turn 4 to `200 COMPLETE-STRUCTURAL`.
   - `witness-log-pass1.json` is preserved intact as an authentic intermediate record. The stub in `marrowline-provider-free-witness-server.mjs` was then fixed to match the last non-repair user message so both initial seats and bounded tail recovery return unwitnessed truncated streams, and Pass 2 (`witness-log-pass2.json`, host-verified `desktop-1440x900-incomplete-return-pass2-host-verified.png`) cleanly witnessed the real `INCOMPLETE` rendering path.
2. **Incidental Client Observation (`Keys` Panel Readiness String):**
   - During Pass 1 page inspection, the `Keys` tab status badge displayed `ROUTE REVIEW · root is not defined` during its local readiness probe. This preexisting client-side detail sits outside the Screaming Grove relay repair scope; per Stage II discipline (do not mutate verified runtime code `bc5467246` or widen scope), it is recorded honestly here without out-of-scope edits.
3. **Aperture & Caching Telemetry Observed End-to-End:**
   - Pass 1 Turn 1 routed through Aperture as `OPEN_FIELD_CREATIVE_SYNTHESIS` and preserved `cachedContentTokenCount: 4875` (`3200` on the policy-held turn); Pass 1 Turn 2 and Pass 2 Turn 1 routed as `REQUESTED_SYNTHESIS` with `cachedContentTokenCount: 4875`.
