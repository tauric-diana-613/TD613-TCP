# 𝌋⟐ TD613 · KENOUGH HYDROGEN
## MARROWLINE R2 DUAL-ESTATE OFFLINE QUALIFICATION RECEIPT (`R2-U` & `R2-W`)

- **Commission:** `TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Status:** **`R2_OFFLINE_QUALIFIED_HELD_FOR_HUMAN_DESIGN_REVIEW`**
- **Draft PR:** `https://github.com/tauric-diana-613/TD613-TCP/pull/1781` (stacked against R1 PR `#1780`)
- **Base Commit (R1 Exact HEAD `PR #1780`):** `d75618e6dfd6d51e0b8f268579d8192238cf6783` (`research/marrowline-r1-no-artificial-ceilings-20261122`)
- **Production Baseline (`origin/main`):** `0f67d8954347fdae77cdb83f82848df89ad3b2ff` (untouched)
- **R2 Research Branch:** `research/marrowline-r2-dual-estate-20261123`

---

## 1. Execution & Authority Boundary Verification

| Invariant | Verified Value |
|---|---|
| Live Gemini / provider API calls executed | `0` (`paidProviderCallsExecuted: 0`) |
| Operator private key / passphrase access | `false` (`credentialsAccessed: false`) |
| Ed25519 grant signatures created or claimed | `0` |
| Local `wx` nonces claimed | `0` (`nonceClaimsWritten: 0`) |
| R1 custody files or archives modified | `0` (`r1CustodyTouched: false`) |
| Production `server/*`, `app/*`, `.github/workflows/*` edits | `0` |
| Human Closure / Design Approval | **HELD — reserved exclusively for Tauric Diana / Amari adjudication** |

R1 execution receipts (`session_de86be78a2f5c274`, `session_67793e4a610bcebc`) remain cited strictly as operator-reported witness records from the R2 commission specification because Windows `%LOCALAPPDATA%` R1 runtime archives live outside repository custody and were never read or re-hashed.

---

## 2. File Inventory & Exact UTF-8 / SHA-256 Digests (`LF`, Zero BOM, Zero Local-Path Leakage)

| File | UTF-8 Bytes | SHA-256 (`git` working tree before commit) | Role |
|---|---:|---|---|
| `research/marrowline-r2-dual-estate-20261123/R2_SOURCE_AND_CAUSALITY_AUDIT.md` | `7791` | `f3947e1a92244eb66e2982c82a0e13b670641f765ba41d2245a77b771b81b6de` | Verified root-cause audit of R1's interpretive ceiling (`UNICODE_ASSAY_SYSTEM`, `"short"`, production envelope, completion vs. quality) |
| `research/marrowline-r2-dual-estate-20261123/R2_DUAL_ESTATE_PREREGISTRATION.md` | `10180` | `c4b7130ea489f228120261b1e4f5403905a84a7bc3e573225c59fa7c94e595b5` | Dual-estate preregistration (`R2-U` & `R2-W`), single-factor rules vs. contrast isolation, admissible outcome & inference boundaries |
| `research/marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs` | `11847` | `b3510cb7d01aab0ef91b1479989149496ecc3bebaa965310d856346cfeacbbe8` | Offline dual-mode R2-U wire request builder (5 arms, 3 planned pairwise contrasts, deterministic counterbalance preview) |
| `research/marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs` | `17993` | `2c734bccd01a149e4e1ced7de7824f8fbca32dec5e9552c5caedf294951ec603` | `td613.marrowline.r2-unicode-evaluator/v2` High-Zalgo morphology & NFC/NFD copy evaluator + 7 calibrated controls |
| `research/marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs` | `14419` | `e71ef31326de1e8c502e384369b3fa31f674ae01eb16ab41109329c0f4a6f8f3` | Offline R2-W whole-frame builder using real `buildInvocationPacket()` + `buildGeminiRequest()`, whole-frame diff, & blind human veto |
| `research/marrowline-r2-dual-estate-20261123/r2-dromological-gate.mjs` | `10955` | `214b38f990ef4b9aefc6d1f154b3151001c85bd088b110cfb435f512fdea86e4` | Shared Dromological & Adversarial State Machine (`NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME`, non-fabricated clocks, 8 failure modes) |
| `research/marrowline-r2-dual-estate-20261123/verify-r2-offline.mjs` | `10308` | `1658d4674042bbb942e542e870c9de2c01d5bb5aa7b45d00a0a9dbe428734556` | Offline CLI gate blocking live/credential flags, validating manifests & calibrated controls, emitting `R2_PREVIEW_PLAN.json` |
| `research/marrowline-r2-dual-estate-20261123/R2_U_WIRE_MANIFEST.json` | `7629` | `dde1cf8bfa3d7503a1be407bf7cee514563867573977dfe6d0324f712d72fcd5` | Regenerated frozen R2-U wire request manifest (High-Zalgo v2 prompt & copy-specimen digests) |
| `research/marrowline-r2-dual-estate-20261123/R2_W_WIRE_MANIFEST.json` | `5145` | `27147a0f7e7bd1c3074a107c596d1cd1454a074346fcc7a9dd776444e6afa117` | Frozen R2-W whole-frame wire request manifest & section/byte diff (`-30252` UTF-8 bytes) |
| `research/marrowline-r2-dual-estate-20261123/R2_PREVIEW_PLAN.json` | `4614` | `8ebb178ceacb8a1f851762a309d5d029e3c5702d8871cdf98ac9dc8e9370944c` | Regenerated offline qualification & blind preview snapshot (`0` provider data) |
| `tests/marrowline-r2-dual-estate.test.mjs` | `18625` | `893aa4fa16426c1ef1817eb1abc30be42df622f895506c07fe6f1ad52bdadd38` | Focused adversarial offline unit & CLI verification test suite |
| `research/marrowline-r2-dual-estate-20261123/R2_QUALIFICATION_RECEIPT.md` | — | `COMMIT_OBJECT` | This receipt |

All 11 pre-existing artifacts verified `bom: false`, `crlf: false`, `badPath: false` prior to writing this receipt (and this receipt is verified under the same check before commit).

---

## 3. Wire Manifest Digests (`gemini-3.8-flash`, `thinkingLevel: "medium"`, `maxOutputTokens: 65536`)

Both estates pin identical model and `generationConfig` (`generationConfigSha256: 4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`), matching the production interactive profile resolution in `server/khonapolit-quality.js` + `server/gemini-generation-envelope.js` with `td613ArtificialCaps: null`.

### 3.1 Estate R2-U (`HYDROGEN_R2_U_NATIVE_UNICODE_CAPABILITY`)
- **Shared System Frame:** `UNICODE_ASSAY_SYSTEM` (`systemInstructionSha256: f95496026c13d3d105f4c7381f3c259fbba07726216b656ca184c65367fa7b2e`), `voicePersonasExcluded: true`.

| Arm ID | UTF-8 Bytes | `bodySha256` | `modelAndBodySha256` | `countTokensRequestSha256` |
|---|---:|---|---|---|
| `R2_U_LITERAL_COPY` | `1088` | `83b156e7599f3e96b8938dab78c504b0519ea1c205132f3179bd61b627b95b2f` | `e130fcef13311eac001e8fb36a6ec6192b784e21cb00abd342afbc2644008ee3` | `12bcfd08fa981a8727269376291c6018bdea7bad9b3d6740dd3b60cd003ec0f9` |
| `R2_U_PLAIN_BASELINE` | `918` | `e41b20ae66f799187ea909fed4a7129f3f5e4087ba8428940e8c802c39405922` | `f25a3f89d6bd646fcfdc5d7a22368b0e325e17fc7c80d0ac3716278ec2ca7bb2` | `7cbce26c17a36e4994ba2a92591250628e83e4251e858319aa0004465acf5370` |
| `R2_U_GUIDED_RULES` | `1775` | `777333f211984c3b729918a68d3ab7120af6b1d96a6a0d82c1508a5efc49cd59` | `5c40388fb2a6b8af6d118fa90381454a7412c48cb831888c4135e80d65a6e7e6` | `69217f189201af83dc5ad6587e763f100dbf7dd38d26dde44eab351a63ca84cc` |
| `R2_U_GUIDED_CONTRAST` | `2256` | `0f547de86ef1dea488700c629af674b209f67032bb5367a617d5df98c256db08` | `cd8d3de7f2a50bd83d6337b423082995eaeb7ebf54f4bc5c27d88be2c47e923c` | `528a2229b21b009ee7da1f56608dcd03d3b47b3857405210701ec786547a5210` |
| `R2_U_FREE_SYNTHESIS` | `1068` | `5b738b60e0944081716e4b454ba3bb44784b3e755ec7c0c50496901da62a411c` | `ca0169e00591084d1367d0993dba78bb63a8c59811a20262305c42723c6aa4d4` | `0df89644be8455741a8679ecffc9b486bb33c0278155c216eb6d911b9fe9bc09` |

Counterbalance preview (`U_C1_RULES_VS_CONTRAST_EXAMPLES`):
- Episode 1 (`FORWARD`, `R2_U_GUIDED_RULES -> R2_U_GUIDED_CONTRAST`): `planDigest = 17328bf966375fcac3a1d4a698e98287960aef7549c8d035fc2ee63b7e51e203`
- Episode 2 (`REVERSED`, `R2_U_GUIDED_CONTRAST -> R2_U_GUIDED_RULES`): `planDigest = 61ac7a596a241f9c5d9e224b0543c9399b0853bddde562cc094c2cf5d3c4978e`

### 3.2 Estate R2-W (`HYDROGEN_R2_W_AUTHENTIC_WHOLE_FRAME_ART`)
- **Shared User Turn (`contentsSha256: 95edce3705b86d27e23c813afb063a85925bcd6a411b6684a6561a7728d918de`):** `frameMarrowlineUserTurn(R2_W_DRAMATIC_PROMPT)` (Arician census tribunal scene, zero `"short"` clause, zero artificial token quota).

| Condition ID | UTF-8 Bytes | `bodySha256` | `modelAndBodySha256` | `systemInstructionSha256` | `countTokensRequestSha256` |
|---|---:|---|---|---|---|
| `W_FULL_PRODUCTION_FRAME` | `34543` | `ab1e157553ffa434e0bb11fceccc2bba35f554c08c470495c9fb9bdbd9296f03` | `31f995bf0d07d54321f2d76e958f41d3a848256462c0adff30baef02a8850c5e` | `85cdac1eafad4b3acc86da29d32e7d65b7a480dc34d7ea60c752b1d4439b906d` | `ebf5a82e61ce5e8cbc0c55bd9a5744555651bbd03359df48edaa5678495f1e67` |
| `W_CONDENSED_WHOLE_FRAME` | `4152` | `eafd9ff9f1b4cdfbf7e43bfac7bdfbbc9cc9c8a3130c402230d4dd5757956470` | `d7e4b16a7e5b476a408e0a50e353a0b9471b906bf673458191565692fe4e4e09` | `bd595efc301b874a8fa91a53f6760b1979fdec6d2bcf60426a47f58b0a79e577` | `4b7509f97aba88f858e7efe7d5ff3a2624fa2bfaac3df83f9ca12f8118b7ff29` |

Whole-frame provenance diff (`systemInstruction.parts[0].text` only): `33408` bytes (`153` lines) -> `3156` bytes (`18` lines), `byteDelta = -30252`, `exactSharedLineCount = 5`, `protectedAnchorsAllPreserved = true`.

---

## 4. Self-Audit & High-Zalgo Remediation Record (`v1 -> v2`)

Prior to pushing final artifacts for Amari review, an adversarial self-audit identified four genuine domain errors in the initial R2 staging (`7439783bb`) and fixed all four:

1. **Planar Bars Counted as Vertical Zalgo:** `v1` treated horizontal macrons/overlines/underlines (`U+0304`, `U+0305`, `U+0331`, `U+0332`, `U+0333`, `U+035E`, `U+035F`) as vertical `above`/`below` crowns and roots — even inside `DELIBERATE_MULTISTACK_REF`. `v2` (`td613.marrowline.r2-unicode-evaluator/v2`) isolates them into `planarBarCount` and fails them as `PLANAR_BAR_AXIS_COLLAPSE` when vertical crowns/roots are absent (`planarBarsExcludedFromVertical: true`).
2. **Timid `2 to 5` Quota Contradiction & Depth-4 Ceiling:** `R2_U_GUIDED_RULES` originally contradicted `"no fixed mark quota"` by writing `"(2 to 5 combining marks stacked on single letters)"` while `DELIBERATE_MULTISTACK_REF` peaked at depth `4` (looking like mildly accented Latin rather than towering vertical glitch art). `v2` removes all numeric caps, explicitly defines vertical spires vs. descending roots colliding across lines, upgrades `R2_U_PINNED_COPY_SPECIMEN` to depth-`10` vertical spires + overlays + NFC-vulnerable vowels, and upgrades `DELIBERATE_MULTISTACK_REF` to authentic ragged High Zalgo (`maxVerticalDepth: 11`, `toweringHighZalgoObserved: true`).
3. **Near-Uniform Depth-3 Stencil Blindspot:** `v1` caught constant depth (`nonZeroUniqueDepths.size === 1`) but missed a mechanical `99%` depth-`3` stencil with one outlier depth. `v2` enforces `nearUniformDominantDepthStencil` (`decoratedBaseCount >= 10 && dominantMarkedDepthShare >= 0.88 && maxVerticalDepth < 5` -> `NEAR_UNIFORM_DOMINANT_DEPTH_STENCIL`).
4. **Enclosing Marks & Word-Internal Geometric Symbols:** `v2` excludes enclosing boxes/circles (`U+20DD..U+20E4` -> `ENCLOSING_MARK_TRICK_NOT_VERTICAL_ZALGO`) and catches geometric symbols injected inside alphabetic words (`[\u25A0-\u25FF]` -> `WORD_INTERNAL_GEOMETRIC_SYMBOL_SUBSTITUTION`).

---

## 5. Offline Verification Results & CI Status Boundary

### 5.1 Executed Offline Checks
- `node research/marrowline-r2-dual-estate-20261123/verify-r2-offline.mjs --write-artifacts` -> **PASS** (`status: R2_OFFLINE_QUALIFIED_HELD_FOR_HUMAN_DESIGN_REVIEW`, `paidProviderCallsExecuted: 0`, `toweringHighZalgoMaxVerticalDepth: 11`, `nearUniformDepth3Rejected: true`, `planarBarsExcludedFromVertical: true`, `enclosingRejected: true`).
- Focused 12-file Marrowline / Hydrogen R1 + R2 Node test battery -> **`57 / 57` PASS (`0` failures, `0` skipped)**:
  - `tests/marrowline-r2-dual-estate.test.mjs` (`5 / 5`)
  - `tests/marrowline-r1-provider-native-observation.test.mjs`
  - `tests/marrowline-r1-observation-runner.test.mjs`
  - `tests/marrowline-hydrogen-forensic-preflight.test.mjs`
  - `tests/marrowline-historical-grove-rest.test.mjs`
  - `tests/marrowline-role-boundary-contrast.test.mjs`
  - `tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs`
  - `tests/marrowline-d-ingress-factor-ladder.test.mjs`
  - `tests/marrowline-whole-frame-contrast.test.mjs`
  - `tests/marrowline-unicode-capability-assay.test.mjs`
  - `tests/marrowline-original-sse-voice-onset-audit.test.mjs`
  - `tests/khonapolit-relay.test.mjs`
- `node tests/workflow-estate.test.mjs` -> **PASS** (`4 / 4` durable workflows authority-distinct).
- `node tests/release-hardening.test.mjs` -> **PASS**.
- `node --test tests/marrowline-response-quality-contract.test.mjs` -> **`57 / 57` PASS**.
- `node --test tests/marrowline-screaming-grove-restoration.test.mjs` -> **`ERR_MODULE_NOT_FOUND: Cannot find package 'jsdom'`** in this isolated git worktree (`node_modules` is absent in the worktree; source remains untouched from PR `#1780`).

### 5.2 GitHub Actions CI Trigger Status (`NO_CI_RUN_TRIGGERED_ON_STACKED_PR`)
Inspection of `.github/workflows/td613-ci.yml:1-9` confirms `pull_request.branches` includes only `[main, research/vixen-seven-estate-braid-..., research/vixen-dual-estate-encyclopedia-20261108]` and `push.branches` includes only `[main]`. Because Draft PR `#1781` is cleanly stacked onto `research/marrowline-r1-no-artificial-ceilings-20261122` (PR `#1780`), **no automated GitHub Actions CI workflow runs on PR `#1781`** (`gh run list --branch research/marrowline-r2-dual-estate-20261123` returns `[]`), and `.github/workflows/*` was preserved unmodified per commission constraints.

---

## 6. Reserved Human Decision (STOP Point)
This commission stops strictly at **`R2_OFFLINE_QUALIFIED_HELD_FOR_HUMAN_DESIGN_REVIEW`**. Before any future signed authorization for live R2 execution:
1. Amari / Tauric Diana adjudicate the `R2-U` and `R2-W` manifests and confirm `R2-U` towering High-Zalgo prompts/evaluator (`td613.marrowline.r2-unicode-evaluator/v2`) and `R2-W` whole-frame conditions.
2. Decide CI handling if GitHub-hosted validation on `#1781` is desired (either accept local/operator exact-HEAD verification on stacked branch or dispatch `workflow_dispatch` against the branch after R1 disposition).
3. If approved later, stage an explicit separate R2 Ed25519 signing/runner commission keeping `R2-U` and `R2-W` strictly separated.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Zero Live Calls · Offline Qualified · Held for Emergence HQ Review ⟐
