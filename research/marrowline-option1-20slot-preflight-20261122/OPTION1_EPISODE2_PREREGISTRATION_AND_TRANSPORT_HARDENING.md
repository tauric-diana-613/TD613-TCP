# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 Episode 2 Preregistration & Transport-Hardening Specification

- **Decision Basis:** Choice B accepted by Human Operator Tawanna C. Miller & Amari ([`PR #1769#issuecomment-7083934930`](https://github.com/tauric-diana-613/TD613-TCP/pull/1769#issuecomment-7083934930))
- **Episode 2 Study / Episode Identity:** `TD613-MARROWLINE-OPTION1-20SLOT-EP2-20261122` (`--episode-id=EP2`, isolated output directory `live-acquisition-ep2/`)
- **Live Execution Status:** **`HELD_PENDING_FINAL_EXACT_HEAD_OPERATOR_AUTHORIZATION`** (`0` Episode 2 paid calls executed)
- **Design Profile Retained Unchanged:** `OPTION1_REV_A_38_VS_36_CONSTRUCTED` (`20` slots: `16` Marrowline 2×2 `{CURRENT_HYBRID_A, LITERAL_OCT02_H2} × {gemini-3.8-flash, gemini-3.6-flash}` + `4` Oct 15 Task D neutral creative controls; exact palindromic counterbalancing `meanSlotIndex = 10.50`; matched `thinkingLevel: "medium"`, `maxOutputTokens: 65536`, `generationConfigSha256 = 4785e46e91df...`)
- **Financial & Token Policy:** **NO dollar spending ceiling and NO aggregate token-budget ceiling.**

---

## 1. Permanent Immutable Episode 1 Coordinates (Never Overwritten, Pooled, or Retried)

| Field | Immutable Value |
|---|---|
| **Episode ID** | `EP1` (`TD613-MARROWLINE-OPTION1-20SLOT-FACTORIAL-20261122`) |
| **Authorized Executable HEAD SHA** | `c67e64363a436607722f1a943311c5ed9a73a906` |
| **Evidence-Publication HEAD SHA** | `51c1f420cfaa1792c25a5b517d253bf0c079ad86` |
| **Immutable Archive Path** | `research/marrowline-option1-20slot-preflight-20261122/live-acquisition/` (harness enforces `REFUSED_EPISODE1_ARCHIVE_IMMUTABLE` if targeted!) |
| **Observed Outcome** | `1` attempted (`S01` `CURRENT_HYBRID_A × 3.8 × T1` → `UND_ERR_HEADERS_TIMEOUT` after `300,403 ms`), `19` unattempted (`S02`–`S20`), `0` recoverable specimens, `0` retries |
| **Upstream Billing / Processing Honesty** | **1 request attempted / 0 recoverable responses — upstream processing and billing status UNKNOWN** (never assumed to be `0` Google processing or `0` billable usage) |

**Separation Law:** Episode 2 is a **fresh, separately registered, separately authorized 20-slot acquisition** in `live-acquisition-ep2/`. Episode 1 is NEVER pooled into Episode 2, NEVER overwritten, and NEVER retroactively reclassified.

---

## 2. Registered Transport-Hardening & Deadline Laws (Locked Before Episode 2 Execution)

1. **Atomic Pre-Send Attempted-Slot Receipt:** Before calling `fetchImpl()` on slot `i`, the runner atomically writes (`tmp` + `rename`) an `IN_FLIGHT_PRE_SEND` slot entry containing `episodeId`, `slot`, `slotIndex`, `envelope`, `modelRequested`, `taskKey`, `sourceHeadSha`, `requestDigests`, and `sendStartedAtUtc`. A socket exception can NEVER leave `calls_executed: 1` with `slots: []`.
2. **Per-Slot Error Handling Around BOTH `fetchImpl()` AND Incremental Streaming Body Reading:**
   - Pre-headers socket/timeout failures (`UND_ERR_HEADERS_TIMEOUT`, `ECONNRESET`, `AbortError`) record `outcomeClass: TRANSPORT_FAILURE`, `transportOutcome: HEADERS_TIMEOUT_NO_RESPONSE | SOCKET_OR_FETCH_ERROR_NO_RESPONSE`, `rawBytesCaptured: 0`, `rawSsePath: null` — **NEVER fabricating a zero-byte `.sse` file**.
   - Mid-stream body-read failures preserve any genuine partial bytes received in `raw-partial/<slot>.partial.sse` (`rawPartialSha256`, `rawBytesCaptured > 0`, `BODY_READ_INTERRUPTED_PARTIAL_BYTES_PRESERVED`), or record `rawBytesCaptured: 0, rawPartialPath: null` if zero bytes arrived.
   - Single isolated transport failures persist cleanly without retry and allow remaining registered slots to proceed.
3. **Registered HTTP/2 Headers / Body / Total-Deadline Policy:**
   - `api_mode`: `streamGenerateContent?alt=sse` (streaming semantics **unchanged** — never silently switched to unary `generateContent`).
   - `headers_timeout_ms`: `300,000 ms` (retaining Node `undici` default rather than imposing an arbitrary shorter cutoff that could manufacture false failures on `MEDIUM` thinking + `33 KB` prompts).
   - `body_idle_timeout_ms`: `300,000 ms`.
   - `total_slot_deadline_ms`: `420,000 ms` (`7 min` hard `AbortSignal.timeout` ceiling per slot).
   - Explicitly recorded: **`timeout_adjustment_is_not_proof_of_upstream_health: true`**.
4. **Registered `STOP_3_CONSECUTIVE_TRANSPORT_FAILURES` Law (`threshold = 2`):**
   - Two consecutive unretried transport failures (socket timeout, body-read abort, or HTTP `503`/`502`/`504`/`429`/`500`) trigger immediate halt **`STOP_3_CONSECUTIVE_TRANSPORT_FAILURES`**, preventing an upstream outage from burning the entire 20-slot episode on timeouts.
   - Any normal HTTP `200` stream arrival immediately resets the consecutive transport failure counter to `0`.
   - On `STOP_3` (or ANY hard STOP), the receipt explicitly enumerates EVERY remaining planned slot in `unattempted_registered_slots` alongside `attempted_registered_slots`.
5. **Hard STOP Precedence Unchanged:** `HTTP 400` (`STOP_HTTP_400_CONFIG_REJECTED`, zero silent `medium`→`low` downgrade), `STOP_1_MODEL_IDENTITY_HOLD_*` (first live `gemini-3.6-flash` `modelVersion` verification), `STOP_2` / `POLICY_TERMINATED` (`PROHIBITED_CONTENT`), and `STOP_4` (dual-parser SSE integrity) all retain immediate single-slot halt precedence.
6. **Blinded Gallery & Chrome Witness Release Boundary:** Blinded gallery files (`OPTION1_BLINDED_LITERARY_GALLERY.md`/`.json` + isolated `private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json`) are generated ONLY when `>= 1` recoverable specimen exists (`NOT_GENERATED_ZERO_RECOVERABLE_SPECIMENS` otherwise), and full-resolution Chrome desktop (`1440×900`) + mobile (`390×844`) PNGs must be rendered post-acquisition before gallery release to Operator.

---

## 3. Read-Only Transport Diagnostic (`2026-11-22T18:58:21.887Z`, `0` Paid Calls)

Recorded verbatim in [`OPTION1_EPISODE2_TRANSPORT_DIAGNOSTIC.json`](./OPTION1_EPISODE2_TRANSPORT_DIAGNOSTIC.json):
- **Node Runtime:** `v26.7.0`
- **TLS / ALPN Handshake (`generativelanguage.googleapis.com:443`):** `TLSv1.3` (`TLS_AES_256_GCM_SHA384`), ALPN **`h2`**, `390 ms`, `authorized: true`.
- **Authenticated Read-Only Metadata `GET`:**
  - `gemini-3.8-flash`: HTTP `200` in **`453 ms`** (`outputTokenLimit: 65536`, `thinking: true`)
  - `gemini-3.6-flash`: HTTP `200` in **`149 ms`** (`version: "3.6-flash-07-2026"`, `outputTokenLimit: 65536`, `thinking: true`)
- **Epistemic Limit:** Confirms host reachability, TLS/ALPN `h2`, and catalog health only — does NOT predict live `streamGenerateContent?alt=sse` thinking latency or upstream processing of Episode 1 `S01`.
