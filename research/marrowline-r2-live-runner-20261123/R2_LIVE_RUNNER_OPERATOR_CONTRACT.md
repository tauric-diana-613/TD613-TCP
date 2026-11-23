# 𝌋⟐ TD613 · MARROWLINE R2
## OPERATOR EXECUTION CONTRACT & WINDOWS POWERSHELL LAUNCH PROCEDURE

- **Commission:** `TD613-MARROWLINE-R2-LIVE-RUNNER-20261123` (Updated for PR `#1783` Review `#6019546753`)
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Authority Posture:** **FAIL-CLOSED OFFLINE BY DEFAULT.** Zero Gemini calls, zero private-key reads, zero grant signatures, zero `wx` nonces until the human operator authorizes a live run from an interactive terminal.

---

## 1. Windows PowerShell Operator Launch Commands (`Launch-R2Observation.ps1`)

### Step 1 — Offline Preflight (Zero Calls / Zero Secrets)
Verify exact `HEAD`, trust-anchor fingerprint (`840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701`), non-relocatable host nonce registry path, frozen wire digests, and exact `planDigestSha256`:

```powershell
# R2-U Initial Pilot preflight (planDigestSha256: c9d360e58fbb0c0bad3ffd2a6a09e2f2cf2e39f9f2558ff72a26b2e72687b788)
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 -Estate R2-U -Plan INITIAL_PILOT

# R2-W Initial Civic + Noncivic Pilot preflight (planDigestSha256: b8c64c2d070014ca2d156109b68184c21bb6155e35725df911718d8089c2c897)
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 -Estate R2-W -Plan INITIAL_PILOT
```

### Step 2 — Authorized Single-Use Live Pilot Launch (Human Interactive Terminal)
When ready to execute an initial pilot under human authority (`INITIAL_PILOT`), invoke `Launch-R2Observation.ps1` with `-ExecuteLive -SignInteractively` (passing your encrypted Ed25519 key path once) or with a separately signed `-GrantFile` & `-PublicKeyFile` generated for that exact `HEAD` and `planId`:

```powershell
# R2-U Initial Pilot launch
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 `
  -Estate R2-U `
  -Plan INITIAL_PILOT `
  -ExecuteLive `
  -SignInteractively `
  -PrivateKeyFile "D:\offline-custody\td613-operator-ed25519.key.pem"

# R2-W Initial Pilot launch (separate estate & separate registry)
.\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 `
  -Estate R2-W `
  -Plan INITIAL_PILOT `
  -ExecuteLive `
  -SignInteractively `
  -PrivateKeyFile "D:\offline-custody\td613-operator-ed25519.key.pem"
```

What is enforced before any provider dispatch:
1. **Plan Consent Binding (`planId`, `episodeCount`, `episodes`, `planDigestSha256`):** Interactive signing binds your signature specifically to the chosen `Plan` / `EpisodesJsonPath` (consent scope only — never an output-token/byte/spend/retry cap). Substituting a different plan fails with `R2_AUTH_PLAN_SCOPE_MISMATCH`.
2. **Non-Relocatable Single-Host `wx` Nonce Registry:** Each `nonce` is claimed atomically (`flag: 'wx', mode: 0o600`) in `%LOCALAPPDATA%\TD613\marrowline-r2\host-nonce-registry\<estate>\` — independent of the per-session `-EvidenceRoot` / timestamped output directory. Reusing any signed grant in a new output directory fails immediately with `R2_AUTH_NONCE_REPLAYED` before metadata discovery or credential reads. (Local single-host OS enforcement only; cross-host distributed prevention remains `false`.)
3. **Separate Session Evidence Directory & Secrets Hygiene:** Writes session logs/SSE/receipts into `%LOCALAPPDATA%\TD613\marrowline-r2\<estate>\<timestamp_guid>\`, prompts via hidden `SecureString` for passphrase and `GEMINI_API_KEY`, clears both in `finally`, supports Ctrl+C / `revocation.json` mid-stream STOP, and writes non-secret `<out>.summary.txt` (and `<out>.blinded.json` for `R2-W`).

---

## 2. Adversarial Gate & Timebase Boundary (`r2-custody-gate-verifier.mjs`)

- Naked caller booleans cannot yield `EMPIRICALLY_QUALIFIED` or `externalAdmissionProved: true`.
- `verifyPhysicalR2CustodyAndEvaluateGate()` cryptographically/physically verifies Ed25519 signature, SPKI fingerprint, exact `HEAD`, signed `planDigestSha256`, shared host nonce ledger entry + session `nonce-ref`, append-only `.jsonl` journal, chunked `.sse` disk SHA-256 + `parseRawSseFileIndependently()` raw SSE re-parse + `.authored.txt` SHA-256, and measured `SINGLE_PROCESS_HRTIME_MONOTONIC_CALIBRATED_MS` timestamps (`actAt`/`worldAnswersAt` remain `null` if halted before dispatch/response; raw `Date.now()` wall-clock snapshots are reported separately and cannot impersonate monotonic hardware proof).

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Operator Contract Updated for Review #6019546753 · Live Execution HELD ⟐
