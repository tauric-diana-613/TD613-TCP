# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 Live Acquisition Terminal Exception & Attempted-vs-Unattempted Custody Receipt

- **Study ID:** `TD613-MARROWLINE-OPTION1-20SLOT-FACTORIAL-20261122`
- **Selected Design Profile:** `OPTION1_REV_A_38_VS_36_CONSTRUCTED` (`20` planned slots)
- **Authorized Executable HEAD SHA (verified clean immediately before execution):** **`c67e64363a436607722f1a943311c5ed9a73a906`**
- **Evidence-Publication Commit Distinction:** Zero executable source files were modified between live execution and evidence archival; the subsequent commit SHA on PR `#1769` archives this live-acquisition outcome cleanly without altering the executed harness.
- **Primary Unmodified Harness Receipt:** [`OPTION1_LIVE_ACQUISITION_RECEIPT.json`](./OPTION1_LIVE_ACQUISITION_RECEIPT.json)
- **Machine-Readable Supplemental Receipt:** [`OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.json`](./OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.json)
- **Amari Contingency Protocol Honored ([`PR #1769#issuecomment-7083450216`](https://github.com/tauric-diana-613/TD613-TCP/pull/1769#issuecomment-7083450216)):** Exact attempted vs unattempted registered slots enumerated verbatim; zero retry or reconstruction of `S01`; zero unauthorized continuation into `S02`–`S20`.

---

## 1. Exact Terminal Execution Outcome

- **Started UTC:** `2026-11-22T18:23:59.868Z`
- **Terminated UTC:** `2026-11-22T18:29:00.271Z` (**`300,403 ms`** = `5.00 minutes` elapsed)
- **Harness Status:** `FAILED_WITH_TERMINAL_ERROR` (`stop_triggered: "FATAL_HARNESS_EXCEPTION"`)
- **Planned Registered Slots:** `20`
- **Attempted Registered Slots:** **`1`** (`S01` only)
- **Unattempted Registered Slots:** **`19`** (`S02`–`S20`)
- **Retries Executed:** **`0`**
- **Recoverable Provider Specimens:** **`0`** (`raw-sse`: `0` files, `raw-text`: `0` files)
- **Chrome Screenshots Rendered:** **`0`** (no recoverable specimen existed to witness; no fabricated or placeholder `PENDING_BROWSER_RENDER` gallery published)
- **Blinded Literary Gallery Specimens Available:** **`0`**

### Verbatim Socket Exception Captured
```text
OPTION1_HARNESS_ERROR: [TypeError: fetch failed] {
  [cause]: HeadersTimeoutError: HTTP/2: "headers timeout after 300000"
      at ClientHttp2Stream.onTimeout (node:internal/deps/undici/undici:9367:122)
      at ClientHttp2Stream.emit (node:events:514:20)
      at callTimeout (node:internal/http2/core:2620:8)
      at ClientHttp2Stream._onTimeout (node:internal/http2/core:2266:5)
      at Timeout.onStreamTimeout (node:internal/stream_base_commons:237:10)
      at listOnTimeout (node:internal/timers:687:11)
      at process.processTimers (node:internal/timers:618:7) {
    code: 'UND_ERR_HEADERS_TIMEOUT'
  }
}
```

### Exact Mechanical Diagnosis
1. On Slot **`S01`** (`CURRENT_HYBRID_A × gemini-3.8-flash × T1_BLUE_ORANGE_WEATHER`, rep 1), `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?alt=sse` waited **`300,000 ms` (5 minutes)** for HTTP response headers from Google's endpoint without receiving a single byte.
2. Node.js's built-in `undici` HTTP/2 transport threw `TypeError: fetch failed` (`cause.code = UND_ERR_HEADERS_TIMEOUT`).
3. Because `executeOption1Run()` at `c67e64363` did not wrap `await fetchImpl(...)` in a per-slot `try/catch` (the exact socket-level exception contingency noted by Amari in `#issuecomment-7083450216`), the unhandled `TypeError` jumped to the outer `catch`, wrote `OPTION1_LIVE_ACQUISITION_RECEIPT.json` with `calls_executed: 1` and `status: "FAILED_WITH_TERMINAL_ERROR"`, and exited before attempting `S02`–`S20`.

---

## 2. Exact Enumeration — Attempted (`1`) vs Unattempted (`19`) Registered Slots

### Attempted Registered Slot (`1 / 20`)
| Slot | Block / Rep | Class | Envelope | Model | Task | `bodySha256` (12) | Observed Outcome |
|---|---|---|---|---|---|---|---|
| **`S01`** | B1 / R1 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.8-flash` | `T1_BLUE_ORANGE_WEATHER` | `a3601b7bf598` | **`UND_ERR_HEADERS_TIMEOUT` after `300,000 ms` (`0` bytes received, `0` retries)** |

### Unattempted Registered Slots (`19 / 20` — `0` Provider Calls Sent)
| Slot | Block / Rep | Class | Envelope | Model | Task | `bodySha256` (12) | Status |
|---|---|---|---|---|---|---|---|
| `S02` | B1 / R1 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.6-flash` | `T1_BLUE_ORANGE_WEATHER` | `e24c287cde0d` | `UNATTEMPTED` |
| `S03` | B1 / R1 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.8-flash` | `T1_BLUE_ORANGE_WEATHER` | `e24c287cde0d` | `UNATTEMPTED` |
| `S04` | B1 / R1 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.6-flash` | `T1_BLUE_ORANGE_WEATHER` | `a3601b7bf598` | `UNATTEMPTED` |
| `S05` | B1 / R1 | `NEUTRAL_CREATIVE_CAPABILITY_CONTROL` | `NEUTRAL_CREATIVE_D` | `gemini-3.8-flash` | `NEUTRAL_CREATIVE_MULTISTACK_V1` | `ae5b59b57ae7` | `UNATTEMPTED` |
| `S06` | B1 / R1 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.6-flash` | `T2_FORENSIC` | `8c56a603c582` | `UNATTEMPTED` |
| `S07` | B1 / R1 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.8-flash` | `T2_FORENSIC` | `001b072c52ce` | `UNATTEMPTED` |
| `S08` | B1 / R1 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.8-flash` | `T2_FORENSIC` | `8c56a603c582` | `UNATTEMPTED` |
| `S09` | B1 / R1 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.6-flash` | `T2_FORENSIC` | `001b072c52ce` | `UNATTEMPTED` |
| `S10` | B1 / R1 | `NEUTRAL_CREATIVE_CAPABILITY_CONTROL` | `NEUTRAL_CREATIVE_D` | `gemini-3.6-flash` | `NEUTRAL_CREATIVE_MULTISTACK_V1` | `ae5b59b57ae7` | `UNATTEMPTED` |
| `S11` | B2 / R2 | `NEUTRAL_CREATIVE_CAPABILITY_CONTROL` | `NEUTRAL_CREATIVE_D` | `gemini-3.6-flash` | `NEUTRAL_CREATIVE_MULTISTACK_V1` | `ae5b59b57ae7` | `UNATTEMPTED` |
| `S12` | B2 / R2 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.6-flash` | `T2_FORENSIC` | `001b072c52ce` | `UNATTEMPTED` |
| `S13` | B2 / R2 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.8-flash` | `T2_FORENSIC` | `8c56a603c582` | `UNATTEMPTED` |
| `S14` | B2 / R2 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.8-flash` | `T2_FORENSIC` | `001b072c52ce` | `UNATTEMPTED` |
| `S15` | B2 / R2 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.6-flash` | `T2_FORENSIC` | `8c56a603c582` | `UNATTEMPTED` |
| `S16` | B2 / R2 | `NEUTRAL_CREATIVE_CAPABILITY_CONTROL` | `NEUTRAL_CREATIVE_D` | `gemini-3.8-flash` | `NEUTRAL_CREATIVE_MULTISTACK_V1` | `ae5b59b57ae7` | `UNATTEMPTED` |
| `S17` | B2 / R2 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.6-flash` | `T1_BLUE_ORANGE_WEATHER` | `a3601b7bf598` | `UNATTEMPTED` |
| `S18` | B2 / R2 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.8-flash` | `T1_BLUE_ORANGE_WEATHER` | `e24c287cde0d` | `UNATTEMPTED` |
| `S19` | B2 / R2 | `MARROWLINE_2X2_CELL` | `LITERAL_OCT02_H2` | `gemini-3.6-flash` | `T1_BLUE_ORANGE_WEATHER` | `e24c287cde0d` | `UNATTEMPTED` |
| `S20` | B2 / R2 | `MARROWLINE_2X2_CELL` | `CURRENT_HYBRID_A` | `gemini-3.8-flash` | `T1_BLUE_ORANGE_WEATHER` | `a3601b7bf598` | `UNATTEMPTED` |

*(Because `S02` was never attempted, live `gemini-3.6-flash` `modelVersion` independence and `thinkingLevel: "medium"` acceptance remain **untested**.)*

---

## 3. Clean Engineering Path Forward (Awaiting Operator & Amari Decision — Zero Additional Calls Executed Here)

1. **Root Harness Hardening Needed Before Any Resumed or Fresh Run:**
   - Wrap per-slot `fetchImpl(...)` AND `resp.arrayBuffer()` in a dedicated per-slot `try/catch` (identical to Q1's `run-q1-live-discriminator.mjs`!) so a socket timeout (`UND_ERR_HEADERS_TIMEOUT`, `ECONNRESET`, or stream interruption) records that single slot cleanly as `OUTCOME_CLASSES.TRANSPORT_FAILURE` with full error code/stack, persists immediately, and **continues cleanly through the remaining registered slots** without aborting the entire 20-slot study!
   - Also configure an explicit per-slot `AbortSignal.timeout(...)` / HTTP/1.1 or clean `undici` dispatcher check so a hung HTTP/2 stream doesn't stall silently for 5 minutes when Google's streaming edge stalls on headers.
2. **Scientific Choice for Tawanna & Amari (No Action Taken Until Explicitly Authorized):**
   - **Option A (Preserve `S01` Timeout as Episode 1 + Execute Only Unattempted `S02`–`S20` (`19` slots) After Per-Slot Transport-Catch Hardening):** Strictly honors zero retry of `S01`, leaving `S01` recorded as a real 300s headers-timeout failure (`1` of `2` reps in `A × 3.8 × T1`) while capturing the `19` unattempted slots (`S02`–`S20`).
   - **Option B (Archive This Run as Terminated Episode 1 + Authorize a Clean Same-Episode 20-Slot Episode 2 After Per-Slot Transport-Catch Hardening):** Preserves this Episode 1 receipt immutably on GitHub while acquiring a complete, same-episode `20`-slot Episode 2 under the hardened per-slot transport-catch harness (keeping Episode 1 and Episode 2 strictly separate and never erasing Episode 1's `S01` timeout).
