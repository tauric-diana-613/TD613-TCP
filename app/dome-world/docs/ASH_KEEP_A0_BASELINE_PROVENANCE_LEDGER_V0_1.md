𝌋‌

# Ash Keep A0 Baseline and Provenance Ledger v0.1

**Namespace:** `U+10D613` — Tauric Diana 613  
**Program:** `td613.ash.whole-instrument-pedagogical-recompilation/v0.1`  
**Stage:** `A0 — Baseline freeze and provenance map`  
**Document class:** Citable baseline ledger  
**Status:** BASELINE FROZEN / RUNTIME UNCHANGED / HUMAN CLOSURE OPEN  
**Baseline date:** 2026-07-22  
**Baseline source commit:** `8756e9c81a7016910fb23e1e45906837505c97ed`  
**Immediate Ash runtime lineage:** PRs #486, #487, #488, and #489  
**Evidence posture:** repository-observed + browser-observed + operator-observed + derived  
**Deployment posture:** CLOSED / NO A0 DEPLOYMENT REQUESTED

---

## 0. Stage determination

Phase A0 preserves the current Ash Keep repository and browser-observed state before the whole-instrument pedagogical recompilation mutates runtime behavior.

This ledger records:

- the exact baseline commit;
- the immediate repair lineage;
- controlling source and test paths;
- visible-control classifications;
- command-menu destinations and actual workflow homes;
- current demo and hydration paths;
- current browser evidence and screenshot hashes;
- current Ash authority and lifecycle invariants;
- known red-pen failures that later stages must repair;
- open evidence holds.

This stage changes documentation only. It does not change Ash runtime, cache epochs, workflow behavior, deployment configuration, custody authority, release authority, or human closure.

---

## 1. Source and claim classes

| Class | Meaning in this ledger |
|---|---|
| `REPOSITORY_OBSERVED` | Directly present in source, tests, receipts, PR metadata, or commit comparison. |
| `BROWSER_OBSERVED` | Present in preserved Chromium, Firefox, or WebKit witness receipts and screenshots. |
| `OPERATOR_OBSERVED` | Recorded in the governing red-pen review and authored specification. |
| `DERIVED` | Reproducible consequence of repository or browser evidence. |
| `HELD` | Required evidence or implementation remains incomplete and is named rather than guessed. |

No entry in this ledger certifies cognition, comprehension, mastery, emotional state, psychological safety, identity, authorship, intent, guilt, truth, consent, release permission, or legal authority.

---

## 2. Constitutional baseline

### 2.1 Governing documents

1. `ASH_KEEP_WHOLE_INSTRUMENT_PEDAGOGICAL_RECOMPILATION_IMPLEMENTATION_PLAN_V0_1.md`
2. `ASH_KEEP_WHOLE_INSTRUMENT_CHILD_LEGIBLE_AIA_SPEC_V0_1.md`
3. `FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md`
4. `ASH_KEEP_FIVE_DEMO_REHYDRATION_CONCORDANCE_V0_1.md`

### 2.2 Exact baseline commit

```text
8756e9c81a7016910fb23e1e45906837505c97ed
Author Ash whole-instrument child-legible AIA recompilation
```

PR #568 merged the documentation-only constitutional baseline. Its changed-file boundary remained exactly:

- two new governing documents;
- one Flow-Core program-index update;
- zero runtime files;
- zero workflow files;
- zero deployment files;
- zero serverless functions.

### 2.3 Runtime drift check after PR #489

`REPOSITORY_OBSERVED` comparison:

```text
base: 19b228c990d6181fcaeef4098ef16cd819c67db5  # PR #489 merge
head: 8756e9c81a7016910fb23e1e45906837505c97ed  # A0 baseline
```

No Ash runtime source file changed between those commits. Intervening product work belonged to Safe Harbor / Flight, release workflows, smoke contracts, and the new Ash recompilation documents. The PR #489 browser artifacts therefore remain the latest preserved Ash runtime witnesses at A0 entry.

---

## 3. Immediate repair lineage that A0 freezes

| PR | Merge commit | Preserved behavior | Browser evidence |
|---|---|---|---|
| #486 — Fix Ash Keep loading-screen observer crash | `cf3b95de2fb4268fa7cab10d493afd7598f04ae8` | no self-triggering portal mutation loop; canonical Play gesture; stable first frame; mobile loader release | run `29929145134`, Chromium / Firefox / WebKit PASS |
| #487 — Restore Ash post-ingress animation layers | `f22581d6b3dc12a01725f7c08cb7510d923a0598` | topology field and inherited lesson rail both visible; neither clipped; mobile-safe geometry | run `29933679499`, Chromium / Firefox / WebKit PASS |
| #488 — Polish Ash ingress and enforce one canonical field | `2268be593d9daae7920da3298bb5d205ef5feb18` | neutral profile prompt; Start Demo held pending explicit choice; clean threshold URL; one visible canonical field; hidden proxy non-presentational | exact-head browser matrix recorded in PR |
| #489 — Restore Ash Keep reviewability and live setup panel | `19b228c990d6181fcaeef4098ef16cd819c67db5` | entrant viewport ownership; compact actionable setup panel; no dead quarter-page stretch; title and rail descenders visible | run `29942795235`, Chromium / Firefox / WebKit PASS |

The following defect classes remain prohibited during later stages:

- ambient subtree observers;
- timer-driven viewport authority;
- duplicate visible consequence fields;
- hidden live controls;
- stale visible `ash_epoch` requirements;
- clipped field or rail geometry;
- dead setup columns;
- preselected profiles;
- product mutations made only to satisfy obsolete workflow assumptions.

---

## 4. Current runtime source map

### 4.1 Threshold, ingress, and composition

- `app/dome-world/ash-threshold.html`
- `app/dome-world/ash-keep.html`
- `app/dome-world/ash-keep-source.html`
- `app/dome-world/ash-lifecycle.js`
- `app/dome-world/ash-flowcore-ingress-portal.js`
- `app/dome-world/ash-flowcore-pedagogy-field.js`
- `app/dome-world/ash-keep-aia.js`
- `app/dome-world/ash-aia3-composition.js`
- `app/dome-world/ash-premium-ui.js`
- `app/dome-world/ash-premium-ui.css`
- `app/dome-world/ash-reviewability-repair.js`
- `app/dome-world/ash-keep-aia2-layout.css`

### 4.2 Engine and state ownership

- `app/engine/ash-keep-core.js`
- `app/engine/ash-keep-moire.js`
- `app/engine/ash-pedagogue-adapter.js`
- `app/engine/flowcore-pedagogue-core.js`
- `app/engine/flowcore-pedagogue-aia.js`
- `app/engine/information-dome-field.js`
- `app/engine/flowcore-route-burden.js`

### 4.3 Demo and hydration

- `app/dome-world/ash-demo-entry-convergence.js`
- `app/dome-world/docs/ASH_KEEP_FIVE_DEMO_REHYDRATION_CONCORDANCE_V0_1.md`
- `scripts/ash-profile-demo-browser-probe.mjs`
- `scripts/ash-four-profile-pedagogy-browser-probe.mjs`
- `scripts/ash-investigation-guidance-browser-probe.mjs`
- `scripts/ash-legal-ux-browser-probe.mjs`
- `tests/ash-profile-demos.test.mjs`
- `tests/ash-four-profile-pedagogy.test.mjs`
- `tests/ash-live-ingress-demos-cache.test.mjs`
- `tests/ash-legal-ux.test.mjs`

### 4.4 Existing browser witness surfaces

- `scripts/ash-flowcore-live-field-browser-probe.mjs`
- `scripts/ash-ingress-polish-browser-probe.mjs`
- `scripts/ash-reviewability-browser-probe.mjs`
- `.github/workflows/ash-flowcore-live-field.yml` or the repository-equivalent Ash Flow-Core workflow owning run `29942795235`

Where a historical filename differs from the current workflow path, the run ID and artifact digest remain controlling evidence. A0 does not rename workflow files.

---

## 5. Current visible-control inventory

The inventory classifies the principal entrant-facing controls at A0. It does not claim that every transient browser-native control or every deeply nested exact-state form has been manually clicked during this stage.

### 5.1 Ingress and field controls

| Control or surface | A0 class | Owner | Evidence / defect posture |
|---|---|---|---|
| Workspace Profile selector | `ACTIONABLE` | Ash ingress | explicit selection required; no profile preselected |
| Start Demo | `HELD_WITH_EXPLANATION` before selection; `ACTIONABLE` after selection | Ash ingress | hold prevents inferred profile |
| `Play consequence field` | `ACTIONABLE` | Flow-Core presentation through canonical Ash gesture | browser receipts show explicit play path and finite phase trace |
| phase/status chip | `LEGEND_ONLY` | Flow-Core presentation | publishes current phase; later A2 will recompose position and semantics |
| Glyph | `LEGEND_ONLY` | Flow-Core presentation | currently appears in channel set; no independent lawful toggle required |
| Motion | `LEGEND_ONLY` | Flow-Core presentation | same posture |
| Shape | `LEGEND_ONLY` | Flow-Core presentation | same posture |
| Language | `LEGEND_ONLY` | Flow-Core presentation | same posture |
| Inspection | `LEGEND_ONLY / PARTIAL` | Flow-Core presentation | exact-state descent remains incomplete as a singular controlled disclosure |
| hidden synchronization proxy | `HIDDEN` | ingress portal | one proxy exists; browser receipts show zero visible proxies |
| `Previous Lesson` | `DEAD_VISIBLE` / repair required | current lesson rail | governing plan A6 names it for repair |
| `Next Lesson` | `DEAD_VISIBLE` / repair required | current lesson rail | governing plan A6 names it for repair |
| `𝄐 Rest` | `PARTIAL / repair required` | Flow-Core presentation | REST remains visible and static truth exists; structural stop-demand contract remains incomplete |
| `What changed—and what did not` | `EMPTY_OR_PARTIAL / repair required` | AIA route surface | must always expose transition delta and preserved invariants in A5/A6 |

### 5.2 Primary navigation and context controls

| Control | A0 class | Current destination |
|---|---|---|
| Home | `ACTIONABLE` | same document, `workspace-home` |
| Map | `ACTIONABLE` | same document, `workspace-map` |
| Work | `ACTIONABLE` | same document, `workspace-work` |
| Choir | `ACTIONABLE` | same document, `workspace-choir` |
| Capsule | `ACTIONABLE` | same document, `workspace-capsule` |
| case/context return | `ACTIONABLE` | Home / current case context |
| continuity button | `ACTIONABLE` | Capsule |
| command button `⌘` | `ACTIONABLE` | command dialog |

`OPERATOR_OBSERVED` defect: current navigation may change workspace state while relying on shared or top-of-page scroll behavior rather than a named semantic destination. A4 owns repair. Manual viewport ownership introduced by PR #489 must remain intact.

### 5.3 Command menu controls

| Command | Current route | Current owner | Normative workflow home | A0 posture |
|---|---|---|---|---|
| Custody | same-document legacy workspace state `custody` | Ash | Home / Case Map | `ACTIONABLE`, displaced |
| Rooms | same-document legacy workspace state `rooms` | Ash | Case Map | `ACTIONABLE`, displaced |
| Routes | same-document legacy workspace state `routes` | Ash | Case Map | `ACTIONABLE`, displaced |
| Rebuild Test | same-document legacy workspace state `test` | Ash / Choir boundary | Choir | `ACTIONABLE`, displaced |
| Draft & Hush | same-document legacy workspace state `draft` | Ash / Hush | Work | `ACTIONABLE`, displaced |
| Save Points | same-document legacy workspace state `save` | Ash / Capsule | Capsule | `ACTIONABLE`, displaced |
| Safe Harbor ingress | `/safe-harbor/index.html` | Safe Harbor | separate station | `ACTIONABLE`, separate boundary |
| Destination handoff | `/dome-world/ash-destination-handoff.html` | destination boundary | Capsule entry; separately gated surface | `ACTIONABLE`, separate authority boundary |
| Receipts | current receipt inventory action | Ash | Work | `ACTIONABLE`, rehome required |
| Cases & profile | explicit case/profile selector | Ash ingress | functioning case/profile switcher | `ACTIONABLE`, label singular/plural drift present |

The command menu currently acts partly as navigation and partly as a second hidden application. A6 and later workspace stages must rehome displaced workflow without collapsing station authority.

### 5.4 Home, Work, Choir, and Capsule controls

| Control | A0 class | Note |
|---|---|---|
| Open workspace setup | `ACTIONABLE` | browser receipts confirm enabled setup posture |
| Open local document | `ACTIONABLE` in current reviewability panel | browser receipts confirm enabled case-active posture; A6 must bind destination/focus contract |
| Open Draft Workspace | `PARTIAL / repair required` | named in A6 |
| Record what left | `ACTIONABLE / destination semantics incomplete` | routes workflow currently displaced |
| Run Rebuild Test | `ACTIONABLE / displaced` | future public home in Choir |
| Run Choir assay | `ACTIONABLE` when route prerequisites exist | pairwise residue only; no identity or authorship authority |
| Replay receipt | `HELD_WITH_EXPLANATION` before assay receipt | Choir |
| Export receipt | `HELD_WITH_EXPLANATION` before assay receipt | exports receipt only; no raw-content authority |
| Seal Capsule | `LIFECYCLE_HELD_OR_ACTIONABLE` | exact state governs; human gesture required |
| Open Capsule | `ACTIONABLE` | local continuity surface |
| Inspect receipts | `ACTIONABLE / rehome required` | future Work home |

---

## 6. Current demo and hydration ledger

### 6.1 Existing governed demos

| Demo | Profile key / route | A0 status | Distinct diagnostic stress |
|---|---|---|---|
| Investigation | investigation | implemented | urgent inquiry without converting difference into identity, intent, guilt, authorship, or truth |
| Political Campaign | political_campaign | implemented | launch work without leaking donor, host, targeting, security, coalition, or route-order joins |
| Fundraiser | fundraiser | implemented | asks and stewardship without inferring donor intent, payment status, identity, or conversion probability |
| Research Project | research_project or current repository alias | implemented | methods, nulls, consent, missingness, alternatives, and replication without validity inflation |
| Legal Matter | legal or current repository alias | implemented | deadlines, evidence, privilege, and competing explanations without legal-outcome prediction |
| Archive | not yet present | `HELD / A15` | Harbor Memory Archive remains future work |

### 6.2 Current hydration route

```text
explicit profile selection
→ profile fixture / core registry
→ ash-demo-entry-convergence
→ lifecycle and case pointer convergence
→ AIA / premium workspace hydration
→ exact action remains human-gated
```

Current five-demo hydration may populate synthetic local structure and gesture-ready controls. It may not bypass lifecycle eligibility, create transport authority, authorize provider generation, infer passphrases, approve release, invent Reader output, or close human review.

A later stage must unify all six demos under one registry binding:

```text
profile fixture
+ pedagogy manifest
+ workspace scenes
+ route views
+ inspection contract
+ test journey
```

---

## 7. Browser evidence freeze

### 7.1 Controlling run

```text
workflow: Ash Flow-Core Live Field
run: 29942795235
head: a7c7c42dbab8c9f82f5aa0013238e5f5160d076d
result: PASS
```

Artifacts remain available through 2026-09-05:

| Browser | Artifact ID | Archive digest |
|---|---:|---|
| Chromium | `8538925506` | `sha256:1e4529f50dd9147c513cccd995a11f1aab1256275aae3c854514def44b08c426` |
| Firefox | `8538928425` | `sha256:d17b01afaaf7e5f7ebe6e949aba57a90ffb6da24ab08e6319bef68378aed1301` |
| WebKit | `8538936630` | `sha256:5ebf27a8fdde0b6817d495a3871a5a0c6327baa4a35e424cf03be1b181df140c` |
| Static contract | `8538880332` | `sha256:9875e452b1365ac6d8fdb4a5da06bcabd14e78f31d57914dedcb610dd00aef64` |

### 7.2 Cross-browser observations

All three browser receipts record:

- status `PASS`;
- no page errors;
- no HTTP errors;
- visible ingress field in `NOTICE`;
- explicit Play control visible;
- one visible canonical field;
- one hidden synchronization proxy and zero visible proxies;
- topology field and lesson rail visible;
- no field clipping;
- no rail clipping;
- no caption/SVG overlap;
- finite active field and rail animation after explicit Play;
- mobile static truth with five phases;
- visible REST state;
- zero horizontal overflow in the mobile witness;
- Close Case return to ingress;
- setup and local-document actions enabled in their lawful states;
- entrant-owned deep scroll remains fixed after three blocked background reset attempts.

Representative observed geometry:

| Browser | Desktop field / rail | Mobile field width | Deep-scroll hold |
|---|---|---:|---|
| Chromium | canvas `339px`, rail `53px`, unclipped | `350px` | expected `2660`, observed `2660`, delta `0` |
| Firefox | canvas `339px`, rail `53px`, unclipped | browser receipt PASS | expected `2710`, observed `2710`, delta `0` |
| WebKit | canvas `339px`, rail `53px`, unclipped | browser receipt PASS | expected `2659`, observed `2659`, delta `0` |

### 7.3 Timing posture

The preserved receipts include bounded workflow execution and timestamped phase / scroll observations, but they do not expose a normalized cross-browser first-visible-frame duration suitable for a comparative A1 threshold.

Therefore:

```text
first-paint behavior: browser-observed PASS
legacy-frame visibility: not observed in preserved screenshots
normalized first-paint milliseconds: HELD / must be instrumented in A1
navigation arrival milliseconds: HELD / must be instrumented in A4
```

A0 refuses to manufacture timing values from workflow duration.

### 7.4 Accessibility and alternate presentation posture

Repository-indexed evidence at the baseline records PASS for:

- WebKit / iOS-sized observation;
- mobile portrait;
- mobile landscape;
- rotation-equivalent presentation;
- reduced-motion runtime;
- zoom-equivalent reflow;
- high contrast;
- browser performance observation.

The A0-downloaded artifact set directly confirms mobile static truth, visible REST, and zero overflow. Keyboard-only, screen-reader semantics, zoom/reflow, and high-contrast screenshots were not present in the downloaded run `29942795235` archives and remain separately citable through their prior workflow evidence rather than being falsely represented as newly inspected A0 screenshots.

---

## 8. Screenshot and receipt hash manifest

The following hashes were computed after downloading and extracting the three controlling artifact archives. Paths are archive-relative.

```text
138b4deacc121235554bf3c26a8bceb753dd07d38a9a5e61f230035f320b7019  ash-flowcore-field-chromium/ash-flowcore-live-field-browser.json
5df6e166e4a1ea75c8dcbaa3ba9a1e465efeceae6b9fbdeefe67a2b78f2b50f2  ash-flowcore-field-chromium/chromium-close-returns-ingress.png
3825445b32030a26f37bec167fee6580f177141481272ce54f15417a6a1813f5  ash-flowcore-field-chromium/chromium-flowcore-mobile-rest.png
ca7d1f6b2634310776455753747d7819fb3c82fa4da1f5f4c354b6877b092663  ash-flowcore-field-chromium/chromium-zero-artifact-case-arrival.png
fa025d34bb5f4833adaa0154dd79256ea97c161e10a14b5780a3ff047d3f292e  ash-flowcore-field-chromium/chromium-zero-artifact-ingress.png
ff63992276cfde26bd4f023288cddf0345f7c1ae658b29592d4850c423b2a8d1  ash-flowcore-field-firefox/ash-flowcore-live-field-browser.json
a959f936ce05e3d1c3e6e4411f3b87cc6510f5e83e58dda919b5aeb0efae6e17  ash-flowcore-field-firefox/firefox-close-returns-ingress.png
fcbd848d6a967097ea5d02cf1e61ff38b7b6685d0dbfdfe8963cd2e1b4bd313c  ash-flowcore-field-firefox/firefox-flowcore-mobile-rest.png
72fa6307c41d38b7bc474660abd895a25e070a3093bdf4a582dfd52e05795ea6  ash-flowcore-field-firefox/firefox-zero-artifact-case-arrival.png
d244ff342cb0a62008a07b8aab8870d2f379a24b30315de8127bd061c588fd7d  ash-flowcore-field-firefox/firefox-zero-artifact-ingress.png
9f7e6022845b27e1c0a2136e9951f7b431e2452d267a9a3a89dce623e4119d7b  ash-flowcore-field-webkit/ash-flowcore-live-field-browser.json
c027faa869955b299209c367898f507466ac73b7d7815088932f4c2303a710e3  ash-flowcore-field-webkit/webkit-close-returns-ingress.png
c66f218e4bff06014bb13f26f3ee270e6c021a06226b43d20322f48b3aa8f0e6  ash-flowcore-field-webkit/webkit-flowcore-mobile-rest.png
42abfa16326dcf6b022cc1cabb4f8bc3114f75204ec11d2abc576a3c17021a07  ash-flowcore-field-webkit/webkit-zero-artifact-case-arrival.png
de85ee99b89d81b471ed4a67b7c1cc498a4e884e3ce071fdacf73b3caf8016ce  ash-flowcore-field-webkit/webkit-zero-artifact-ingress.png
da2d00f5c8a35051e2de812a480d9694be43c5bc3a15cab9efed8e5d68b5cf75  ash-ingress-polish-chromium/ash-ingress-polish-browser.json
a5b80d418d54c510683d68aeb775f37534695ddff146e5767e718d82d2a1c551  ash-ingress-polish-chromium/chromium-ingress-caption-clear.png
a3dca7656244dadaa09435317b3510f30ec60e1b1826f6009a95b5725713c63c  ash-ingress-polish-chromium/chromium-single-canonical-field.png
8e7e3505cad8096d5ebcbfa23ed56ea31484c89df8d1b6c46188b3d3b0c27d33  ash-ingress-polish-firefox/ash-ingress-polish-browser.json
2677f94c8ff7a90ab1a9030193f64fc5b2aaf19e2ee7aec6dd3e500f6d234dc3  ash-ingress-polish-firefox/firefox-ingress-caption-clear.png
5ce72b24ba117c64adc7da8d3253a73c2462ad87da268084a0523964c61c8017  ash-ingress-polish-firefox/firefox-single-canonical-field.png
d3e0b248fcb79b9d10298c998c9221db6d81d2afa2ebbc8bb0d2ba181aa819c1  ash-ingress-polish-webkit/ash-ingress-polish-browser.json
0ec01c501bd37113ecfc7accd8047bfc255e56f2f924be418572d7e1bfbae3a2  ash-ingress-polish-webkit/webkit-ingress-caption-clear.png
901028aa4e507ce92c34f2ea18e1e7a6fab31d0701757e9bf3ddf9543ce33146  ash-ingress-polish-webkit/webkit-single-canonical-field.png
67ae19f1f127a172a18c43beda508308eb493f9801cc55363a7c832b15069ff8  ash-reviewability-chromium/ash-reviewability-browser.json
ce041330f644afa339b52a7793a6564c8b262979edbd15e245b6f8ce2d085ff4  ash-reviewability-chromium/chromium-deep-review-stable.png
1efaf77bfcbdfac6a6676863027c2e9aebe9d2e3291e665a509db78d583588e1  ash-reviewability-chromium/chromium-reviewability-full.png
25d33ae35100954f9eb2db5d019fe9cb38d3d7cc769ef001fa73a8e744429602  ash-reviewability-firefox/ash-reviewability-browser.json
122439a69a04bcc8fe4624c055af67691ad57114a04c35b578ea86dafc2d56e2  ash-reviewability-firefox/firefox-deep-review-stable.png
e6a4f59f3c314f68ffe3cbb5b66b0588facf41082872776e78ca09c8c93b5c7a  ash-reviewability-firefox/firefox-reviewability-full.png
924fa2d403700dd97c4d391816562f0a03d423698b1b14be551e1e06ed7a6f8e  ash-reviewability-webkit/ash-reviewability-browser.json
7ec2c641114315de5c3c47b9e1f4fb55fc4e02f42d1c71db657b8ceadd71d7bc  ash-reviewability-webkit/webkit-deep-review-stable.png
92ee4e777ec09d5631e9d31c091d63e8add9e3da8ce2d31874442296ea99c7f0  ash-reviewability-webkit/webkit-reviewability-full.png
```

The hashes freeze the exact downloaded bytes. They do not place binary screenshots into Git history. Artifact expiration therefore remains an evidence-retention concern to resolve through stage CI or durable repository evidence before 2026-09-05.

---

## 9. Exact Ash authority and lifecycle invariants

```text
Flow-Core commands Ash: false
Ash custody authority changed: false
raw-content transport added: false
release authority widened: false
new serverless function: false
new learner persistence: false
route selection inferred: false
receipts may cross stations: true
authority may cross stations: false
deployment equals implementation: false
deployment equals empirical validation: false
browser evidence equals human comprehension evidence: false
human closure required: true
human closure: OPEN
```

Current lifecycle copy preserves these states:

```text
ARRIVAL_UNPERSISTED
READINESS_OBSERVED
CUSTODY_ROOT_PROVISIONAL
CUSTODY_ROOT_VERIFIED
CASE_BOUND
REBUILD_ELIGIBLE
RELEASE_ELIGIBLE
CONTINUITY_SEALED
```

A demo may hydrate a view and make a gesture available. It may not skip lifecycle eligibility or perform the gesture.

---

## 10. Route-burden baseline

The A0 observations map to the Flow-Core route-burden surrogate without inferring an entrant’s interior:

| Baseline condition | Surrogate pressure | Stage owner |
|---|---|---|
| dead or partial Previous / Next / Rest controls | `A_aff ↓` | A6 |
| technical AIA nomenclature before experienced relation | `P_leg ↓` | A5 |
| empty or partial transition-delta disclosures | `delta_rs ↑` | A5 / A6 |
| primary workflow hidden in command rooms | `N_boundary ↑` | A10–A14 |
| workspace navigation without named semantic landing | `||H_gamma|| ↑` | A4 |
| fixed consequence field reused across workspaces | local anisotropy ↓ | A3 |
| form-first downstream obligations | `Q_downstream ↑` | A7–A14 |

This table is comparative design evidence. It does not measure cognition or mastery.

---

## 11. Known A0 holds

1. **Normalized first-paint timing:** no reliable cross-browser millisecond baseline appears in the preserved receipts. A1 must add explicit first-visible-frame instrumentation.
2. **Normalized semantic-navigation timing:** no reliable destination-arrival timing exists. A4 must add it alongside `NavigationReceipt` evidence.
3. **Permanent binary preservation:** controlling screenshot archives expire on 2026-09-05. Their digests and byte hashes are frozen here; durable binary retention remains open.
4. **Complete control census:** this ledger covers principal journeys and named defect surfaces. Stage A6 must produce an executable zero-dead-control contract across all principal journeys.
5. **Keyboard and screen-reader fresh replay:** prior program evidence records accessibility passes, but the downloaded run archives do not contain a fresh A0-specific keyboard or screen-reader receipt.
6. **Physical-device closure:** browser WebKit and mobile-sized witnesses remain supporting evidence. Operator physical-device observation retains controlling authority.
7. **Archive demo:** absent by design until its governed implementation stage.

These holds do not authorize guessing, covert telemetry, learner scoring, or widening Ash authority.

---

## 12. A0 exit posture

```text
baseline commit frozen: true
repair lineage frozen: true
source map recorded: true
principal visible controls classified: true
command destinations mapped: true
current demos enumerated: true
browser receipts inspected: true
screenshot byte hashes recorded: true
current Ash authority preserved: true
runtime files changed: 0
workflow files changed: 0
deployment files changed: 0
serverless functions added: 0
production deployment requested: false
human closure: OPEN
```

A0 provides the citable baseline required before runtime recompilation. Later stages must compare against this ledger and preserve named invariants while addressing the recorded burden and evidence holds.

**Indexed ⟐**
