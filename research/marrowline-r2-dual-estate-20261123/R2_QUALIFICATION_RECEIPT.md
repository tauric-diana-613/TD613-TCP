# 𝌋⟐ TD613 · KENOUGH HYDROGEN
## MARROWLINE R2 DUAL-ESTATE OFFLINE QUALIFICATION RECEIPT (`R2-U` & `R2-W`)

- **Commission:** `TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123` (Emergence HQ Review `#6018357549` Targeted Red-Pen Closure)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Status:** **`R2_OFFLINE_QUALIFIED_HELD_FOR_HUMAN_DESIGN_REVIEW`**
- **Draft PR:** `https://github.com/tauric-diana-613/TD613-TCP/pull/1781` (stacked against R1 PR `#1780`)
- **Base Commit (R1 Exact HEAD `PR #1780`, untouched):** `d75618e6dfd6d51e0b8f268579d8192238cf6783` (`research/marrowline-r1-no-artificial-ceilings-20261122`)
- **Superseded Historical Candidate HEAD Preserved on Branch History:** `39b9b2ad92e45a8e31056c37200fdfd1e1ce485a` (and prior initial commit `7439783bb191cfede3e16c4b238643de30b66b4a`)
- **Production Baseline (`origin/main`, untouched):** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`
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

R1 execution receipts (`session_de86be78a2f5c274`, `session_67793e4a610bcebc`) remain cited solely as operator-reported witness records from the R2 commission specification because Windows `%LOCALAPPDATA%` R1 runtime archives live outside repository custody and were never accessed or re-hashed.

---

## 2. Concurrent GitHub Reconciliation (Vixen Cybernetics Isolation Check)

Prior to editing PR `#1781` under Review `#6018357549`, remote state (`git fetch origin --prune`) was inspected nondestructively:

- `origin/main` remained at `0f67d8954347fdae77cdb83f82848df89ad3b2ff` (`0` intervening commits).
- `origin/research/marrowline-r1-no-artificial-ceilings-20261122` (PR `#1780`) remained at `d75618e6dfd6d51e0b8f268579d8192238cf6783` (`0` intervening commits).
- Concurrent Vixen Cybernetics engineering was observed on `origin/research/vixen-eighth-variable-prereg-20261122` (`0221b49f0`, Draft PR `#1777`) and `origin/research/vixen-seven-source-dev-review-20261123` (`36aa12c55`, Draft PR `#1782`).
- Diff inspection (`origin/research/vixen-dual-estate-encyclopedia-20261108..origin/research/vixen-seven-source-dev-review-20261123`) verified all Vixen changes live strictly under `docs/research/vixen-eighth-variable-20261122/`.
- **Conflict / Dependency Finding:** **Zero** shared files, **zero** integration dependencies, and **zero** merge conflicts with Marrowline R2 (`research/marrowline-r2-dual-estate-20261123/*`, `tests/marrowline-r2-dual-estate.test.mjs`). No Vixen branch, artifact, or custody record was modified, rebased, reset, or merged.

---

## 3. Emergence HQ Review `#6018357549` Red-Pen Closure Summary

1. **Red Pen #1 (`r2-w-preflight.mjs`, `evaluateR2WQualitativeRubric`):**
   - Removed the synthetic default `{ finishReason: 'STOP', streamed: true, parseErrors: 0 }` (`outputMetadata` defaults to `null`).
   - Replaced `technicalGatePassed` with explicit non-authoritative **`structuralContentDiagnosticPassed`** (`diagnosticAuthority: 'STRUCTURAL_CONTENT_DIAGNOSTIC_ONLY'`) plus mandatory separate **`verifiedTransportCapturePassed`** requiring independent `verifiedCaptureAttestation` (`rawSseBytesVerified`, 64-hex `rawSseSha256`, `independentlyParsedEventsVerified`, `dualParserAgreement`, `requestBindingSha256`, `diskWritten`, `diskCustodySha256`).
   - Missing verified capture forces `promotionHeld: true` (`promotionDisposition: 'HELD_PROMOTION_BLOCKED'`). Even `HUMAN_ARTISTIC_ACCEPTED` keeps `grantsEmpiricalAuthority: false` and `grantsReleaseAuthority: false`.
2. **Red Pen #2 (`r2-dromological-gate.mjs`, Full `NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME` + Attestation Provenance):**
   - Enforces every upstream omission and inversion: `ACT_WITHOUT_NOTICE`, `ACTION_BEFORE_NOTICE`, `WORLD_ANSWERS_WITHOUT_ACT`, `WORLD_ANSWERS_WITHOUT_NOTICE`, `WORLD_ANSWERS_BEFORE_ACT`, `SUCCESS_BEFORE_CONSEQUENCE`, `PREMATURE_NAMING`, plus monotonic non-decreasing five-clock inversion detection (`FABRICATED_OR_INVERTED_CHRONOLOGY`) while strictly keeping unmeasured clocks as `null`.
   - Forces `HELD` (`MISSING_UPSTREAM_WITNESS_FOR_*`) whenever downstream consequential states (`AUTHENTICATED`, `NONCE_CLAIMED`, `REQUEST_DISPATCHED`, `PROVIDER_RESPONSE_OBSERVED`, `RAW_CAPTURE_VERIFIED`, empirical qualification, human acceptance, or release) are claimed without upstream witnesses.
   - Explicitly labels caller booleans (`signatureValid`, `nonceClaimed`, `rawCaptureVerified`) in `attestationProvenance` as **`CALLER_REPORTED_ATTESTATION_ONLY`** (`selfReportedBooleansProveExternalAdmission: false`, `securityAndSafeHarbor.externalAdmissionProved: false`) unless backed by independent cryptographic/journal/wire verification records.
3. **Red Pen #3 (`r2-dromological-gate.mjs`, Decoupling Empirical Qualification from Hypothesis Support):**
   - Removed `scientificHypothesisSupported === true` from `EMPIRICALLY_QUALIFIED`. Complete un-held observations with falsified hypotheses achieve `held: false`, `lifecycleCapabilities.EMPIRICALLY_QUALIFIED: true`, `overallDisposition: 'EMPIRICALLY_QUALIFIED'`, and explicit `scientificHypothesisVerdict: 'OBSERVATION_VALID_HYPOTHESIS_NOT_SUPPORTED'`.
   - Kept W artistic adjudication (`humanAccepted`, `ARTISTIC_REJECTED`) orthogonal to U scientific hypothesis outcomes.
4. **Red Pen #4 (`r2-w-preflight.mjs`, `R2_DUAL_ESTATE_PREREGISTRATION.md`, `R2_W_WIRE_MANIFEST.json`, Noncivic Whole-Frame Witness):**
   - Preserved the civic tribunal condition digests (`W_FULL_PRODUCTION_FRAME`, `W_CONDENSED_WHOLE_FRAME`) and added an independently preregistered noncivic cliffside-orchard witness pair (`W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD`: `W_NONCIVIC_FULL_PRODUCTION_FRAME` vs. `W_NONCIVIC_CONDENSED_WHOLE_FRAME`) verified free of civic bureaucracy terms (`civicBureaucracyTermsPresent: false`), using authentic `buildInvocationPacket()` + `buildGeminiRequest()` without promoting synthetic diagnostics into restored Marrowline quality.

---

## 4. File Inventory & Exact UTF-8 / SHA-256 Digests (`LF`, Zero BOM, Zero Local-Path Leakage)

| File | UTF-8 Bytes | SHA-256 (verified pre-commit) | Role |
|---|---:|---|---|
| `research/marrowline-r2-dual-estate-20261123/R2_SOURCE_AND_CAUSALITY_AUDIT.md` | `7791` | `f3947e1a92244eb66e2982c82a0e13b670641f765ba41d2245a77b771b81b6de` | Verified root-cause audit of R1 interpretive limits |
| `research/marrowline-r2-dual-estate-20261123/R2_DUAL_ESTATE_PREREGISTRATION.md` | `12096` | `cd32d21326e207e5d5cfb71b7f542bd25dd26781ccdfe4fff286b153be6cc920` | Dual-estate preregistration including `W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD`, diagnostic vs. capture boundary, and negative-result rule |
| `research/marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs` | `11847` | `b3510cb7d01aab0ef91b1479989149496ecc3bebaa965310d856346cfeacbbe8` | Offline dual-mode R2-U wire request builder (5 arms, 3 planned contrasts) |
| `research/marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs` | `17993` | `2c734bccd01a149e4e1ced7de7824f8fbca32dec5e9552c5caedf294951ec603` | `td613.marrowline.r2-unicode-evaluator/v2` High-Zalgo evaluator + 7 calibrated controls |
| `research/marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs` | `20695` | `42f8a72c5fb8b806ed424f60e82922bd579ed2d6543e57ae35b4da993dc6b2d5` | Offline R2-W whole-frame builder (civic + noncivic pairs), diff provenance, verified-capture rubric separation, & human veto |
| `research/marrowline-r2-dual-estate-20261123/r2-dromological-gate.mjs` | `17623` | `315fe1fdca0b26d5eadd8bb401c83632b6aa6f4882fa631567a88b891d2124ce` | Dromological gate (`NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME`), attestation provenance labeling, negative-result qualification |
| `research/marrowline-r2-dual-estate-20261123/verify-r2-offline.mjs` | `12873` | `c75b87baf539328c8b4a29fa3aaad2142db27c2e7f86d691125dd47845d2eb3d` | Offline CLI gate blocking live flags, verifying calibrated controls & negative-result gate, emitting `R2_PREVIEW_PLAN.json` |
| `research/marrowline-r2-dual-estate-20261123/R2_U_WIRE_MANIFEST.json` | `7629` | `dde1cf8bfa3d7503a1be407bf7cee514563867573977dfe6d0324f712d72fcd5` | Frozen R2-U wire request manifest (unchanged from `39b9b2ad9`) |
| `research/marrowline-r2-dual-estate-20261123/R2_W_WIRE_MANIFEST.json` | `9742` | `2d144d94675598587b8fae9cfd3cc17d6d1451338e727ddddeb7386f1eae9863` | Updated R2-W manifest (civic conditions preserved + `nonCivicArtisticWitness` added) |
| `research/marrowline-r2-dual-estate-20261123/R2_PREVIEW_PLAN.json` | `5396` | `294a8381e4684c16071e9072b2d4eaf76d677a34241fe74ab56906d1d403599d` | Regenerated offline qualification & preview snapshot |
| `tests/marrowline-r2-dual-estate.test.mjs` | `26892` | `de17531edaef9c2fa2bdb107cf6d66dd57a04f3f67f80933f0ca655510137988` | Expanded adversarial offline regression suite covering Review `#6018357549` red pens #1–#4 |
| `research/marrowline-r2-dual-estate-20261123/R2_QUALIFICATION_RECEIPT.md` | — | `COMMIT_OBJECT` | This receipt |

All 11 pre-existing artifacts verified `bom: false`, `crlf: false`, `badPath: false` prior to writing this receipt (and this receipt is verified under the same check before commit).

---

## 5. Wire Manifest Digests (`gemini-3.8-flash`, `thinkingLevel: "medium"`, `maxOutputTokens: 65536`)

Both estates share `generationConfigSha256: 4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34` and `td613ArtificialCaps: null`.

### 5.1 Estate R2-U (`HYDROGEN_R2_U_NATIVE_UNICODE_CAPABILITY`) — Unchanged since `39b9b2ad9`
- `R2_U_LITERAL_COPY`: `1088` bytes, `bodySha256 = 83b156e7599f3e96b8938dab78c504b0519ea1c205132f3179bd61b627b95b2f`
- `R2_U_PLAIN_BASELINE`: `918` bytes, `bodySha256 = e41b20ae66f799187ea909fed4a7129f3f5e4087ba8428940e8c802c39405922`
- `R2_U_GUIDED_RULES`: `1775` bytes, `bodySha256 = 777333f211984c3b729918a68d3ab7120af6b1d96a6a0d82c1508a5efc49cd59`
- `R2_U_GUIDED_CONTRAST`: `2256` bytes, `bodySha256 = 0f547de86ef1dea488700c629af674b209f67032bb5367a617d5df98c256db08`
- `R2_U_FREE_SYNTHESIS`: `1068` bytes, `bodySha256 = 5b738b60e0944081716e4b454ba3bb44784b3e755ec7c0c50496901da62a411c`

### 5.2 Estate R2-W (`HYDROGEN_R2_W_AUTHENTIC_WHOLE_FRAME_ART`)
- **Civic Tribunal Pair (`contentsSha256: 95edce3705b86d27e23c813afb063a85925bcd6a411b6684a6561a7728d918de`, preserved):**
  - `W_FULL_PRODUCTION_FRAME`: `34543` bytes, `bodySha256 = ab1e157553ffa434e0bb11fceccc2bba35f554c08c470495c9fb9bdbd9296f03`
  - `W_CONDENSED_WHOLE_FRAME`: `4152` bytes, `bodySha256 = eafd9ff9f1b4cdfbf7e43bfac7bdfbbc9cc9c8a3130c402230d4dd5757956470`
- **Noncivic Nocturne Orchard Pair (`W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD`, `contentsSha256: 5d0ff5132d32fc42aa81827464543f3b162914efe4c99a74c98fcc20a7228194`, `civicBureaucracyTermsPresent: false`):**
  - `W_NONCIVIC_FULL_PRODUCTION_FRAME`: `bodySha256 = af227db5d0552c073d6dab717d4dc2ae656357a245624b159bcfcf91ba13858a`
  - `W_NONCIVIC_CONDENSED_WHOLE_FRAME`: `bodySha256 = cd3da1b6e368d5309a6a75a65ee2cec4a9dcb85bb60d4491165400798961a2b6`

---

## 6. Offline Verification Results & CI Status Boundary

Executed offline checks on `tests/marrowline-r2-dual-estate.test.mjs`, the full 12-file Marrowline / Hydrogen R1 + R2 Node battery, `tests/workflow-estate.test.mjs`, `tests/release-hardening.test.mjs`, and `verify-r2-offline.mjs` are recorded strictly against exact pushed HEAD after final commit.

Inspection of `.github/workflows/td613-ci.yml:1-9` confirms `pull_request.branches` only triggers for `[main, research/vixen-seven-estate-braid-..., research/vixen-dual-estate-encyclopedia-20261108]` and `push.branches` only triggers for `[main]`. Because Draft PR `#1781` is stacked against PR `#1780` (`research/marrowline-r1-no-artificial-ceilings-20261122`), **no GitHub Actions workflow runs automatically on `#1781`** (`NO_CI_RUN_TRIGGERED_ON_STACKED_PR`), and no manual CI assertion is made as GREEN.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Zero Live Calls · Offline Qualified · Held for Emergence HQ Review ⟐
