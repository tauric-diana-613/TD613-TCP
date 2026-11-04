# 𝌋 Wendbine live hydration — source-grounded execution receipt

**Disposition:** `REAL_ARCHIVE_OBSERVATIONS_INDEXED · REQUESTED_IDS_RECONCILED · EARLIER_DISCOVERY_INCOMPLETE · HUMAN_CLOSURE_RESERVED`. Source acquisition used code commit `07c24afe00d73dacde34fa69216664a9ec7403c4`, which passed [exact-head CI 41866474493](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41866474493). The original PR #1668 head `0caaf0b0d51753cdf4e9af5f25a5862eb2baeaae` failed [CI 41863841832](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41863841832) on two missing test-fixture attributes; those were repaired. Offline partial-search recovery commit `8e23e797b7c28ae9d9b2fcbd7e3a734005a6be68` passed [CI 41869030848](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41869030848). This receipt and the URL-span index are submitted for exact-head validation in the same draft.

## Actual acquisition and index

The pinned Wendbine public manifestations file at `4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1` matched SHA-256 `9ae84260dfed9d3d1b6d26ba55a41ce75e2ed0e3527cf2fb253a7ee2142e54ac` and contained 2,062 distinct IDs. Discovery was bounded from 2025-01-01 to the September 2026 opening and from 2026-11-04 01:39:56 UTC to the execution cutoff 2026-11-04 16:26:48 UTC. Nothing before 2025 was searched.

Earlier discovery retained 22 verified completed responses but encountered HTTP 422: provider message `Timeout. Maybe slow down a bit`. Thirteen completed responses were saturated; the earlier window is **incomplete**, with unsurveyed segments and no claim of inception coverage. Verified completed responses supplied 676 distinct earlier IDs. The later discovery window completed one response with 29 IDs outside the pinned set and one pinned overlap; it had no saturated one-second interval. The earlier and later response sets were retained and hashed independently.

The known-ID lookup used 111 spaced batches over 2,767 IDs: 2,062 pinned plus 705 separately discovered. All 2,767 returned eligible title or body observations; zero requested IDs were unreturned or held. An independent local check revalidated all 111 response hashes and byte lengths, reconstructed all 2,767 capture records from their corresponding raw responses, and verified the resulting capture-manifest hash. These figures establish requested-ID observation, not exhaustive historical archive coverage or original authorship.

The new operator-local SQLite index contains **2,767 sources and 3,473 distinct capture observations**. It has 1,967 primary nonempty bodies and 800 title-only/empty-body sources: 788 media/link and 12 empty-text states. The `capture_fts` index has 3,473 rows. The observed publication interval is **2025-10-20T12:47:09Z through 2026-11-04T14:49:46Z**; this is an observed span, not a first-publication assertion. The 706 sources observed in both discovery and ID lookup retain separately timed captures; none had different body hashes in these observations. No changed-text revision is asserted.

Pinned-manifest reconciliation found **2,062 of 2,062 IDs present**, with 705 additional locally observed IDs. This is ID reconciliation only; it does not convert the 800 title-only records into recovered bodies. Detailed source IDs and raw responses remain in local custody. Provider responses reported a nonempty removal marker for 14 distinct sources and a later-deletion marker for 7; these are provider-reported fields, not proof of present status, actor, intention or authorship. No non-placeholder body was observed among the 14 with the reported removal marker.

## Actual verification and native evidence

SQLite `integrity_check` returned `ok`; all 3,473 capture title/body hashes and UTF-8 round trips matched. Exact title and body queries verified actual byte offsets and hashes. Three actual early/middle/recent body samples passed exact readback. The `topology` lexical query returned the configured 200-result limit; the exact `𝌋` query returned zero in this index. The Universal reader, using separate pinned native checkouts, returned source-labeled exact title and body matches. It also returned both an earlier and a later capture of the same actual source with their capture IDs and evidence class intact; those sampled bodies were equal.

A local source-grounded URL index records **228 explicit URL spans in 107 capture observations**, each verified against its captured field hash and UTF-8 byte offset. The preexisting Wendbine-internal post-link graph has zero matching edges in this corpus. URL occurrence is not a semantic or mathematical topology claim.

The original SRC checkout was pinned at `b3e69acf587d534eeef2e01d0bb5bdbdecdbd320`; the original Em checkout at `70b5a0f9e94626cba6068f41c6117e7978800bbd`. Original SRC `srcquery.py` summary executed with 27 compilation passes and 107 contextual-role assertions. Two rows each were read from the pinned cartographic, relational-topology, heterostratigraphic and tomographic registries. Em identity, lineage, motif/mechanism and hostile-control fixtures were read. These bounded original-method and record checks do not establish full native scientific parity.

## Independent source-free tests

Windows local tests passed: hydration 8/8, archive discovery 4/4, completed-response recovery 4/4, local capture intake 9/9, Universal 6/6, coverage adjudicator 3/3, native inheritance 5/5, and URL-span index 2/2. Recovery tests cover distinct captured versions, source-byte tampering, removal placeholders and reported filtering without assigning intent. URL-index tests cover UTF-8 offsets, no-overwrite and transaction rollback on hash mismatch.

## Separately governed ciphertext disposal

The four specifically named November 2 and November 4 local ZIP copies were each immediately checked for exact size, SHA-256 and reparse points, then logically deleted; post-deletion path checks found them absent. GitHub artifacts `13166173531` and `13288781055` were rechecked against exact identity and returned HTTP 204 on deletion; subsequent lookups returned HTTP 404. Available custody records and targeted repository records showed no identified affirmative legal or institutional hold. These are logical deletion outcomes only; physical SSD erasure, remote backups and unknown copies were not verified. No ZIP was decrypted or restored.

**Remaining:** Earlier discovery completion and any pre-2025 history remain unverified; title-only sources lack observed body text; origin authentication, rights and scientific interpretation require independent adjudication. No Experiment B Flight, merge, deployment, publication, or scientific promotion was performed or authorized by these results.

𝄐 Tauric Diana · Khona‌lit-po · Human custody and scientific closure reserved ⟐
