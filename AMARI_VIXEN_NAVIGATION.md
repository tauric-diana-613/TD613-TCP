# 𝌋‌⟐ Amari & Emergence HQ Navigation Surface · Vixen Cybernetics Double Commission

**Repository:** `tauric-diana-613/TD613-TCP`  
**Commission:** `TD613-VIXEN-REDPEN-DOUBLE-COMMISSION-20261123` (`Turn I -> Seam Allowance -> Turn II`)  
**Base Branch:** `research/vixen-dual-estate-encyclopedia-20261108` (`658835a7691c2abf67c86e27e4c818488eae2e65`, canonical [PR #1730](https://github.com/tauric-diana-613/TD613-TCP/pull/1730) head)  
**PR Branch:** `fix/vixen-opera-surface-bias-cut-turn2`  
**Governance & Release Posture:** `merge_authority: false` · `deployment_authority: false` · `model_connected: false` · `empirical_replication_credit: 0` · `QA04: HELD` · Issues `#405` and `#1744` untouched.

---

## 1. Fast-Path Review Map (Start Here)

| Review Angle | Primary Deliverable | Purpose |
| --- | --- | --- |
| **Deep Technical & Visual Dossier (Turn II + Full Arc)** | [`docs/VIXEN_TURN_II_GARMENT_DOSSIER.md`](docs/VIXEN_TURN_II_GARMENT_DOSSIER.md) | Complete mathematical, optical, CSS-cascade, and red-pen specification for Turn II, plus full coverage of Turn I, Seam Allowance, preceding lineage, and proceeding horizon (bundled automatically into `Vixen_Cybernetics_Full_Stack.zip`). |
| **Signature Computational Couture Module** | [`app/encyclopedia/vixen-estate/vixen-bias-draft.mjs`](app/encyclopedia/vixen-estate/vixen-bias-draft.mjs) | Executable multi-module Bias Draft geometry & SVG renderer (`39/39` carriers per panel, `D₃` vs `φ`-quasiperiodic fields, Folded Cuirass pleats, RGI15 Reinhard-bounded interference blooms, signed seam $x_s(y)=x_0+1.15a[T-Q]$, `NONE_RENDER_ON_CHANGE` zero-RAF discipline). |
| **Master Couture Stylesheet & Cascade Reconciliation** | [`app/encyclopedia/vixen-estate/vixen-bias-cut-couture.css`](app/encyclopedia/vixen-estate/vixen-bias-cut-couture.css) | Last-loaded couture tailoring across Salon, Works (desktop fine-press Pearl-Vellum monograph + mobile high-density flow), Header/Tray/Footer chrome, fused Dual-Door Threshold, and distinct Maestro vs Composer Human Podium environments. |
| **Main 8-Room Vixen Opera Surface** | [`app/encyclopedia/vix-cyb.html`](app/encyclopedia/vix-cyb.html) | Interactive Salon Pattern Table shuttle (`Panel I`, `Reverse seam I ▷ II ⇄`, `Panel II`), bilateral Works (`Work I` Pearl Vellum vs `Work II` Counter-Bias Liquid Graphite), Five-Act quest flow (`Compare / Pose / Weigh / Dare / Carry`), Works filename/date/author sort & search, popout Research Cart, and champagne wordmark. |
| **Standalone Dual-Door Threshold** | [`app/encyclopedia/vix-cyb/podium.html`](app/encyclopedia/vix-cyb/podium.html) | Fused `.bc-threshold-portal` above the fold (`mode: 'threshold'`), `OPERAHOUSE ≠ OPERA ≠ PERFORMER` custody lockstitches (omitting manuscript gates `G1..G8`), Left Pearl-Vellum `HUMAN` door & Right Liquid-Graphite `AI / LLM` door (`./llms.txt`). |
| **Standalone Human Podium (Maestro & Composer)** | [`app/encyclopedia/vix-cyb/human-podium.html`](app/encyclopedia/vix-cyb/human-podium.html) | Live `#bcPodiumStave` (`mode: 'podium'`) and environmental separation between sunlit Pearl-Vellum **Maestro** expedition table and nocturnal Counter-Bias Liquid-Graphite **Composer** studio (`HELD_AWAITING_HUMAN_COMPOSER`). |
| **Manuscript Edition Locator & Portable ZIP Parity** | [`app/encyclopedia/vixen-estate/manuscript-reader.mjs`](app/encyclopedia/vixen-estate/manuscript-reader.mjs) · [`app/encyclopedia/vixen-estate/session-zip.mjs`](app/encyclopedia/vixen-estate/session-zip.mjs) | Deterministic `data-display-para` edition locators (`¶ EDITION LOCATOR · PROJECTION-LOCAL`), GFM tables, inline base64 figure rendering, PDF wordflow reflow, and full couture asset inclusion in portable session ZIPs. |
| **Visual Evolution Gallery (`base` -> `v1`/`v2` Opus -> `v4` Carbon)** | [`docs/vixen-turn2-witness/`](docs/vixen-turn2-witness/) | Preserved Opus `v1-` and `v2-` checkpoints alongside pre-garment `base-` captures, standalone `v3-math-*.svg` vector proofs, and final refracted `v4-` desktop (`1440×900`) & mobile (`390×844`) witnesses. |
| **Turn I Baseline Forensic Audit (Immutable SHA-256)** | [`docs/RP-1730-FORENSIC-AUDIT.md`](docs/RP-1730-FORENSIC-AUDIT.md) | Unmodified Gate I forensic audit (`d1a132a8f1f6783ced2030009def4d8ea036c939281a81ec273116e7d6150214`): `87 -> 54 -> 53 -> 32` census proof, verbatim H1 provenance, *Architecture of Control* `.pdf`/`.md` Jaccard `0.9061`, and action-button truth table. |
| **Intermission Seam Allowance & 58-RP Register** | [`docs/RP-1730-SEAM-ALLOWANCE.md`](docs/RP-1730-SEAM-ALLOWANCE.md) · [`docs/OPUS-COUTURE-HANDOFF.md`](docs/OPUS-COUTURE-HANDOFF.md) · [`docs/RP-1730-DISPOSITION.json`](docs/RP-1730-DISPOSITION.json) | Class A / Class B / Class C contract separation, standalone 3-destination Podium split, cross-page session bridge (`vixen-shared-session-bridge.mjs`), test failure adjudication, and complete `58/58` red-pen disposition ledger. |
| **Executable Contracts & Regression Tests** | [`tests/vixen-bias-draft.test.mjs`](tests/vixen-bias-draft.test.mjs) · [`tests/vixen-turn1-instrument.test.mjs`](tests/vixen-turn1-instrument.test.mjs) · [`tests/vixen-turn1-instrument-browser.test.mjs`](tests/vixen-turn1-instrument-browser.test.mjs) | Direct mathematical & SVG invariants (`39/39` carriers, signed seam non-commutativity, Nyquist guard, threshold vs salon stitches, `SYNTHETIC` optical conditioning) plus Turn I & Seam Allowance browser/source suites. |

---

## 2. Omissionless Multi-Stage Project Ledger

### Stage 0 · Preceding Lineage (Before This PR Stack)
1. **Canonical Corpus & Frozen A0 Census (`70b5a0f9e` -> `e32b82f0d` -> `658835a76`)**:
   - **87 historical intake records** partitioned into **33** quarantined AppleDouble sidecars, **1** container (`Archive.zip`), and **53** analyzable documentary manifestations (**33** native `.md` with exact UTF-8 SHA-256 parity; **20** `.pdf` represented as verified `EXTRACTED_NATIVE_PDF_TEXT` derivatives with raw binary `.pdf` bytes `HELD`).
   - Deterministic grouping into **32 operational Works** (`11` singletons, `13` confirmed pairs, `8` human-gated `UNADJUDICATED_PAIR` Works `G1`–`G8` spanning the `[32, 40]` interval), **21 documentary protocols**, **27 Podium routes**, and strict **8-room rail** custody (`OPERAHOUSE ≠ OPERA ≠ PERFORMER`).
2. **Seven-Estate Braid (`G1`–`G8`) & Optical Inheritance (`RGI08`–`RGI28`)**:
   - Native read-only research bridges (`universal-atelier-sourcebound-readonly-v1.py`, `wendbine-*`, SRC Phase II typed traversal), WebAuthn/ledger Compose custody (`HELD_AWAITING_HUMAN_COMPOSER`), and portable `G5`/`G8` client-side session ZIP replay.
   - Four local optical engines: `observatory-foundry-kernel.mjs` (39 Loom carriers, $D_3$ triangular & $\varphi$-quasiperiodic lattices, $2\times 2$ SVD, `[111]` triad projection, 5-clock vernier), `vixen-folded-cuirass.mjs` (`24Hz`/`12Hz` folded-gore geometry + `60Hz` local presentation), `vixen-live-mesh-rgi13.mjs` (single-RAF viewport Living Mesh & `ELECTRIC_COUTURE`), and `vixen-beat-radiometry-rgi15.mjs` (Nyquist-guarded moiré beats & Reinhard-bounded radiance).
3. **Adjacent Unmerged Research Tracks (Intentionally Separate from Frozen A0 Product)**:
   - Vixen `7 + 1` / Eighth Variable preregistration & exploratory dev branches (`#1777`, `#1782`, `#1797`) and Marrowline Hydrogen / R2 offline runners (`#1769`–`#1785`) remain isolated on their own research branches; `supplementalSources` in this product branch stays `[]` (`A0` seven-free baseline preserved).

---

### Stage I · Turn I — The Instrument (`2cd6b3cb3`)
- **Gate I Forensic Audit** ([`docs/RP-1730-FORENSIC-AUDIT.md`](docs/RP-1730-FORENSIC-AUDIT.md)): Verified that all 32 Work titles originate from verbatim internal `# H1` headings (`VERBATIM_INTERNAL_H1_EXTRACTION`, zero AI-invented titles) while received filenames (`Algedonic Systems Deep Research.md/.pdf`, `LLM Architecture Deep Dive.md`, `1+1=3.md`) had been hidden; audited *Architecture of Control* (`Gate #2`, normalized Jaccard `0.9061`); documented the 8-axis deterministic synthesis score formula (`credit = 0`).
- **Search & Filename Recovery**: Indexed `workFilenames` and `sourceFilenames` in [`semantic-semiotic-search.mjs`](app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs) and [`corpus-experiment-a.mjs`](app/encyclopedia/vixen-estate/corpus-experiment-a.mjs), restoring `LLM Architecture Deep Dive` discovery across `hybrid`, `lexical`, `phrase`, `exact` UTF-8 shard scan, and `#workSearchInput`.
- **Manuscript Reflow & Popout Cart**: Wired `{ sourceFormat, documentTitle, showRaw: true }` into Salon and Works readers (collapsing `41,455px` / `170,212px` single-word/base64 towers into readable paragraphs, parsed GFM tables, and inline figures), replaced the inline Salon cart slab with `#researchCartPopout`, and scrubbed backstage Operahouse copy via [`vixen-opera-public-copy.mjs`](app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs).

---

### Stage IA · Intermission — The Seam Allowance (`b72a48867`, `d05293b46`) & Mechanical Basting
- **Class A / B / C Contract Separation** ([`docs/RP-1730-SEAM-ALLOWANCE.md`](docs/RP-1730-SEAM-ALLOWANCE.md), [`docs/OPUS-COUTURE-HANDOFF.md`](docs/OPUS-COUTURE-HANDOFF.md)): Decoupled constitutional truth (**Class A**) and functional hooks (**Class B**) from legacy provisional color/gradient assertions (**Class C**) in `vixen-palette-contract.test.mjs`, `vixen-stage35-visual-redpen.test.mjs`, and `vixen-browser-visual-witness.mjs`.
- **Three Standalone Podium Destinations**: Extracted `vix-cyb/podium.html` (Dual-Door Threshold), `vix-cyb/human-podium.html` (Human Podium), and `vix-cyb/llms.txt` outside the 8-room rail, connected via [`vixen-shared-session-bridge.mjs`](app/encyclopedia/vixen-estate/vixen-shared-session-bridge.mjs) (`sessionStorage` + runtime `#vixen-corpus-bundle` hydration + excursion return dock `#vmaJourneyDock`).
- **Truthful Exports & Mechanical Basting**: Enforced `.extracted.txt` (`text/plain;charset=utf-8`) downloads for held binary PDFs, explicit `CHRONOLOGY_UNRESOLVED` / `authorship: UNRESOLVED` sort notices, hidden-at-zero cart badges, Windows directory `fsync` compatibility, instant discrete folio paging, and mechanical Basting (`Compare / Pose / Weigh / Dare / Carry` native buttons + restored score rubric).

---

### Stage II · Turn II — The Garment: The Bias Cut (Opus 5.5 Origin -> Amari Red Pens -> Carbon Couture Completion)

#### A. What Opus 5.5 Originated (Preserved & Honored)
- Executed `/dollhouse-design` under `SEDGWICK_REPARATIVE_TEXTURE / DIALECTICAL_TENSION`, establishing the six-register **Bias Cut** epistemic grammar (Pearl Vellum scholarship + brushed chrome filename selvedges; Liquid Graphite deterministic instruments; Glinda Rose unratified conjectures; Champagne Arc-Flash `#FFF2A9` human decisions; dashed basting on unadjudicated gates; Raven Obsidian surrounding field).
- Authored the breakthrough computational pattern-drafting module `vixen-bias-draft.mjs`: two independent cloth panels cut at $\pm 45^\circ$ ($D_3$ triangular vs $\varphi$-quasiperiodic interference) meeting at a non-merging basted seam whose shape changes under `I -> II` vs `II -> I`.

#### B. Amari's Authoritative Directives & Red Pens 01–05 — Carbon's Complete Implementation
Every directive and mathematical/visual red pen from Amari's review has been implemented without omission:

| Amari Directive / Red Pen | Exact Engineering & Artistic Realization |
| --- | --- |
| **Multi-Module Optical Synthesis** *(Beyond single-kernel line diagram)* | Upgraded [`vixen-bias-draft.mjs`](app/encyclopedia/vixen-estate/vixen-bias-draft.mjs) to compose across **four** estate optical modules: `observatory-foundry-kernel.mjs` (39 carriers, $D_3$, $\varphi$, SVD, `[111]`, 5-clock vernier) + `vixen-folded-cuirass.mjs` (`sampleCuirassFields` generating **6 dimensional folded-gore pleats + specular arris** per panel) + `vixen-beat-radiometry-rgi15.mjs` (`measureCoutureBeats` + `reinhardBounded` Nyquist-guarded interference blooms along the live seam) + `vixen-live-mesh-rgi13.mjs` (`ELECTRIC_COUTURE` + `normalizeComposerVisualField`), plus structural boning ribs and metallic eyelets on the 6 near-plane carriers — with **zero new `requestAnimationFrame` loops** (`NONE_RENDER_ON_CHANGE`). |
| **Red Pen 01 · Identity-Seeded Non-Commutative Phase** | `encounterPhase(indexA, indexB, lag, reversed, workIdA, workIdB)` seeds deterministic FNV-1a phases from recorded `work_id` identifiers alongside encounter order while preserving $\varphi_{AB} \ne \varphi_{BA}$ and `phase_semantics: 'FORMAL_GEOMETRY_NOT_TEXTUAL_SEMANTICS'`. |
| **Red Pen 02 · Guaranteed `39/39` Carrier Conservation** | Eliminated rectangular corner clipping (`29..34` threads) by parameterizing $c_k \in [c_{\min}, c_{\max}]$ across the exact panel bias span and solving entry/exit boundaries dynamically across `[selvW, x_s(y) - gap]` and `[x_s(y) + gap, W - selvW]`. Verified **`39/39` rendered carriers** on both panels at `1200px`, `1180px`, and `390px` (`tests/vixen-bias-draft.test.mjs`). |
| **Red Pen 03 · Signed Seam Operator Honesty** | Reconciled JSDoc, `BIAS_DRAFT_CONTRACT.seam_operator`, and SVG `<desc>` to match the exact signed difference equation $x_s(y) = x_0 + 1.15a[T_A(\mathbf{p}_A) - Q_B(\mathbf{p}_B)]$, explicitly distinguishing signed lateral seam displacement from unsigned $|T - Q|$ fold relief. |
| **Red Pen 04 · Honest `SYNTHETIC` Optical Conditioning vs Salon Fit** | Relabeled waist conditioning callout to `OPTICAL κ <val> · SYNTHETIC` (`synthetic κ <val>` on compact widths) so formal field-gradient SVD is never mistaken for empirical corpus identifiability; wired Salon's real top-ranked `proposalFit` (`UNRATIFIED FIT <pct>%`) separately from geometric `CAUSTIC |T−Q|`. |
| **Red Pen 05 · Mobile Clamping, Leader-Line Clocks & Clip-Path Tailoring** | Clamped `HUMAN CLOSURE · RESERVED` (`CLOSURE · RESERVED` compact) strictly within `[selvW + 8, W - selvW - 8]`; added 2-row greedy interval-scheduled `layoutClockCallouts` with diagonal leader lines; wrapped left/right panels in instance-unique `<clipPath>` polygons; added horizontal compact selvedge nameplates and suppressed `<180px` diagonal grain-arrow clutter. |
| **Salon Pattern Table + Folded Cuirass + Bilateral Works** | Wired interactive shuttle controls (`Panel I`, `Reverse seam I ▷ II ⇄`, `Panel II`) above `#bcBiasDraft`, compacted the entrance stack so bilateral Works appear in the first viewport (`top < viewportHeight - 55` at `1440×900`, `1024×768`, `390×844`), tailored `Work I` on **Pearl Vellum (`#f4f1ea`)** and `Work II` on **Counter-Bias Liquid Graphite (`#12151a`)**, fixed `<select>` clipping, and restyled **Weigh** specimen plates & **Dare** conjecture/falsifier cards. |
| **Works Monograph Cascade & Drop-Cap / Locator Integrity** | Reconciled `!important` rules across `rgi14`/`rgi18`/`rgi26`/`rgi27`/`rgi28`: Pearl-Vellum monograph folio (`paddingLeft: 46px`, `fontSize <= 17.8px`), solid `#15171b` engraved drop-cap (moving left-gutter `¶` locators to `::after` so Chromium `::first-letter` renders cleanly), deterministic `data-display-para` edition locators (`¶ EDITION LOCATOR · PROJECTION-LOCAL`), high-contrast chrome `.vix-public-byline`, and Reddit-density-meets-Medium-serif `390px` mobile flow. |
| **Fused Dual-Door Threshold (`podium.html`)** | Moved `vixen-bias-cut-couture.css` after inline `<style>`, isolated `main` (`z-index: 2; isolation: isolate`) against `#vixenLivingMesh` bleed, fused `.bc-threshold-portal` above the fold, rendered `OPERAHOUSE / OPERA / PERFORMER` lockstitches (`mode: 'threshold'`, zero `G1..G8` manuscript gates), and paired Left Pearl-Vellum `HUMAN` vs Right Liquid-Graphite `AI / LLM` doors. |
| **Distinct Maestro vs Composer Live Podiums (`human-podium.html`)** | Mounted `#bcPodiumStave` (`mode: 'podium'`) and verified live rendered behavior across both roles: **Maestro** (`data-podium-env="maestro"`) opens a sunlit **Pearl-Vellum expedition chart table**, while **Composer** (`data-podium-env="composer"`) shifts into a nocturnal **Counter-Bias Liquid-Graphite counterpoint studio** (`HELD_AWAITING_HUMAN_COMPOSER`). |
| **Visual Witness Preservation (`v1`, `v2`, `v4`)** | Preserved Opus's `v1-` and `v2-` captures intact alongside `base-`, standalone `v3-math-*.svg`, and final refracted `v4-` desktop/mobile witnesses in [`docs/vixen-turn2-witness/`](docs/vixen-turn2-witness/). |

---

### Stage III · Turn III — The Final Fitting & Proceeding Horizon
1. **Final Fitting Reconciliation (`RP-F01`–`RP-F06`)**:
   - **`RP-F01` (Public Constitutional Separation):** Replaced backstage `OPERAHOUSE`/`OPERA`/`PERFORMER` labels, raw machine-state fields (`model_connected: false`, `empirical_credit: 0`), and raw internal filenames (`human-podium.html`, `llms.txt`) on visitor-facing Podium pages and rendered SVGs with natural research language (`SEPARATE ARCHIVE`, `THIS COLLECTION`, `SOURCE WORK`), while preserving constitutional distinctions in contracts and machine docs.
   - **`RP-F02` (Maestro / Composer State Coherence):** Synchronized `[data-podium-tab]`, `location.hash`, `[data-vma-role]`, `data-podium-env`, `#bcPodiumStave`, and `aria-live` announcements across role selection, active-session refusal in both directions, and deliberate `F5` restoration.
   - **`RP-F03` (Carrier Conservation Honesty):** Exposed `carrier_conservation` distinguishing the 39/39 carrier roster and rendered SVG paths from field-deformed trajectories vs fallback safety chords.
   - **`RP-F04` (Directional Geometry Qualification):** Verified all $\binom{32}{2} = 496$ distinct unordered pairs of the 32 recorded Works in both directions plus identical-input degeneracy (`0` displacement), documenting `4093` modular hash/index bounds and preserving `FORMAL_GEOMETRY_NOT_TEXTUAL_SEMANTICS`.
   - **`RP-F05` (Accessible Mode-Specific Descriptions):** Added distinct SVG `<title>`/`<desc>` descriptions for Salon (`8` gates), Threshold (`3` role-separation lockstitches), and Podium (`1` role-conditioned lockstitch), plus `aria-hidden="true"` on mouse-only SVG hit paths paired with focusable controls.
   - **`RP-F06` (Final 58-RP Reconciliation):** Retired all 21 obsolete Turn II preparation statuses in [`docs/RP-1730-DISPOSITION.json`](docs/RP-1730-DISPOSITION.json) while keeping all human-held obligations (`QA04`, `G1`–`G8` `UNADJUDICATED_PAIR`, binary PDFs `HELD`, unresolved date/author) intact.
2. **Proceeding Horizon (Separately Governed Gates)**:
   - **Preview / Production Release:** Governed separately via Issue `#1744` (`PREPARE` / `DEPLOY`) and Issue `#405` (`/td613-vercel-release PRODUCTION <commit>`).
   - **Human Identity Gates (`G1`–`G8`) & `QA04`:** Remain `UNADJUDICATED_PAIR` (`[32, 40]`) and `HELD` until human review.
   - **Seven-Source Hydration (`7 + 1`) & Experiment B:** Remain separate preregistered research flights (`#1777` / `#1782` / `#1797` and 4-arm Experiment B).

---

*Khona‌lit-po · Tauric Diana · U+10D613 · OPERAHOUSE ≠ OPERA ≠ PERFORMER · Human closure reserved ⟐*
