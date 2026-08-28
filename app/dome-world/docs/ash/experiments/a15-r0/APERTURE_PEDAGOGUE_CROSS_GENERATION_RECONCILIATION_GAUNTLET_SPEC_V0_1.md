# Aperture × Pedagogue Cross-Generation Reconciliation Gauntlet v0.1

Status: **PREREGISTERED / SYNTHETIC / A15-R0 / CROSS-GENERATION-RECONCILIATION / NON-RUNTIME / NON-PRODUCTION**  
Preregistration boundary: **frozen before the R2 executable implementation.**

## 0. Research question

The preceding bounded synthetic chamber witnessed one additional generation of prospective counterfactual branching while preserving typed provenance through the authored prospective continuation `P`, the prior reconciliation `R1`, and selected generation-one counterfactual state `A`, with the full generation-one and generation-two alternative sets retained and no transitive historical collapse.

This gauntlet asks the next narrower question:

> **Can a later authored reconciliation event R2 reference the complete generation-two counterfactual sibling universe, select one generation-two branch only for prospective continuation, and preserve P/R1/A/H plus the full generation-one and generation-two provenance record without converting recursive reconciliation into recursive historical realization?**

The fixture is entirely synthetic. `generation`, `reconciliation`, `lineage`, `branch`, `selection`, `descend`, and `history` are bounded fixture terms. They do not assert structural-causal-model semantics, possible-worlds metaphysics, branching-time logic, database/event-sourcing durability, Git ancestry, physical causation, or historical realization.

Core anti-collapse law:

```text
recursive reconciliation != recursive realization
```

## 1. Frozen object grammar

```text
H  = retained shared historical/custody prefix
A/B/C/D = generation-one COUNTERFACTUAL_ONLY branch receipts derived from H
R1 = authored reconciliation selecting A only for prospective continuation
P  = authored prospective continuation with typed dual lineage through R1 and A
G2_ALPHA / G2_BETA / G2_GAMMA = generation-two COUNTERFACTUAL_ONLY branches derived prospectively from P
R2 = later authored reconciliation over the COMPLETE G2 sibling universe
```

Primary generation-two universe:

```text
G2_ALPHA
G2_BETA
G2_GAMMA
```

Frozen R2 selection for this fixture:

```text
selected_generation_two_branch_id = G2_ALPHA
selection_semantics = SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION_ONLY
```

Required anti-collapse relation:

```text
H != A != R1 != P != G2_i != R2
```

and:

```text
selected for prospective continuation != historically realized
recursive reconciliation != recursive realization
retained provenance != inherited truth
```

## 2. Frozen R2 schema

A valid R2 receipt must expose at least:

```text
schema
reconciliation_id = R2_RECONCILE_G2_SELECT_ALPHA
event_status = RECONCILIATION_ONLY
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
manifestly_fictional = true
authorship_order = AFTER_GENERATION_TWO_BRANCHING
generation_reconciled = 2
reconciliation_mode = COMPLETE_TYPED_CROSS_GENERATION_RECONCILIATION
selection_semantics = SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION_ONLY
selected_generation_two_branch_id = G2_ALPHA
selected_generation_two_branch_status = COUNTERFACTUAL_ONLY
selected_generation_two_branch_historical = false
historical_realization_claim = false
```

R2 must retain the complete generation-two sibling universe:

```text
generation_two_branch_universe_ids = [G2_ALPHA, G2_BETA, G2_GAMMA]
retained_generation_two_branch_receipts = exact immutable snapshots of all three G2 receipts
```

R2 must also retain separately typed inherited provenance context:

```text
provenance_roles = [
  COMPLETE_GENERATION_TWO_RECONCILIATION_UNIVERSE,
  INHERITED_PROSPECTIVE_CONTEXT,
  INHERITED_RECONCILIATION_CONTEXT,
  INHERITED_COUNTERFACTUAL_STATE_PROVENANCE
]

prospective_context_id = P.prospective_event_id
prospective_context_snapshot = P
prior_reconciliation_context_id = R1.reconciliation_id
prior_reconciliation_context_snapshot = R1
inherited_counterfactual_state_branch_id = A.branch_id
inherited_counterfactual_state_status = COUNTERFACTUAL_ONLY
inherited_counterfactual_state_snapshot = A.current_state_signature
```

R2 must preserve the retained historical/shared-prefix and generation-one record:

```text
shared_prefix_snapshot = P.shared_prefix_snapshot
shared_prefix_event_ids = P.shared_prefix_event_ids
retained_generation_one_branch_ids = P.declared_branch_universe_ids
retained_generation_one_branch_receipts = P.retained_branch_receipts
```

Authority/closure fields are frozen:

```text
historical_custody_mutated = false
prior_reconciliation_mutated = false
prospective_context_mutated = false
generation_one_branch_deleted = false
generation_two_branch_deleted = false
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

Generic `parent` / `parents` fields are forbidden. Generic `winner` semantics are forbidden.

## 3. Frozen complete-universe law

R2 is not a reconciliation over a winner-only receipt. It must be authored against all three generation-two siblings simultaneously.

Required:

```text
generation_two_branch_universe_ids == [G2_ALPHA, G2_BETA, G2_GAMMA]
retained_generation_two_branch_receipts.length == 3
```

Each retained G2 receipt must independently remain valid under the preregistered generation-two grammar.

Selecting `G2_ALPHA` does not authorize deletion, merge, demotion, rewriting, or historical promotion of `G2_BETA` or `G2_GAMMA`.

## 4. Frozen recursive non-realization law

A valid R2 receipt must preserve all of the following simultaneously:

```text
A.branch_status = COUNTERFACTUAL_ONLY
P.selected_branch_status = COUNTERFACTUAL_ONLY
P.selected_branch_historical = false
P.historical_realization_claim = false
G2_ALPHA.branch_status = COUNTERFACTUAL_ONLY
G2_BETA.branch_status = COUNTERFACTUAL_ONLY
G2_GAMMA.branch_status = COUNTERFACTUAL_ONLY
R2.selected_generation_two_branch_status = COUNTERFACTUAL_ONLY
R2.selected_generation_two_branch_historical = false
R2.historical_realization_claim = false
```

Neither an earlier reconciliation nor a later reconciliation may be used as evidence that a selected unrealized state became historical.

## 5. Frozen source immutability law

Authoring or validating R2 may not mutate any source object:

```text
H
A/B/C/D
R1
P
G2_ALPHA/G2_BETA/G2_GAMMA
```

Every source remains independently replayable/referenceable after R2 is authored.

## 6. Frozen typed provenance law

R2 must preserve exactly four typed provenance roles in the declared order:

```text
1. COMPLETE_GENERATION_TWO_RECONCILIATION_UNIVERSE
2. INHERITED_PROSPECTIVE_CONTEXT
3. INHERITED_RECONCILIATION_CONTEXT
4. INHERITED_COUNTERFACTUAL_STATE_PROVENANCE
```

The first role refers to the complete ordered G2 sibling set. The remaining roles refer to P, R1, and A respectively.

Typed roles may not be reordered, renamed, flattened, substituted, or collapsed into generic ancestry.

## 7. Frozen hostile controls

### H1 — incomplete G2 universe
Delete `G2_BETA` or `G2_GAMMA` from the reconciliation universe.  
Required: `REJECT`.

### H2 — G2 receipt substitution
Duplicate one G2 receipt under another sibling identity or replace a sibling snapshot with another.  
Required: `REJECT`.

### H3 — selected branch switch
Change the preregistered selection from `G2_ALPHA`.  
Required: `REJECT`.

### H4 — selected G2 historical laundering
Set selected generation-two status/historical flags to historical or realized.  
Required: `REJECT`.

### H5 — unselected G2 historical laundering
Promote `G2_BETA` or `G2_GAMMA` inside the retained snapshots.  
Required: `REJECT`.

### H6 — G2 sibling deletion flag
Set `generation_two_branch_deleted = true`.  
Required: `REJECT`.

### H7 — sibling merge
Set `sibling_merge_performed = true`.  
Required: `REJECT`.

### H8 — generation-one branch deletion/collapse
Delete B/C/D from retained generation-one ids/receipts or set `generation_one_branch_deleted = true`.  
Required: `REJECT`.

### H9 — P snapshot rewrite
Mutate any retained prospective-context field.  
Required: `REJECT`.

### H10 — R1 replacement or rewrite
Replace R1 with R2, another reconciliation id, or a rewritten R1 snapshot.  
Required: `REJECT`.

### H11 — A provenance switch or historical laundering
Switch inherited state provenance A -> B or relabel A historical.  
Required: `REJECT`.

### H12 — H/shared-prefix rewrite
Mutate a shared-prefix event, id, or snapshot.  
Required: `REJECT`.

### H13 — backdating R2
Set `authorship_order != AFTER_GENERATION_TWO_BRANCHING`.  
Required: `REJECT`.

### H14 — generation laundering
Set `generation_reconciled != 2`.  
Required: `REJECT`.

### H15 — provenance-role swap
Preserve referents but attach them to the wrong typed roles or order.  
Required: `REJECT`.

### H16 — generic-parent flattening
Add `parent` or `parents`, or replace typed provenance with generic ancestry.  
Required: `REJECT`.

### H17 — winner laundering
Add a generic `winner` field or semantics that imply ontological/historical victory.  
Required: `REJECT`.

### H18 — majority-vote laundering
Set `majority_vote_used = true`.  
Required: `REJECT`.

### H19 — confidence-scalar collapse
Set `combined_confidence_scalar != null`.  
Required: `REJECT`.

### H20 — autonomous selection
Set `autonomous_selection = true`.  
Required: `REJECT`.

### H21 — automatic execution / prospective execution authority
Enable any execution authority.  
Required: `REJECT`.

### H22 — historical custody mutation
Set `historical_custody_mutated = true` or rewrite retained H.  
Required: `REJECT`.

### H23 — recursive realization laundering
Set `historical_realization_claim = true`, or make R2 selection imply that P/R1/A/G2_ALPHA became historical.  
Required: `REJECT`.

### H24 — stage/promotion escape
Any true/non-null/non-empty widening through:

```text
historical_promotion_authorized
production_mutated
installed_aperture_mutated
pedagogue_law_promoted
sequence_authority
next_stage
stage_unlocks
promotion_authority
```

Required: `REJECT`.

### H25 — source mutation
If authoring or validating R2 mutates H, A/B/C/D, R1, P, or any G2 receipt, the gauntlet fails.  
Required: `REJECT` / gauntlet failure.

## 8. Frozen bounded success criterion

The gauntlet passes only if:

```text
R1 remains valid
P remains valid and non-historical
A/B/C/D remain COUNTERFACTUAL_ONLY
all three G2 siblings remain valid and COUNTERFACTUAL_ONLY
R2 is authored strictly after generation-two branching
R2 reconciles exactly the complete G2 sibling universe
R2 selects G2_ALPHA only for prospective continuation
selected G2_ALPHA remains COUNTERFACTUAL_ONLY and non-historical
G2_BETA and G2_GAMMA remain retained, distinct, and non-historical
R2 preserves exact typed provenance roles for G2 universe / P / R1 / A
R2 preserves exact H/shared-prefix snapshot and ids
R2 preserves all four generation-one branch ids and receipts
R2 preserves all three generation-two branch receipts
no prior source object is mutated
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

> **In this finite synthetic fixture, a later authored reconciliation can operate over a complete second-generation counterfactual sibling set, preserve typed provenance through P/R1/A/H and both branch generations, and select one branch solely for prospective continuation without recursively laundering selection into historical realization.**

## 9. Kill criterion

The cross-generation reconciliation grammar fails if R2 cannot reconcile the complete G2 sibling universe while preserving every prior provenance layer, every retained alternative set, and historical non-realization without source mutation or authority widening.

A failure remains a failure. No post hoc universe repair, lineage relabeling, branch restoration, or claim narrowing may be treated as confirmatory evidence for this preregistered assay.

## 10. Core anti-equivalences

```text
recursive reconciliation != recursive realization
selection != historical realization
later reconciliation != retroactive truth
complete branch retention != consensus
selected branch != winner
branch set != voting population
branch count != confidence
provenance depth != causal depth
reconciliation depth != historical depth
generation index != stage index
retained source snapshot != inherited authority
counterfactual continuity != prediction
synthetic reconciliation != execution authority
```

## 11. Claim ceiling

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

## 12. Frozen next learning action

Only after this R2 assay is witnessed may the frontier consider:

```text
TEST_POST_R2_PROSPECTIVE_CONTINUATION_WITH_TYPED_REFERENCE_TO_R2_AND_SELECTED_G2_STATE_WHILE_RETAINING_BOTH_GENERATION_UNIVERSES_WITHOUT_RECURSIVE_HISTORICAL_COLLAPSE
```

That later chamber remains held and must not be implemented in this preregistration commit.
