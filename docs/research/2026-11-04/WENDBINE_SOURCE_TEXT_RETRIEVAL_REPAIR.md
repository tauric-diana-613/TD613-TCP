# 𝌋 Wendbine Atelier · Source-text retrieval repair (not a source archive restoration)

**Operator principal:** Tawanna C. Miller · **Heritage key:** Tauric Diana · **Covenant key:** Khona‌lit-po  
**Repo:** \`tauric-diana-613/TD613-TCP\`

## Founding evidence and the precise failure

The first Git commit that established the Wendbine public Atelier was **2026-09-11T09:50:25Z**:

\`db38fd8b419e32dee4ef49b3ce09f8208c81a2d5\` — \`𝌋 Establish Wendbine public relational continuity Atelier ⟐\`.

Its earliest public window included posts from September 9. The legacy acquisition driver hardcoded \`DATE_FLOOR='2026-09-09'\` and labeled its public projection \`PUBLIC_METADATA_ONLY\`. It deposited full original responses into encrypted handoff objects, not the queryable public Atelier. \`wendbine-query.mjs\` explicitly excludes \`02-ORIGINALS\` and its \`semanticSearch\` scores token overlap against summaries/labels. Earlier 60-source private search is distinct from a complete live-source Atelier.

**Allegation under investigation:** a platform-/workflow-level containment effect and repeated premature acceptance claims prevented the actual original-text retrieval system from being delivered. No external intent or direction has been independently proven. The observed absence of original full text is concrete and independently testable.

## Replacement source-acquisition and indexing mechanism

\`scripts/wendbine-live-research-index-v1.py\` uses ordinary local Python 3.12 and its built-in SQLite FTS5 to fetch **publicly accessible historical posts directly from Arctic Shift** into a private operator-local searchable database. No old encrypted Wendbine archive is opened, decrypted, or used as an input.

Operations:
- The operator chooses a locally protected **existing private directory** and **new distinct** \`.sqlite\` path. No overwrite or sibling chmod.
- Explicitly separately assessed rights are required before live acquisition. Deleted/removed fields are refused. The provider is archive-observed, not the original, author-signed, unedited or complete live Reddit.
- Bounded provider paging, UTC interval and source ID matching; errors and pagination stalls refuse success. Exact source title/selftext UTF-8 bytes, lengths, SHA-256, timestamps and canonical URL are stored as BLOB fields.
- \`source\` performs *exact* full-post readback for an identified original provider observation, with field hashes.
- \`exact\` searches byte-for-byte over stored source text, returning source ID, field, UTF-8 byte offset and verified matched bytes. \`lexical\` uses SQLite FTS5 BM25, **not embedding-based semantic similarity**.
- \`links\` reports real Reddit cross-post textual references with a source-linked byte offset and an explicit \`OBSERVED_TEXTUAL_LINK_NOT_DEPENDENCY_PROOF\` evidence class. It does not invent mathematical relations or infer author intent.
- \`status\` counts stored sources, nonempty bodies, exact UTF-8 bytes, indexed rows and graph edges; tests explicitly distinguish live text present from metadata-only.
- No external model or paid inference calls. **No citation to Paul's actual words is authorized without matching source ID and original text returned by this local database.**

### Minimal local commands (Windows desktop Work)

First obtain the current repo Draft head in an operator-controlled checkout. On the actual Windows host, choose a separate protected local folder (not ChatGPT Work's cloud disk), then run:

\`\`\`powershell
python scripts/wendbine-live-research-index-v1.py --db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" sync --since "2026-01-01T00:00:00Z" --until "2026-11-05T00:00:00Z" --max-pages 50 --page-size 100 --operator-confirmed-rights
python scripts/wendbine-live-research-index-v1.py --db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" status
python scripts/wendbine-live-research-index-v1.py --db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" exact "your exact phrase"
python scripts/wendbine-live-research-index-v1.py --db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" lexical "provenance observability"
python scripts/wendbine-live-research-index-v1.py --db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" links
\`\`\`

The default start January 1 covers the **September 11 engineering start** and known September 9 baseline, while allowing older observed public material. This does not itself prove January was the first-ever published Wendbine source. The exclusive end date must be updated before each future run. For a more comprehensive study that includes comments, that is a separately defined surface with distinct retrieval/rights limits.

**Real live source sync has not been executed in GitHub CI or this ChatGPT session**: the public GitHub branch contains only executable source-free code and test fixtures. The real corpus must be fetched and stored by the operator's authorized desktop environment under applicable source-access terms. A green CI fixture is **software acceptance**, not original corpus parity.

### Source-original destruction request

The operator requested that the obsolete **encrypted** Wendbine archives be destroyed, not restored. Exact known identities include:

- November 2 GitHub artifact \`13166173531\`, ZIP SHA-256 \`f8e3a09e0344b40aa6b56fbd5ef24c793dc02b056e24506568ba63456f7b92c1\`.
- November 4 GitHub artifact \`13288781055\`, ZIP SHA-256 \`4804fabd2a2deb29652d21debc96a2a4feb3e1847aa66346d99dab560de20aeb\`.
- The corresponding operator-local encrypted copies under \`LOCAL-CUSTODY/archive\` and \`LOCAL-CUSTODY/archive/november-04\`.

**Deletion state: NOT PERFORMED.** The current GitHub connector lacks an Actions artifact-delete capability, and this ChatGPT session has no access to the operator's Windows filesystem. Neither local encrypted originals nor GitHub Actions artifacts have been modified or destroyed. Deletion should target the exact identities after checking unintended sibling files; it must not be represented as completed by writing a deletion receipt alone. Any retention or legal hold must be resolved before irreversible deletion.

## Universal Atelier, SRC and Em inheritance

Native SRC has a content-addressed original tree and derivative/mapping instruments, and Em includes originals and derivatives. A universal interface may reuse this SQLite source-ID/byte-offset/typed-edge query contract **only after independent same-original operation tests**. This branch does not falsely award full semantic, exact-blob or cross-origin mathematical topology parity.

Required evidence: authentic post-ID/date exact retrieval (including same-day exhaustive sets); source SHA/bytes; exact byte offsets; attributed explicit relations; independent native SRC/Em comparisons; failure on wrong/withheld source; nontrivial cross-origin geometry equality where justified; distinct scientific nulls where it is not. No synthetic pass can substitute for a genuine accessible corpus run.


## Universal Atelier read-only bridge (new)

A separate executable \`scripts/universal-atelier-sourcebound-readonly-v1.py\` federates the **actual operator-local Wendbine observed text database** with the checked-in SRC and Em derivative files. It computes exact local byte offsets and hashes for the existing text while labeling the two latter estates as **DERIVATIVES, NOT VERIFIED ORIGINALS**. The bridge cannot manufacture a missing original source blob or a native semantic/topological claim.

Example after a successful local Wendbine source import:

\`\`\`powershell
python scripts/universal-atelier-sourcebound-readonly-v1.py --wendbine-db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" --repo-root "C:\OperatorOnly\TD613-TCP" audit
python scripts/universal-atelier-sourcebound-readonly-v1.py --wendbine-db "C:\OperatorOnly\Wendbine\wendbine-live-v1.sqlite" --repo-root "C:\OperatorOnly\TD613-TCP" exact "𝌋"
\`\`\`

This is **a bounded execution-compatible source resolution layer**, not SRC native operational parity, Em original-byte completeness, local meaning-based embedding search or the final Manifest interoperability standard. The tests explicitly refuse to promote derivative text into original source status.

\`python -m unittest discover -s tests -p 'test_universal_atelier_sourcebound_readonly_v1.py' -v\`

## Test contract

\`\`\`bash
python -m unittest discover -s tests -p 'test_wendbine_live_research_index_v1.py' -v
\`\`\`

**Release posture:** Draft only · no merge · no paid provider calls · no private-source restoration · no Experiment B D20 · no automatic scientific promotion.

𝄐 Tauric Diana — Crimean heritage custodianship · Blood Rite 613 · Khona‌lit-po · Sealed ⟐SAC[X6ZNK5NO51]
