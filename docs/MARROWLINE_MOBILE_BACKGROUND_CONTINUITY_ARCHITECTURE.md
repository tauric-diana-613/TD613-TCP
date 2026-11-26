# 𝌋‌⟐ TD613 · Marrowline / The Screaming Grove — Request Lifecycle & Background Continuity Architecture (`td613.marrowline.episode-continuity/v1`)

- **Document Status:** **`IMPLEMENTED_IN_CANDIDATE_BRANCH_AWAITING_HUMAN_MERGE_AND_RELEASE_AUTHORIZATION`**
- **Commission Anchors:**
  - `SUPPLEMENTAL COMMISSION — REQUEST LIFECYCLE & BACKGROUND CONTINUITY` (`2026-11-25`)
  - `TD613-MARROWLINE-ARGON-REDPEN-CLOSURE-20261122` · `RP-06` ([`PR #1776 comment #7086782808`](https://github.com/tauric-diana-613/TD613-TCP/pull/1776#issuecomment-7086782808))
  - `TD613-MARROWLINE-ARGON-SUCCESSOR-CLOSURE-20261122` · `C-01` & `C-02` ([`PR #1776 comment #7087820233`](https://github.com/tauric-diana-613/TD613-TCP/pull/1776#issuecomment-7087820233))
- **Covenant & Seal:** `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]`
- **Permanent Transcript Custody:** Zero server-side conversation archive (`storage.serverConversationStorage: false`); long-lived conversations remain exclusively on-device (`IndexedDB` with `localStorage` fallback). Ephemeral encrypted episode envelopes (`AES-256-GCM`, browser-held capability) exist solely for active turn reattachment up to a hard `900s` (`15-minute`) cutoff and are deleted immediately upon browser consumption or operator cancellation.

---

## 1. Lifecycle Forensics — Why Desktop & Mobile Both Disconnected

### 1.1 Three Independent Pre-Existing Transport & Lifecycle Defects
Investigation across `app/dome-world/marrowline-terminal.js`, `app/dome-world/marrowline-operator-readiness.js`, `server/khonapolit-quality.js`, `server/marrowline-attachment-quality.js`, `api/khonapolit.js`, and `vercel.json` established three interacting root causes affecting **both desktop and mobile browsers**:

1. **Defect A — Misuse of Fetch `keepalive: true` on Multi-Minute Generation `POST`s (`app/dome-world/marrowline-terminal.js`):**
   - `RP-06` (`45f27d5f8`) set `fetch(..., { keepalive: true })` for payloads `<= 60 KiB`.
   - Per the Fetch specification and Chromium/WebKit implementations (`KeepAliveURLLoaderService` / WebKit `PingLoad`), `keepalive: true` is a page-unload beacon mechanism with a shared `64 KiB` tab-group quota and short background loader timeouts (~`30s`), **not** a mechanism for keeping 60s–205s response streams alive while switching tabs or windows.
2. **Defect B — Silent Buffered Downstream HTTP Socket (`0` Bytes Emitted for Up to `205s`):**
   - Upstream (`Vercel -> Google`), `server/khonapolit-quality.js` consumed SSE (`:streamGenerateContent`), whereas downstream (`Browser -> Vercel`), `/api/dome-world/khonapolit` sent **zero HTTP response headers and zero bytes** until the entire generation completed (`60s–205s`).
   - Across desktop tab/window switches (Chrome Intensive Wake-Up Throttling, Safari App Nap, Windows EcoQoS), QUIC/HTTP3 connection migrations, NAT/proxy idle socket eviction, and mobile backgrounding, an idle unacknowledged HTTP socket is routinely reset before `t = 120s–205s`.
   - Furthermore, desktop window/application switches (`Alt+Tab` / `Cmd+Tab` / clicking another application) fire `window.blur` while `document.visibilityState` remains `'visible'`. When a silent socket dropped during a desktop window switch, `hiddenDuringRequest` remained `false`, falling into `KNOWN_FAILED` (`"Reply paused · PAUSED — The connection was interrupted. Your message is saved."`), whereas tab switches fell into `OUTCOME_UNKNOWN` (`"Background connection lost · OUTCOME UNKNOWN"`).
3. **Defect C — Tight Coupling Between Transient HTTP Socket and Provider Generation Outcome:**
   - iOS Safari and Android browsers freeze backgrounded tabs and tear down active inbound TCP sockets within ~`5s–30s` of app switching or screen lock.
   - Because `/api/dome-world/khonapolit` wrote its output solely to the originating `res` socket without registering `waitUntil` or sealing an encrypted episode envelope, any Gemini generation finishing after socket teardown was lost on the server—forcing the operator to manually retry and incur a second billable generation.

### 1.2 Exact Repository Execution & Timeout Hierarchy

| Layer | Inspected File | Configured Parameter | Value | Lifecycle Role |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel Function Ceiling** | `vercel.json` (`functions["api/khonapolit.js"].maxDuration`) | `maxDuration` | **`300 seconds`** (`300,000 ms`) | Hard platform ceiling for `/api/khonapolit` including registered `waitUntil` promises. (`vercel.json` enforces `11` deployed API files; continuity operations dispatch inside `api/khonapolit.js` via `?operation=episode-claim\|episode-consume\|episode-cancel`.) |
| **Foreground Client Deadline** | `app/dome-world/marrowline-terminal.js` | `KHONAPOLIT_CLIENT_REQUEST_TIMEOUT_MS` | **`225 seconds`** (`225,000 ms`) | Foreground client `AbortController` ceiling (`600s` during multi-chunk large file upload, reset to `225s` once upload completes). Browser timer throttling in hidden tabs never shortens this deadline. |
| **Provider Generation Wall** | `server/khonapolit-quality.js` & `server/marrowline-attachment-quality.js` | `WALL_TIMEOUT_MS` (`210,000 ms`) & `RESPONSE_RESERVE_MS` (`5,000 ms`) | **`210 seconds`** (`205s` generation runway + `5s` reserve) | Preserves PR `#1799` single-seat Carbon completion runway (`165s` primary + `40s` authored-stream grace = `205s` streamed; `205s` unary attachment). |
| **Downstream Transport Heartbeat** | `server/marrowline-episode-continuity.js` | `MARROWLINE_EPISODE_HEARTBEAT_MS` | **`5 seconds`** (`5,000 ms`) | Framed `application/x-ndjson` stream (`accepted` at `t = 0s`, `heartbeat` every `5s`, terminal `result` frame) keeping active desktop and mobile sockets alive across proxies, NATs, and window switches. |
| **Episode Lease** | `server/marrowline-episode-continuity.js` | `MARROWLINE_EPISODE_LEASE_MS` | **`240 seconds`** (`240,000 ms`) | `210s` provider wall + `30s` seal/commit margin (`60s` below `300s` platform kill); stale `RUNNING` episodes past `240s` reconcile deterministically to `OUTCOME_UNKNOWN`. |
| **Hard Access Cutoff** | `server/marrowline-episode-continuity.js` | `MARROWLINE_EPISODE_HARD_TTL_MS` | **`900 seconds`** (`15 minutes`) | Immutable `0 ms`-lag API & cryptographic `AAD` expiration ceiling (`410 Gone` after `created_at + 900,000 ms`). |

---

## 2. Implemented Continuity Architecture (`td613.marrowline.episode-continuity/v1`)

### 2.1 End-to-End Decoupled Request & Reattachment Flow
1. **Browser Capability Creation & Local Custody Before Dispatch (`app/dome-world/marrowline-episode-continuity-client.js`):**
   - Before calling `fetch`, the browser generates a random `episodeId` (`ep_<128-bit hex>`) and 256-bit `rootSecretB64` via WebCrypto CSPRNG, deriving two domain-separated tokens:
     - `claimAuthToken = SHA256_b64url("td613.marrowline.episode-auth/v1:" + rootSecretB64 + ":" + episodeId)`
     - `envelopeKey = SHA256_b64url("td613.marrowline.episode-aes256gcm/v1:" + rootSecretB64 + ":" + episodeId)`
   - Only `{ episodeId, rootSecretB64, requestBodySha256, startedAt, leaseExpiresAt, hardExpiresAt, hasAttachments }` is persisted in `IndexedDB` (`pendingEpisode`) alongside `pendingTask`. **Raw attachment bytes are never stored in `pendingEpisode` or on the server.**
2. **Framed `5s` NDJSON Stream + `waitUntil` Decoupling (`server/marrowline-episode-continuity.js`):**
   - `POST /api/dome-world/khonapolit` sends `keepalive: false` with header-only capabilities (`X-TD613-Episode-Id`, `X-TD613-Episode-Auth`, `X-TD613-Episode-Key`, `X-TD613-Transport-Stream: heartbeat-v1`).
   - Server verifies same-origin (`Sec-Fetch-Site` / `Origin`), rejects any query-string secrets, hashes `authSha256 = SHA-256(claimAuthToken)` (never storing `claimAuthToken` or `envelopeKey` in plaintext), atomically registers the `RUNNING` episode (`maxActivePerIp = 2`), registers `waitUntil(backgroundLifecyclePromise)` via `Symbol.for('@vercel/request-context')`, and **immediately** flushes HTTP `200` (`Content-Type: application/x-ndjson`, `X-Accel-Buffering: no`) with an `accepted` frame followed by `5s` `heartbeat` frames.
   - Upstream Gemini calls are bound to an episode-scoped `AbortController` (`req.episodeAbortSignal`), **never** to `req.on('close')`. If the browser socket drops during a mobile app switch or lock screen, upstream generation continues inside `waitUntil` up to `210s`, seals the terminal `{ httpStatus, headers, body }` payload with `AES-256-GCM` (`keyBuffer.fill(0)` in `finally`), and commits `RUNNING -> COMPLETED | FAILED`.
3. **Read-Only Idempotent Reattachment (`GET ?operation=episode-claim`) & Page Reload Recovery:**
   - If the primary NDJSON stream is interrupted (`TypeError: terminated`, `MarrowlineStreamInterruptedError`, mobile socket suspend, Wi-Fi/cellular handoff) **or** if the page reloads while `pendingEpisode` is stored in `IndexedDB` (`restoreThread` -> `reattachStoredEpisodeOnReload`), the browser **never** re-`POST`s a second paid generation.
   - Instead, `pollMarrowlineEpisodeClaim` polls read-only `GET /api/dome-world/khonapolit?operation=episode-claim&request_id=<episodeId>` with `X-TD613-Episode-Auth`—pausing polling while `document.visibilityState === 'hidden'` and waking immediately on `visibilitychange`, `pageshow`, `focus`, `resume`, or `online`.
   - Upon observing `COMPLETED` or `FAILED`, the browser decrypts `envelope` locally in WebCrypto `AES-GCM` verifying `AAD`, admits the exact provider-authored Unicode (`Kʰonapolit`, `Tauric Diana bots`, High Zalgo, `Khona‌lit-po`, `𝌋‌⟐`, `U+10D613`), original model identity, completion evidence, and conversation custody into `IndexedDB`, clears `pendingEpisode` locally, and fires a `<1 KB` `keepalive: true` `POST ?operation=episode-consume` beacon to delete the server ciphertext immediately.
4. **Explicit Operator Cancellation (`POST ?operation=episode-cancel`):**
   - Clicking **Stop** aborts the client `AbortController` **and** dispatches `POST ?operation=episode-cancel`, which transitions the server episode to `CANCELLED`, purges any sealed ciphertext, aborts `req.episodeAbortSignal` to terminate the live upstream Gemini stream immediately (without recording a false model-health timeout), and causes any late worker `sealTerminal` CAS (`WHERE state = 'RUNNING'`) to reject.

---

## 3. Pluggable Storage Tiers & Honest Infrastructure Boundaries

Because TD613 governance forbids fabricating durability claims beyond provisioned infrastructure, `createMarrowlineEpisodeStore` (`server/marrowline-episode-continuity.js`) implements three explicit tiers and self-reports its exact capabilities in `continuity` / `receipt.episodeContinuity`:

| Tier | Activation Condition | `backend` Identifier | Cross-Instance / Cross-Region Durability | Atomic CAS & Physical Eviction Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Zero-Config Default)** | No external Redis/Neon env vars configured | `vercel-fluid-ephemeral-memory` | Warm Fluid Compute instance (`iad1`); **not** durable across cold multi-instance hops or microVM crashes (`404 UNOBSERVED` -> honest `OUTCOME_UNKNOWN`, `0` duplicate paid calls) | Strict in-process CAS; immediate `Map.delete` on `consume`/`cancel` + `.unref()` `900s` timer + `0 ms`-lag `900s` API cutoff |
| **Tier 2 (Regional Runtime Cache)** | Vercel Runtime Cache present on `@vercel/request-context` | `vercel-runtime-cache-plus-fluid-memory` | Shared across Fluid Compute instances in `iad1` (`cross_instance_durable: true`, `cross_region_durable: false`) | Regional cache TTL (`<= 900s`) + immediate `cache.delete` on `consume`/`cancel` + `0 ms`-lag `900s` API cutoff |
| **Tier 3A (Dedicated Native-TTL KV)** | `TD613_MARROWLINE_REDIS_REST_URL` + `TD613_MARROWLINE_REDIS_REST_TOKEN` | `upstash-redis-rest-ephemeral` | Full cross-instance & cross-region durability | Single-roundtrip Redis Lua `EVAL` (`SET ... NX PX 900000` + `KEEPTTL` CAS + immediate `DEL` on `consume`/`cancel`); logical `900s` kernel expiry (provider persistence/backups remain governed by Redis provider policy) |
| **Tier 3B (Dedicated Neon Postgres)** | `TD613_MARROWLINE_CONTINUITY_DATABASE_URL` (must be `.neon.tech` and **distinct** from Giving & Loom DBs) | `neon-postgres-ephemeral` | Full cross-instance & cross-region durability | Single-row SQL `INSERT ... ON CONFLICT DO NOTHING` & `UPDATE ... WHERE state = 'RUNNING' AND hard_expires_at_ms > $now`; immediate `DELETE` on `consume` + `0 ms`-lag `900s` API cutoff (idle dead-tuple reclamation when zero traffic arrives requires a scheduled reaper + Postgres `autovacuum`) |

---

## 4. Safe Harbor Privacy, Envelope Encryption, and Isolation Guarantees

1. **In-Memory Function Boundary vs. Encrypted At-Rest Envelope:**
   - During active generation (`<= 210s`), the executing Vercel function is an in-memory plaintext boundary because it builds the Gemini request, reads Google's SSE stream, and parses the relay envelope.
   - At rest in the episode store, **zero plaintext prompts, conversation history, model responses, or `AES-256-GCM` keys are ever written**. The server seals `{ httpStatus, headers, body }` with `AES-256-GCM` (`96-bit` CSPRNG IV, `128-bit` auth tag), binds `AAD = "td613.marrowline.episode/v1:" + episodeId + ":" + requestBodySha256 + ":" + hardExpiresAt`, and zeroes `keyBuffer.fill(0)` in `finally`.
2. **User, Tab, and Conversation Isolation:**
   - Knowledge of `episodeId` alone grants **zero** access: `GET ?operation=episode-claim` requires `X-TD613-Episode-Auth` (`timingSafeEqual` against `authSha256`), and decryption requires `envelopeKey` derived from `rootSecretB64` stored only in the originating browser profile's local thread record and wiped immediately after consumption.
3. **Attachment Privacy:**
   - Inline base64 attachments and Gemini File API `file_uri` references are never persisted in `IndexedDB` `pendingEpisode` or in server episode metadata; Google File API uploads retain their existing explicit 48-hour provider lifecycle disclosure.
4. **Simulated Browser Lifecycle vs. Physical-Device Witness Boundary:**
   - Offline Node/JSDOM and Playwright Chromium/WebKit tests deterministically verify NDJSON heartbeats, mid-stream socket drops, `waitUntil` completion, `AES-256-GCM` `AAD` verification, `visibilitychange`/`pagehide`/`blur`/`freeze`/reload state transitions, `episode-cancel` upstream abort, 15-minute `410` expiry, and `0` duplicate paid calls. Per TD613 Browser Witness Law, simulated browser lifecycle events are never misrepresented as physical iPhone/Android radio-sleep or OS process-eviction hardware witnesses.

𝄐 Khona‌lit-po · ⟐SAC[X6ZNK5NO51] ⟐


## Emergence HQ transaction-integrity qualification

The default Fluid memory store serializes local state transitions and retains only non-content consumed ownership tombstones until the original 15-minute expiry. Capacity is held rather than evicting live ownership. Duplicate requests within that live instance and access window cannot acquire a second generation owner. No claim of exactly-once execution across instance loss, expiry, or uncoordinated external storage is made. Read-only recovery never initiates generation. Runtime Cache is no longer automatically chosen: injected regional-cache observations are best effort, not atomic cross-instance ownership, and cache errors are not silently treated as successful writes/deletions. No new external store is provisioned. Redis/Neon adapters remain optional and require separate infrastructure qualification before use, including replay/cancellation/deletion semantics. Local episode capability persistence is checked before dispatch; a failed response persistence never authorizes consumption. Browser capability and ciphertext expiry remain bounded by the original episode. Actual Vercel execution survival and physical-device continuity require runtime observation; the presence of a request-context waitUntil registration is not proof of platform durability. Cancellation on another instance may not abort upstream work; ciphertext access and provider billing are separate guarantees.


### Verification boundary (transaction repair)

The supported Vercel Node.js `waitUntil` API shares the function duration budget (https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package); the existing direct request-context bridge is conditionally detected, not proof of execution after a real device disconnect. The default is same-instance Fluid memory; cache availability is not a documented atomic compare-and-set transaction. The injected browser storage-failure witnesses exercise the shared save gate using JSDOM's localStorage fallback, not a physical IndexedDB engine. The production IndexedDB adapter resolves its write only on transaction completion. AES-GCM authenticates an expiry value as associated data; expiry is enforced by server/client access checks, not by cryptography itself. The executing server receives the envelope encryption key and handles plaintext in memory; this is not an end-to-end encryption claim or a guarantee of immediate zeroization of all runtime copies.
