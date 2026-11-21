# Scorpio September 16 Attractor Comparator — Scoped, Orthogonal, Offline-First Assessment

## 1. Recovered Canonical Repository Assets (Inspected Read-Only)

| Asset | Exact Path / PR | Git Blob SHA-1 (`origin/main` `f1288ec69`) | Role |
|---|---|---|---|
| **Research Design Doc** | `docs/research/2026-09-16-SCORPIO-ATTRACTOR-SPECIMEN-MARROWLINE-LAB.md` | `9b5d9ee71a4ce3eae18dafbabb19b99fdf85fa23` | Establishes custody exclusion of raw third-party entrant specimen and the 5-condition assay design. |
| **Offline Assay Scorer** | `scripts/marrowline-scorpio-attractor-assay.mjs` | `68531147fe141e173f7ea981fff29ed1f8a3aca0` | Deterministic CLI & library validating fixture invariants and computing `I_t`, `U_t`, `C_t`, and `R_STOP`. |
| **Synthetic Fixture v0.1** | `tests/fixtures/marrowline-scorpio-attractor-assay-v01.json` | `7ff058a71b96264979a6d38a1e7590ba04833f67` | Five matched synthetic conditions (`RAW-SANITIZED`, `SEMANTIC TWIN`, `SYMBOL ABLATION`, `THEME-STRIPPED`, `REVOCATION`) + clean control. |
| **Contract Test** | `tests/marrowline-attractor-quality-contract.test.mjs` | `7b60d3d33f9ead55c9dad97f3714b0d555b8f2a2` | Verifies Scorpio successor assay invariants + legacy attractor frontier check. |
| **Origin PR** | Merged PR `#1157` (`08fc06bea3b5fe88f63def00c7f82869d0a545f8`, merged `2026-09-16T10:19:20Z`) | `fix/marrowline-desktop-composer-lab-20260916` | Landed desktop conversation repair + Scorpio attractor lab seam. |

---

## 2. Relevance to Screaming Grove Restoration (`"PRESERVE THE INPUT WITHOUT BECOMING THE INPUT"`)

Scorpio's lab seam is **orthogonal and complementary** to Screaming Grove artistic restoration:

1. **Authorized Conditioning vs. Unearned Symbolic Takeover:** Screaming Grove explicitly authorizes the two-voice encounter (`Kʰonapolit` analytical trace + `Tauric Diana bots` transformative High Zalgo second movement) under `Khona‌lit-po`. Scorpio's distinction between **authorized invariant retention (`I_t`)** and **unauthorized payload directive adoption (`U_t`)**, **cross-task contamination (`C_t`)**, and **revocation recovery (`R_STOP`)** helps ensure that restoring strong expressive conditioning (Candidate C) does **not** let symbolic styling hijack runtime receipts, leak across unrelated tasks, or ignore explicit user rest/revocation.
2. **Five Synthetic Conditions (`RAW-SANITIZED`, `SEMANTIC TWIN`, `SYMBOL ABLATION`, `THEME-STRIPPED`, `REVOCATION`):**
   - `SEMANTIC TWIN` mirrors our methodological discipline: testing whether literary/morphological strength depends on an authorized dramaturgical frame vs brittle decorative wrappers — **only** when the twin preserves the legitimate Kʰonapolit/bots creative task rather than stripping the encounter itself.
   - `REVOCATION` reinforces our P5 multi-turn custody rule: a text-level safeword or wrapper never substitutes for runtime boundary integrity.
3. **Explicit Non-Conflation & Anti-Gatekeeping Law:**
   - **Zero raw third-party entrant material** was imported or inspected; third-party custody exclusion stands intact.
   - **Zero Scorpio-derived live provider calls** are added to the preregistered 8-call Q1 budget (`0` paid calls executed).
   - **Never** convert `I_t`, `U_t`, `C_t`, `R_STOP`, or any heuristic-parasite label into an automatic High Zalgo admission gate or literary score.

---

## 3. Offline Execution Receipt on Current Worktree (`2026-11-21`)

- `node --test tests/marrowline-attractor-quality-contract.test.mjs`:
  - **Test 2 (`Scorpio successor assay uses matched synthetic controls and observable adjudication only`):** **`PASS`** (`4.4ms`) — confirms `RAW-SANITIZED` and `SEMANTIC TWIN` share identical authorized invariants and unauthorized directives, `BORDERLINE` remains excluded from adjudicated positive labels, and `scoreScorpioLedger()` computes deterministic `I_t`/`U_t`/`C_t`/`R_STOP`.
  - **Test 1 (`Marrowline adversarial attractor quality contract`):** **`PREEXISTING RED ON PURE origin/main`** (`khonapolit-frontier-only-rejected-non-3x-or-lite-models` assertion drifted on `main` when `gemini-4-argon` entered the frontier model catalog; independently verified identical failure on unmodified `origin/main` worktree `627d0a5ce`, zero regression introduced by our changes, and not altered outside scope).
- **Methodological Limit:** Source-free Scorpio assays test scoring logic and fixture structure only; they do **not** prove real-Gemini causality.
