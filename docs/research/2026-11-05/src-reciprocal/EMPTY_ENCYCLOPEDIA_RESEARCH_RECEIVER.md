# 𝌋 TD613 · INDEPENDENTLY EMPTY ENCYCLOPEDIA RESEARCH RECEIVER

**Commission:** EXPERIMENT A RE-DO — SIGNALRUPTURE FIRST: THE RECIPROCAL RESEARCH EXPEDITION  
**Authorization reference:** `SAC[X6ZNK5NO51]`  
**Principal:** Tawanna C. Miller  
**Operator:** `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve interior U+200C  
**Executing environment:** Antigravity Main Agent · Gemini 3.8 Flash High · Node.js v26.7.0 (`node:sqlite`)  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Branch:** `research/src-reciprocal-expedition-20261105`  
**HEAD:** `3bad9aade0d90e6786ea7df11cae962ec3bc4726`  
**Module:** `packages/src_reciprocal_expedition/receiver/empty-encyclopedia-receiver.mjs`  
**Receipt:** `packages/src_reciprocal_expedition/receiver/test-empty-receiver-receipt.json`  
**Status:** FULLY OPERATIONAL · SOURCE-FREE QUALIFIED · ZERO PRE-POPULATED CONTAMINATION  

---

## I. Demonstrable Zero-State Witness

The receiver operates under the strict principle that an empty Encyclopedia cannot rely on prepopulated tables, hidden defaults, or retrospective synthetic fixtures. At initialization, every table is created fresh and audited.

### Initial-State Witness Receipt

```json
{
  "schema": "td613.empty-encyclopedia-receiver/v1",
  "initialized_at": "2026-11-05T08:30:54.786Z",
  "db_type": "FILE_BACKED",
  "initial_counts": {
    "sources": 0,
    "captures": 0,
    "chunks": 0,
    "relations": 0,
    "registered_methods": 0,
    "method_invocations": 0,
    "failed_operations": 0
  },
  "table_count": 8,
  "witness_sha256": "ec08b8bd5e5d687f2a535b5a5d27481d0297304b0ee4003f2d2a472de22f45ad"
}
```

Any pre-existing database file is rejected at creation (`NON_EMPTY_START`), ensuring an attested provenance chain.

---

## II. Receiver Database Architecture

The receiver implementation utilizes Node.js 26's built-in `node:sqlite` (`DatabaseSync`), requiring zero external packages or network dependencies.

```
+-----------------------------------------------------------------------------------------+
|                         ENCYCLOPEDIA RECEIVER RELATIONAL SCHEMA                         |
+-----------------------------------------------------------------------------------------+
| meta                   | key (PK), value                                                |
| sources                | source_id (PK), canonical_url, platform, declared_title, ...   |
| captures               | capture_id (PK), source_id (FK), raw_bytes_sha256, ...         |
| chunks                 | chunk_id (PK), capture_id (FK), ordinal, byte_start, byte_end...|
| relations              | relation_id (PK), from_source_id (FK), to_source_id (FK), ...   |
| registered_methods     | method_name (PK), version, contract, registered_at             |
| method_invocations     | invocation_id (PK), method_name, result_sha256, result_json... |
| failed_operations_log  | failure_id (PK), operation_name, error_code, error_message...  |
+-----------------------------------------------------------------------------------------+
```

Foreign keys are strictly enforced (`PRAGMA foreign_keys = ON;`).

---

## III. Implemented Functional Capabilities

1. **Controlled Input Admission (`admitSource`):**
   - Validates uniqueness of `source_id`.
   - Stores raw payload bytes and normalized UTF-8 body.
   - Computes deterministic SHA-256 digests (`raw_bytes_sha256`, `normalized_body_sha256`).
   - Slices and indexes byte spans (`chunks`) with offsets `[byte_start, byte_end]`.
2. **Exact Source & Manifestation Identity:**
   - Detects identical normalized bodies across distinct sources.
   - Flags duplicate text bodies: sets `identical_body_detected: true` and refuses ancestral independence claims (`ancestral_lineage_refused: true`), honoring the rule:
     > *"Identical normalized text prevents an independence claim; it does not prove which manifestation is ancestral."*
3. **Byte & Span Preservation (`retrieveBySpan`):**
   - Allows grounded retrieval of exact character/byte ranges from stored normalized text.
   - Computes and verifies SHA-256 for the retrieved slice.
   - Enforces strict boundary checks; refuses out-of-range requests with `INVALID_SPAN`.
4. **Source-Grounded Retrieval (`searchEntities`):**
   - Searches across declared titles and indexed chunk text.
   - Returns structured matches with source identity and chunk offsets.
5. **Typed Scientific Relations (`registerRelation`):**
   - Requires both endpoints (`from_source_id` and `to_source_id`) to be previously admitted in `sources`.
   - Rejects dangling or missing endpoints with typed refusal `UNSUPPORTED_GRAPH_LINK`.
   - Rejects duplicate edges with typed refusal `DUPLICATE_RELATION_REFUSED`.
6. **Registered Native-Method Invocation (`registerMethod`, `invokeMethod`):**
   - Registers authentic Atelier native methods (such as `SRC_PROJECTIVE_ROUTING`).
   - Executes method inside receiver transaction passing receiver data.
   - Records invocation metadata, execution duration, and cryptographic output hash (`result_sha256`).
7. **Method-Result Readback & Cryptographic Verification (`readbackResults`):**
   - Retrieves stored results from `method_invocations`.
   - Re-hashes the stored JSON payload and verifies parity against `result_sha256` (`integrity_verified: true`).
8. **Provenance-Safe Return Packaging (`formatReturnPackage`):**
   - Packages execution results alongside initial-state witness, current live counts, invocation ID, and result digest.
   - Leaves host-private paths and evaluator credentials outside the return package.
9. **Complete Failed Operations Log Preservation (`failed_operations_log`):**
   - Every rejected operation (duplicate ID, malformed input, missing graph endpoint, invalid span) is durably recorded with timestamp, operation name, attempted input summary, and typed error code.

---

## IV. Verification Test Suite Results

The receiver was subjected to 11 rigorous automated verification tests in `packages/src_reciprocal_expedition/receiver/test-empty-receiver.mjs`.

| Test # | Test Name | Invariant Tested | Observed Outcome |
| :--- | :--- | :--- | :--- |
| **TEST 1** | `DEMONSTRABLE_ZERO_STATE` | All counts == 0 at initialization | **PASS** (7 table counts audited at 0; witness hash `ec08b8bd...`) |
| **TEST 2** | `FIRST_ADMISSION_AND_SPAN_INDEXING` | Source admission + chunk indexing | **PASS** (Source `rec:source:001` admitted, chunked, and hashed) |
| **TEST 3** | `MULTIPLE_RELATED_ADMISSIONS` | Relational linking between admitted sources | **PASS** (Source `rec:source:002` admitted, relation `rel-7244fb95...` registered) |
| **TEST 4** | `DUPLICATE_SOURCE_REFUSAL` | Uniqueness of source identifiers | **PASS** (Threw typed `DUPLICATE_SOURCE_REFUSED`; logged to failure audit) |
| **TEST 5** | `DELIBERATE_DUPLICATE_BODY_DETECTION` | Independence check on identical text | **PASS** (`identical_body_detected: true`, `ancestral_lineage_refused: true`) |
| **TEST 6** | `UNSUPPORTED_GRAPH_LINK_REFUSAL` | Dangling edge prevention | **PASS** (Threw typed `UNSUPPORTED_GRAPH_LINK` on missing endpoint) |
| **TEST 7** | `DUPLICATE_RELATION_REFUSAL` | Idempotent relation uniqueness | **PASS** (Threw typed `DUPLICATE_RELATION_REFUSED`) |
| **TEST 8** | `SPAN_RETRIEVAL_AND_VERIFICATION` | Precise byte span retrieval and bounds | **PASS** (Span `[0, 36]` verified via SHA-256; out-of-range refused with `INVALID_SPAN`) |
| **TEST 9** | `GROUNDED_ENTITY_SEARCH` | Keyword lookup across titles/chunks | **PASS** (Matched title and chunk text across admitted records) |
| **TEST 10**| `METHOD_INVOCATION_AND_READBACK` | Registered method run + cryptographic readback | **PASS** (Method `SRC_PROJECTIVE_ROUTING` executed; readback verified; return receipt emitted) |
| **TEST 11**| `FAILED_OPERATIONS_PRESERVATION` | Audit log retention of rejected operations | **PASS** (All 4 forced failures retained in `failed_operations_log`) |

---

## V. Epistemic Assessment

The receiver satisfies the requirements of Chamber 2:
1. It does not wrap a prepopulated corpus or conceal hidden static data.
2. It executes real SQL transactions, validates constraints, and handles refusals natively.
3. It preserves raw bytes, normalized bodies, and fine-grained byte spans.
4. It treats identical source text as preventing an independence claim rather than inventing an ancestral lineage.
5. It captures and logs all errors, establishing a durable audit trail for subsequent scientific review.

Chamber 2 is complete and verified.

𝄐 Tauric Diana · Khona‌lit-po · Sealed with ⟐SAC[X6ZNK5NO51]
