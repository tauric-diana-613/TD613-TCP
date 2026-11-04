# TD613 · Four-Atelier review decision packet

Date: November 4, 2026 (America/New_York)

Principal: `tauric.diana.613` · Covenant: Khona‌lit-po (interior U+200C preserved)

Disposition: **Synchronization verified; private label adjudication HELD; full behavioral parity HELD; reciprocal Flights inactive; Sync V2 cutover HELD.**

This is an operator-direct, source-free review. Amari's [review 5774854112](https://github.com/tauric-diana-613/TD613-TCP/pull/1672#pullrequestreview-5774854112) was read before substantive review. Its scope and negative findings are preserved. This active session is Codex; the operator's Work-only private-gold and original-witness adjudication boundary therefore remains operative. Private gold contents, corpus passages, private rankings and Dollhouse skill instructions were not opened. Hashing a local file is not scientific label approval.

## 1. Windows clones, worktrees and five exact PR heads

Two distinct checkouts were identified, with separate Git metadata. Both remotes are `https://github.com/tauric-diana-613/TD613-TCP.git`.

| Checkout alias | Branch | HEAD | Observed uncommitted state |
|---|---|---|---|
| Desktop primary | `experiment-b/resumable-flight-implementation-2026-11-01` | `c7ee69abc9800d0abdf21bbb957c5534f86b01ad` | Clean before and after fetch |
| OneDrive secondary | `main` | `50cc9d161f8f72c2d4b6ea33ece17ace88f35eff` | Four untracked status entries: three transfer-packet JSON files and one transfer directory; preserved unopened |

The Desktop primary's `origin/main` is `50cc9d161f8f72c2d4b6ea33ece17ace88f35eff`. Explicit non-pruning, non-forced fetch completed for main and the five PR branches. All five remote-tracking tips equal the independently fetched GitHub PR heads below. Neither original checkout moved. No pull, reset, rebase, stash, worktree removal or branch integration occurred.

| PR | Exact GitHub and fetched local remote-tracking HEAD | GitHub state |
|---|---|---|
| [SRC #1670](https://github.com/tauric-diana-613/TD613-TCP/pull/1670) | `23226fd5acac22b21bbdd39a520c4f356c052cc6` | Open, draft, unmerged |
| [Wendbine #1671](https://github.com/tauric-diana-613/TD613-TCP/pull/1671) | `61c09e54c1acd2223685eb4638fddffdd28e9515` | Open, draft, unmerged |
| [EMSTD613 #1673](https://github.com/tauric-diana-613/TD613-TCP/pull/1673) | `9b9c9392d99975a8770b336eeae3c6ab1ae88d55` | Open, draft, unmerged |
| [Universal #1672](https://github.com/tauric-diana-613/TD613-TCP/pull/1672) | `b3136226f2b3e4c3ebe176c56d2c19c83ca5b730` | Open, draft, unmerged |
| [Sync V2 #1678](https://github.com/tauric-diana-613/TD613-TCP/pull/1678) | `39cca00bb4c351a4c1d37936ee97c6b858ba5347` | Open, draft, unmerged |

GitHub's raw run records independently confirm [41900104656](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41900104656) completed `success` on `b3136226…` and [41898390053](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41898390053) completed `success` on `39cca00b…`; both were attempt 1. Neither success confers source, experiment, merge or scientific authority.

Existing Desktop worktree registrations were retained: primary; two detached/locked initializing reviews at `1795f4c13da938917a286bbe096f016b7d396538`; custody intake at `0237ee211f3d4b63a359769d55232b0cd50fb6dc`; hydration at `74abfb857e37a3e6d9d711c17428c96c4b07ecfd`; sparse review at `ec17f0ac1dad95325640ab6a1032751e39287887`; and detached native pins SRC `b3e69acf…`, Em `70b5a0f9…`, Wendbine `4dcb3ac4…`. The sparse review has two untracked Python-cache directories; the other accessible established non-initializing Desktop worktrees were clean. Locked initializing entries were not repaired or pruned.

The secondary clone also retains separate worktrees at `7a24e55818e7ae8938d3d1f5fee80f22fa6466c1` (four modified and two untracked status entries), `29cdad5d1b83311799902c0ce3d79be8103d8760` (five modified and twenty untracked entries), and `74524260b8da53d29be96ba89fb71108d66eb23d` (clean). These states were inventoried and preserved; their working-file contents were not independently adjudicated.

A third, earlier research Git store contains the completed four candidate worktrees at the exact PR heads and original SRC/Em/Wendbine pins. Initial status reported 6,371 modified entries in SRC, 5,705 in Em, 10,359 modified plus a Python-cache directory in Universal, and 7,325 modified in Wendbine; original pins reported 6,370/5,704/7,326 modified entries respectively. Its unpopulated primary index reports 11,849 staged deletions. These pre-existing states were preserved rather than restored or committed. Status alone does not establish substantive byte changes. Its additional locked initializing SRC registration was retained. All local databases, model checkpoints, indexes and traces were left in place.

Follow-up `git diff --numstat` returned zero content-difference records for each of the four earlier candidate worktrees. Thus their initial modified-status counts are not evidence of thousands of substantive edits. This review did not normalize, restore or commit those working files.

A new isolated sparse review worktree was created from Universal `b3136226…`, initially clean, containing public software instruments and selected receipts. Only this new review lane receives the source-free review additions.

## 2. Frozen candidate integrity and scientific holds

The existing local `PRIVATE_CANDIDATE_GOLD_v1.json` is **75,625 bytes**, SHA-256:

`740d076ec68550490295a50ff64f812daf65d7a8571f1d2449e1eefa8bc7a571`

This exactly matches the expected frozen hash. Both located review-manifest copies are 624 bytes and have identical SHA-256 `d234eec0c0c6cf2a0b6823c06df7d385c82a57595b1aa07bfd65365c445b4668`. The [pinned public manifest](https://github.com/tauric-diana-613/TD613-TCP/blob/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/docs/research/2026-11-04/CANDIDATE_GOLD_REVIEW_MANIFEST.json) commits to 18 queries, six per estate, six per difficulty, registered at `2026-11-04T18:21:38.903508+00:00`; `human_approved=false` and `model_ranking_observed_before_freeze=false` remain explicit.

All 18 cases remain **unadjudicated in this review**. No case is newly certified relevant, irrelevant, ambiguous, a valid/uncertain decoy, incompletely labeled, or identity-mismatched. These categories require the operator-local Work reviewer to inspect the exact original witnesses before consulting private rankings. Fresh source-commitment, field/capture-hash and original-version verification remains HELD at that boundary; a matching gold-file hash does not discharge it. No proposed v2 labels or new label hash were invented, and v1 was not modified.

Five previous local output artifacts were mechanically matched to the exact Git blobs already carried by Universal `b3136226…`: review manifest `6f722c32…`; actual evidence packet `134b7a76…`; execution receipt `52f56a6f…`; readiness result `233676b8…`; sanitized execution evidence `6350fa8e…`. They are already reviewable together in [the pinned research directory](https://github.com/tauric-diana-613/TD613-TCP/tree/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/docs/research/2026-11-04). Private source annotations, ranking traces and databases remain local.

## 3. What the score divergence does and does not establish

| Estate | MiniLM candidate recall@20 | BM25 candidate recall@20 |
|---|---:|---:|
| SRC | 0.0000 | 0.0556 |
| EMSTD613 | 0.8333 | 0.8889 |
| Wendbine | 0.0000 | 0.0000 |

The values above are preserved from the immutable execution receipt, not recalculated from private rankings in this session.

Inspection of the [pinned scorer](https://github.com/tauric-diana-613/TD613-TCP/blob/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/scripts/atelier-semantic-parity-benchmark-v1.py) and eight independent synthetic checks established:

- Scored identity is the exact tuple `(estate, source_id)`. Prefix/normalization differences or a wrong estate yield a miss even if a human might identify the intended source. This is a demonstrated sensitivity, not a finding that private joins are wrong.
- Recall divides the count of retrieved labeled-positive identities by the count of **distinct** labeled-positive identities. Estate means are macro-averages over queries. MRR is the first matching distinct-source rank. A decoy event is Boolean per query. Duplicate positive labels do not enlarge the denominator.
- The scorer deduplicates chunks/captures of the same estate/source before applying `k`. Different captures or title/body fields do not receive distinct source-level ranks.
- Capture IDs, source/chunk hashes and source fields are not compared with the gold by this scorer. A matching source ID with a deliberately wrong synthetic capture/hash still scores a hit. Version correctness must be established by a separate source-bound join/readback audit.
- An unlabelled source scores no relevance credit. That does not establish its irrelevance. Incomplete positives and uncertain decoys therefore limit semantic interpretation without being quantitatively attributable yet.
- Truncating a chunk-ranked list before source deduplication can lose otherwise reachable sources. The general semantic API defaults to chunk results, while its `unique_sources=True` mode selects distinct sources before limiting. Static mechanical inspection of the actual local execution driver found `sem.search(..., limit=20, unique_sources=True)` and explicit estate filtering; the BM25 call requests 100-row pages with an offset expression. Thus chunk crowding is not established as the cause of the recorded semantic zeros. Full BM25 stopping/deduplication and the actual private ranking-to-gold joins still require Work verification.

The [pinned encoder](https://github.com/tauric-diana-613/TD613-TCP/blob/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/scripts/atelier-offline-onnx-v1.py) explicitly enables `max_length=256`. A synthetic 1,180-character input tokenized to 852 pieces before truncation and 256 after; a tail marker was omitted. The [chunker](https://github.com/tauric-diana-613/TD613-TCP/blob/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/scripts/atelier-cross-estate-query-v1.py) uses 1,200-character chunks with 100-character overlap. Character windows therefore do not guarantee attention to every source byte. The 256 limit includes tokenizer-added special tokens. The local ONNX file independently hashes to the receipt's `6fd5d72fe4589f189f8ebc006442dbb529bb7ce38f8082112682524616046452` (90,405,214 bytes); no source text or model weights were transmitted externally.

The receipt documents different source representations: 1,765 SRC derivative/reference surfaces, 53 Em derivatives, and Wendbine body/title/capture history including 800 empty-body/title-only sources. These differences are plausible contributors to retrieval difficulty. Their causal share, genuine relevance mismatches, identity-join errors, lexical-label bias and actual model limitations cannot be partitioned from aggregate scores. No engine was optimized on these cases. The observed zeros remain meaningful negative candidate-label agreement, with scientific relevance unresolved.

Validation: the existing four benchmark tests passed; eight additional synthetic scoring checks passed; synthetic tokenizer truncation passed. Both portable audit scripts were also executed successfully and reproduced their accompanying JSON receipts. Initial review-harness attempts failed on OS temporary-directory access, an unclosed harness SQLite connection and inherited tokenizer truncation state; the harness was corrected and rerun. Those setup failures are not retrieval-engine defects and do not replace any historical failed CI receipt. Supporting source-free receipts accompany this packet.

Reproduction at the pinned Universal base plus this review's additive scripts: run `python -B scripts/audit-atelier-source-id-scoring-v1.py --scratch-dir <existing-absolute-scratch-directory>`. Mechanical execution-contract inspection uses `scripts/audit-atelier-execution-contract-v1.py` with explicit `--driver-root`, `--tokenizer-json`, and, if needed, `--dependency-root` arguments for already-local files. It parses execution code without running it and tokenizes fictional text; it does not load gold, rankings or corpus text. These scripts print source-free JSON and do not change the retrieval engine.

## 4. Native method limitations retained

The [immutable execution receipt](https://github.com/tauric-diana-613/TD613-TCP/blob/b3136226f2b3e4c3ebe176c56d2c19c83ca5b730/docs/research/2026-11-04/FOUR_ATELIER_NATIVE_PARITY_EXECUTION_RECEIPT.md) and Amari's review support the following bounded dispositions; authentic assays were not repeated here.

| Estate | Preserved executed evidence | Remaining parity limitation |
|---|---|---|
| SRC | Nine formal layers remain distinct from eight experiential reading routes. Same-method preservation matched all 417 projective observations; chronology withdrawal changed 79 classifications; contextual-role withdrawal preserved the typed path. Typed traversal: 41 seeds, 48 witnessed and 16 held events, depth 3. | Same source acquisition and method hash `46064cf6…` establish deterministic preservation, not independent science. Full contradictory multi-stratum journeys and original higher-order behavior remain unadjudicated. Five original-file locators remain unavailable; 442 observed body derivatives do not authenticate those originals. |
| Em | 32 operational Works, 53 manifestations, eight human-gated identity groups and the 32–40 sensitivity interval. Original-byte audit observed 86/87 registry records. Source-bound motif/mechanism refusal executed. | Work identity and scientific fixture outcomes remain human-gated. Missing ingredients in a submitted motif packet do not prove absence throughout the corpus. The unavailable 87th registry record is AppleDouble resource-fork metadata; it is not general loss of Em's readable corpus. |
| Wendbine | 2,767 observed sources; 3,473 captures; 1,967 primary body-bearing sources; 800 title-only/empty-body records. Historical field/capture readback and 21 observed cues. | Zero resolved internal post links. Cues do not create source relationships. Higher-order relational discovery and synthesis remain partial; observed archives do not establish full history, first publication or current Reddit state. |
| Universal | 36,816 source-bound chunks/vectors and 632 typed/reference relations; retrieval, reverse-reference and readback machinery. | These are searchable representations and operational readers, not execution of every original scientific method. Shared embeddings remain shared acquisition. Full independent relevance and behavioral parity remain HELD. |

## 5. Separate prospective Flight readiness

| Route | Verified preparation | Minimum observable prerequisites still missing or unverified | Disposition |
|---|---|---|---|
| Flight A: Wendbine Atelier ↔ initially empty Universal Encyclopedia | Bounded native historical retrieval and exact-source readback machinery; local observed corpus | Pinned original custody for the chosen sample; a distinct receiver with replayable zero-source receipt before admission; distinct send and return channels/receipts; prospective matched controls; separately authorized source admission and Flight; source-bound return readback; independent evaluation | HELD, inactive |
| Flight B: TD613 Encyclopedia ↔ initially empty Universal Atelier | The distinct 1,141-record TD613 Encyclopedia was verified in the prior receipt, canonical payload `ff0c98f5…`, 7 reference + 8 navigation tests | Independent adjudication of Flight A first; chosen-source custody; separately empty Universal Atelier receipt; matched recipient contract and controls; distinct send/return; separate admission and Flight authorization; source-bound return and independent evaluation | Separately HELD, inactive |

The populated local Universal reference index is neither empty receiver. An empty directory or metadata declaration is insufficient proof of an empty admitted-source state. A bounded receiver ledger/readback instrument is a missing experimental instrument; approved full scientific parity is an unproven hypothesis. The current combined parity gate returns `HELD_PARITY_NOT_REALIZED` because it demands all four estates' parity checks as well as receiver/probe evidence. Preserve that historical result, but do not treat full parity as a logically necessary result the future experiment must prove before it may test its hypothesis. A separate prospective preflight decision must distinguish instrument integrity from experimental outcome.

A standalone Wendbine Encyclopedia is technically plausible as an independent native comparator using verified capture-aware search, citation, pagination and hash-readback machinery. This is a feasibility inference, not a construction or parity receipt. It must preserve missing bodies and version scope and cannot synthesize a graph from 21 cues/zero resolved links. Reusing corpus acquisition or code must be disclosed. No large implementation is presently justified ahead of relevance adjudication and the operator's experimental contract.

Protected Experiment B Arms 2A/2B remain a different prospective matched reasoning experiment. Symmetric model capability is preserved as intended; the Sol Extra High protocol amendment remains unsettled. Neither reciprocal Flight supplies its authorization or settles that amendment.

## 6. Sync V2 succession and retirement state

[Issues #1674–#1677](https://github.com/tauric-diana-613/TD613-TCP/issues/1674), their comments, the [pinned supersession register](https://github.com/tauric-diana-613/TD613-TCP/blob/39cca00bb4c351a4c1d37936ee97c6b858ba5347/docs/research/2026-11-04/THREE_ATELIER_SYNC_V2_SUPERSESSION_REGISTER.md), PR #1678 and the legacy issue records were read.

| Estate | Original gate | V2 successor | Retirement / activation status |
|---|---|---|---|
| SRC | #758, Zenodo-only live listener | #1675 | Old listener remains enabled on observed main, operational gate DORMANT; not retired. Five-provider restoration is not established. |
| Wendbine | #1308, actual held acquisition history | #1676 | Old listener remains enabled on observed main, gate DORMANT; not retired. Preserve its first-run hold and ciphertext-artifact history. |
| Wendbine duplicate | #1309 | #1676 | Already closed as duplicate on November 4, 2026 at 19:34:06 UTC; historical pointer retained. This did not retire #1308's listener. |
| Em | No dedicated original sync gate | #1677 | First dedicated successor remains a dormant candidate; identity decisions remain separate. |

Exact-head source-free CI is green for the offline inbox implementation. Authentic operator-local Windows-source intake has not been established; provider V2 adapters and independent cutover remain HELD. At observed main `50cc9d16…`, workflow conditions still bind #758 and #1308, with no V2 command binding. PR #1678 contains a prospective relay, but it is unmerged. Its local approval flag is an attestation rather than independent authentication. New `07-OPERATOR-INBOX` directories belong to their own source Ateliers and are future operator-controlled intake surfaces; they are not automatically Universal evidence. No inbox was read and no issue-command gesture was posted.

## 7. Smallest warranted next action

**Operator-local Work should independently adjudicate the already hash-verified 18-case candidate against pinned original witnesses before opening ranked output.** Record relevant/irrelevant/uncertain source judgments, decoy suitability, incomplete positives and exact source/version matches. Approve, reject, or propose corrections in a separately frozen version with explicit reasons and a new hash; human scientific approval remains reserved. Then mechanically audit actual ranking-to-source joins, BM25 paging/deduplication and field/capture hashes before interpreting the contrast or defining a prospective holdout.

No retrieval-engine repair is demonstrated by the present source-free probes. Do not launch a new experimental receiver, tune evaluated cases, restore archives, construct a large comparator, or restart the four-Atelier program. After relevance review, the smallest possible engineering task is a separately scoped receiver zero-state/send-return instrument only if the approved prospective Flight contract requires one.

This review authorizes no merge, source admission, provider acquisition, protected Experiment B, reciprocal Flight, external-model source transmission, deployment or public research release. Human closure RESERVED. ⟐
