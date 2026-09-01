# A15-R0 · Atlas Weighted 2-Section / Stratified Möbius Reconstruction · Preregistration v0.1

Parent authority: exact earned #944 / `578be6f432cffa67dbaf6da0a47cb9d36c0fb68f` / run 2424 / 33465942939 SUCCESS / A15-R0 step 19 SUCCESS.

Status: preregistered successor only; theorem UNEARNED until exact-head constitutional GREEN.

## Question
Can the linearity hypothesis of #944 be removed if Atlas replaces the unweighted overlap graph by the weighted 2-section and retains exact multiplicities of every incidence support of cardinality at least three?

Let the labeled block set be `I={0,...,m-1}`. For each ground element `e`, its incidence support is `supp(e)={i:e∈B_i}`. Let

`mu(S)=#{e : supp(e)=S}`

for nonempty `S⊆I`. Union-groundedness fixes `mu(∅)=0`.

Receiver:

- vertex capacity `c_i=|B_i|`;
- weighted pair intersection `w_ij=|B_i∩B_j|` for every `i<j`;
- exact high-support multiplicity `mu(S)` for every `|S|>=3`.

These are zeta sums on the support-multiplicity function:

`c_i = Σ_{S⊇{i}} mu(S)`

`w_ij = Σ_{S⊇{i,j}} mu(S)`.

Frozen reconstruction law:

`mu({i,j}) = w_ij - Σ_{S⊇{i,j}, |S|>=3} mu(S)`

then

`mu({i}) = c_i - Σ_{S⊇{i}, |S|>=2} mu(S)`.

Thus every nonempty support multiplicity is recovered exactly. This is a descending finite zeta/Möbius reconstruction, not causal inversion and not historical-source recovery.

## Frozen algebraic theorem candidate
For every finite union-grounded incidence system with labeled blocks, the receiver `(capacity vector, weighted 2-section, exact multiplicities of all supports of size >=3)` reconstructs the complete nonempty incidence-support multiplicity function exactly, hence reconstructs the incidence-neighborhood multiset up to ground-element relabeling. Neither global uniformity nor pairwise linearity is required.

## Exhaustive executable assay
Ground set `{0,1,2,3,4,5}`. Block pool: every 2-, 3-, and 4-subset, exactly 50 labeled candidate blocks. Enumerate every 1-, 2-, and 3-block family:

- family profile: `50, 1225, 19600`;
- total families: `20875`;
- total blocks: `61300`;
- pair checks: `60025`;
- raw ground/block membership evaluations: `367800`;
- raw incidence-neighborhood entries: `109500`.

Frozen structural census:

- nonuniform families: `18375`;
- nonlinear families (some pair intersection >1): `16490`;
- nonlinear + nonuniform: `14820`;
- families with at least one support of size >=3: `11405`;
- nonlinear + marked: `11015`;
- high-support multiplicity histogram: multiplicity 1 => `9090`, 2 => `2235`, 3 => `80`;
- residual degree-2 support entries with multiplicity >1: `8700`.

Frozen receiver result:

- weighted reconstruction successes: `20875`;
- weighted reconstruction failures: `0`;
- unweighted reconstruction successes: `4385`;
- unweighted reconstruction failures: `16490`;
- therefore, inside this declared exhaustive assay, `UNWEIGHTED_FAILURE_SET = NONLINEAR_SET` exactly.

Weighted pair census:

- positive weighted pair entries: `53655`;
- pair-weight sum: `88200`;
- residual positive degree-2 pair entries after subtracting high-support contributions: `37500`;
- residual degree-2 multiplicity sum: `46800`;
- maximum pair weight: `3`;
- maximum high-support multiplicity: `3`;
- maximum residual degree-2 multiplicity: `3`.

## Negative / necessity controls
1. Unweighted 2-section must fail whenever repeated pair-overlap multiplicity is present in the declared assay.
2. Removing capacity labels leaves degree-1 multiplicities underdetermined.
3. Removing high-support multiplicities makes pair weights insufficient to decide how overlap weight is bundled into degree>=3 versus degree-2 supports.
4. Adding isolated declared ground elements remains invisible; union-groundedness is required.

## Candidate bounded 𝄐
`FOR_EVERY_FINITE_UNION_GROUNDED_LABELED_INCIDENCE_SYSTEM_THE_BLOCK_CAPACITY_VECTOR_PLUS_WEIGHTED_2_SECTION_PLUS_EXACT_MULTIPLICITIES_OF_ALL_SUPPORTS_OF_SIZE_AT_LEAST_THREE_RECOVERS_THE_COMPLETE_NONEMPTY_INCIDENCE_SUPPORT_MULTIPLICITY_FUNCTION_BY_DESCENDING_ZETA_MOBIUS_RECONSTRUCTION; LINEARITY_AND_UNIFORMITY_ARE_NOT_REQUIRED.`

Mandatory membranes:

- `WEIGHTED_2SECTION_PLUS_HIGH_SUPPORTS != UNIVERSAL_COMPRESSION`
- `SUPPORT_MULTIPLICITY_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY`
- `ZETA_MOBIUS_RECONSTRUCTION != CAUSAL_INVERSION`
- `PAIR_INTERSECTION_WEIGHT != PHYSICAL_EDGE_WEIGHT`
- `HIGH_SUPPORT_MULTIPLICITY != CAUSAL_CONCURRENCY`
- `BLOCK_LABEL != PHYSICAL_ENTITY_IDENTITY`
- `UNION_GROUNDEDNESS != COMPLETE_EXTERNAL_GROUND_KNOWLEDGE`
- `FINITE_EXHAUSTIVE_ASSAY != PROOF_BY_SAMPLING`
- `ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`
- `A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION`
- `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐
