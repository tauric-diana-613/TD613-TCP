# 𝌋 TD613 · The Eighteen Witnesses

Principal: `tauric.diana.613` · Covenant: Khona‌lit-po

**Actual source-based diagnostic review: 18/18 cases examined, 108 original source-role judgments recorded. Human scientific approval remains reserved.**

This collection preserves the original candidate gold, questions, annotations, rankings, scoring outputs, source-witness crosswalks, methods, predecessor receipts and the new scientific findings. The repository was verified **public** before export. The original filenames containing `PRIVATE` or `private` are historical filenames; the files deliberately included here have been reviewed for the operator-authorized public research disclosure.

Start with [SCIENTIFIC_DECISION_PACKET.md](SCIENTIFIC_DECISION_PACKET.md), then consult:

- [The exact original gold](originals/PRIVATE_CANDIDATE_GOLD_v1.json): 75,625 bytes; SHA-256 `740d076ec68550490295a50ff64f812daf65d7a8571f1d2449e1eefa8bc7a571`.
- [The original freeze manifest](originals/CANDIDATE_GOLD_REVIEW_MANIFEST.json) and [question inventory](RESEARCH_QUERIES.json).
- [The 18 source-based records frozen before individual rankings](SOURCE_BASED_ADJUDICATION_PRE_RANK.json) and their [freeze receipt](SOURCE_BASED_ADJUDICATION_PRE_RANK_MANIFEST.json). Individual case files are in `adjudication_pre_rank/`.
- [Source/capture/field/hash crosswalk](SOURCE_WITNESS_CROSSWALK.json), with pinned native source URLs and observed-post references.
- [Original MiniLM rankings](originals/semantic-rankings-private.json), [original BM25 rankings](originals/lexical-rankings-private.json), [original scoring output](originals/semantic-execution-private.json), and [subsequent ranking diagnosis](ORIGINAL_RANKING_DIAGNOSTIC.json).
- [Proposed diagnostic amendment v2](PROPOSED_CANDIDATE_GOLD_v2_DIAGNOSTIC.json) and its [separate freeze manifest](PROPOSED_CANDIDATE_GOLD_v2_MANIFEST.json). It is pending human approval and is **not ready for confirmatory scoring**. Original labels and scores remain unchanged.
- [Complete artifact manifest](RESEARCH_ARTIFACT_MANIFEST.json), including public destinations and specific local-only exclusions.

The review is **POST-OBSERVATION DIAGNOSTIC ADJUDICATION**. Aggregate performance was already known. The new source judgments were written and frozen before individual ranked outputs were opened; that preserves a useful ordering but does not make this a preregistered confirmatory study or an independent human approval.

## Reproduce the original scores

At Universal commit `b3136226f2b3e4c3ebe176c56d2c19c83ca5b730`, use `scripts/atelier-semantic-parity-benchmark-v1.py` with the original gold and either original ranking JSON. Its command requires absolute paths to existing files:

```text
python -B scripts/atelier-semantic-parity-benchmark-v1.py --preregistered-gold <absolute-original-gold-path> --local-ranked-output <absolute-original-ranking-path> --k 20
```

This replays source-ID scoring without model inference, provider acquisition or source admission. It reproduces the historical candidate scores; it does not approve their relevance labels. The two original driver scripts are preserved under `originals/` as execution-method evidence. Their relative local-layout assumptions are historical, and they must not be run as automatic intake or receiver initialization.

Native source pins remain SRC `b3e69acf587d534eeef2e01d0bb5bdbdecdbd320`, Em `70b5a0f9e94626cba6068f41c6117e7978800bbd`, and Wendbine research lineage `74abfb857e37a3e6d9d711c17428c96c4b07ecfd`. Native source links authenticate pinned derivative bytes; they do not authenticate absent original PDFs or prove scientific authorship. Observed Wendbine capture hashes do not certify current platform state.

For additional omitted witnesses, `evidence_sha256` in the pre-ranking diagnostic records hashes the whitespace-normalized review window. `evidence_byte_offset` locates its beginning in the source, and `source_sha256` binds the complete source field. That review-window digest is not an unnormalized raw chunk digest. Original gold `passage_sha256` and retrieved `chunk_sha256` retain their original exact-text meanings.

The generic completeness field in the case records identifies an annotation deficiency, not a completed exhaustive survey. For `SRC-1-INTERMEDIATE`, the later/unresolved-target condition remains held and no replacement positive satisfying that full condition is certified. Its candidate omissions must not be read as executed later-title matches.

## Access and exclusions

No ChatGPT Library upload endpoint was exposed in the connected tools. A desktop attempt to inspect the signed-in ChatGPT browser was refused with “Computer Use was not approved to use DuckDuckGo.” The operator then expressly selected GitHub PRs as the fallback. **This collection uses that fallback; no Library upload or Library artifact ID is claimed.**

The complete v1 gold and its bounded witness excerpts are included unchanged. No credential, private contact detail or confidential business-state value was identified in those excerpts or the published evaluation metadata. Full corpus databases, bulk third-party bodies, model weights, the full offline corpus browser and operational acquisition records remain in preserved local custody; they are not needed to reproduce the published score calculation. The manifest identifies those exclusions individually. No new source permission is inferred from a public URL, and no unavailable video or missing original was restored.

Experiment B receivers receive none of this collection automatically. ARM_0_TRANSPORT, ARM_1_ARCHIVAL, ARM_2A_MODULAR and ARM_2B_MATCHED_UNION remain separate. GPT-6.1 Sol Extra High matched treatments and GPT-6 Astra Max Stage II remain prospective under their separately frozen contract and credential/environment checks. The Wendbine/Paul advisory checkpoint is preserved without automatic experimental exposure. Both reciprocal Flights remain inactive.

Human authorship, scientific approval, protected source admission and release closure RESERVED. ⟐
