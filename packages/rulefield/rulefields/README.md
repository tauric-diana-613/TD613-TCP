## Source-complete revised human docket

`node scripts/rulefield-docket2.mjs validate|render|chat|export` runs the revised 86-field source-complete dossier. It includes the six thermodynamic prerequisites, Temporal Guardian reviewed ordering, original 70 positions, role multiplicity, all audited type corrections, derived candidate children and explicit OD-02 HOLD. Historic source filenames and IDs remain untouched. A rule can be examined as a rulefield; the research role does not execute its rule or grant source custody.

## Executable ontology correction — after source audit

See [TYPE_SYSTEM.md](TYPE_SYSTEM.md) and [typed projection code](type_system.mjs). **26** high-impact historical records have reviewed target types, **11** operational rules are explicitly retained, **31** candidate child rules/assays are modelled without scientific promotion, and **14** broad fields remain protected. The other **559** historical records remain `HISTORICAL_RECORD`, pending future assessment. The full 596-record registry, 70 rank positions, old 80-field source and OD-02 six new fields remain byte-preserved. Run `node scripts/rulefield-types.mjs validate`, `rule INF-01`, `field RF-060` for direct source-linked inspection.

# 𝌋 Rulefields — Research-Domain Engine (not UI)

**Status:** SOURCE-FREE ENGINE · STAGED PRIORITY APPEND · HUMAN CLOSURE RESERVED  
**Distinction:** \`RULEFIELD ≠ RULE\` is a type-system requirement, not an assertion of mathematical novelty.

A **rulefield** is a researchable domain of candidate questions, incompatible theories, potential local rules, evidence, sources, observers, constraints, experimental methods, and unresolved references. A **rule** is a particular fully specified transition, guard, relation or admissibility predicate with formal type and test conditions. One rulefield can generate many mutually incompatible rule candidates; a rule may participate in multiple fields. Neither conversion is automatic.

### What this invocation actually accomplished

- Retained all **80** operator expressions in [data/operator-rulefields-20261107.json](data/operator-rulefields-20261107.json) in submission order, including long trains of thought, symbols, uncertain referents, literal metaphors and possible counterexamples.
- Proposed reversible **scholarly working labels** and research categories. These labels are agent-authored hypotheses, not consent to rename the human's original expressions or confirmations of intellectual provenance.
- Built a **nonmutating 150-position agenda** in memory: the canonical 70 topic positions are preserved verbatim, while 80 staged rulefields append at proposed positions 71–150. A hold flags duplicate or possible overlapping topics without discarding the original.
- Added bounded lexical search leads into the existing 596 rules, explicitly marked **UNVERIFIED_RETRIEVAL_LEADS**. The engine has not searched inaccessible archives or independently verified the citations.
- Supports **priority permutation previews** using \`MOVE_BEFORE\` and \`MOVE_AFTER\` on stable IDs, with content-bound plan baselines; even moves of historical topics result in an explicit HOLD, without modifying canonical order.
- Exports concise or full Markdown agendas and machine-readable JSON to an ignored outbox. No visual UI, watcher, automatic syncing or canonical mutation.

### First actions — portable Node 22 commands

From extracted archive root:

\`\`\`bash
node scripts/rulefield-fields.mjs help
node scripts/rulefield-fields.mjs validate
node scripts/rulefield-fields.mjs stats
node scripts/rulefield-fields.mjs queue-md
node scripts/rulefield-fields.mjs field RF-002
node scripts/rulefield-fields.mjs move RF-002 before Q05
node scripts/rulefield-fields.mjs export full
node --test tests/rulefield-fields.test.mjs
\`\`\`

All priority move commands are **dry-run** until an explicitly separate integration protocol is commissioned. File-based plans (see [plans/PLAN.template.json](plans/PLAN.template.json)) must name the current canonical registry and seed SHA-256, and are read only from this directory.

### Retrieval before rules: the source-gleaning ladder

1. Begin with the exact human expression, preserve all punctuation, and identify a working field label. Never change an operator's words in the raw archive.
2. Search currently accessible sources in order: source snapshots and Rulefield, specific GitHub branches/commits, allowed connected conversation or library records, and appropriate public scholarly or product references. No inferred hidden local disk access.
3. For each recovered record, classify source standing and actual observation; record path/ref/commit or URL, text span and retrieval time, conflicting alternatives, and limits of independence.
4. Identify connections to existing **rulefields** and **rules** with the provenance of each proposed link, then preserve branch distinctions and explicit non-equivalences.
5. Construct finite falsifiable rule/transition candidates only where the ontology has sufficient variables, inputs, update order, competing interpretation, and a competent null.
6. Stage qualified proposals in the existing [Kiki Receiver](../amendments/RECEIVER.md) with full disclosure and human authorization boundary. An unqualified field can remain a valuable research direction without generating a rule.
7. Report held source identity, epistemic type errors, missing scientific tests, unresolved formalization, and null results alongside promising hypotheses.

See [RECOVERY_PROTOCOL.md](RECOVERY_PROTOCOL.md) for the agent-facing full method. The field engine generates **a plan to glean**; actual connected-source retrieval requires an executing agent with lawful tool access.

### Why the long and unusual expressions remain uncompressed

"Unpredictability" is not a proof that every iterative rule is computationally irreducible. Combinatorial state-space growth does not guarantee unlimited novel structure in every finite system. A formal notation mixing thermodynamics and social field theory needs defined quantities and units before it is an empirical equation. Someone named Evelyn requires disambiguation, not inference from a familiar narrative. Similar phrases about "buff/nerf" and iterative control may describe overlapping methods without requiring a single flattened entry.

The raw expressions remain independent until a source-based, reviewable merger or split is explicitly commissioned. **Reinterpretation ≠ loss of provenance.**

### Future priority interface

See the wishlist in [ROADMAP.md](../ROADMAP.md). A human-scrollable, searchable, drag/reorder UI and review tray will be developed only in a subsequent, independently commissioned product stage. This package supplies the engine and stable IDs first.

𝄐 Khona‌lit-po · Rulefield ≠ Rule · Source-bound, not self-certifying.

### Nonexclusive type system

Rulefield ≠ Rule **does not entail disjoint object extensions**. See [Role Multiplicity](type_assessment/ROLE_MULTIPLICITY_ROD0002.md) and run `node scripts/rulefield-types.mjs roles I-001`. A historical rule is permitted to serve as a research field in another context while preserving the executable rule and evidence limits. Ten source-linked role fixtures are staged; none is a canonical change.
