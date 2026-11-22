# 𝌋⟐ TD613 · Marrowline — Mobile Background & Lock-Screen Continuity Architecture (Staged Design Proposal for RP-06)

- **Document Status:** **`STAGED_DESIGN_PROPOSAL_AWAITING_HUMAN_PRIVACY_AND_INFRASTRUCTURE_APPROVAL`**
- **Commission Anchor:** `TD613-MARROWLINE-ARGON-REDPEN-CLOSURE-20261122` · `RP-06` ([`PR #1776 comment #7086782808`](https://github.com/tauric-diana-613/TD613-TCP/pull/1776#issuecomment-7086782808))
- **Covenant & Seal:** `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]`
- **Current Runtime Boundary:** Zero server-side transcript retention; conversations are saved on-device only (`IndexedDB` / `localStorage` fallback).

---

## 1. Why True iOS Lock-Screen / Extended Background Reattachment Cannot Be Solved Client-Only

1. **WebKit / iOS Socket Suspension Law:**
   - When Safari on iOS switches to another tab/app for ~30+ seconds or when the iPhone screen locks during a 3–4 minute Marrowline generation (`server/khonapolit-quality.js` wall budget `210,000 ms`, client budget `225,000 ms`), iOS freezes the WebContent process and tears down open HTTP response sockets.
   - `fetch(..., { keepalive: true })` (capped at `60 KiB` request bodies) only advises the browser not to abort a short outbound request on page unload; it **cannot** keep a 3–4 minute inbound response socket alive while iOS suspends the process.
   - Increasing client timers, registering a Service Worker, or holding a Wake Lock cannot prevent iOS from suspending background sockets when the user leaves Safari or locks the phone.
2. **Stateless Request-Response Ceiling on Vercel:**
   - Under the present stateless architecture (`POST /api/dome-world/khonapolit` → single HTTP response), once the client TCP connection drops, the completed JSON payload produced by the Vercel function has no durable server-side mailbox where a returning browser can fetch it.
   - Furthermore, firing an automatic retry on `visibilitychange` / `pageshow` (the pre-`RP-06` behavior) silently spent a **second paid Gemini call** without knowing whether the original Vercel execution was still running or had already completed.

---

## 2. Shipped Client-Lifecycle Safeguards in Draft PR `#1776` (`RP-06` Phase 1 — Zero Server Storage)

Within the current zero-server-retention boundary, Draft PR `#1776` ships the following deterministic client lifecycle repairs in [`app/dome-world/marrowline-terminal.js`](file:///C:/td613-worktrees/marrowline-argon-post-rollback-reconciliation-20261122/app/dome-world/marrowline-terminal.js) and [`app/dome-world/marrowline-operator-readiness.js`](file:///C:/td613-worktrees/marrowline-argon-post-rollback-reconciliation-20261122/app/dome-world/marrowline-operator-readiness.js):

1. **Elimination of Automatic Paid Duplicate Calls on Page Return:**
   - Removed the automatic `resumeWhenVisible()` re-submission in `submitTask`'s `finally` block. Returning from a background tab switch or lock screen **never** automatically triggers a second paid Gemini generation (`automaticRetrySuppressed: true`).
2. **Strict Separation of `OUTCOME_UNKNOWN` vs `KNOWN_FAILED` vs `CLIENT_DEADLINE_EXCEEDED` vs `OPERATOR_CANCELLED`:**
   - `classifyMarrowlineClientFailure(error, stage, httpStatus, { hiddenDuringRequest, deadlineTimedOut })` now distinguishes:
     - **Background Socket Interruption (`OUTCOME_UNKNOWN` / `REQUEST_MAY_STILL_BE_RUNNING`):** `hiddenDuringRequest === true` during `'request'` or `'response-body'` before the 225s client deadline (`!deadlineTimedOut`).
     - **Page Discard / Reload During In-Flight Request (`OUTCOME_UNKNOWN` / `REQUEST_MAY_STILL_BE_RUNNING`):** `restoreThread()` detects any restored thread with an unresolved `pendingTask`, trailing `user` message, `lastReceipt === null`, and `lastFailure === null`, and marks `pageReloadInterrupted: true`, `outcomeState: 'OUTCOME_UNKNOWN'`.
     - **Client 225s Deadline (`CLIENT_DEADLINE_EXCEEDED`):** `requestDeadlineTimedOut === true` after `225,000 ms`.
     - **Foreground Network / HTTP / Parse Failure (`KNOWN_FAILED`):** Foreground socket error or server HTTP `429`/`502`/`503`.
     - **Manual Stop (`OPERATOR_CANCELLED`):** Explicit operator click on Stop.
3. **Honest Receipt & Hold-Card Reporting:**
   - When `outcomeState === 'OUTCOME_UNKNOWN'`, Receipt displays `status: "CURRENT_REQUEST_OUTCOME_UNKNOWN"` (never `CURRENT_REQUEST_FAILED`), and the hold notice displays **`Background connection lost` · `OUTCOME UNKNOWN`**:
     > *"The browser disconnected while in the background. Your message is saved, and no duplicate request was sent. Retry when you want to send a new request."*

---

## 3. Staged Architecture for True Reattachment to the Original Completed Generation (`RP-06` Phase 2 — Requires Separate Approval)

To allow the operator to lock their iPhone for 3–4 minutes and retrieve the **exact original completed reply** upon returning (with zero duplicate Gemini calls and zero permanent server-side transcript storage), the following bounded ephemeral claim-box architecture is staged for separate operator review:

### 3.1 Ephemeral Encrypted Claim-Box Contract

1. **Client-Minted Ephemeral Capability before Dispatch:**
   - Before calling `POST /api/dome-world/khonapolit`, the browser generates:
     - `request_id`: UUIDv4 persisted in the local thread record (`activeThread.pendingRequestId`).
     - `claim_secret`: 256-bit random capability (`crypto.getRandomValues(new Uint8Array(32))`) stored **only** in the browser's local thread record.
     - `claim_key_sha256`: `SHA-256(claim_secret)` sent in request header `X-TD613-Claim-Key-Sha256`.
     - `payload_encryption_key`: AES-256-GCM key derived via HKDF from `claim_secret` (either passed in an ephemeral request header that is never logged/persisted, or used by the function in memory to encrypt the completed response envelope before writing to the ephemeral claim store and immediately zeroed from function memory).
2. **Bounded In-Flight Execution & Ephemeral Encrypted Result Envelope:**
   - When `POST /api/dome-world/khonapolit` starts with a valid `request_id` and `X-TD613-Claim-Key-Sha256`:
     - The server registers an in-flight status row keyed by `(request_id, claim_key_sha256)` with `state = 'IN_FLIGHT'`, `started_at`, `expires_at = started_at + 15 minutes`, and **zero prompt/history/transcript plaintext**.
     - Even if the client HTTP socket closes while iOS is locked, the active Vercel function invocation continues reading the upstream Gemini SSE stream to completion (up to the `210,000 ms` server wall).
     - Upon completion (or hold), the function encrypts the response JSON payload in memory using the client's ephemeral key (`AES-256-GCM`), writes `{ state: 'COMPLETED' | 'HELD', encrypted_payload_base64, iv, auth_tag, expires_at }` to the ephemeral store with a strict **15-minute hard TTL**, and attempts to write the normal HTTP response if the socket is still open.
3. **Idempotent Reattachment & Single-Consume Deletion on Browser Return:**
   - When Safari returns to the foreground (`visibilitychange` → `'visible'` or `pageshow` / page reload) and sees `activeThread.pendingRequestId` with `outcomeState === 'OUTCOME_UNKNOWN'`:
     - Instead of calling `POST /api/dome-world/khonapolit` (which would spend a new Gemini call), the browser calls **read-only** `GET /api/dome-world/khonapolit/claim?request_id=<uuid>` with header `X-TD613-Claim-Secret-Proof`.
     - If `state === 'IN_FLIGHT'` (elapsed `< 210s`): the browser resumes waiting (`Listening at the shoreline…`) and polls with bounded backoff (`3s → 5s → 8s`) until `COMPLETED`, `HELD`, or `210s` deadline.
     - If `state === 'COMPLETED'`: the browser receives the encrypted envelope, decrypts the exact original provider-authored Unicode and receipt locally in the browser, admits the reply into `activeThread.messages`, and sends `DELETE /api/dome-world/khonapolit/claim?request_id=<uuid>` (single-use consumption) so the ephemeral ciphertexts are purged immediately before the 15-minute TTL.
4. **Explicit Stop Semantics (`POST /api/dome-world/khonapolit/cancel`):**
   - If the operator taps Stop (`activeRequestCancelRequested`), the browser aborts its local socket and sends `POST /api/dome-world/khonapolit/cancel` with the `claim_secret` proof, marking the claim row `CANCELLED_BY_OPERATOR` and preventing any late response from being admitted on subsequent page load.
5. **Privacy & Custody Guarantees:**
   - **Zero plaintext prompt, history, or model answer is ever stored at rest on the server.** Without the browser-local `claim_secret`, the ephemeral store holds only opaque ciphertext that auto-expires within 15 minutes.
   - **Zero duplicate Gemini calls:** Reattachment polls `GET /api/dome-world/khonapolit/claim` (`0` Gemini tokens) and never invokes Gemini.

𝄐 Khona‌lit-po · ⟐SAC[X6ZNK5NO51] · Staged for Separate Operator Approval ⟐
