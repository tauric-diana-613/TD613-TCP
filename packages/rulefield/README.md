## Typed ontology repair — source-preserving

The [typed projection](rulefields/TYPE_SYSTEM.md) now distinguishes a research **Rulefield**, formal **Rule**, **Assay**, **Model**, **Claim**, **Theorem** and **Source**. A review-only crosswalk retypes 26 high-impact legacy rule records, preserves 11 explicitly operational rules and retains all 596 historical IDs/bytes. The 31 possible child rules are prospective and require a formal specification, independent tests and human review. `node scripts/rulefield-types.mjs validate` and `node scripts/rulefield-types.mjs summary` inspect the repair; no canon changes occur.

# 𝌋 TD613 Living Rulefield
## Five-plane source-free research index · v1.0-rc1

**Authority reference:** SAC[X6ZNK5NO51] · **Covenant:** Khona‌lit-po · **Human scientific closure:** RESERVED  
**Experiment B:** HELD · **Scientific status:** a research registry and bounded source-free evidence, not empirical proof.

The old Wolframian rule index has become too complex for one increasing list. It intermingled the original 190 NKS records, later source-recovered propositions, design candidates, crossing hypotheses, execution receipts and the operator's changing research priorities. The Living Rulefield **replaces that structure without removing its ancestors**.

## Conversation-first Rulefield Operator Dockets

**The human decision is presented in the chat, not hidden behind a ZIP.** This package now implements the [frozen nomenclature v1](operator/contracts/NOMENCLATURE_V1.md) and [Rulefield Operator Docket](operator/IN_CHAT_DECISION_PROTOCOL.md) (ROD), produced from the *actual* 70 inherited topics and 80 operator-supplied candidate fields by [operator/docket.mjs](operator/docket.mjs).

From repository root:

    node scripts/rulefield-docket.mjs validate
    node scripts/rulefield-docket.mjs render
    node scripts/rulefield-docket.mjs chat
    node scripts/rulefield-docket.mjs export

Each exported docket includes `.docket.md` (all 80 original expressions, 80 academic working labels, 70 historical ranks), `.docket.json` (complete machine record), and `.chat.json` (eight navigable 10-item groups and digest-bound human decision prompts). The assistant must reproduce the *substantive* proposed changes in-message and provide useful controls or a textual decision fallback; a link alone cannot substitute. The user action creates a new turn; it cannot merge GitHub code or approve unknown future changes. **The independent graphical workbench remains wishlist-only.**

## Rulefields (research domains) and local rules — separate types

`RULEFIELD ≠ RULE`: The [source-free research-domain engine](rulefields/README.md) preserves 80 verbatim operator expressions as provisional rulefields, proposes 80 scholarly working labels and retrieval plans, and generates a **150-position staging preview** (70 original priorities unchanged, followed by 80 new proposed fields). It offers dry-run stable-ID priority permutations and Markdown/JSON exports, without a graphical interface or canonical mutation.

    node scripts/rulefield-fields.mjs validate
    node scripts/rulefield-fields.mjs queue-md
    node scripts/rulefield-fields.mjs field RF-002
    node scripts/rulefield-fields.mjs move RF-002 before Q05

New [human-authored research field requests](operator/templates/HUMAN_RULEFIELD_SUBMISSION_REQUEST.md) can contain single words, mathematical formulas, long thoughts, unresolved subjects or contradictory ideas. An authorized agent uses [the source-gleaning protocol](rulefields/RECOVERY_PROTOCOL.md) to recover actual literature/source witnesses before creating any executable rule or scientific claim. The desired visual drag/reorder interface is [wishlist-only](ROADMAP.md); the running engine comes first.

## Human operator interface and authorization

**Human researchers start in [operator/README.md](operator/README.md)**, not the machine registry. The [extensive operator guide](operator/OPERATOR_GUIDE.md), [eleven-act Antigravity activation](operator/ACTIVATION_PROMPT.md), and the [human-only research submission](operator/templates/HUMAN_RESEARCH_SUBMISSION_FORM.md) accompany the source-free [full disclosure dossier](operator/templates/PRE_SYNTHESIS_AUTHORIZATION_DOSSIER.md). [Human authorization](operator/templates/HUMAN_AUTHORIZATION_DECISION.md) is an independent, content-bound later decision. The receiver writes one comprehensive dossier with Light / Medium / Heavy views and complete JSON annexes; its JSON is never an automatic signature or a canonical change. [Quarantined archive intake](operator/INTAKE_AND_SYNC.md) verifies returned ZIPs before proposing an amendment.

    node scripts/rulefield-operator.mjs help
    node scripts/rulefield-operator.mjs disclose RF-AP-20261107-NEW.json
    python3 scripts/rulefield-intake.py verify /path/to/returned.zip

**Present status:** source-free review and disclosure; protected Flight HELD; real human approval and future exact Git patch remain separately gated.

## LLM receiver and experimental laboratory

The Rulefield now functions as a **versioned research registry, scientific starter laboratory and review-first amendment intake system**. A connected agent can recover evidence and propose new rules or relationships without silently changing historical data. When the requested computation exceeds the current engine, the capability enters the future-integration backlog rather than being claimed as already available.

**For a fresh agent or Antigravity thread, begin here:**

1. [`AGENTS.md`](AGENTS.md) — scoped source/authority entry contract.
2. [`rulebook/LLM_QUICK_START.md`](rulebook/LLM_QUICK_START.md) and [`rulebook/source_locator.json`](rulebook/source_locator.json) — discover original evidence across GitHub revisions, project files, Library/archives, Ateliers, Encyclopedia, research instruments and publicly accessible Wolfram tools.
3. [`lab/README.md`](lab/README.md), [`lab/tool_registry.json`](lab/tool_registry.json), [`lab/multiway_lab.mjs`](lab/multiway_lab.mjs) — bounded multiway rewriting, overlapping critical-pair controls, event histories, cellular automata and clearly separated external computation.
4. [`amendments/RECEIVER.md`](amendments/RECEIVER.md), [`amendments/schema.json`](amendments/schema.json), [`amendments/hooks.json`](amendments/hooks.json) — propose NKS-style geometry, projections, relationships, tests and consequences as typed review packets.
5. [`ROADMAP.md`](ROADMAP.md) — **22 capability-gated future integrations**, including Wolfram kernels, NetLogo, larger causal graphs, scientific observer experiments, source-bearing Atelier coordination and experimental successors.

**Runnable reference commands** (from the repository root, Node.js 22):

```bash
node scripts/rulefield.mjs stats
node scripts/rulefield-lab.mjs suite
node scripts/rulefield-lab.mjs diamond
node scripts/rulefield-lab.mjs critical
node scripts/rulefield-lab.mjs ca 30
node scripts/rulefield-amend.mjs init RF-AP-20261107-001
node scripts/rulefield-amend.mjs dry-run
node scripts/rulefield-amend.mjs sync
node --test tests/rulefield-garden-triptych.test.mjs tests/rulefield-v1.test.mjs tests/rulefield-nks-lab.test.mjs tests/rulefield-amendments.test.mjs
```

`sync` means **inbox to content-addressed review outbox** only. It does not watch continuously, rewrite the canonical registry, merge a PR, qualify physical or social emergence, access protected archives, or activate Experiment B.

The native Wolfram comparison script at [`lab/wolfram_comparator.wl`](lab/wolfram_comparator.wl) is **staged but unexecuted**. It requires a genuine Wolfram Language runtime and a source-level execution receipt before any parity or physical claim.

## The three updated Garden editions

These three files live **directly in `packages/rulefield/`** and are synchronized representations of this source-free Living Rulefield edition:

| File | Purpose | Expected consistency |
|---|---|---|
| [`TD613_NKS_Wolframian_Garden_Advancement_20261107.md`](TD613_NKS_Wolframian_Garden_Advancement_20261107.md) | Reader-facing full historical Garden manuscript **plus** successor appendices, all 70 queue topics and all 406 later rule records | 190 inherited rules preserved in the historic section; 406 appended; 58 additional crossings |
| [`TD613_NKS_Wolframian_Garden_Advancement_20261107.json`](TD613_NKS_Wolframian_Garden_Advancement_20261107.json) | **Standalone bridge JSON** preserving the v2 Garden root fields, with complete compiled Rulefield under `living_rulefield` | Root `rules` = 190 / `crossings` = 30; nested `comprehensive_records` = 596 / `comprehensive_crossings` = 88; queue = 70 |
| [`TD613_NKS_Wolframian_Garden_Advancement_20261107.csv`](TD613_NKS_Wolframian_Garden_Advancement_20261107.csv) | Searchable flat research register including role, source lineage, scientific limits, typed lane and queue rank | 596 data rows; 27 columns; original 15 CSV columns retain their headings and historical values |

**Authoritative query corpus:** [`data/rulefield.v1.json`](data/rulefield.v1.json). **Historical structured Garden:** [`sources/nks-garden-190.snapshot.json`](sources/nks-garden-190.snapshot.json). **Earlier recovery:** [`sources/emergence-recovery-112.snapshot.json`](sources/emergence-recovery-112.snapshot.json). These separate snapshots remain the provenance anchors; the expanded three files are **derived views** and may be regenerated or reviewed without automatically promoting a scientific proposition.

**Versioning guidance:** Because the filenames retain their original November 7 date, downstream consumers should inspect the JSON's `schema = td613.nks.garden-index/v2.1-rulefield-bridge` and use `living_rulefield.comprehensive_records` for the expanded catalogue. Code expecting the original Garden can still read the *root* `rules` and `crossings`, but should separately check the version marker. The CSV is the expanded export (not a drop-in 190-row-only CSV).

**Regression check:** `node --test tests/rulefield-garden-triptych.test.mjs` crosschecks all three views, the historical Garden, and the canonical Rulefield. Run it whenever the compiled register changes. An absence of an independent CI witness leaves validation at the level actually executed.

## Five planes

| Plane | Question it answers | Boundary |
|---|---|---|
| Rule identity and lineage | What exact proposition, class, authorial/source root and history? | Inherited labels remain unchanged |
| Evidence and claim ceiling | Which test, counterexample, source or qualification supports this statement? | A receipt never proves external origin |
| Multiway behavior | What was rewritten, what history survived, and did a competent null tie? | Scalar equality never substitutes for path history |
| Typed crossings | Is this a rule relation, topical hypothesis or unresolved alias? | Ambiguous names never silently merge |
| Operator priorities | Which research question should be considered next? | Position in the queue never confers proof or release authority |

A Rulefield query addresses a structured tuple of rule records, source references, evidence/claim types, typed relations, retained histories, operator queue and immutable custody constitution. The queue may change while source warrants and historical experimental claims remain fixed.

**Relation-geometry and relational-geometry remain different study-local concepts.** A static typed relation graph captures possible edges; a situated relational-geometry model additionally requires time, observation, permission, hearing policy, source custody and route histories. The particular DD-02 shortest-path construct is not a universal metric of human suffering or a geometric law of physical spacetime.

**Ambiance is a separate conditional research question.** A theme-only change can be required to preserve kernel output and authority while still changing what a human notices. No observer effect is claimed until independently measured.

## Counts at migration

| Lane | Records | Status |
|---|---:|---|
| Historical NKS I/P/X rules | 190 | Verbatim structured data preserved (50 I / 45 P / 95 X) |
| Source-recovered rules | 112 | Source-reported or prospective as individually labeled |
| Cumulative operator-queue candidates | 245 | Research proposals |
| Operahouse derivatives | 16 | Mixed locally tested contracts and proposals |
| Thinker conditions | 20 | Theoretical computational translations only |
| DD-02 CBFE conditional geometry | 12 | Bounded source-free test, no earned emergence |
| Multiway warranted-path-fiber hypothesis | 1 | PROPOSED_NOT_QUALIFIED |
| **Total** | **596** | **No automatic promotion between lanes** |

**Typed crossings:** 88 = 30 original + 12 earlier recoveries + 26 cumulative queue crossings + 10 Operahouse proposals + 8 DD-02 conceptual crossings + 2 new Rulefield research hypotheses. Those final two are explicitly unexecuted.

**Queue:** 70 ordered priorities. Computational Black feminist epistemology = 4, dromology = 5, Operahouse = 15, Palace Acts I and II = 16 and 17, and Black feminist epistemology remains a distinct intellectual tradition at rank 47. Forty-eight historical rules are searchable but unranked, rather than forced into artificial priorities.

**Debt preserved:** 32 crossing tokens have no safely unique documented alias and 10 historic bibliography identifiers are unresolved. The index reports them for adjudication instead of concealing them through guesswork.

## A source-free result with genuine limits

The v0.4 preregistered DD-02 comparison produced:

- 384/384 correct for the proposed typed conditional hearing geometry.
- 384/384 correct for the information-matched competent strong-union model.
- 49/384 correct for the deliberately incomplete static-graph ablation.
- No demonstrated predictive novelty above the strong comparator: SOURCE_FREE_BOUNDED_TIE.

Equal shortest-path costs may conceal distinct consent, appeal and hearing histories. This motivates the **multiway warranted-path fiber** conjecture, but still fails to demonstrate its unique value beyond a fully informed history-preserving comparator.

## Executable research index

In a full TD613-TCP checkout with Node.js 22:

    node scripts/rulefield.mjs validate
    node scripts/rulefield.mjs stats
    node scripts/rulefield.mjs queue
    node scripts/rulefield.mjs priority 4
    node scripts/rulefield.mjs search standing --rank 4 --limit 12
    node scripts/rulefield.mjs trace CBFE-RG-11
    node scripts/rulefield.mjs crossing RF-X01
    node scripts/rulefield.mjs aliases
    node scripts/rulefield.mjs frontier
    node scripts/rulefield.mjs sample_proposal
    node --test tests/rulefield-v1.test.mjs

The last sample command stages a **dry-run proposal in memory** with explicit source, falsifier, competent comparator, and queue rank. It cannot mutate Git, K0, the protected archive, or the scientific claim grade.

Implementation files:

- packages/rulefield/data/rulefield.v1.json — compiled five-plane corpus.
- packages/rulefield/sources/nks-garden-190.snapshot.json — original Garden as a parsed structured snapshot.
- packages/rulefield/sources/emergence-recovery-112.snapshot.json — prior source-recovered research and its separate promotion annotations.
- packages/rulefield/rulefield.mjs — validation, query and source-tracing library.
- scripts/rulefield.mjs — read-only CLI.
- tests/rulefield-v1.test.mjs — inherited-lineage, queue, alias, evidence-null and authority checks.

The Garden snapshot is a parsed text restoration; its inclusion **does not independently authenticate a historical author's original file bytes or external provenance**. Do not confuse source labels, Git blob IDs, and an independent external witness.

## Emergence gardening and restraint

RGI-01 can generate a new candidate rule under explicit conditions, but a candidate must carry a **falsifier, a capable null comparator, a scope and lineage** before it can even be staged. No rule becomes law by virtue of increased catalogue size or a persuasive metaphor.

Negative results and nonjoinable hypotheses may remain beside one another. What matters is whether the Rulefield makes their differences recoverable and proposes experiments that can actually disconfirm the claims.

**Flight HELD · Automatic promotion false · Original I/P/X frozen · No unblinding, merge or deployment · Human closure RESERVED.**

𝄐 Khona‌lit-po · Marked ⟐

## Prior-entry duplicate admission

The [duplicate-admission sieve](amendments/duplicate_gate.mjs) compares proposed new-entry text and candidate IDs against existing rules, crossings and 70 queue headings, plus earlier candidates in the same packet. It fails closed for exact repeats and reused IDs, and holds likely lexical or operator-declared overlaps for review. All prior IDs, comparison methods and unresolved consequences appear in the [human disclosure](operator/DISCLOSURE_PROTOCOL.md). A human can request a difference analysis or an explicit versioned revision rather than losing an independent hypothesis. This is a computational admission HOLD, never an allegation of plagiarism.
