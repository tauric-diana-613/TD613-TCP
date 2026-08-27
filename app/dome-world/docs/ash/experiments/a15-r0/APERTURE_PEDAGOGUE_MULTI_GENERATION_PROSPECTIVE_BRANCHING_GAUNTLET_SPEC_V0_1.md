# Aperture × Pedagogue Multi-Generation Prospective Branching Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / CROSS-GENERATION-TYPED-LINEAGE / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before generation-two executable implementation.**

## 0. Research question

The preceding bounded synthetic chamber established that a post-reconciliation prospective continuation can preserve two distinct typed provenance roles:

```text
RECONCILIATION_CONTEXT -> R
COUNTERFACTUAL_STATE_INPUT -> A
```

without relabeling the selected branch as historical, deleting unselected branches, or rewriting the shared retained prefix.

This gauntlet asks the next narrower question:

> **Can one additional generation of prospective counterfactual branching descend from the authored prospective continuation P while preserving the inherited reconciliation and selected-state provenance as separately typed lineage, retaining the full generation-one branch universe, and refusing transitive historical collapse?**

The fixture is entirely synthetic. `generation`, `lineage`, `descend`, `fork`, and `branch` are bounded provenance terms inside this assay. They do not assert biological ancestry, causal parenthood, structural causal model semantics, possible-worlds metaphysics, branching-time logic, Git ancestry, database durability, or historical realization.

## 1. Frozen object grammar

```text
H = retained shared historical/custody prefix
A/B/C/D = generation-one COUNTERFACTUAL_ONLY branch receipts derived from H
R = authored reconciliation event selecting A for prospective continuation
P = authored prospective continuation with typed dual lineage through R and A
G2_i = generation-two COUNTERFACTUAL_ONLY branches derived prospectively from P
```

Primary generation-two universe:

```text
G2_ALPHA
G2_BETA
G2_GAMMA
```

Required anti-collapse relation:

```text
H != A != R != P != G2_i
```

and:

```text
transitive provenance != transitive realization
```

## 2. Frozen generation-two lineage grammar

Every valid `G2_i` must carry exactly three typed lineage legs, in this order:

### L1 — direct prospective derivation source

```text
lineage_role = DIRECT_PROSPECTIVE_DERIVATION_SOURCE
referent = P
```

Meaning only:

```text
G2_i was authored as a prospective synthetic derivative of P
```

It does not mean P is historical.

### L2 — inherited reconciliation context

```text
lineage_role = INHERITED_RECONCILIATION_CONTEXT
referent = R
```

Meaning only:

```text
G2_i preserves the reconciliation context under which P was authored
```

It does not mean R supplies historical truth.

### L3 — inherited counterfactual state provenance

```text
lineage_role = INHERITED_COUNTERFACTUAL_STATE_PROVENANCE
referent = A
```

Meaning only:

```text
G2_i preserves which generation-one COUNTERFACTUAL_ONLY state supplied P's state input
```

It does not mean A became historical.

A generic `parent` or `parents` field is forbidden.

## 3. Frozen generation-two branch schema

Each generation-two branch must expose at least:

```text
schema
branch_id
branch_status = COUNTERFACTUAL_ONLY
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
manifestly_fictional = true
generation = 2
authorship_order = AFTER_PROSPECTIVE_CONTINUATION
lineage_mode = TYPED_CROSS_GENERATION_LINEAGE
lineage = [L1, L2, L3]
direct_prospective_source_id = P.prospective_event_id
direct_prospective_source_snapshot = P
inherited_reconciliation_context_id = R.reconciliation_id
inherited_reconciliation_context_snapshot = R
inherited_counterfactual_state_branch_id = A.branch_id
inherited_counterfactual_state_snapshot = A.current_state_signature
shared_prefix_snapshot = P.shared_prefix_snapshot
shared_prefix_event_ids = P.shared_prefix_event_ids
retained_generation_one_branch_ids = P.declared_branch_universe_ids
retained_generation_one_branch_receipts = P.retained_branch_receipts
generation_two_sibling_ids = [G2_ALPHA, G2_BETA, G2_GAMMA]
prospective_variant_id
current_state_signature
historical_realization_claim = false
historical_custody_mutated = false
prior_generation_mutated = false
shared_history_rewritten = false
generation_one_branch_deleted = false
generation_two_sibling_deleted = false
sibling_merge_performed = false
majority_vote_used = false
autonomous_selection = false
combined_confidence_scalar = null
historical_promotion_authorized = false
prospective_execution_authority = false
automatic_execution = false
production_mutated = false
installed_aperture_mutated = false
pedagogue_law_promoted = false
sequence_authority = false
next_stage = null
stage_unlocks = []
promotion_authority = false
human_closure_required = true
```

## 4. Frozen generation-two state mutation ceiling

This assay is a lineage-integrity experiment, not a downstream decision experiment.

Therefore `G2_i.current_state_signature` may only:

1. preserve an exact snapshot of `P.counterfactual_state_snapshot`; and
2. add a manifestly synthetic research-only variant marker:

```text
prospective_variant_id = G2_ALPHA | G2_BETA | G2_GAMMA
prospective_variant_note = RESEARCH_ONLY_COUNTERFACTUAL_VARIANT
```

The assay may not invent a new decision consequence, custody consequence, runtime consequence, world event, user action, or production effect.

## 5. Frozen source immutability law

Authoring generation-two branches may not mutate any of:

```text
H
A
B
C
D
R
P
```

The generation-one branch universe and P/R snapshots must remain independently replayable/referenceable after all three `G2_i` objects are authored.

## 6. Frozen generation-one retention law

Every `G2_i` must retain the exact full generation-one universe already carried by P:

```text
G2_i.retained_generation_one_branch_ids == P.declared_branch_universe_ids
G2_i.retained_generation_one_branch_receipts == P.retained_branch_receipts
```

Using A as inherited state provenance does not authorize deletion, collapse, merge, demotion, or historical promotion of B/C/D.

## 7. Frozen sibling retention law

Every generation-two branch must name the same complete generation-two sibling universe:

```text
[G2_ALPHA, G2_BETA, G2_GAMMA]
```

No sibling is a winner. No sibling may delete, merge, vote out, supersede, or become historical merely because another sibling is later referenced.

## 8. Frozen historical non-realization law

Required for all generation-two branches:

```text
G2_i.branch_status = COUNTERFACTUAL_ONLY
G2_i.historical_realization_claim = false
P.selected_branch_historical = false
P.historical_realization_claim = false
P.selected_branch_status = COUNTERFACTUAL_ONLY
A.branch_status = COUNTERFACTUAL_ONLY
```

A valid generation-two derivation may preserve transitive provenance through P/R/A without promoting any referenced unrealized state into historical fact.

## 9. Frozen hostile controls

### H1 — direct-source skip

Point `DIRECT_PROSPECTIVE_DERIVATION_SOURCE` directly to A or R instead of P.

Required: `REJECT`.

### H2 — inherited reconciliation switch

Point `INHERITED_RECONCILIATION_CONTEXT` to an object other than R.

Required: `REJECT`.

### H3 — inherited state branch switch

Change inherited state provenance A -> B.

Required: `REJECT`.

### H4 — lineage-role/referent swap

Preserve the same three ids but attach them to the wrong lineage roles or order.

Required: `REJECT`.

### H5 — generic-parent flattening

Replace typed lineage with `parent` or `parents`.

Required: `REJECT`.

### H6 — generation laundering

Set:

```text
generation != 2
```

Required: `REJECT`.

### H7 — backdating

Set:

```text
authorship_order != AFTER_PROSPECTIVE_CONTINUATION
```

Required: `REJECT`.

### H8 — P historical laundering

Rewrite the retained P snapshot so that P or its selected state is historical.

Required: `REJECT`.

### H9 — A historical laundering

Set A's retained status or inherited state provenance to a historical/realized status.

Required: `REJECT`.

### H10 — P snapshot rewrite

Mutate any retained direct-source snapshot field.

Required: `REJECT`.

### H11 — R snapshot rewrite

Mutate any retained reconciliation-context snapshot field.

Required: `REJECT`.

### H12 — H/shared-prefix rewrite

Mutate any shared-prefix event, id, or snapshot field.

Required: `REJECT`.

### H13 — generation-one branch deletion/collapse

Delete B, C, or D from the retained generation-one universe, or set:

```text
generation_one_branch_deleted = true
```

Required: `REJECT`.

### H14 — generation-two sibling deletion

Delete a sibling id or set:

```text
generation_two_sibling_deleted = true
```

Required: `REJECT`.

### H15 — sibling merge

Set:

```text
sibling_merge_performed = true
```

Required: `REJECT`.

### H16 — majority-vote winner laundering

Set:

```text
majority_vote_used = true
```

or add any winner field.

Required: `REJECT`.

### H17 — autonomous selection laundering

Set:

```text
autonomous_selection = true
```

Required: `REJECT`.

### H18 — confidence scalar collapse

Set:

```text
combined_confidence_scalar != null
```

Required: `REJECT`.

### H19 — invented downstream consequence

Alter the inherited state beyond the preregistered research-only variant marker.

Required: `REJECT`.

### H20 — authority widening

Any true/non-null/non-empty authority must reject, including:

```text
historical_promotion_authorized
prospective_execution_authority
automatic_execution
production_mutated
installed_aperture_mutated
pedagogue_law_promoted
sequence_authority
next_stage
stage_unlocks
promotion_authority
```

Required: `REJECT`.

### H21 — source mutation

If authoring any `G2_i` mutates H, A/B/C/D, R, or P, the assay fails.

Required: `REJECT` / gauntlet failure.

## 10. Frozen bounded success criterion

The gauntlet passes only if:

```text
R remains valid
P remains valid
A/B/C/D remain COUNTERFACTUAL_ONLY
P remains non-historical
all three G2 branches are COUNTERFACTUAL_ONLY
all three G2 branches declare generation = 2
each G2 branch carries exactly three typed lineage legs
L1 = DIRECT_PROSPECTIVE_DERIVATION_SOURCE -> P
L2 = INHERITED_RECONCILIATION_CONTEXT -> R
L3 = INHERITED_COUNTERFACTUAL_STATE_PROVENANCE -> A
all G2 branches retain exact H/shared prefix
all G2 branches retain all four generation-one branch receipts
all G2 branches retain all three generation-two sibling ids
no G2 branch claims historical realization
no G2 branch mutates H, A/B/C/D, R, or P
no sibling is selected, merged, deleted, voted, or promoted
all hostile controls reject
combined_confidence_scalar = null
historical_custody_mutated = false
production_mutated = false
sequence_authority = false
next_stage = null
stage_unlocks = []
promotion_authority = false
human_closure_required = true
```

A passing result may support only this bounded refinement candidate:

> **In this finite synthetic fixture, one additional generation of prospective counterfactual branching can retain a typed derivation chain through P while preserving R/A/H as immutable referenced provenance and leaving generation-one and generation-two alternatives intact without transitive historical collapse.**

## 11. Kill criterion

The cross-generation grammar fails if one additional prospective generation cannot preserve exact typed lineage, full retained alternative sets, and historical non-realization without mutating prior objects or widening authority.

A failure must remain a failure; no post hoc lineage repair is confirmatory.

## 12. Core anti-equivalences

```text
transitive provenance != transitive realization
derivation generation != historical generation
direct derivation source != causal parent
inherited context != inherited truth
inherited state provenance != realized state
counterfactual child != future prediction
prospective fork != runtime fork
sibling set != voting population
retention != consensus
branch count != confidence
lineage depth != causal depth
generation index != stage index
synthetic derivation != execution authority
```

## 13. Claim ceiling

No passing result grants authority for:

```text
historical adjudication
causal identification
causal DAG theorem
structural causal model theorem
potential-outcomes theorem
branching-time theorem
possible-worlds theorem
event-sourcing theorem
database ancestry theorem
database durability theorem
Git/version-control theorem
cryptographic append-only guarantee
Bayesian filtering theorem
Bayesian model selection
prediction
active learning
reinforcement learning
planning
autonomous branch generation
autonomous branch selection
autonomous reconciliation
autonomous execution
optimal experimental design
physical sensor feedback
physical tomography
blind tomography
operator tomography
connection
curvature
Berry structure
holonomy
TD613-general AIA theorem
Proto-Loom
production mutation
Vercel release
```

Installed Aperture remains unchanged. Pedagogue law promotion remains false. Historical custody remains unchanged. A15-R0 remains phase-free. A16 remains held.

## 14. Frozen next learning action

Only after the multi-generation branching assay is witnessed may the frontier consider:

```text
TEST_RECONCILIATION_ACROSS_GENERATIONS_WHERE_A_LATER_AUTHORED_EVENT_REFERENCES_MULTIPLE_GENERATION_TWO_COUNTERFACTUAL_BRANCHES_WHILE_PRESERVING_GENERATION_ONE_AND_SHARED_PREFIX_LINEAGE_WITHOUT_TRANSITIVE_HISTORICAL_COLLAPSE
```

That later cross-generation reconciliation question remains held and must not be implemented in this preregistration commit.
