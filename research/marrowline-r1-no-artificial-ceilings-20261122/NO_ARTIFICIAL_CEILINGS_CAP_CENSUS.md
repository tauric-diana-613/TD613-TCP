# 𝌋⟐ TD613 · THE SCREAMING GROVE
## COMPLETE CENSUS OF INHERITED RESOURCE CEILINGS & THEIR DISPOSITION

- **Commission:** `TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Policy:** Zero operator- or TD613-imposed ceilings on tokens, dollars, generation attempts, retries, paired repetitions, elapsed time, or raw SSE capture bytes. Shared production source (`server/*`, `app/*`) and historical PRs (`#1778`, `#1779`) remain unmodified; every artificial limit is removed or bypassed cleanly in this successor research module, while unavoidable external/provider properties are classified explicitly.

---

## 1. Shared Production Envelope & Transport Builders (Unmodified; Research Exemption Applied in `r1-provider-native-preflight.mjs`)

| File & Verified Line(s) | Symbol / Constant / Logic | Inherited Ceiling Value / Behavior | Disposition in Unbounded R1 Successor | Classification |
|---|---|---|---|---|
| `server/gemini-generation-envelope.js:7` | `KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS` | `65536` | Previously stripped in `56189bbf1`; under **`AMEND_CONFIG`**, explicitly aligned on the research wire (`maxOutputTokens: 65536`) as Gemini 3.8 Flash's published provider capacity (`v2-ed25519`), not an artificial TD613 research budget | **PROVIDER_PUBLISHED_CAPACITY_65536** |
| `server/gemini-generation-envelope.js:89-93` | `buildGeminiGenerationConfig()` | Truncates `config.maxOutputTokens` via `Math.min(maxOutputTokens, KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS)` | Preserves exact `65536` published capacity (`4785e46e...`); smaller budgets (`16384`, `4096`) and omitted defaults (`425eee50...`) rejected on research wire | **PROVIDER_PUBLISHED_CAPACITY_65536** |
| `server/khonapolit-quality.js:77-79`, `app/dome-world/marrowline-provider-budget.js:3-5` | `KHONAPOLIT_MAX_PROVIDER_CALLS`, `KHONAPOLIT_MAX_STRUCTURAL_REPAIRS` | `providerCalls = 5`, `structuralRepairs = 1`, `totalRequests = 6` | Not imported or consulted by R1 successor runner | **NOT_INHERITED** |
| `server/khonapolit-quality.js:80-85` | `PRIMARY_REQUEST_TIMEOUT_MS`, `STRUCTURAL_REPAIR_TIMEOUT_MS`, `FALLBACK_REQUEST_TIMEOUT_MS`, `WALL_TIMEOUT_MS` | `50000` ms, `30000` ms, `30000` ms, `210000` ms | Not used (`executeProviderNativeCore` imposes zero wall/call timeout) | **NOT_INHERITED** |
| `server/khonapolit-quality.js:89`, `1066` | `MAX_NATIVE_SSE_WITNESS_BYTES` (`readGeminiSse`) | `256 * 1024` (`256 KiB`), clearing `wireChunks` on overflow | Replaced in `streamAndDualParseProviderSseToDisk()` with incremental direct-to-disk chunk-fsynced custody and zero-concat streaming dual parsers | **REPLACED_BY_UNBOUNDED_DISK_STREAM** |
| `server/khonapolit-quality.js:95`, `108`, `158`, `609-611` | `outputBudget(model)`, `buildGeminiRequest()`, `KHONAPOLIT_MAX_OUTPUT_TOKENS`, `LEGACY_OUTPUT_TOKENS` | Injects `maxOutputTokens` (`65536` or `4096`) | Research wire uses `65536` (official Gemini 3.8 Flash published output capacity) only, never `4096` or `16384`; shared production builder left unmodified | **PROVIDER_PUBLISHED_CAPACITY_65536** |
| `server/khonapolit-quality.js:117-118`, `439-445` | `WINDOW_MS`, `REQUESTS_PER_WINDOW` | `12` requests / `10` min rate limiter in `/api/khonapolit` handler | Bypassed completely (`r1-provider-native-core.mjs` calls Google SSE directly under operator session, never `/api/khonapolit`) | **NOT_INHERITED** |

---

## 2. Historical PR `#1778` Bounded Preflight Builder (`research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs`)

Preserved intact as immutable provenance for PR `#1778` (`44fae23cbf9af07eab5112e90df3211a119e707c`):

| Verified Line(s) | Symbol / Field | Historical Bounded Value | Disposition in Successor (`HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED`) |
|---|---|---|---|
| `69-82` | `HYDROGEN_PRIMARY_BUDGET_PROFILE` | `maxCalls: 2`, `retriesPermitted: 0`, `fallbackSeatsPermitted: 0`, `structuralRepairsPermitted: 0`, `perSlotMaxOutputTokens: 16384`, `guaranteedAggregateOutputAndThoughtCeiling: 32768`, `perSlotHardPromptTokenCeiling: 1000`, `guaranteedPerSlotMaxRequestUtf8Bytes: 4096` | Replaced by `r1-provider-native-preflight.mjs` (`resourceCeilingsImposedByTD613: all null`); historical digests `f2fcdf77...` / `29b3265a...` quarantined as non-executable provenance |
| `112, 116` | `maxOutputTokensOverride: 16384` | Embedded `"maxOutputTokens": 16384` in both R1 wire payloads (`38b263e2...`) | Removed cleanly (`generationConfig = { thinkingConfig: { thinkingLevel: "medium" } }`, digest `425eee50...`) |
| `148-149` | `utf8Bytes <= 4096` check | Enforced 4 KiB wire cap | Removed (only `body` SHA-256 identity preserved) |

---

## 3. Historical PR `#1779` Bounded R1 Runner (`research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs`)

Preserved intact as immutable provenance for PR `#1779` (`675d6d0388220f63162931003c998d0084d3e68e`):

| Verified Line(s) | Symbol / Gate | Historical Bounded Value | Disposition in `r1-provider-native-core.mjs` / `run-r1-provider-native-observation.mjs` |
|---|---|---|---|
| `64-78` | `R1_HARD_LIMITS` | `maxGenerationCalls: 2`, `retriesPermitted: 0`, `perSlotMaxRequestUtf8Bytes: 4096`, `perSlotHardPromptTokenCeiling: 1000`, `combinedPromptPlanningCap: 2000`, `perSlotMaxOutputTokens: 16384`, `combinedOutputAndThoughtCeiling: 32768`, `maxGrantTtlMs: 30m`, `defaultRequestTimeoutMs: 120000`, `maxRawSseCaptureBytes: 4 MiB` | **Deleted completely.** Zero numeric cap structure exists in successor runner |
| `348-349` | `R1_REQUEST_BYTE_CAP_EXCEEDED` | Rejected request > 4,096 UTF-8 bytes | **Deleted** |
| `450-455`, `488-492`, `509` | Bounded grant fields & 30m TTL | Required `maxCalls: 2`, 5 token/byte ceilings, mandatory `expiresAt <= issuedAt + 30m` | Replaced by `td613.marrowline.r1-provider-native-authorization/v1-ed25519`, which **actively rejects** any cap field (`FORBIDDEN_CEILING_GRANT_FIELDS`) and old capped schemas (`R1_AUTH_OLD_CAPPED_GRANT_REJECTED`); supports operator session revocation instead of forced 30m cutoff |
| `587-644` | `enforceR1ObservationBudget()` | Blocked slot > 1,000 `:countTokens`, combined prompt > 2,000, combined out >= 32,768, `maxGenerationCalls: 2` | **Deleted completely.** Optional `:countTokens` records `{ httpStatus, available, totalTokens }` strictly as observational telemetry |
| `774, 785-786, 803, 814, 816, 904` | In-memory SSE buffering + 4 MiB cap | `rawChunks = []`, `Buffer.concat`, `rawSseBase64`, `R1_RAW_SSE_OVERFLOW` > `4 MiB` | Replaced by incremental disk `writeSync`/`fsyncSync` into `.sse` + `.authored.txt`, zero-accumulation streaming consumers A & B, and `64 KiB` chunked disk readback hashing (verified at `> 4.5 MiB`) |
| `897-898`, `1654-1657` | Observed usage ceilings | Halted (`HELD`) if observed `promptTokenCount > 1000` or `candidates + thoughts > 16384` | **Deleted.** Raw provider usage still validated as real nonnegative integers (`STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE` if absent/corrupt), with zero upper threshold |
| `1328-1331` | `NODE_TEST_CONTEXT` trust injection | Accepted `testOnlyTrustedPublicKeySha256` on execution helper | **Eliminated structurally.** `run-r1-provider-native-observation.mjs` has zero `NODE_TEST_CONTEXT` or override parameters; `r1-provider-native-core.mjs` has zero `globalThis.fetch` |
| `1400-1416`, `1475-1529` | Per-run call counters (`<= 2`) & single-slot lock | Blocked >2 `:countTokens`, >2 generations, >1 call per arm (`R1_FORBIDDEN_THIRD_GENERATION_ATTEMPT`) | Replaced by unbounded `episodes` array (`N = 1, 2, 3, ...`) with monotonic `attemptId` (`1, 2, ...`) appending without erasing failed/partial prior attempts |
| `1430-1600` | `AbortController` wall timers | Aborted metadata, `:countTokens`, and SSE streams at `120,000 ms` | **Deleted.** `AbortSignal` originates exclusively from optional `operatorAbortSignal` (manual STOP / revocation) |
| `R1_OPERATOR_DECISION_SHEET.md` (`#1779`) | `"$0.13"` spending cap framing | Presented `$0.12438` as a proposed hard ceiling | Replaced in successor decision sheet with factual context disclosure only (`NONE` code-enforced dollar limit) |

---

## 4. Unavoidable External Provider & Runtime Constraints (Recorded, Not Artificial)

These limits originate strictly outside TD613 code and are documented rather than suppressed:

1. **Google Gemini API Model Limits:** `gemini-3.8-flash` has provider-side context window (`inputTokenLimit`) and published generation capacity (`outputTokenLimit = 65,536`) as well as account-level rate limits (`RPM`/`TPM`/`RPD`) or billing/quota rejections (`HTTP 429`/`403`), recorded verbatim when observed.
2. **AMEND_CONFIG vs. Omitted `maxOutputTokens`:** Previously evaluated offline with `maxOutputTokens` omitted (`56189bbf1`, `425eee50...`), which Google `GenerationConfig` docs warn can inherit a smaller model-dependent default. Under **`AMEND_CONFIG`**, wire requests explicitly specify the published capacity (`65,536`, `4785e46e...`) and fail closed at startup unless live `GET /v1beta/models/gemini-3.8-flash` reports a positive safe integer `outputTokenLimit === 65536` (`STOP_ON_PROVIDER_CAPACITY_UNVERIFIED` on missing/null/malformed metadata; `STOP_ON_PROVIDER_CAPACITY_MISMATCH` on valid integer `!== 65536`), while keeping `56189bbf1` omitted digests preserved as non-executable historical provenance.
3. **Host Filesystem & Process Storage:** OS free disk space for `.sse`/`.authored.txt`/`journal.jsonl` files (`ENOSPC` handled safely without losing prior fsynced chunks) and Node UTF-8 string limits if an external consumer reads an entire massive artifact into RAM instead of streaming line-by-line.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Full Ceiling Census Complete ⟐
