# 𝌋 06 · FROZEN CONFIRMATORY PROTOCOL & SOURCE-LOCK MANIFEST

- **Lock Manifest:** [`preregistration/frozen-confirmatory-lock-act2.json`](../preregistration/frozen-confirmatory-lock-act2.json)
- **Confirmatory Orchestrator (Self-Locked):** [`scripts/run-confirmatory-192.mjs`](../scripts/run-confirmatory-192.mjs)
- **Pilot Qualification Gate:** [`receipts/pilot-48-receipt.json`](../receipts/pilot-48-receipt.json) (`qualified_for_confirmatory_freeze: true`)
- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`

---

## 1. Chronological Git Lock Architecture (Remediation of Review `#5792614762` Finding #2)

In Palace Act I (`PR #1699`), the confirmatory runner `scripts/run-confirmatory-96.mjs` was committed in the same commit as the confirmatory results rather than inside the pre-holdout lock commit.

In Act II, **`14` files** — comprising the preregistration manifest, JSON schema, qualified pilot receipt, all `9` scientific modules under `src/*.mjs`, the pilot runner, **and `scripts/run-confirmatory-192.mjs` itself** — are cryptographically hashed in `preregistration/frozen-confirmatory-lock-act2.json` and committed to Git **prior** to generating or scoring `ACT2_CONFIRMATORY_192`.

At startup, `verifyFrozenConfirmatoryLock()` in `scripts/run-confirmatory-192.mjs`:
1. Recomputes exact byte length and SHA-256 of every entry in `locked_files`;
2. Explicitly asserts `selfIncluded === true` (verifying `run-confirmatory-192.mjs` is inside the locked set);
3. Fails closed (`[FROZEN_LOCK_MISMATCH]`) if a single byte of scientific or orchestration code has changed;
4. Records `git rev-parse HEAD` at execution time inside `receipts/confirmatory-192-receipt.json` so any auditor can verify in `git log` that the pre-confirmatory lock commit strictly precedes the confirmatory receipt commit.

---

## 2. Permanent Distinction Among Epistemic Safeguards

Per Section V and Section IX.7, this lock establishes **chronological Git source locking and internal software masking only**:

| Safeguard Class | Status in Act II | Exact Meaning |
|---|---|---|
| **Chronological Git Source Lock** | **ESTABLISHED** | All generator, policy, oracle, statistical, and confirmatory runner bytes committed & hashed before `ACT2_CONFIRMATORY_192` runs. |
| **Dynamic Software Masking (`Proxy`)** | **ESTABLISHED** | `InstrumentedSecretVault` traps every property read and verifies `0` investigator reads across all episodes. |
| **Supervising Model Separation** | **`INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL`** | Designed, executed, and documented within a single interactive session (`independent_external_blinding: false`). |
| **Independent External Replication** | **`NOT_ESTABLISHED`** | Requires an independent human team or external execution environment (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`). |
| **Real-World Empirical Evidence** | **`NOT_CLAIMED`** | Bounded mathematical/computational simulation over synthetic mechanisms (`SOURCE-FREE`). |

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
