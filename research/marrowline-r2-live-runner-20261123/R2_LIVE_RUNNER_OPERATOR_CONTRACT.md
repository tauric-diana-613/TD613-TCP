# 𝌋⟐ TD613 · MARROWLINE R2
## OPERATOR EXECUTION CONTRACT & WINDOWS POWERSHELL LAUNCH PROCEDURE

- **Commission:** `TD613-MARROWLINE-R2-LIVE-RUNNER-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Authority Posture:** **FAIL-CLOSED OFFLINE BY DEFAULT.** Zero Gemini calls, zero private-key reads, zero grant signatures, zero `wx` nonces until the human operator authorizes a live run from an interactive terminal.

---

## 1. Simplest Windows PowerShell Operator Workflow (`Launch-R2Observation.ps1`)

### Step 1 — Offline Preflight (Zero Calls / Zero Secrets)
Verify exact `HEAD`, trust-anchor fingerprint (`840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`), frozen wire digests, and acquisition plan scope:

```powershell
# R2-U Initial Pilot preflight
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 -Estate R2-U -Plan INITIAL_PILOT

# R2-W Initial Civic + Noncivic Pilot preflight
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 -Estate R2-W -Plan INITIAL_PILOT
```

### Step 2 — Single-Use Authorized Execution (Human Terminal)
When ready to dispatch real Gemini observations, run in interactive PowerShell with your encrypted Ed25519 private key PEM (`-SignInteractively` signs a ceiling-free single-use grant pinned to exact `HEAD` inside human terminal memory without saving your passphrase, OR pass pre-signed `-GrantFile` & `-PublicKeyFile`):

```powershell
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 `
  -Estate R2-U `
  -Plan INITIAL_PILOT `
  -ExecuteLive `
  -SignInteractively `
  -PrivateKeyFile "D:\offline-custody\td613-operator-ed25519.key.pem"
```

What the launcher automates safely without weakening custody:
1. Creates a separate isolated session directory under `%LOCALAPPDATA%\TD613\marrowline-r2\<estate>\<timestamp_guid>\` (cross-estate contamination into R1 or the opposite R2 estate is blocked fail-closed).
2. Prompts with hidden `SecureString` input for your Ed25519 passphrase, verifies the public SPKI fingerprint matches `840a7162...`, zeroes passphrase buffers immediately, and requires typing `EXECUTE R2-U` (or `EXECUTE R2-W`).
3. Prompts with hidden `SecureString` input for `GEMINI_API_KEY` (stored in child process scope only and scrubbed in `finally`).
4. Prints step-by-step progress (`[1/4]` Model Metadata `outputTokenLimit === 65536` check, `[2/4]` `:countTokens` measurement, `[3/4]` raw `.sse` disk streaming, `[4/4]` physical cryptographic + disk custody Gate check).
5. Writes a non-secret `<out>.summary.txt` (and for `R2-W`, `<out>.blinded.json` **first** so you read blinded artistic outputs before condition labels).

### Instant Mid-Stream Operator STOP / Revocation
- Press **`Ctrl+C`** in PowerShell (`SIGINT`), **or** write `{"revokeAll":true}` to the printed `...-revocation.json` path. Active SSE readers abort immediately, `fsync` partial raw `.sse` bytes to disk, and classify cleanly as `STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED`.

---

## 2. Adversarial Gate Closure Boundary (`r2-custody-gate-verifier.mjs`)

- Naked caller booleans (`signatureValid: true`, `nonceClaimed: true`, `rawCaptureVerified: true`) **cannot** yield `EMPIRICALLY_QUALIFIED` or `externalAdmissionProved: true`.
- `verifyPhysicalR2CustodyAndEvaluateGate()` independently re-verifies:
  1. Ed25519 signature over `TD613_R2_U_AUTH_V1\n<canonicalJson>` / `TD613_R2_W_AUTH_V1\n<canonicalJson>`, SPKI trust anchor, `HEAD`, and all estate frozen manifest hashes.
  2. Physical on-disk `${prefix}-nonce-${nonce}.json` (`wx`) and `${prefix}-${sessionId}-${nonce}-journal.jsonl` custody binding.
  3. Physical `.sse` disk bytes (`hashFileChunkedSync`), independent on-disk `.sse` re-parse (`parseRawSseFileIndependently`), `.authored.txt` disk parity, `finishReason === 'STOP'`, `modelVersion === 'gemini-3.8-flash'`, and valid integer `usageMetadata`.
  4. Documented clock timebase (`timebaseValidated: true` + `timebaseRelation`), preserving `null` when unvalidated.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Operator Contract Staged · Live Execution HELD ⟐
