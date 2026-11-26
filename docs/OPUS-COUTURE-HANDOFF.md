# Seam Allowance -> Turn II Handoff: Vixen Cybernetics Couture Commission

**Commission:** `TD613-VIXEN-REDPEN-DOUBLE-COMMISSION-20261123` (`PR #1730`, `fix/pr-1730-redpen`)
**Lineage:** Baseline `658835a7691c2abf67c86e27e4c818488eae2e65` -> Turn I `2cd6b3cb31d48090f01450e9a205aa55f6361030` -> Seam Allowance successor (`CARBON_SUCCESSOR_RECEIPT.json`).
**Companion Records:** `docs/RP-1730-FORENSIC-AUDIT.md` (Turn I baseline forensics, unmodified) · `docs/RP-1730-SEAM-ALLOWANCE.md` (Repairs I–VI & failure classifications) · `docs/RP-1730-DISPOSITION.json` (`58/58` RP register).
**Jurisdiction:** Seam Allowance completed functional repairs and separated protected contracts (**Class A/B**) from transformable aesthetic scaffolding (**Class C**). Turn II (**Claude Opus · `/dollhouse-design` · The Garment**) owns final typography, raven obsidian materiality, anti-Google-Forms spatial choreography, `#footerVixenWordmark`, Salon holonomy cadence, and Dual-Door / Human Podium couture.

---

## 1. Class A · Constitutionally Protected (Do Not Alter)
- **Source Census & Integrity:** Preserve all 32 Works, 53 manifestations (`#vixen-corpus-bundle`), 8 unadjudicated Human Gates (`UNADJUDICATED_PAIR`), `[32, 40]` interval, 21 protocols, `#vixen-reference-manifest`, `app/encyclopedia/reference/podium/manifest.json` (27 routes), and authentic manuscript prose / `original_filename` bytes.
- **OPERAHOUSE != OPERA != PERFORMER & Public-Copy Scrub:** Never expose `The Empty Operahouse`, `The Seam Allowance`, `Atelier`, `SignalRupture`, `Wendbine`, `EMSTD613`, `SRC`, `FADT`, or bare `TD613` in visitor UI (`vixen-opera-public-copy.mjs`, `vixen-public-copy-browser.test.mjs`). Preserve `TD613 Encyclopedia` in footer (`RP-46`) and protect authentic source/machine elements (`[data-vixen-source-provenance]`, `.vs-work-title`, `.vix-manuscript`).
- **8-Room Rail Cap:** Keep `.vixen-room-rail .vixen-room` strictly at 8 rooms (`overview`, `observatory`, `works`, `gates`, `protocols`, `holds`, `collection`, `reference`). Podium pages live outside `.vixen-room-rail`.
- **Epistemic & Export Boundaries:** `model_connected: false`, `empirical_replication_credit: 0`, `release_authority: false`, `human_closure_required: true`. Composer stops at `HELD_AWAITING_HUMAN_COMPOSER`. Preserve unresolved Work chronology/authorship honesty (`#workSortNotice`) and `.extracted.txt` (`text/plain;charset=utf-8`) downloads with explicit notice that binary `.pdf` bytes are held/unavailable (`RP-07`, `RP-10`).
- **Approved Assets & Frozen Files:** Preserve `assets/vixen/fox-arcflash.svg`, desktop/mobile frontispieces, `--arc-flash: #FFF2A9` eye/accent color, WebGL2/Canvas2D optical calculations (`observatory-foundry.frag`, `vixen-folded-cuirass.mjs`), `package.json`, `package-lock.json`, `.gitignore`, and `C:\tawmi\tcp-repository`.
- **Zero Purple Law (Visitor-Facing Rendered Surfaces):** Rendered visitor surfaces and dynamic states must never present plum/violet/purple washes (`hsl 235..327 deg`, `S > 5%`, `b > g + 6` when saturated). Microscopic raven (`max(r,g,b)<36 && spread<=12`) and pale pearlescent (`min>=225 && spread<=10`) optical interference remain permitted. Historical source illustrations/fixtures are protected from repo-wide recoloring.

---

## 2. Class B · Functionally Protected Destinations, Symbols & Data Flows
1. **Separate 3-Destination Podium Architecture (outside main rail):**
   - `app/encyclopedia/vix-cyb/podium.html` (`data-page="podium-entrance"`): Standalone Dual-Door Threshold (`#podiumDoorHuman` -> `./human-podium.html`, `#podiumDoorAi` -> `./llms.txt`, `#podiumResumeExistingBtn` -> `./human-podium.html?resume=1`). Not a redirect.
   - `app/encyclopedia/vix-cyb/human-podium.html` (`data-page="podium"`): Dedicated Human Podium hosting `[data-podium-tab]` (`maestro`, `composer`, `settings`, `help`), secondary `LLM Entrance ↗`, `#vmaRestoreBanner` (`#vmaRestoreSessionBtn` / `#vmaDiscardSessionBtn` deliberate `F5` restore), `#vixenAiJourney`, `#vmaComposerWorkbench`, `#vmaComparativeFieldLab`, `#vmaSourceChallenge`, `#view-operator` Settings & Ledger, and `#podiumHelpPane`.
   - `app/encyclopedia/vix-cyb/llms.txt`: Plain-text AI/LLM research guide synced to 27 manifest routes, `.extracted.txt` custody, and separate Podium paths.
2. **Cross-Page Session Bridge (`app/encyclopedia/vixen-estate/vixen-shared-session-bridge.mjs`):**
   - `sessionStorage` keys: `vixen.study_tray.v1`, `vixen.salon_manifesto.v1`, `vixen.synthesis_log.v1`, `vixen.podium.excursion.v1`.
   - `ensureCanonicalCorpusDom` fetches `#vixen-corpus-bundle` from `../vix-cyb.html` at runtime without duplicating source corpus XML/JSON in `podium.html` or `human-podium.html`.
   - Excursion return: `"Read the work"` from Maestro/Comparative Trial/Source Challenge calls `persistForExcursion(workId)` -> `vix-cyb.html#works/<id>` displays `#vmaJourneyDock` -> clicking returns to `human-podium.html?resume=1`.
3. **Packaging & Static Dependency Closure (`vixen-portable-fidelity.mjs`, `session-zip.mjs`, `package-vixen-preview.py`):**
   - All `<link>`, `<script>`, `import`, `import(...)`, and `new URL(...)` asset specifiers MUST remain static string literals. `downloadVixenSessionZip` from `vix-cyb/*.html` passes `baseHref: new URL('../vix-cyb.html', window.location.href).href`.
   - `VALID_VIEWS` in `vix-cyb.html` MUST end with `'reference', 'operator'` (`encyclopedia-reference.test.mjs`).
4. **Core DOM Hooks to Preserve (Remap Tests Explicitly Only If Architecture Changes):**
   - **Header & Cart:** `#vixenReturnLink` (`⌂`), `#vixenHistoryBack` (`🢔`), `#vixenHistoryForward` (`🢖`), `[data-action="search"]` (`Ctrl/Cmd+K`), `#researchCartBtn`, `#collectionCount` (MUST stay empty `''` and `hidden` when count is `0`; populated only at `count > 0`), `#vixenCarryCount` (same rule), `#researchCartPopout`, `#collectionItemsContainer`, `#cartStageSalonBtn`, `#cartToPodiumBtn`, `#exportTrayBtn`, `#footerSaveSessionBtn`, `#menuToggle`, `#motionBtn.hdr-pill.hdr-motion-control`, `#headerHelpBtn[data-pua-emblem="􍘓"]`, `#inspectorDialog` (4-step visitor workflow guide).
   - **Works & Reader:** `#workSortSelect` (`order, filename, title, date, author, cluster, manifestations, status`), `#workSortOrderBtn`, `#workSortNotice`, `.work-received-filenames`, `.works-manifestation-bar`, `[data-inspect-manifestation]`, `[data-download-kind]`, `#worksExperimentAReaderMount`, `#expaCompanionBodyPre`, `#globalSearchInput`, `#globalSearchResults`, `#vixFolioPrevious`, `#vixFolioNext` (`behavior: 'instant'` discrete paging).
   - **Salon (`#view-collection`):** `#vixenSynthesisSalon`, `#salonInviteAiBtn`, `.vs-overture-notes`, `#salonLiveBrief`, `#salonCribAndManifesto`, `#salonMathCrib`, `#salonManifestoPanel`, `.vs-seam`, `.vs-holonomy-grid`, `.vs-cart-scope`, `#ciForm`, `#ciCandidateGrid`, `#ciConjectureGrid`, `#ciStatusLine`. Never re-add inline `#researchCartPanel` inside `#view-collection`.
   - **Footer:** `footer.footer`, `#footerPodiumLink` (`href="./vix-cyb/podium.html"`), `#footerVixenWordmark[data-couture-slot="footer-wordmark"] > strong` (`VIXEN CYBERNETICS`), `#footerEncyclopediaLink` (`𝌋 TD613 Encyclopedia →`).

---

## 3. Class C · Transformable Artistic Scaffolding & CSS Cascade Ownership
Opus may freely redesign typography, color surfaces (within Class A/WCAG AA `>= 4.5` & Zero Purple Law), spacing, wrapper tags, and motion choreography across these inherited provisional details:
- **Explicitly Released Constraints:** Historical RGI12 pearl-pink `linear-gradient` on `.vs-hero-copy`, exact `rgb(16, 24, 30)` `.vs-optical-stage` backdrop (any opaque dark obsidian/raven `alpha >= 0.9, max < 65` is valid), neutral dark `.vs-title` ink (use WCAG AA `>= 4.5` against hero surface), warm-paper reader RGB `>= 235` (WCAG AA `>= 4.5` on light or dark paper is valid), `#ciForm` wrapper styling, `.works-sort-bar` styling, and standalone Podium inline styles.
- **Complete `vix-cyb.html` CSS Cascade (Head Load Order):**
  `fusion-console.css` -> `research-chamber.css` -> `synthesis-salon.css` -> `vixen-ai-journey.css` -> `vixen-comparative-field-trial.css` -> `vixen-source-challenge.css` -> `observatory-electric-foundry.css` -> `vixen-foyer.css` -> `vixen-motion.css` -> `reference/vixen-operator-encounter.css` -> `<style id="vixen-structural-css">` -> `<style id="manifest-instance-theme">` -> `glinda-cybergoth-rgi10.css` -> `vixen-stage-architecture-rgi10b.css` -> `glinda-spectacle-rgi11.css` -> `glinda-luminous-proscenium-rgi12.css` -> `vixen-electrical-breath-rgi13.css` -> `vixen-opaline-couture-rgi14.css` -> `assets/vixen/brand-assets.css` -> `vixen-mobile-seams-rgi16.css` -> `vixen-mobile-reading-rgi17.css` -> `vixen-redpen-couture-rgi18.css` -> `vixen-obsidian-reading-rgi26.css` -> `vixen-mobile-manuscript-opera-rgi27.css` -> `vixen-proscenium-seam.css` -> `vixen-desktop-manuscript-opera-rgi28.css`.
- **`podium.html` & `human-podium.html` CSS:** Load `vixen-motion.css`, `vixen-operator-encounter.css`, `glinda-cybergoth-rgi10.css`, `vixen-stage-architecture-rgi10b.css`, `glinda-luminous-proscenium-rgi12.css`, `vixen-electrical-breath-rgi13.css`, `vixen-opaline-couture-rgi14.css`, `brand-assets.css`, `vixen-mobile-seams-rgi16.css`, `vixen-redpen-couture-rgi18.css`, `vixen-proscenium-seam.css` (+ `vixen-ai-journey.css`, `synthesis-salon.css`, `vixen-comparative-field-trial.css`, `vixen-source-challenge.css` in `human-podium.html`) followed by local standalone styles.
- *Packaging Note:* `scripts/package-vixen-preview.py:31-58` checks presence of `glinda-cybergoth-rgi10.css`, `vixen-stage-architecture-rgi10b.css`, `glinda-spectacle-rgi11.css`, `vixen-electrical-breath-rgi13.css`, `vixen-opaline-couture-rgi14.css`, `observatory-electric-foundry.css`, `synthesis-salon.css`, and `reference/vixen-operator-encounter.css` in `vix-cyb.html`.
- **`[data-couture-slot]` Turn II Targets (`/dollhouse-design`):**
  1. `footer-wordmark` (`#footerVixenWordmark`, `RP-47`): luminous champagne/iridescent glow or neon treatment on `VIXEN CYBERNETICS`.
  2. `salon-crib-manifesto` & `#ciForm` / `#ciCandidateGrid` / `#ciConjectureGrid` (`RP-18`, `RP-19`, `RP-51`–`RP-57`): quest-first dark choreography eliminating Google-Forms card stacks and `2 LONG?`/`2 big?` proportions.
  3. `works-manuscript-measure` (`RP-08`–`RP-10`): scholarly serif measure (`62ch–74ch`), table hairlines, compact `.works-manifestation-pill` polish.
  4. `podium-threshold` (`podium.html` & `human-podium.html`, `RP-33`–`RP-39`): veil-kinship obsidian drama and Podium tab/workbench craft (preserving `390px` `scrollWidth <= clientWidth` and `#vmaJourneyDock`).
  5. `RP-49` / `RP-50`: Holonomy SVG and `.vs-holonomy-grid` / `.vs-trajectory-memory` balance (`EMPTY` space eliminated).

---

## 4. Remaining External/Baseline HOLDs & Qualification Coordinates
- **Remaining HOLDs:** `BINARY_PDF_BYTES_HELD` (20 PDF manifestations store UTF-8 text derivatives only); `SEVEN_SOURCE_HYDRATION_HELD`; `HUMAN_GATES_UNADJUDICATED`; `LIVE_AI_PROVIDER_DISCONNECTED`; `WINDOWS_NODE26_CI_PARITY` (`vixen-seven-estate-g3.test.mjs:20` Windows `core.autocrlf` CRLF checkout vs Linux Git SHA-1 check & full multi-viewport `vixen-browser-visual-witness.mjs` `HELD_PENDING_CI`).
- **Focused Successor Witness:** `C:\Users\tawmi\TD613_Empty_Operahouse_Evidence\seam-allowance-witness\` (`7` PNGs + `witness-manifest.json`). Preview stack archive: `C:\Users\tawmi\TD613_Empty_Operahouse_Evidence\vixen-preview-seam-allowance.zip`.
- **Qualification Environment (Windows Worktree):** Run tests with `PYTHONDONTWRITEBYTECODE=1`, `VIXEN_PYTHON=<cpython-3.12.16-path>`, `TD613_NATIVE_PYTHON=<cpython-3.12.16-path>`, `VIXEN_WITNESS_OUT_DIR=C:\Users\tawmi\TD613_Empty_Operahouse_Evidence\...`, and `RUNNER_TEMP=C:\Users\tawmi\TD613_Empty_Operahouse_Evidence\...` (prevents `verify-vixen-podium-dollhouse.mjs` from dirtying `artifacts/vixen-dual-estate/ci-podium-native-dollhouse-receipt.json`).
  - Source suite: `npm run test:vixen:source`
  - Browser runner: `npm run test:vixen:browser` (`VIXEN_WITNESS_OUT_DIR` external)
  - Full-surface visual campaign (Turn II only): `node scripts/run-vixen-browser-tests.mjs tests/vixen-full-surface-witness.mjs`
