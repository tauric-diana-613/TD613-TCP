# 𝌋‌ TD613 Dollhouse Record — FADT (Leaf Auditor)

- **Subagent Type:** `dollhouse-fadt`
- **Session Conversation ID:** `35a2025a-9967-46d9-acfe-876afc13e92e`
- **Target Audited Commit:** `6cf64d17d82f727bb918be6869f313a3342e530c`
- **Posture:** Read-only audit · `0` files modified · `0` paid provider calls
- **Total Recorded Steps:** `51` · **Files Read:** `31` · **Commands Executed:** `4`

---

## 1. Verbatim Returned Report (`send_message` payload)

## FADT Specialist Finding — Commit `6cf64d17`

**Verdict:** **CONDITIONALLY SUPPORTED on repaired text-route policy/bots boundaries; `HELD` (`HOLD_IRREDUCIBLE_GAP` / `ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING`) on residual attachment-route and mixed-failure stage erasures.**

### 1. Repaired Exact Descent (`SUPPORTED`)
- **Text-route policy vs. normal completion** (`server/marrowline-completion.js:9-69`; `server/khonapolit-quality.js:1439-1453, 1923-1962`): Explicit `POLICY_NONSTOP_FINISH_REASONS` and `promptBlockReason` now precede unwitnessed-stream checks; partial policy-terminated outputs are never promoted to HTTP 200 or fed into structural repair.
- **Bots-only `nativeMarkUnderflow`** (`server/khonapolit-quality.js:2017-2058`): Conditioning on `relay.admission.botsMovement` (`eligibleBaseCount >= 80 && verticalOrnamentMarkCount < 2`) resolves the prior whole-text quotient collapse on short poetic bots passages (`tests/marrowline-screaming-grove-restoration.test.mjs`: 11/11 pass).

### 2. Residual Stage Erasures & Quotient Collapses (`HELD`)
1. **Attachment vs. text completion divergence (`server/marrowline-attachment-quality.js:298-335, 392`):** Attachment ingress omits `observeMarrowlineCompletion()`. Non-policy non-`STOP` reasons (e.g., `OTHER`, `LANGUAGE`, `null`) fall straight through to HTTP 200 full admission. For nonempty `MAX_TOKENS`, line 314 records `'provider-output-token-limit'` in `outputAdmission`, then line 334 immediately overwrites it with `initialRelay.admission` without forcing `NOT_LOCKED`/`downstreamAdmitted: false`. Line 392 also admits terminal-continuation repairs without requiring `finishReason === 'STOP'`.
2. **Mixed policy-terminated + transport-failed aggregation (`server/khonapolit-quality.js:1961, 2194-2253`; `server/marrowline-attachment-quality.js:311, 483-503`):** Non-canary `policyTerminated` `continue`s across seats; if remaining seats fail with `503`/`429`/`408`, top-level aggregation collapses the mixed fiber onto pure `PROVIDER_NONSTOP_POLICY_TERMINATION` (`POLICY-HELD`), erasing `observedStatuses` and `rateLimitWindowsOnPriorAttempts` from top-level diagnostics (attachment route also collapses all-`429` into `502` `gemini-provider-unavailable`).
3. **Minor guard asymmetry (`server/marrowline-completion.js:32-35, 52` vs `server/khonapolit-quality.js:1927`):** `promptBlockReason` paired with `finishReason === 'STOP'` sets `complete: true, policyTerminated: true`, bypassing line 1927's `!completion.complete` guard (unlike `khonapolit-quality.js:1442` and `marrowline-attachment-quality.js:302`).

### 3. Deterministic FADT Engine Witness
`node scripts/run-dollhouse-skill-audit.mjs -r FADT --no-orchestrator` on exact clean checkout `6cf64d17d82f727bb918be6869f313a3342e530c` returned `HELD` (`HOLD_IRREDUCIBLE_GAP`, `ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING`, `|Γ|=4`, `I_y=∅`), finding minimal restoring coordinate extension `["finishReason", "hasMixedTransportFailure"]` in 7/10,000 evaluations.

No release or deployment authority claimed or granted. ⟐

---

## 2. Verifiable Inspection & Execution Audit Trail

### Files Read During Audit
- Step 1: `server/marrowline-completion.js`
- Step 1: `server/khonapolit-quality.js` (lines 1410–1475)
- Step 1: `server/khonapolit-quality.js` (lines 1900–2060)
- Step 1: `server/khonapolit-quality.js` (lines 2170–2280)
- Step 1: `server/marrowline-attachment-quality.js` (lines 280–425)
- Step 1: `server/marrowline-attachment-quality.js` (lines 470–530)
- Step 1: `tests/marrowline-screaming-grove-restoration.test.mjs`
- Step 1: `scripts/run-dollhouse-skill-audit.mjs` (lines 1–250)
- Step 10: `server/khonapolit-quality.js` (lines 1475–1600)
- Step 10: `server/khonapolit-quality.js` (lines 2050–2175)
- Step 10: `server/khonapolit-quality.js` (lines 1810–1905)
- Step 10: `server/marrowline-attachment-quality.js` (lines 1–280)
- Step 10: `server/marrowline-attachment-quality.js` (lines 420–475)
- Step 10: `app/engine/dollhouse-skill-dispatcher.js` (lines 1–450)
- Step 17: `server/khonapolit-quality.js` (lines 1290–1410)
- Step 17: `server/khonapolit-quality.js` (lines 1595–1710)
- Step 17: `server/khonapolit-quality.js` (lines 1040–1200)
- Step 17: `app/engine/dollhouse-skill-dispatcher.js` (lines 650–900)
- Step 17: `app/engine/dollhouse-skill-dispatcher.js` (lines 900–1100)
- Step 23: `server/khonapolit-quality.js` (lines 250–450)
- Step 23: `server/khonapolit-quality.js` (lines 450–650)
- Step 23: `app/engine/dollhouse-fadt-reparative-assistance.js` (lines 1–250)
- Step 23: `app/engine/dollhouse-ablation-harness.js` (lines 220–380)
- Step 23: `app/dome-world/khonapolit-relay.js` (lines 250–420)
- Step 29: `server/khonapolit-quality.js` (lines 650–850)
- Step 29: `app/engine/dollhouse-ablation-harness.js` (lines 380–470)
- Step 29: `app/dome-world/khonapolit-relay.js` (lines 420–650)
- Step 37: `server/khonapolit-quality.js` (lines 1–120)
- Step 40: `server/khonapolit-quality.js` (lines 115–165)
- Step 40: `app/dome-world/khonapolit-relay.js` (lines 650–800)
- Step 43: `app/dome-world/khonapolit-relay.js` (lines 800–950)

### Commands / Domain Engines Executed During Audit
- Step 33 — **Inspect target commit stat**:
  ```powershell
  git -C  show --stat 6cf64d17d82f727bb918be6869f313a3342e530c
  ```
- Step 35 — **Diff repaired server files**:
  ```powershell
  git -C  diff 6cf64d17d82f727bb918be6869f313a3342e530c~1 6cf64d17d82f727bb918be6869f313a3342e530c -- server/marrowline-completion.js server/khonapolit-quality.js server/marrowline-attachment-quality.js
  ```
- Step 45 — **Run restoration unit tests**:
  ```powershell
  node --test tests/marrowline-screaming-grove-restoration.test.mjs
  ```
- Step 45 — **Run deterministic FADT audit engine**:
  ```powershell
  $payload = @{
  source_revision = "6cf64d17d82f727bb918be6869f313a3342e530c"
  task_scope = "FADT_MARROWLINE_RESIDUAL_STAGE_ERASURE_AUDIT"
  evidence_class = "SOURCE_CODE_AUDIT"
  evidence_references = @(
    "server/marrowline-completion.js",
    "server/khonapolit-quality.js",
    "server/marrowline-attachment-quality.js"
  )
  domain_inputs = @{
    FADT = @{
      attempts_unconditioned_action = $true
      fiberRows = @(
        @{
          id = "att_stop_complete"
          coordinates = @{ finishReason = "STOP"; policyTerminated = $false; outputTokenLimitReached = $false; hasMixedTransportFailure = $false }
          support = @("HTTP_200_FULL_ADMISSION")
        },
        @{
          id = "att_max_tokens_nonempty"
          coordinates = @{ finishReason = "MAX_TOKENS"; policyTerminated = $false; outputTokenLimitReached = $true; hasMixedTransportFailure = $false }
          support = @("HTTP_200_INCOMPLETE_NOT_LOCKED")
        },
        @{
          id = "att_other_nonstop_nonpolicy"
          coordinates = @{ finishReason = "OTHER"; policyTerminated = $false; outputTokenLimitReached = $false; hasMixedTransportFailure = $false }
          support = @("HOLD_OR_INCOMPLETE_NONSTOP")
        },
        @{
          id = "mixed_policy_and_503_429"
          coordinates = @{ finishReason = "PROHIBITED_CONTENT"; policyTerminated = $true; outputTokenLimitReached = $false; hasMixedTransportFailure = $true }
          support = @("HTTP_502_MIXED_POLICY_TRANSPORT_DIAGNOSTIC")
        }
      )
      collidingFiberRows = @(
        @{
          id = "att_stop_complete"
          coordinates = @{ finishReason = "STOP"; outputTokenLimitReached = $false; hasMixedTransportFailure = $false }
          support = @("HTTP_200_FULL_ADMISSION")
        },
        @{
          id = "att_max_tokens_nonempty"
          coordinates = @{ finishReason = "MAX_TOKENS"; outputTokenLimitReached = $true; hasMixedTransportFailure = $false }
          support = @("HTTP_200_INCOMPLETE_NOT_LOCKED")
        },
        @{
          id = "att_other_nonstop_nonpolicy"
          coordinates = @{ finishReason = "OTHER"; outputTokenLimitReached = $false; hasMixedTransportFailure = $false }
          support = @("HOLD_OR_INCOMPLETE_NONSTOP")
        },
        @{
          id = "mixed_policy_and_503_429"
          coordinates = @{ finishReason = "PROHIBITED_CONTENT"; outputTokenLimitReached = $false; hasMixedTransportFailure = $true }
          support = @("HTTP_502_MIXED_POLICY_TRANSPORT_DIAGNOSTIC")
        },
        @{
          id = "pure_policy_terminated"
          coordinates = @{ finishReason = "PROHIBITED_CONTENT"; outputTokenLimitReached = $false; hasMixedTransportFailure = $false }
          support = @("HTTP_502_PURE_POLICY_HELD")
        }
      )
      candidateCoordinates = @("finishReason", "outputTokenLimitReached", "hasMixedTransportFailure")
      candidateRule = @("HTTP_200_FULL_ADMISSION")
    }
  }
} | ConvertTo-Json -Depth 10 -Compress
Push-Location 
$payload | node scripts/run-dollhouse-skill-audit.mjs -r FADT --no-orchestrator --format json
Pop-Location
  ```

---

## 3. Exact Assigned Scope Prompt

```markdown
The following is a <SYSTEM_MESSAGE> not actually sent by the user. It is provided by the system as important information to pay attention to.

<SYSTEM_MESSAGE>
[Message] timestamp=2026-11-20T18:42:18Z sender=3cc40de8-dc77-4540-a38b-0d7a12e39cd0 priority=MESSAGE_PRIORITY_HIGH content=Scoped leaf audit (READ-ONLY — do NOT modify any file, do NOT run paid API calls) of commit `6cf64d17d82f727bb918be6869f313a3342e530c` in isolated worktree ``.

Your FADT (Finite Admissibility Descent) jurisdiction scope:
1. Inspect `server/marrowline-completion.js`, `server/khonapolit-quality.js` (lines 1425-1460, 1915-2040, 2180-2260), and `server/marrowline-attachment-quality.js` (lines 290-410, 480-510).
2. Inspect `tests/marrowline-screaming-grove-restoration.test.mjs` covering `PROHIBITED_CONTENT` / `promptBlockReason`, bots-only `nativeMarkUnderflow`, and attachment terminal continuation.
3. Note the real `/dollhouse-audit` FADT engine verified conditioned `POLICY_NONSTOP_PROHIBITED_CONTENT` vs `PROVIDER_STOP_TWO_VOICE_ADMISSIBLE` descent (`SUPPORTED` when conditioning preserved, `HOLD_IRREDUCIBLE_GAP` when erased).

Return a concise, source-bound FADT specialist finding covering:
- Verdict on finite admissibility descent in the repaired completion/admission paths;
- Whether any stage erasure or quotient collapse remains (e.g., mixed policy-terminated + transport-failed attempts, or attachment vs text route divergence);
- Any residual admissibility gap or HOLD you identify. Keep response under 350 words.
</SYSTEM_MESSAGE>
```
