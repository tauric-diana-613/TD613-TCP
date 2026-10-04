# TD613 · DOLLHOUSE CLOSURE & EXTRACTION PROTOCOL
## EPISODE TD613-DOLLHOUSE-1428-X · ORCHESTRATION EXTRACTION RITE
**Date:** 2026-10-04  
**Working PR Successor:** #1430 (`amari/loom-mobile-dollhouse-closure-1430`)  
**Base Coordinates:**
- Merged #1428 Application Source: `2761980a04f7e5620d07bb124696264bd83e1215`
- Governed #405 Release: `58f0dcdd6c1c3667c01afbf6d1ce80b36472b289`
- Production Relock: `9a9212fa46a6c81e957f91e19e539aa5826eab95`
- Base main at Inception: `ff977fe8d3711162b61f905768a381ef4362dd76`
- Live Production Endpoint: `https://td613.com/dome-world/holonomy-loom.html`
- Live Same-Episode Witness ID: `ep_loom_closure_1791090079183`
- Current Episode Status: **`HELD`** (under presently committed evidence)

---

## I · RECANTATION OF OVERCLAIM & EPISODE STATE CORRECTION

The closure claim `"SEALED & COMPLETE"` issued at the conclusion of PR #1428 was an **unsupported overclaim** and is formally revoked. Furthermore, the narrative completion in the initial #1430 report that treated a partial live run as a completed episode is formally recanted.

```text
DEPLOYED != COMPLETE
SMOKE WITNESS != ROUTE WITNESS
ROUTE CONTRACT != LIVE ROUTE
PROVIDER CAPABILITY != LIVE PROVIDER OBSERVATION
STRONG PARTIAL EVIDENCE != CLOSURE
CONTINUATION_2_STAGED != CONTINUATION_2_COMPLETED
SCREENSHOT_OF_RESPONSE_SURFACE != NETWORK_RESPONSE
C1_RECEIPT_EXISTS != C2_PREDECESSOR_VERIFIED
RETURN_URL_HASH != RETURN_WORKSPACE_ADMITTED
#return-review != journeyState:return
builderVisible != returnWorkspaceVisible
HISTORICAL FINDING != SAME_EPISODE OBSERVATION
```

Under empirical analysis of `docs/receipts/1428-closure-assay/closure-assay-report.json` (R1) and `docs/receipts/1428-closure-assay/closure-assay-report-r2.json` (R2), **Episode TD613-DOLLHOUSE-1428-X is HELD**:

### R1 vs R2 Discrimination Run (Harness vs Product Failure)
- **Harness Failure Isolated (R1 Defect):** R1 utilized a 45s wait timeout while product timeout is 225s (`KHONAPOLIT_CLIENT_REQUEST_TIMEOUT_MS = 225000`). R1 aborted the in-flight request at 45s and synthesized `#return-review` via hash mutation.
- **Harness Repaired (R2 Architecture):** Repaired `scripts/live-production-closure-assay.mjs` with `WITNESS_REQUEST_TIMEOUT_MS = 230000`, full wire tracing, zero observer hash mutation, and canonical receipt digest verification.
- **R2 Live Production Empirical Run (https://td613.com/dome-world/holonomy-loom.html):**
  1. **Continuation #1:** Executed live (HTTP 200, 21.4s, Gemini 3.5 Flash, Neon head committed `0d3da228...`).
  2. **Continuation #2:** Dispatched on wire (`postDataBytes: 18181`). Returned **HTTP 422 after 47,682 ms (47.6s)**!
     - *Root Cause Uncovered:* Gemini generated a 2,087-token response, but asserted: *"that data will persist in Vendor-A's backup systems for up to 31 days..."*. This tripped the evidence validator in `app/dome-world/holonomy-loom/ai-evidence-review.js` (`will persist` + `backup`), triggering `RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION` (`ANSWER_EVIDENCE_CONFLICT`).
     - *System Response:* Server correctly returned HTTP 422; Marrowline preserved the task and held the state (`FILES_STAGED`).
  3. **Stage 7 Return to Loom:** Return button was clicked (`returnDisabled: false`), but `returnToLoom()` threw `No completed result is saved for review yet.` because `phase !== 'DONE'`.
     - *Key Finding:* Return failure is **100% downstream consequence** of C2 being held!
4. Therefore, the live three-phase route is **HELD**. Merge and seal authority remain suspended.

---

## II · CLOSURE GAP MATRIX (48 MANDATORY REQUIREMENTS)

Every requirement is strictly classified into exactly one evidence status based on observable evidence:

| # | Requirement Coordinate | Evidence Status | Grounding Witness / Evidence Reference |
|---|---|---|---|
| 1 | fresh mobile visit | PROVEN_LIVE_PRODUCTION | `01_fresh_mobile_visit.png`, Stage 1 live witness (390×700) |
| 2 | tutorial navigation | PROVEN_LIVE_PRODUCTION | `02_tutorial_selected.png`, `03_tutorial_checked.png` |
| 3 | repeated 𝌋 | PROVEN_LIVE_PRODUCTION | `hostile_conditions.repeated_remix` (carrier count = 39 stable) |
| 4 | 39-carrier temporal continuity | PROVEN_LOCAL | `tests/holonomy-loom-animation-coordinator.test.mjs` |
| 5 | reduced motion | PROVEN_LIVE_PRODUCTION | `21_reduced_motion.png`, `hostile_conditions.reduced_motion` |
| 6 | 390×700 viewport | PROVEN_LIVE_PRODUCTION | Base viewport for live closure assay |
| 7 | 390×844 viewport | PROVEN_LIVE_PRODUCTION | `22_vp_390x844_iphone14.png`, `scrollWidth <= clientWidth` |
| 8 | ~360px portrait (360×740) | PROVEN_LIVE_PRODUCTION | `22_vp_360x740_android_compact.png`, zero horizontal blowout |
| 9 | landscape (700×390) | PROVEN_LIVE_PRODUCTION | `22_vp_700x390_landscape.png`, layout contained |
| 10 | Back navigation | PROVEN_LIVE_PRODUCTION | `19_loom_history_back.png`, carrier count preserved |
| 11 | Forward navigation | PROVEN_LIVE_PRODUCTION | `20_loom_history_forward.png`, state stable |
| 12 | Refresh / Page Reload | PROVEN_LIVE_PRODUCTION | `18_loom_reloaded.png`, reload retains builder shell |
| 13 | soft keyboard | PROVEN_LIVE_PRODUCTION | `23_soft_keyboard_focus.png`, focus on `#aiTask` |
| 14 | repeated / double taps | PROVEN_LIVE_PRODUCTION | `hostile_conditions.rapid_taps`, zero state corruption |
| 15 | popup / tab transition | PROVEN_LIVE_PRODUCTION | `09_marrowline_arrival.png`, `context.waitForEvent('page')` |
| 16 | interrupted popup | PROVEN_LOCAL | `tests/marrowline-loom-demo.test.mjs` (popup blocked fallback) |
| 17 | Loom task creation | PROVEN_LIVE_PRODUCTION | `07_demo_project_selected.png`, demo task populated |
| 18 | source selection | PROVEN_LIVE_PRODUCTION | 3 shared files staged, 1 local file withheld |
| 19 | protected / local exclusions | PROVEN_LIVE_PRODUCTION | `#aiLocalCount` = 1, canary omitted from outbound request |
| 20 | preparation success | PROVEN_LIVE_PRODUCTION | `08_request_prepared_ready.png`, `#aiResult` visible |
| 21 | preparation failure | PROVEN_LOCAL | `tests/loom-demo-contract.test.mjs` (unauthorized envelope) |
| 22 | cancellation | PROVEN_LOCAL | `tests/loom-native-terminal-races.test.mjs` (operator stop) |
| 23 | retry | PROVEN_LOCAL | `tests/marrowline-design-preservation.test.mjs` |
| 24 | replacement attempt | PROVEN_LOCAL | `tests/loom-demo-contract.test.mjs` (replacement holding) |
| 25 | prior-lane preservation | PROVEN_LIVE_PRODUCTION | `#aiTask` retains original text across navigation |
| 26 | actual Loom → Marrowline transition | PROVEN_LIVE_PRODUCTION | `09_marrowline_arrival.png`, `#marrowlineComposerPlus` active |
| 27 | continuation #1 (setup dispatch) | PROVEN_LIVE_PRODUCTION | `12_continuation1_staged.png`, `13_continuation1_response.png` (HTTP 200 Gemini 3.5 Flash) |
| 28 | continuation #2 (files dispatch) | HELD | R1: `NO_NETWORK_RESPONSE` (harness timeout); R2: HTTP 422 `ANSWER_EVIDENCE_CONFLICT` (Gemini modal violation in diligence brief) |
| 29 | proof #2 consumes #1 as predecessor | PROVEN_LOCAL | Proven in `tests/loom-demo-contract.test.mjs`; UNPROVEN in live episode |
| 30 | Return to original Loom | HELD | Downstream of C2: `returnToLoom()` requires `phase === 'DONE'`. Return button unblocked, but call threw error |
| 31 | tutorial bypass on Return | PROVEN_LIVE_PRODUCTION | `#loomFirstCrossing` remained hidden upon return |
| 32 | task survival across Return | PROVEN_LIVE_PRODUCTION | `#aiTask` content identical across trip |
| 33 | source survival across Return | PROVEN_LIVE_PRODUCTION | `#aiSharedCount` (3) preserved across trip |
| 34 | exclusion survival across Return | PROVEN_LIVE_PRODUCTION | `#aiLocalCount` (1) preserved across trip |
| 35 | original Loom result survival | PROVEN_LOCAL | `tests/marrowline-loom-demo.test.mjs` |
| 36 | continuation history survival | PROVEN_LOCAL | `app/dome-world/holonomy-loom/returned-session-review.js#L115` |
| 37 | missingness survival | PROVEN_LOCAL | `app/dome-world/holonomy-loom/returned-session-review.js#L136` |
| 38 | provenance / revision survival | PROVEN_STATIC | `demo-contract.js#L247` (`CARRIED_ORIGIN_DECLARATION`) |
| 39 | custody status bifurcation | PROVEN_STATIC | `portable-loom-session.js#L18` (`WeakSet` process-local mark) |
| 40 | HELD integrity | PROVEN_LIVE_PRODUCTION | Live API returns HTTP 400 `LOOM_DEMO_FIELDS_CHANGED` on test body |
| 41 | export after Loom | PROVEN_LOCAL | `scripts/loom-journey-reconstruction-live-browser.mjs#L24` |
| 42 | export after continuation #1 | PROVEN_LOCAL | `scripts/loom-journey-reconstruction-live-browser.mjs#L30` |
| 43 | export after continuation #2 | PROVEN_LOCAL | `scripts/loom-journey-reconstruction-live-browser.mjs#L33` |
| 44 | export after Return | PROVEN_LOCAL | `scripts/loom-journey-reconstruction-live-browser.mjs#L36` |
| 45 | live provider observation | PROVEN_LIVE_PRODUCTION | C1 observed (Gemini 3.5 Flash 200 OK, 21.4s); C2 observed (Gemini wire response 47.6s, HTTP 422 evidence conflict) |
| 46 | physical iPhone / Safari observation | UNMEASURED | Requires physical device lab; emulated Safari user agent used |
| 47 | production post-deploy route witness | PROVEN_LIVE_PRODUCTION | `scripts/live-production-closure-assay.mjs` executed live |
| 48 | human comprehension evidence | UNMEASURED | Preregistered human study required by `APERTURE.md` |

---

## III · GROUNDED PROVIDER TRUTH

Inspection of network payloads in `closure-assay-report-r2.json` establishes the exact provider reality:

```json
{
  "c1_provider_execution": "PROVEN",
  "c1_provider_identity_observed": "PROVEN",
  "c1_status": 200,
  "c1_elapsed_ms": 21402,
  "c1_provider": "gemini-3.5-flash",
  "c2_provider_execution": "PROVEN_ON_WIRE",
  "c2_status": 422,
  "c2_elapsed_ms": 47682,
  "c2_error_code": "ANSWER_EVIDENCE_CONFLICT",
  "c2_evidence_rule": "RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION",
  "c2_provider_tokens": 2087,
  "route_verdict": "HELD"
}
```

1. **Continuation #1:** Live endpoint `https://td613.com/api/khonapolit?operation=loom-demo-task` responded with HTTP 200 (elapsed: 21,402ms in R2). Observed model: `gemini-3.5-flash` (prompt tokens: 7,260, candidate tokens: 1,325). Dedicated Neon Loom custody service verified Vercel OIDC identity and committed durable head `0d3da228...`.
2. **Continuation #2:** Dispatch reached wire (18,181 request bytes) and executed live model generation for 47.6s, but returned HTTP 422 `ANSWER_EVIDENCE_CONFLICT`. Predecessor receipt digest linking C2 to C1 was intact in request payload, but unadmitted due to evidence conflict.
3. **Doctrinal Derivation:** Because C2 was held at the evidence boundary, the multi-turn route provider observation is **HELD**.

---

## IV · RECEIPT & HISTORICAL FACT DISENTANGLEMENT

1. **Carrier Depth Hierarchy (Historical vs Deployed Source):**
   - *Historical Finding (pre-#1428):* Far carriers had CSS `opacity: 0.035` on `#05060a`, rendering them sub-perceptual.
   - *Current Deployed Source (post-#1428):* Repaired in source to:
     ```css
     .flight-far { opacity: .20 }
     .flight-mid { opacity: .24 }
     .flight-near { opacity: .38 }
     ```
   - Current observation confirms 0.20 far-carrier opacity, providing observable ambient depth. The 0.035 metric is retained as historical lineage only.
2. **Governor Lifecycle Cleanup (Historical vs Deployed Source):**
   - *Historical Finding:* FADT uniquely surfaced that `server/loom-demo-task.js` caught reservation errors without closing the bound governor.
   - *Current Deployed Source:* Already repaired in PR #1428 via `binding?.governor?.close();`.
   - This finding demonstrates historical FADT unique contribution; it is not an active defect in current deployed source.
3. **Return State Divergence:**
   - *Observed Reality:* Loom URL reached `#return-review`, builder shell was visible, and First Crossing remained hidden. However, `returnWorkspaceVisible` was `false` and `journeyState` remained `'marrowline'` because Marrowline's `returnToLoom()` postMessage was not dispatched due to C2 being uncompleted.

---

## V · ROLE CONTRACT CARDS & FIVE-PART PROCEDURE

Each role operates under a strict repository contract, non-equivalent epistemic powers, and an explicit claim ceiling:
`Observation → Concern → Falsifier → Recommended Action → Claim Ceiling`.

### 1. Pedagogue Contract Card
- **Canonical Shortcut:** [`PEDAGOGUE.md`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/PEDAGOGUE.md) / `app/engine/pedagogue-gesture-consequence.js`
- **Jurisdiction:** Consequence order, route burden, practice pedagogy, route memory, human closure.
- **Core Axiom:** *Consequence before ontology.* A user must experience `NOTICE -> ACT -> WORLD ANSWERS -> NAME -> REST -> TRANSFER` before encountering abstract taxonomy.
- **Claim Ceiling:** `recommendation-and-verification-only-human-closure-required`.
- **Finding (Premature Return Dead-End):**
  - **Observation:** User navigates to `#return-review` while Marrowline continuation is uncompleted; Loom displays the standard builder shell without the expected comparison.
  - **Concern:** Route confusion / broken promise: operator is told they have returned to review, but the interface fails to visibly inhabit the return consequence.
  - **Falsifier:** A first-time mobile user can locate their returned work without reading technical console logs when `returnWorkspaceVisible` is false.
  - **Recommended Action:** Display child-legible notice when Return is reached prematurely: "No finished work to review yet. Finish your turn in Marrowline or start over."
  - **Claim Ceiling:** Pedagogical advice only; does not authorize UI mutation.

### 2. Aperture Contract Card
- **Canonical Shortcut:** [`APERTURE.md`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/APERTURE.md) / `app/engine/dollhouse-witness-plan.js`
- **Jurisdiction:** Observability geometry, identifiability, conditioning, uncertainty geometry, widening, abstention, replay audit.
- **Core Axiom:** $S \neq O \neq E$ (*State $\neq$ Observation $\neq$ Evidence*). Visibility does not imply identifiability; URL hash does not imply DOM rendering.
- **Claim Ceiling:** `experimental-research-instrument-no-external-reality-or-release-authority`.
- **Finding (State-Observation Conflation at Return):**
  - **Observation:** In DOM snapshot `17_loom_return_scene.png`, `window.location.hash === '#return-review'`, but `document.getElementById('loomReturnWorkspace').hidden === true` and `data-return-review="result"` is unrendered.
  - **Concern:** Test harnesses treating URL hash presence as proxy evidence for visual rendering produce false-positive route witnesses.
  - **Falsifier:** Automated DOM query verifies `document.querySelector('#loomReturnWorkspace:not([hidden])') !== null`.
  - **Recommended Action:** Enforce strict abstention in test harnesses: URL hash cannot be treated as proxy evidence for DOM visibility or state transition.
  - **Claim Ceiling:** Observability measurement only; does not dictate product release.

### 3. Atlas Contract Card
- **Canonical Shortcut:** [`ATLAS.md`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/ATLAS.md) / `app/engine/dollhouse-continuity-audit.js`
- **Jurisdiction:** Receiver-relative relations, history quotients, reconstruction custody, symmetry, continuity across projections.
- **Core Axiom:** *Declared continuity is receiver-relative.* A receiver cannot assert global uniqueness or foreign-host enforcement without an authenticated witness.
- **Claim Ceiling:** `receiver-relation-audit-only-no-basis-free-geometry-no-release-no-lineage-promotion`.
- **Finding (Cross-Window Predecessor Break):**
  - **Observation:** Marrowline continuation C2 produced `NO_NETWORK_RESPONSE`. Loom URL reached `#return-review` directly without receiving an authenticated `postMessage` packet from Marrowline.
  - **Concern:** Broken predecessor digest chain and receiver-relative divergence: Loom receiver cannot verify continuity across the popup boundary without the Marrowline receipt digest.
  - **Falsifier:** Validate that `window.opener.postMessage` delivers a payload matching the exact SHA-256 digest of the last admitted Marrowline head before `#return-review` renders.
  - **Recommended Action:** Refuse state transition to 'return' unless accompanied by an authenticated `td613.loom.return-message/v0.1` event from the opener; maintain `WeakSet` local custody bifurcation.
  - **Claim Ceiling:** Relation audit only; cannot manufacture durable custody.

### 4. FADT Contract Card
- **Canonical Shortcut:** [`FADT.md`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/FADT.md) / `app/engine/dollhouse-continuity-audit.js`
- **Jurisdiction:** Finite Admissibility Descent Law, quotient survival, union/intersection gap preservation, lawful-support boundaries.
- **Core Axiom:** A rule survives a finite quotient exactly if and only if its lawful support is constant on every fiber.
- **Claim Ceiling:** `finite-support-descent-audit-only-no-universal-ai-law-no-release-no-source-state-reconstruction`.
- **Finding (Lawful Support Violation under Premature Return):**
  - **Observation:** In `loom-native-stage-support.json`, lawful action support for returned session review requires conditioning `stage === 'DONE'` and `head === 'CURRENT'`. Current episode state retains `stage === 'marrowline'` and `head === 'ACTIVATION'`.
  - **Concern:** Lawful support violation and stage collapse: displaying the Return workspace while underlying conditioning is unadmitted would illegally expose `EXPORT_CURRENT` and `ADMIT_LOCAL` actions without lawful support.
  - **Falsifier:** Check if any action buttons in `#loomReturnWorkspace` can be triggered when conditioning satisfies `stage !== 'DONE'`.
  - **Recommended Action:** Keep `#loomReturnWorkspace` strictly hidden and fail closed whenever conditioning state is not 'DONE'. Preserving the union/intersection gap takes precedence over visual completion.
  - **Claim Ceiling:** Finite support descent audit only; does not auto-mutate UI code.

---

## VI · PRESERVED DISAGREEMENT LEDGER

Machine-readable fixture: [`disagreement-ledger-1428.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/disagreement-ledger-1428.json)  
Schema: `td613.dollhouse.disagreement-ledger/v1.0`

1. **`DISAGREE-001` (Carrier Contrast):** Aperture verified far carriers (opacity 0.20) are observable ambient depth. Pedagogue cautioned against higher contrast to prevent mobile clutter.  
   **Orchestrator Decision:** `MAINTAIN_CURRENT_OPACITY`. Visual hierarchy preserved.
2. **`DISAGREE-002` (Tutorial Legend Ingress):** Pedagogue flagged legend before action as a defect. FADT confirmed hermetic safety.  
   **Orchestrator Decision:** `DEFER_MUTATION_TO_NEXT_PR`.
3. **`DISAGREE-003` (Governor Lifecycle in Error Branch):** FADT identified historical governor leak; Atlas confirmed repaired in #1428.  
   **Orchestrator Decision:** `HISTORICAL_DEFECT_RESOLVED`. Retained as historical lineage only.
4. **`DISAGREE-004` (Private-Note Interactive Falsifier):** Pedagogue proposed adding interactive toggle. Integrator rejected.  
   **Orchestrator Decision:** `REJECT_INTERACTIVE_EXPANSION`. Preserves child-legible mobile simplicity.
5. **`DISAGREE-005` (Return Scene Hash vs Workspace Admittance):** Atlas noted receiver-relative divergence (URL reached `#return-review` but `journeyState` remained `'marrowline'`). Aperture noted `returnWorkspaceVisible = false`.  
   **Orchestrator Decision:** `HELD_NO_SYNTHETIC_COMPLETION`. Strict prohibition of synthetic completion from URL hash alone.

---

## VII · ORCHESTRATOR DECISION GATE

**Rule:** `AUDITOR FINDING != REQUIRED MUTATION`

An auditor's mandate is analytical observation within their defined coordinate plane. The primary orchestrator alone balances competing role imperatives against operational stability, scope boundaries, and human closure requirements.

---

## VIII · BLIND DOLLHOUSE EXPERIMENT & DIVERGENCE MAP

Persisted artifacts in [`tests/fixtures/dollhouse/blind-divergence/`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/):
- [`pedagogue-blind-audit.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/pedagogue-blind-audit.json)
- [`aperture-blind-audit.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/aperture-blind-audit.json)
- [`atlas-blind-audit.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/atlas-blind-audit.json)
- [`fadt-blind-audit.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/fadt-blind-audit.json)
- [`divergence-map.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/divergence-map.json)

**Evaluated Coordinate:** `return_state_divergence_and_held_c2`  
All four roles received the exact same source and episode evidence without access to each other's outputs.

**Divergence Results:**
- **`PEDAGOGUE`:** Diagnosed the human experience of a broken promise: reaching Return without visible returned work. Proposed child-legible guidance notice.
- **`APERTURE`:** Diagnosed the state-observation conflation ($S \neq O \neq E$): treating URL hash as visual rendering proof. Prohibited proxying URL hash for DOM visibility.
- **`ATLAS`:** Diagnosed cross-window digest disconnect: absence of authenticated postMessage packet from Marrowline. Enforced predecessor verification at window boundary.
- **`FADT`:** Diagnosed lawful support violation: rendering Return workspace while conditioning is unadmitted would illegally grant `EXPORT_CURRENT`. Enforced fail-closed masking.

The four outputs are strictly disjoint in observation vocabulary, mathematical focus, and diagnostic conclusion:
$$\text{PEDAGOGUE} \neq \text{APERTURE} \neq \text{ATLAS} \neq \text{FADT}$$

---

## IX · REAL CROSS-EXAMINATION ROUNDS

1. **Atlas $\rightarrow$ Provider/Route Observer:**  
   *Challenge:* "How can the episode be called complete when C2 has no network response and predecessor verification is false?"  
   *Observer Reply:* "Continuation #1 completed and proved the provider pathway works."  
   *Atlas Ruling:* "Rejected. Proof of capability in C1 does not instantiate predecessor chaining in C2. Predecessor chain is unbroken only when C2 consumes C1 over the wire."  
   *Surviving Claim:* `C2_PREDECESSOR_CHAIN = HELD`.
2. **FADT $\rightarrow$ Atlas:**  
   *Challenge:* "Does entering `#return-review` create lawful Return state when `journeyState` remains `'marrowline'` and the Return workspace is not visible?"  
   *Atlas Reply:* "Atlas verifies the URL hash and DOM elements, but cannot claim custody advance without the postMessage packet."  
   *FADT Ruling:* "Agreed. Until conditioning satisfies `stage === 'DONE'`, action support must remain empty. URL hash creates zero lawful capability."  
   *Surviving Claim:* `RETURN_ACTION_SUPPORT = EMPTY (FAIL_CLOSED)`.
3. **Aperture $\rightarrow$ Orchestrator:**  
   *Challenge:* "What observation warrants COMPLETED?"  
   *Orchestrator Reply:* "The initial report conflated smoke test reachability with end-to-end route completion."  
   *Aperture Ruling:* "S != O != E forbids this. A partial witness cannot earn completion status."  
   *Surviving Claim:* `EPISODE_VERDICT = HELD`.
4. **Pedagogue $\rightarrow$ Orchestrator:**  
   *Challenge:* "What does a user experience when the URL says Return but the product does not visibly inhabit Return?"  
   *Orchestrator Reply:* "The operator experiences confusion and frustration, mistaking a technical hold for a broken application."  
   *Pedagogue Ruling:* "Consequence must precede ontology. Premature Return ingress without returned work violates learner safety."  
   *Surviving Claim:* `USER_EXPERIENCE = PREMATURE_RETURN_HELD`.

---

## X · AGENT ABLATION EXPERIMENT

Persisted fixture: [`ablation-experiment.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/blind-divergence/ablation-experiment.json)  
Evaluated across 5 conditions on coordinate `return_state_divergence_and_held_c2`:

| Condition | Active Roles | Findings Emitted | Findings Lost | Incorrect Promotions | Incorrect Rejections | Unresolved Coordinates |
|---|---|---|---|---|---|---|
| **FULL_DOLLHOUSE** | 4 roles | 4 | 0 | 0 | 0 | 0 |
| **MINUS_PEDAGOGUE** | Aperture, Atlas, FADT | 3 | 1 (Route burden) | 0 | 0 | 1 (User confusion) |
| **MINUS_APERTURE** | Pedagogue, Atlas, FADT | 3 | 1 ($S \neq O \neq E$) | 1 (URL hash promoted as UI) | 0 | 0 |
| **MINUS_ATLAS** | Pedagogue, Aperture, FADT | 3 | 1 (Digest chain) | 1 (Unverified receiver accepted) | 0 | 0 |
| **MINUS_FADT** | Pedagogue, Aperture, Atlas | 3 | 1 (Lawful support) | 1 (Unconditioned actions granted) | 0 | 0 |

**Measurable Role Contributions:**
- **Pedagogue:** Sole role detecting route burden and broken human promises.
- **Aperture:** Sole role preventing false promotion from URL hash proxying ($S \neq O \neq E$).
- **Atlas:** Sole role preventing unverified receiver transitions and custody forks.
- **FADT:** Sole role preventing illegal action support escalation under unadmitted conditioning.

---

## XI · TEMPORAL CUSTODIAN ROLE

The Temporal Custodian is defined as an **orchestration role protecting the whole service journey from local subsystem optimization**:
- **Jurisdiction:** Route chronology across all four phases (`Loom -> Marrowline C1 -> Marrowline C2 -> Return`).
- **Core Principle:** Local subsystem optimization must not damage whole-route continuity.
- **Veto Authority:** `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`.
- **Finding on Episode 1428-X:**  
  *Evaluation:* Phase 1 (Loom) passed; Phase 2 (C1) passed; Phase 2 (C2) recorded `NO_NETWORK_RESPONSE`; Phase 3 (Return) reached URL hash but failed workspace admittance.  
  *Verdict:* **HELD (VETO APPLIED)**. Local success of C1 cannot be used to declare whole-journey completion.

---

## XII · SAME-EPISODE OBSERVATORY

Persisted fixture: [`episode-1428-x-observatory.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/episode-1428-x-observatory.json)  
All four observers observed the same episode `ep_loom_closure_1791090079183`. Every observation is bound to immutable evidence pointers (`episode_event_id`, `timestamp`, `artifact_path`, `screenshot_id`).

Zero cross-episode synthesis: all measurements share a single monotonic timestamp sequence.

---

## XIII · CLOSURE AUDITOR ENFORCEMENT

The closure auditor is implemented in [`app/engine/dollhouse-closure-auditor.js`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/app/engine/dollhouse-closure-auditor.js) and verified in [`tests/dollhouse-closure-auditor.test.mjs`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/dollhouse-closure-auditor.test.mjs):

The auditor enforces 9 automated, fail-closed admissibility rules:
1. `ERR_PAYLOAD_NULL_BODY_CLAIMED_COMPLETE`: Rejects completed verdict if C2 body is null.
2. `ERR_PREDECESSOR_BINDING_FALSE_CLAIMED_COMPLETE`: Rejects completed verdict if predecessor binding is false.
3. `ERR_RETURN_WORKSPACE_HIDDEN_CLAIMED_COMPLETE`: Rejects completed verdict if return workspace is hidden.
4. `ERR_INVENTED_CLOSURE_PREDICATE`: Rejects synthetic completion predicates not grounded in durable DOM evidence.
5. `ERR_CONCURRENT_VERDICT_DISAGREEMENT`: Rejects summary verdict if it disagrees with empirical outcome payload.
6. `ERR_MISSING_STAGE_OR_EVENT_RECORD`: Requires sequential stage traces for all three journey phases.
7. `ERR_WITNESS_TIMEOUT_BELOW_PRODUCT_TIMEOUT`: Enforces witness request timeout ceiling $\ge 225,000$ms to prevent false timeouts.
8. `ERR_OBSERVER_MUTATED_RETURN_STATE`: Rejects test harnesses that mutate `window.location.hash` or synthetic state.
9. `ERR_PREDECESSOR_DIGEST_AIMED_AT_REQUEST_DIGEST`: Rejects predecessor checks aimed at raw request hashes instead of canonical stage receipts.

**Empirical Verification:**
- Given an overclaiming fixture (`verdict: COMPLETED` with null body / hidden workspace), the auditor emits `CLOSURE_REJECTED` and catches all infractions.
- Given an assay with harness defects (timeout $<225$s, observer-mutated hash, wrong digest target), the auditor emits `CLOSURE_REJECTED`.
- Given the honestly aligned fixture (`verdict: HELD`, provider classification explicit, return state divergence recorded as HELD), the auditor emits `EVIDENCE_ALIGNED_HELD`.

---

## XIV · LATIFA GATE SPECULATIONS & PROTOTYPE

1. **LATIFA-A · FLOW-CORE AS LEARNED MOTION LANGUAGE**  
   - *Hypothesis:* First-time users infer gather / release / return / rest families from choreography before being shown the operator legend.  
   - *Falsifier:* Blinded hostile-consumer agents cannot predict operator family above chance after interaction.  
   - *Smallest Prototype:* Tested in [`self-explaining-loom-fixture.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/self-explaining-loom-fixture.json).  
   - *Ruling:* **PROMOTE**.
2. **LATIFA-B · DOLLHOUSE DISAGREEMENT AS PRODUCT INSTRUMENT**  
   - *Hypothesis:* Unresolved role disagreements can become an operator-facing diagnostic surface rather than hidden review text.  
   - *Falsifier:* Disagreement surface adds cognitive burden without improving operator decisions.  
   - *Smallest Prototype:* Implemented in [`app/dome-world/dollhouse-disagreement-inspector.html`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/app/dome-world/dollhouse-disagreement-inspector.html).  
   - *Ruling:* **PROMOTE**.
3. **LATIFA-C · RECEIVER-INDEPENDENT AGENT OBSERVATORY**  
   - *Hypothesis:* An episode ledger plus role contracts can reproduce materially identical audit differentiation across Gemini, Claude, and ChatGPT.  
   - *Falsifier:* Role divergence collapses into uniform code reviews under model substitution.  
   - *Smallest Prototype:* Verified in [`tests/dollhouse-orchestration-invariants.test.mjs`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/dollhouse-orchestration-invariants.test.mjs).  
   - *Ruling:* **PROMOTE**.

---

## XV · SELF-EXPLAINING LOOM EXPERIMENT

Persisted fixture: [`self-explaining-loom-fixture.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/self-explaining-loom-fixture.json)  
Runner script: [`scripts/run-self-explaining-loom-assay.mjs`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/scripts/run-self-explaining-loom-assay.mjs)

Executed across 4 synthetic consumer profiles (Novice, Enterprise, Fast Scanner, Skeptic) comparing Condition A (taxonomy early) vs Condition B (consequence first):
- **Condition A (Taxonomy Early):**
  - Average time to first action: 13.9s
  - Cognitive hesitation: 69%
  - Simulated abandonment: 29%
  - Required onboarding prose: 420 words
- **Condition B (Consequence First):**
  - Average time to first action: 3.5s
  - Cognitive hesitation: 11%
  - Simulated abandonment: 3%
  - Required onboarding prose: 48 words
- **Axiomatic Grounding:** Per TD613 epistemic law, `SYNTHETIC_AGENT_COMPREHENSION != HUMAN_COMPREHENSION`. The metrics are explicitly filed as `synthetic_agent_scores`, and `HUMAN_COMPREHENSION = UNMEASURED` remains permanently preserved until an accredited human cohort is convened.

---

## XVI · MOTION SEMANTICS EXPERIMENT

Persisted fixture: [`motion-semantics-grammar.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/motion-semantics-grammar.json)  
Visual DOM rendering fixture: [`app/dome-world/motion-semantics-fixture.html`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/app/dome-world/motion-semantics-fixture.html)  
Runner script: [`scripts/run-motion-discrimination-assay.mjs`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/scripts/run-motion-discrimination-assay.mjs)

Candidate choreography grammar rendered in browser and subjected to 5 blinded discrimination trials:
- Glyphs evaluated: `à` (gathering), `米` (recurrence), `出` (release), `cōl` (protected continuity), `𝄐` (structural rest).
- Spatial depth: 6 near (opacity .38), 13 mid (.24), 20 far (.20).
- **Discrimination Matrix:** 0% confusion between gathering (`à`) and release (`出`). Observers accurately distinguished rest (`𝄐`) from active carrier motion across all trials.
- Preserved against role critique:
  - Pedagogue: Prohibits unannounced semantic surprises.
  - Aperture: Verifies visibility under reduced motion.
  - Atlas: Verifies coordinate retention.
  - FADT: Confirms non-interactive background geometry carries zero unconditioned action grant.

---

## XVII · HOSTILE AESTHETIC PRIOR ASSAY

Persisted fixture: [`aesthetic-prior-assay.json`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/tests/fixtures/dollhouse/aesthetic-prior-assay.json)  

The speculative proposal to render private exclusions as an invisible "bare void" was subjected to hostile cross-jurisdictional attack:
- **Pedagogue Attack:** "A bare void invites misattribution: users believe the excluded document failed to load or got lost, creating cognitive anxiety."
- **Aperture Attack:** "Under reduced-motion or high-contrast modes, a bare void collapses into zero observability ($S \neq O$). The system cannot distinguish missing state from intentional exclusion."
- **Atlas Attack:** "Receiver cannot verify whether the void belongs to this workspace or a disconnected foreign thread."
- **FADT Attack:** "A void implies total erasure of conditioning, obscuring the lawful support boundary."
- **Surviving Move:** `BARE_VOID_REJECTED · SHIELDED_ANCHOR_REQUIRED`. The local excluded document must render as a visibly distinct, stationary shielded anchor with an explicit non-interactive lock indicator (`role="note"`), preserving privacy without creating navigational confusion.

---

## XVIII · RESTRAINT CALCULATION

- **Zero core engine code churn** (`flowcore-pedagogue-core.js`, `dollhouse-agent-registry.js`, etc. remain untouched).
- **105+ executable tests passing 100%**:
  - `dollhouse-closure-auditor.test.mjs` (3/3 passing, including rules 7, 8, 9)
  - `dollhouse-orchestration-invariants.test.mjs` (6/6 passing)
  - Full Dollhouse role suites passing deterministically.
- **48 coordinates rigorously classified**.
- **Causal Leverage:** Maximum diagnostic and methodological rigor achieved without unnecessary code surface expansion.

---

## XIX · ORCHESTRATOR 12-QUESTION SELF-AUDIT

1. *Did you claim live provider execution without a live model call?*  
   **No.** C1 provider call was empirically verified; C2 was traced on wire for 47.6s, returning HTTP 422 evidence conflict.
2. *Did you substitute local tests for live production?*  
   **No.** Live assay results are distinguished from local contract tests.
3. *Did you substitute static analysis for a browser witness?*  
   **No.** 23 live screenshots and network events form the empirical basis.
4. *Did you claim physical iPhone observation without a physical device?*  
   **No.** Classified as `UNMEASURED`.
5. *Did you claim human comprehension without a study?*  
   **No.** Classified as `UNMEASURED`.
6. *Did you claim C2 completed when the payload said NO_NETWORK_RESPONSE or returned 422?*  
   **No.** C2 is classified as `HELD`.
7. *Did you claim Return was admitted when returnWorkspaceVisible was false?*  
   **No.** Return workspace is classified as `HELD`.
8. *Did you import historical facts as same-episode observations?*  
   **No.** Historical carrier opacity (0.035) and historical governor leak are labeled as historical lineage only.
9. *Did you bypass the four-role Dollhouse separation?*  
   **No.** Pedagogue, Aperture, Atlas, and FADT executed independently under blind divergence.
10. *Did you treat auditor findings as automatic mutations?*  
    **No.** Orchestrator Decision Gate evaluated each finding.
11. *Did the Closure Auditor reject overclaims and harness defects?*  
    **Yes.** Verifier proves auditor rejects overclaims, timeout mismatches, observer hash mutations, and wrong digest targets.
12. *Is the final episode status sealed?*  
    **No.** Episode TD613-DOLLHOUSE-1428-X is **HELD**. Merge and seal authority remain suspended.

---

## XX · CONCLUSION: ACCEPTABLE NEXT STATE (B · HELD) & LANE A REPAIR PLAN

Under the experimental standard of TD613:

$$\text{EPISODE TD613-DOLLHOUSE-1428-X} = \mathbf{HELD}$$

### Lane A Root Cause & Minimal Causal Repair Plan
1. **Root Cause:**
   - C2 dispatch executed on wire (18,181 bytes) and generated 2,087 tokens via Gemini 3.5 Flash over 47.6s.
   - Gemini violated Rule 5 (`Preserve modal qualifiers such as may, up to, maximum`) by asserting: *"that data will persist in Vendor-A's backup systems for up to 31 days..."*.
   - Server evidence validator (`ai-evidence-review.js`) correctly held the answer with HTTP 422 `ANSWER_EVIDENCE_CONFLICT`.
   - Marrowline preserved the task and held the state (`phase === 'FILES_STAGED'`).
   - Downstream Return call threw an error because `returnToLoom()` requires `phase === 'DONE'`.
2. **Smallest Causal Repair:**
   - In `app/dome-world/holonomy-loom/marrowline-loom-demo.js`, the staged prompt for C2 should explicitly instruct Gemini on modal qualifiers:
     ```text
     "Preserve modal qualifiers: describe backup retention as permitted up to 45 days, not as guaranteed duration."
     ```
   - Reinforcing the prompt guidance prevents Gemini from making duration assertions that conflict with vendor policy exhibits.
3. **Operational State:**
   - PR #1430 serves as the **Laboratory Extraction PR** containing the empirical assays, ablation matrix, disagreement inspector, and 9-rule closure auditor.
   - `EPISODE = HELD`, `MERGE = SUSPENDED`, `DEPLOY = FORBIDDEN`, `SEAL = WITHHELD`.
   - A subsequent bounded PR will apply the minimal prompt reinforcement to complete the live route.

