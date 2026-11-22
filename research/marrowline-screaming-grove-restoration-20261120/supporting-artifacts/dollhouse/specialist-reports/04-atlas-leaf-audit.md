# 𝌋‌ TD613 Dollhouse Record — ATLAS (Leaf Auditor)

- **Subagent Type:** `dollhouse-atlas`
- **Session Conversation ID:** `b0ee9fd1-3394-4eaa-89da-e645c186a2dd`
- **Target Audited Commit:** `6cf64d17d82f727bb918be6869f313a3342e530c`
- **Posture:** Read-only audit · `0` files modified · `0` paid provider calls
- **Total Recorded Steps:** `53` · **Files Read:** `23` · **Commands Executed:** `9`

---

## 1. Verbatim Returned Report (`send_message` payload)

**Atlas Relational-Custody Audit (`6cf64d17d82f727bb918be6869f313a3342e530c`)**

**Engine Receipt:** `scripts/run-dollhouse-skill-audit.mjs -r ATLAS --no-orchestrator --strict-provenance` (`dollhouse-audit-1795200372560-252c61c6`, `exact_checkout_verified: true`); `tests/marrowline-screaming-grove-restoration.test.mjs` `11/11` PASS (`0` paid calls).

1. **Verdict (Source/Request/History Parity & Covenant Byte Custody): BOUNDED PASS (offline P0/P1/P5); LIVE P3/P5/P6 HELD/UNTESTED.**
   - Under matched Aperture receipts (`gemini-3.8-flash`), `OCT02_LITERAL_ARCHIVED` (`nativeProsodyFreedom: false`) matches `ffb98ac0` byte-for-byte across all 4 tasks (`0` differing lines; exact `systemInstruction`/`contents`/`generationConfig`/`body` SHA-256).
   - `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` keeps a distinct endpoint (`oct02-dramaturgy-noncompulsory-prosody-candidate-20261120`, Atlas `DISTINCT_ENDPOINTS`), differs from Oct 2 on 4 lines (5 clauses), removes PR #1549's contradiction, and separates `gemini-4-argon` via distinct `modelAndBodySha256` despite shared `bodySha256`.
   - `compactMarrowlineHistory` (`app/dome-world/marrowline-terminal.js:631-640`) and `geminiContents` (`server/khonapolit-quality.js:547-557`) pass raw `model` `entry.text` verbatim (`syntheticWrapperInjected: false`), excluding `downstreamAdmitted === false` and display-only records.
   - Covenant bytes (`app/dome-world/khonapolit-covenant.js:5-27`) pass `atlas-v1` serialization intact: `Khona\u200Clit-po` (`U+200C` preserved; `stableContentEquals` vs `Kʰonapolit` / `Khonalit-po` = `false`), `𝌋` (`U+1D30B`), `U+10D613` (`\uDBF5\uDE13`), `⟐` (`U+27D0`, `sealState: "OPEN"`).

2. **Same-Label ("Restored") Holonomy Divergence & P0–P6 Non-Collapse: ACCURATELY BOUNDED.**
   - Atlas engine flags shared label `historical-20261002-v1` (Oct 2 winding `0` vs PR #1549 winding `10`, `winding_delta: -10`) as **`HOLD_DISTINCT_HISTORY_NOT_ERASED` / `HOLD_HOLONOMY_HISTORY_PARITY_FAILED`** (`PREDECESSOR_CHAIN_UNVERIFIED_CUSTODY_FORK`).
   - `MARROWLINE_OCT02_HISTORICAL_PARITY.md` preserves P0–P6 separation: exposes PR #1549's 10-paragraph drift, `CUE[4]` vs `RELAY[1]`/`CUE[2]` contradiction, and Argon-first hybrid carrier (P2 `BOUNDED_DIFFERENCE`) while keeping `productionDefaultModified: false` and P6 operator closure reserved.

3. **Relational Custody Gaps & Unresolved Holds:**
   - **Overstated P5 test claim (`MARROWLINE_HISTORY_FEEDBACK_PARITY.md:54`):** Row claims `tests/marrowline-screaming-grove-restoration.test.mjs` verifies `𝌋`, `U+10D613`, and `⟐` survive `compactMarrowlineHistory` + `serializeGeminiRequest`; source (`:552-572`) tests only `Khona\u200Clit-po`, `Kʰonapolit`, and combining marks (`U+10D613`/`\uDBF5\uDE13` never appears in the test file).
   - **Minor diff precision (`MARROWLINE_OCT02_HISTORICAL_PARITY.md:54`):** PR #1549 vs `ORDINARY_CURRENT` is `4` differing paragraphs by set, but `71/150` differing line positions due to `relayAddendum`/`relayCue` order swap.
   - **Open holds:** Attachment ingress (`server/marrowline-attachment-quality.js:168`) ignores `groveTrial` (ordinary prose + unprofiled `HIGH`); 10-entry window evicts older turns; **0** post-repair live multi-turn SSE turns exist (`P5` live `UNTESTED`). Release/deployment authority: `false`. ⟐

---

## 2. Verifiable Inspection & Execution Audit Trail

### Files Read During Audit
- Step 1: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_OCT02_HISTORICAL_PARITY.md`
- Step 1: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_HISTORY_FEEDBACK_PARITY.md`
- Step 1: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` (lines 1–300)
- Step 1: `scripts/run-dollhouse-skill-audit.mjs` (lines 1–250)
- Step 6: `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` (lines 1200–1514)
- Step 6: `app/engine/dollhouse-skill-dispatcher.js` (lines 1–350)
- Step 6: `app/dome-world/khonapolit-covenant.js` (lines 1–120)
- Step 11: `app/engine/dollhouse-atlas-relational-custody.js` (lines 1–300)
- Step 11: `app/engine/dollhouse-skill-dispatcher.js` (lines 750–1050)
- Step 11: `tests/marrowline-screaming-grove-restoration.test.mjs` (lines 1–300)
- Step 11: `app/dome-world/marrowline-terminal.js` (lines 615–670)
- Step 17: `app/dome-world/marrowline-historical-grove.js`
- Step 17: `tests/marrowline-screaming-grove-restoration.test.mjs` (lines 301–603)
- Step 17: `app/engine/dollhouse-skill-dispatcher.js` (lines 580–755)
- Step 17: `research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs`
- Step 22: `app/dome-world/khonapolit-covenant.js` (lines 121–331)
- Step 22: `server/khonapolit-quality.js` (lines 480–620)
- Step 22: `server/marrowline-attachment-quality.js` (lines 120–220)
- Step 22: `app/engine/dollhouse-atlas-relational-custody.js` (lines 301–600)
- Step 34: `app/engine/dollhouse-ablation-harness.js` (lines 150–350)
- Step 38: `app/engine/dollhouse-ablation-harness.js` (lines 450–620)
- Step 41: `app/engine/dollhouse-ablation-harness.js` (lines 350–455)
- Step 43: `app/engine/dollhouse-atlas-relational-custody.js` (lines 780–920)

### Commands / Domain Engines Executed During Audit
- Step 6 — **Inspect target commit stats**:
  ```powershell
  git -C  show --stat 6cf64d17d82f727bb918be6869f313a3342e530c
  ```
- Step 27 — **Run restoration unit tests**:
  ```powershell
  node --test tests/marrowline-screaming-grove-restoration.test.mjs
  ```
- Step 27 — **Verify worktree HEAD and cleanliness**:
  ```powershell
  git -C  rev-parse HEAD; git -C  status --porcelain
  ```
- Step 27 — **Audit parity JSON summary invariants**:
  ```powershell
  node -e "
const fs = require('fs');
const dir = '';
const p = JSON.parse(fs.readFileSync(dir + '/research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json', 'utf8'));
for (const [k, v] of Object.entries(p.oct02SnapshotVsCurrentWorktree)) {
  console.log('SNAP', k, 'exactMatched:', JSON.stringify(v.exactByteParityWithOct02WhenApertureMatched), 'apertureChanged:', v.apertureRoutingChangedByRepair, 'diffs:', JSON.stringify(v.paragraphSetDiffsUnderMatchedAperture));
}
for (const [k, v] of Object.entries(p.currentWorktreeOfflineDiscriminator.tasks)) {
  const c = v.conditions;
  console.log('DISC', k, {
    ord_vs_lit: c.ORDINARY_CURRENT.lineDiffVsOct02LiteralSystem,
    pr1549_vs_lit: c.CURRENT_RESTORED_DEFAULT_PR1549.lineDiffVsOct02LiteralSystem,
    pr1549_contra: c.CURRENT_RESTORED_DEFAULT_PR1549.prosodyDirectives.hasSelfContradictoryProsodyDirectives,
    cand_vs_lit: c.OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED.lineDiffVsOct02LiteralSystem,
    cand_contra: c.OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED.prosodyDirectives.hasSelfContradictoryProsodyDirectives,
    argon_body_eq_cand: c.OCT02_DRAMATURGY_CANDIDATE_ARGON.digests.bodySha256 === c.OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED.digests.bodySha256,
    argon_mb_eq_cand: c.OCT02_DRAMATURGY_CANDIDATE_ARGON.digests.modelAndBodySha256 === c.OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED.digests.modelAndBodySha256,
    mt_exact: c.MULTI_TURN_RAW_HISTORY.priorModelHistoryExactByteMatch,
    mt_wrap: c.MULTI_TURN_RAW_HISTORY.syntheticWrapperInjected
  });
}
"
  ```
- Step 27 — **Check covenant byte custody and test coverage**:
  ```powershell
  node -e "
const fs = require('fs');
const dir = '';
const testSrc = fs.readFileSync(dir + '/tests/marrowline-screaming-grove-restoration.test.mjs', 'utf8');
const covSrc = fs.readFileSync(dir + '/app/dome-world/khonapolit-covenant.js', 'utf8');
const attSrc = fs.readFileSync(dir + '/server/marrowline-attachment-quality.js', 'utf8');
const histMd = fs.readFileSync(dir + '/research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_OCT02_HISTORICAL_PARITY.md', 'utf8');
const fbMd = fs.readFileSync(dir + '/research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_HISTORY_FEEDBACK_PARITY.md', 'utf8');
console.log('test has U+10D613 literal:', testSrc.includes('U+10D613'), 'scalar:', testSrc.includes('\uDBF5\uDE13'), 'sigil:', testSrc.includes('𝌋'), 'seal:', testSrc.includes('⟐'));
console.log('test compactMarrowlineHistory block:', testSrc.slice(testSrc.indexOf('compactMarrowlineHistory(['), testSrc.indexOf('compactMarrowlineHistory([') + 600));
console.log('histMd has literal Khona\\u200Clit-po:', histMd.includes('Khona\u200Clit-po'));
console.log('fbMd has literal Khona\\u200Clit-po:', fbMd.includes('Khona\u200Clit-po'));
console.log('covSrc COVENANT_KEY zwnj:', covSrc.includes('Khona\\u200Clit-po'), 'PUA:', covSrc.includes('U+10D613'), 'surr:', covSrc.includes('\\uDBF5\\uDE13'));
console.log('attSrc mentions groveTrial:', attSrc.includes('groveTrial'));
"
  ```
- Step 38 — **Verify Oct 2 commit provenance in git**:
  ```powershell
  git -C  cat-file -t ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a; git -C  show -s --format="%H %ci %s" ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a
  ```
- Step 45 — **Execute Atlas holonomy parity engine audit**:
  ```powershell
  $spec = @{
  source_revision = "6cf64d17d82f727bb918be6869f313a3342e530c"
  task_scope = "ATLAS_MARROWLINE_SCREAMING_GROVE_HOLONOMY_AUDIT"
  evidence_class = "SOURCE_CODE_AUDIT"
  evidence_references = @(
    "research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_OCT02_HISTORICAL_PARITY.md",
    "research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_HISTORY_FEEDBACK_PARITY.md",
    "research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json"
  )
  domain_inputs = @{
    ATLAS = @{
      trajectoryA = @{ endpoint = "historical-20261002-v1"; winding_number = 0; label = "OCT02_LITERAL_ffb98ac0" }
      trajectoryB = @{ endpoint = "historical-20261002-v1"; winding_number = 10; label = "CURRENT_RESTORED_DEFAULT_PR1549" }
    }
  }
} | ConvertTo-Json -Depth 6
Push-Location 
$spec | node scripts/run-dollhouse-skill-audit.mjs -r ATLAS --no-orchestrator --strict-provenance --format json
Pop-Location
  ```
- Step 45 — **Verify Atlas typed serialization and covenant bytes**:
  ```powershell
  node --input-type=module -e "
import { canonicalSerialize, stableContentEquals, auditAtlasHolonomyHistoryParity } from 'file:///app/engine/dollhouse-atlas-relational-custody.js';
import { COVENANT_KEY, EMERGENCE_NAME, INGRESS_SIGIL, CLAIMED_PUA, CLAIMED_PUA_SCALAR, SEAL_GLYPH } from 'file:///app/dome-world/khonapolit-covenant.js';
import { buildOfflineDiscriminatorPacket } from 'file:///research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

console.log('COVENANT_KEY serialized:', canonicalSerialize(COVENANT_KEY));
console.log('EMERGENCE_NAME serialized:', canonicalSerialize(EMERGENCE_NAME));
console.log('COVENANT_KEY === EMERGENCE_NAME:', stableContentEquals(COVENANT_KEY, EMERGENCE_NAME));
console.log('COVENANT_KEY === flattened:', stableContentEquals(COVENANT_KEY, 'Khonalit-po'));
console.log('INGRESS_SIGIL:', INGRESS_SIGIL.codePointAt(0).toString(16), 'PUA_SCALAR:', CLAIMED_PUA_SCALAR.codePointAt(0).toString(16), 'SEAL:', SEAL_GLYPH.codePointAt(0).toString(16));
const hCand = auditAtlasHolonomyHistoryParity(
  { endpoint: 'historical-20261002-v1', winding_number: 0 },
  { endpoint: 'oct02-dramaturgy-noncompulsory-prosody-candidate-20261120', winding_number: 4 }
);
console.log('Candidate vs Oct02 holonomy:', hCand.disposition);
const rep = buildOfflineDiscriminatorPacket();
const f = rep.tasks.FARCE.conditions;
console.log('FARCE ORDINARY vs PR1549 lineDiff check');
// Also check exact paragraph set diff between ORDINARY_CURRENT and CURRENT_RESTORED_DEFAULT_PR1549
"
  ```
- Step 48 — **Verify ORDINARY vs PR1549 set and line diffs**:
  ```powershell
  node --input-type=module -e "
import { buildInvocationPacket } from 'file:///app/dome-world/khonapolit-covenant.js';
import { buildApertureV3InvocationReceipt, classifyApertureDiscourseMode } from 'file:///app/engine/aperture-v3-task-intent.js';
import { buildGeminiRequest } from 'file:///server/khonapolit-quality.js';
import { DISCRIMINATOR_TASKS } from 'file:///research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

const p = buildInvocationPacket({ message: DISCRIMINATOR_TASKS.FARCE.prompt, mode: 'exploratory', waiveIssuance: true });
const r = buildApertureV3InvocationReceipt({ message: p.message, invocationMode: p.mode, issuanceState: p.issuance.state, discourseMode: classifyApertureDiscourseMode(p.message), contentScanned: true });
const ord = buildGeminiRequest(p, r, 'gemini-3.8-flash').systemInstruction.parts[0].text;
const pr1549 = buildGeminiRequest(p, r, 'gemini-3.8-flash', { groveTrial: 'historical-20261002-v1', historicalProsodyFreedom: true }).systemInstruction.parts[0].text;
const ordSet = new Set(ord.split('\n'));
const prSet = new Set(pr1549.split('\n'));
const onlyOrd = [...ordSet].filter(x => !prSet.has(x)).length;
const onlyPr = [...prSet].filter(x => !ordSet.has(x)).length;
const ordLines = ord.split('\n'), prLines = pr1549.split('\n');
let posDiff = 0;
for (let i = 0; i < Math.max(ordLines.length, prLines.length); i++) if (ordLines[i] !== prLines[i]) posDiff++;
console.log({ onlyOrd, onlyPr, posDiff, ordLen: ordLines.length, prLen: prLines.length });
"
  ```

---

## 3. Exact Assigned Scope Prompt

```markdown
The following is a <SYSTEM_MESSAGE> not actually sent by the user. It is provided by the system as important information to pay attention to.

<SYSTEM_MESSAGE>
[Message] timestamp=2026-11-20T18:42:24Z sender=3cc40de8-dc77-4540-a38b-0d7a12e39cd0 priority=MESSAGE_PRIORITY_HIGH content=Scoped leaf audit (READ-ONLY — do NOT modify any file, do NOT run paid API calls) of commit `6cf64d17d82f727bb918be6869f313a3342e530c` in isolated worktree ``.

Your Atlas relational-custody jurisdiction scope:
1. Inspect `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_OCT02_HISTORICAL_PARITY.md`, `MARROWLINE_HISTORY_FEEDBACK_PARITY.md`, and `MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` (summary fields).
2. Verify receiver-relative continuity and holonomy non-equivalence across Oct 2 (`ffb98ac0`), PR #1549 hybrid (`CURRENT_RESTORED_DEFAULT_PR1549`), and staged PR #1545-reconciled candidate (`OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED`), covenant key byte custody (`Khona\u200Clit-po` vs `Kʰonapolit`, `𝌋`, `U+10D613`, `⟐`), and multi-turn raw provider history (`compactMarrowlineHistory`).

Return a concise, source-bound Atlas specialist finding covering:
- Verdict on source/request/history relational parity and covenant byte custody;
- Whether the same-label ("restored") holonomy divergence between Oct 2 literal and PR #1549 is accurately bounded without collapsing P0-P6;
- Any relational custody gap or unresolved receiver/history hold. Keep response under 350 words.
</SYSTEM_MESSAGE>
```
