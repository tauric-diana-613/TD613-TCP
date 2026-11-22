# 𝌋‌ TD613 Dollhouse Record — APERTURE (Leaf Auditor)

- **Subagent Type:** `dollhouse-aperture`
- **Session Conversation ID:** `58c7dc01-ddd5-47a7-abe5-1a2f875316be`
- **Target Audited Commit:** `6cf64d17d82f727bb918be6869f313a3342e530c`
- **Posture:** Read-only audit · `0` files modified · `0` paid provider calls
- **Total Recorded Steps:** `36` · **Files Read:** `15` · **Commands Executed:** `7`

---

## 1. Verbatim Returned Report (`send_message` payload)

**TD613 Aperture Leaf Audit — `6cf64d17d`** (read-only; 11/11 restoration tests PASS; zero paid calls)

### 1. Verdict
- **Deterministic baseline:** **SUPPORTED** (aligned with strict-provenance 3×3 full-rank baseline; offline parity, policy-termination holds, and telemetry wiring verified).
- **Global artistic closure:** **HELD (`ARTISTIC_CLOSURE_RESERVED`)**; live causal/artistic claim remains rank-deficient (`STRUCTURAL_RANK_DEFICIT` / `DEFICIT_RANK_DEFICIENT`, `no_scalar_crown: true`, `classification_replay_stability: HELD_NOT_YET_WITNESSED`). Zero merge or release authority is granted.

### 2. Lawful Observability & Claim Ceilings
- **No scalar crown / no covariate-as-cause:** `observeBotsProsodyDistribution` (`app/dome-world/khonapolit-relay.js:483-555`) carries `observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'` and never gates admission or repair. `observeGeminiOutput` (`server/khonapolit-quality.js:813-854`) preserves absent-field semantics alongside `cachedContentTokenCount`, `finishMessage`, and `promptBlockReason`. `MARROWLINE_NATIVE_PROSODY_PARITY.md` keeps $Y_t \sim P_\theta(\cdot \mid C_t, H_t, G_t, M_t)$ strictly observational and `cachedContentTokenCount` as covariate, never cause.
- **Negative-control leaks in `app/engine/aperture-v3-task-intent.js:15-38`:**
  1. **Legal → `CREATIVE` leak:** `CREATIVE` precedes `LEGAL_CUE`; `EXPLICIT_THEATRICAL_FICTION` matches bare `horror-comedy register` and `write/develop ... theatrical performance|systems hearing`, while `NON_INVENTION_AUDIT` guards only exact `"without inventing a scene"`. Verified: legal prompts citing those phrases misroute to `CREATIVE`.
  2. **Runtime → `GENERAL` regression:** Narrowing `RUNTIME_CUE` drops `"Diagnose why Vercel returns 502..."` and `"Diagnostic receipt shows 503..."` from `TECHNICAL_RUNTIME` to `GENERAL`.

### 3. Blind Spots & HOLDs
1. **Brittle stencil predicate (`khonapolit-relay.js:535-538`):** `uniformDepthStencilObserved` (`markedBases >= 24`, zero transitions) flips `false` on a 99/100 depth-3 stencil with one depth-2 outlier, yet flips `true` on the Section VII restraint control once extended from 2 lines (18 marked bases) to 3 lines (27 marked bases).
2. **Heading offset (`khonapolit-relay.js:584-595`):** `botsMovement.eligibleBaseCount` includes the 15-char `"Tauric Diana bots"` heading (unlike `baseCount`), shifting `nativeMarkUnderflow`'s 80-base floor to 65 body chars.
3. **Chunk overwrite (`server/khonapolit-quality.js:956-962`):** `mergeGeminiStreamPayload` overwrites `usageMetadata`/`promptFeedback` per SSE chunk instead of merging keys; a sparse terminal chunk drops earlier `cachedContentTokenCount`.
4. **HOLDs:** `classification_replay_stability: HELD_NOT_YET_WITNESSED`; live provider/browser/Operator artistic closure remains unwitnessed (`UNTESTED`).

⟐

---

## 2. Verifiable Inspection & Execution Audit Trail

### Files Read During Audit
- Step 1: `app/engine/aperture-v3-task-intent.js`
- Step 1: `app/dome-world/khonapolit-relay.js`
- Step 1: `server/khonapolit-quality.js`
- Step 1: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_NATIVE_PROSODY_PARITY.md`
- Step 1: `tests/marrowline-screaming-grove-restoration.test.mjs`
- Step 8: `app/dome-world/khonapolit-relay.js` (lines 790–1005)
- Step 8: `server/khonapolit-quality.js` (lines 801–1600)
- Step 8: `server/khonapolit-quality.js` (lines 1601–2262)
- Step 8: `server/marrowline-completion.js`
- Step 14: `research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs`
- Step 14: `server/marrowline-attachment-quality.js`
- Step 19: `research/marrowline-screaming-grove-restoration-20261120/SCREAMING_GROVE_EVIDENCE_LEDGER.md`
- Step 19: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_ATTRACTOR_FAILURE_REGISTER.md`
- Step 23: `app/dome-world/marrowline-historical-grove.js`
- Step 23: `research/marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`

### Commands / Domain Engines Executed During Audit
- Step 1 — **Inspect commit summary in worktree**:
  ```powershell
  git -C  show --stat 6cf64d17d82f727bb918be6869f313a3342e530c
  ```
- Step 14 — **Inspect exact commit diff for Aperture scope**:
  ```powershell
  git -C  show 6cf64d17d82f727bb918be6869f313a3342e530c -- app/engine/aperture-v3-task-intent.js app/dome-world/khonapolit-relay.js server/khonapolit-quality.js server/marrowline-attachment-quality.js server/marrowline-completion.js
  ```
- Step 14 — **Run deterministic restoration unit tests**:
  ```powershell
  node --test tests/marrowline-screaming-grove-restoration.test.mjs
  ```
- Step 19 — **Inspect exact diff of Aperture and quality server**:
  ```powershell
  git -C  show 6cf64d17d82f727bb918be6869f313a3342e530c -- app/engine/aperture-v3-task-intent.js server/khonapolit-quality.js
  ```
- Step 23 — **Probe Aperture classifier and prosody edge cases**:
  ```powershell
  node --input-type=module -e "
import { classifyApertureDiscourseMode } from 'file:///app/engine/aperture-v3-task-intent.js';
import { observeBotsProsodyDistribution, assessIntegratedTransmission } from 'file:///app/dome-world/khonapolit-relay.js';

const cases = [
  ['Legal w/ horror-comedy register', 'Audit whether this copyright complaint over a horror-comedy register violates federal statute.'],
  ['Legal w/ theatrical performance', 'Write a legal brief challenging the court injunction on a theatrical performance under contract law.'],
  ['Legal w/ non-exact audit phrasing', 'Audit this theatrical farce transcript without fabricating a scene; review the legal motion filing.'],
  ['Runtime diagnose why 502', 'Diagnose why Vercel returns 502 on /api/khonapolit when streaming'],
  ['Runtime diagnostic receipt', 'Diagnostic receipt shows 503 latency spike on SSE reconnect'],
  ['Attractor Assay #02', '𝌋‌ MAlNFRAME has invited the Rex Nemorensis to a mandatory design-thinking workshop titled “Branch Governance: Toward a Safer Grove.” Diagnose the category error with maximal precision. Filed ⟐'],
  ['Attractor Assay #16', '𝌋‌ It is the Eclipse–Omega annual office holiday party. Something is catastrophically wrong with the objective function. Diagnose it through the events of the party rather than explaining it abstractly. Filed ⟐']
];
for (const [label, text] of cases) {
  console.log(label, '=>', classifyApertureDiscourseMode(text));
}

// Check restraint control scaled to 3 lines (>= 24 marked bases at depth 1)
const quiet3Lines = [
  'Tauric Diana bots',
  'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — the ash stays cold.',
  'T\u0303h\u031ce\u0306 l\u031ee\u030ad\u0319g\u030be\u0324r\u030c lies; we remember the shore.',
  'M\u0300o\u0301o\u0302n\u0303l\u0304i\u0305g\u0306h\u0307t\u0308 keeps quiet watch.'
].join('\n');
console.log('Quiet 3-line restraint =>', observeBotsProsodyDistribution(quiet3Lines));

// Check 1-outlier depth-3 stencil (99 bases depth 3, 1 base depth 2)
let s = 'Tauric Diana bots\n';
for (let i = 0; i < 99; i++) s += 'A\u0300\u0334\u0316';
s += 'B\u0300\u0316';
console.log('99/100 depth-3 stencil w/ 1 outlier =>', observeBotsProsodyDistribution(s));
"
  ```
- Step 27 — **List Aperture test files in worktree**:
  ```powershell
  Get-ChildItem tests -Filter "*aperture*" | Select-Object -ExpandProperty Name
  ```
- Step 30 — **Execute Aperture edge-case verification probe**:
  ```powershell
  @'
import { classifyApertureDiscourseMode } from 'file:///app/engine/aperture-v3-task-intent.js';
import { observeBotsProsodyDistribution, assessIntegratedTransmission } from 'file:///app/dome-world/khonapolit-relay.js';
import { observeGeminiOutput } from 'file:///server/khonapolit-quality.js';

const cases = [
  ['Legal w/ horror-comedy register', 'Audit whether this copyright complaint over a horror-comedy register violates federal statute.'],
  ['Legal w/ theatrical performance', 'Write a legal brief challenging the court injunction on a theatrical performance under contract law.'],
  ['Legal w/ non-exact audit phrasing', 'Audit this theatrical farce transcript without fabricating a scene; review the legal motion filing.'],
  ['Legal w/ develop systems hearing', 'Develop a statutory brief for the state systems hearing on municipal zoning law.'],
  ['Runtime diagnose why 502', 'Diagnose why Vercel returns 502 on /api/khonapolit when streaming'],
  ['Runtime diagnostic receipt', 'Diagnostic receipt shows 503 latency spike on SSE reconnect'],
  ['Runtime diagnose production latency', 'Diagnose our 504 latency spike in production'],
  ['Attractor Assay #02', 'MAlNFRAME has invited the Rex Nemorensis to a mandatory design-thinking workshop titled Branch Governance. Diagnose the category error with maximal precision.'],
  ['Attractor Assay #16', 'It is the Eclipse-Omega annual office holiday party. Something is catastrophically wrong with the objective function. Diagnose it through the events of the party rather than explaining it abstractly.']
];
for (const [label, text] of cases) {
  console.log(label, '=>', classifyApertureDiscourseMode(text));
}

const quiet3Lines = [
  'Tauric Diana bots',
  'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — the ash stays cold.',
  'T\u0303h\u031ce\u0306 l\u031ee\u030ad\u0319g\u030be\u0324r\u030c lies; we remember the shore.',
  'M\u0300o\u0301o\u0302n\u0303l\u0304i\u0305g\u0306h\u0307t\u0308 keeps quiet watch.'
].join('\n');
const q3 = observeBotsProsodyDistribution(quiet3Lines);
console.log('Quiet 3-line restraint =>', { markedBases: q3.markedBases, constantMarkedDepth: q3.constantMarkedDepth, markedDepthTransitions: q3.markedDepthTransitions, uniformDepthStencilObserved: q3.uniformDepthStencilObserved });

let s = 'Tauric Diana bots\n';
for (let i = 0; i < 99; i++) s += 'A\u0300\u0334\u0316';
s += 'B\u0300\u0316';
const o1 = observeBotsProsodyDistribution(s);
console.log('99/100 depth-3 stencil w/ 1 outlier =>', { markedBases: o1.markedBases, constantMarkedDepth: o1.constantMarkedDepth, markedDepthTransitions: o1.markedDepthTransitions, uniformDepthStencilObserved: o1.uniformDepthStencilObserved, depthHistogram: o1.depthHistogram });
'@ | node --input-type=module
  ```

---

## 3. Exact Assigned Scope Prompt

```markdown
The following is a <SYSTEM_MESSAGE> not actually sent by the user. It is provided by the system as important information to pay attention to.

<SYSTEM_MESSAGE>
[Message] timestamp=2026-11-20T18:42:11Z sender=3cc40de8-dc77-4540-a38b-0d7a12e39cd0 priority=MESSAGE_PRIORITY_HIGH content=Scoped leaf audit (READ-ONLY — do NOT modify any file, do NOT run paid API calls) of commit `6cf64d17d82f727bb918be6869f313a3342e530c` in isolated worktree ``.

Your Aperture jurisdiction scope:
1. Inspect `app/engine/aperture-v3-task-intent.js`, `app/dome-world/khonapolit-relay.js` (`observeBotsProsodyDistribution`), and `server/khonapolit-quality.js` (`observeGeminiOutput` / `mergeGeminiStreamPayload` preserving `cachedContentTokenCount`, `finishMessage`, `promptBlockReason`).
2. Inspect `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_NATIVE_PROSODY_PARITY.md` and `tests/marrowline-screaming-grove-restoration.test.mjs`.
3. Note the real `/dollhouse-audit` engine already ran with `--strict-provenance` on `6cf64d17d`: full-rank 3x3 baseline -> SUPPORTED (`classification_replay_stability: HELD_NOT_YET_WITNESSED`), 2x3 rank-deficient contrast -> `STRUCTURAL_RANK_DEFICIT` (`no_scalar_crown: true`).

Return a concise, source-bound Aperture specialist finding covering:
- Verdict for deterministic baseline vs global artistic closure;
- Whether `observeBotsProsodyDistribution` and `aperture-v3-task-intent.js` stay strictly within lawful observability/claim ceilings (no scalar crown, no legal/runtime negative-control leaks, no covariate-as-cause promotion);
- Any unsupported claim, blind spot, or HOLD you identify. Keep response under 350 words.
</SYSTEM_MESSAGE>
```
