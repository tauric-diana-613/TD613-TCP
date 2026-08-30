# A15-R0 · Finite Transport-Opacity / Origin-Selection Robustness — Preregistration v0.1

Status: PREREGISTRATION ONLY / CONDITIONAL ON #884 EXACT-HEAD SUCCESS / NO THEOREM AUTHORITY / NO MERGE.

## Conditional scientific parent

Intended parent: #884, Finite Orientation-Fibre Symmetry-Breaking Identifiability.

This successor branch was cut from #884 science head `3657b96372cbbfc91778139d986f4a78e9ec750b` before exact-head aggregate authority completed. Therefore this preregistration carries zero theorem authority until #884 itself earns exact-head success. If #884 fails scientifically rather than procedurally, this chamber MUST be revised or abandoned.

Earned lower floor remains #882 / `9456a6a44eaaff46fa796cd591bb2f61e3680187` / run 2389 SUCCESS.

## Parent-frozen algebraic object

From #882, the compatible orientation fibre is

`F={0000000001,0000000010,1111111101,1111111110}`

with inherited orientation

`tau*=1111111110`

and metric-isometry group

`G={id,(B M),(A R),(A R)(B M)}`

acting freely and transitively on `F`.

This is a finite regular group action / torsor structure only. It MUST NOT be promoted to physical gauge theory, a hidden physical state space, or continuum geometry.

## New object: residual transport set

For any declared witness `w:F->V`, let the inherited-value cell be

`C_w={tau in F : w(tau)=w(tau*)}`.

Using the parent free-transitive action, define the residual transport set

`S_w={g in G : w(g·tau*)=w(tau*)}`.

For a witness family `W`, define

`S_W = intersection_{w in W} S_w`.

Because the action is free and transitive, `g -> g·tau*` is bijective, so

`|S_W| = |C_W|`

for the inherited-value cell `C_W`, but the chamber MUST preserve transport identity rather than reporting cardinality alone.

## Core questions

1. Which nonidentity transports survive each parent-declared witness and witness family?
2. Do equal residual fibre cardinalities hide different surviving transport identities?
3. Under nested witness families, does the residual transport set form a monotone filtration

`G = S_emptyset >= S_W1 >= S_W2 >= ... >= {id}`

under set inclusion?
4. What is the minimum declared witness-family cardinality required to obtain `S_W={id}` inside each parent witness class?
5. How robust is origin selection to arbitrary witness erasure?

## Transport-separating rank

For any declared witness class `K`, define the finite class-relative transport-separating rank

`r_tr(K)=min{|W| : W subseteq K and S_W={id}}`

when such a family exists; otherwise report `IMPOSSIBLE_WITHIN_CLASS`.

This is a finite class-relative witness cardinality. It is NOT a Shannon bit count, minimum description length, universal identifiability rank, or action-generating rank.

## Transport-separation multiplicity

For a selected witness family `W`, define

`mu_tr(W)=min_{g != id} #{w in W : w(g·tau*) != w(tau*)}`.

The implementation MUST exhaustively test the finite deletion criterion for every selected family and every erasure budget admitted by its size:

`origin selection survives every deletion of at most e witnesses iff mu_tr(W) >= e+1`.

The theorem may be earned only as a finite deterministic result on the fixed parent fibre and declared witness families.

## Frozen witness classes

Conditional on #884 earning them exactly, inherit these four classes:

- specialization comparability predicates;
- principal-open identity witnesses;
- principal-open size witnesses;
- recovered-cut orientation coordinates.

For each singleton and each relevant finite identifying family, record:

- inherited-value fibre cell `C_W`;
- residual transport set `S_W` with explicit group elements;
- residual cardinality;
- setwise stabilizer of `C_W`;
- whether `S_W` is a subgroup (diagnostic only; no assumption that every residual set is one);
- exact origin-selection status;
- `mu_tr(W)`;
- arbitrary-erasure survival spectrum.

## Mandatory hostile controls

- Empty family: `S_emptyset=G`.
- Any constant witness leaves `S_w=G`.
- A witness cell of cardinality 2 MUST yield two residual transports, but those identities must be reported explicitly.
- Two witness cells with equal cardinality but different transported alternatives MUST remain distinct records.
- Setwise stabilizer and residual transport set MUST be computed independently and may not be conflated.
- Deleting all witnesses from an identifying family MUST restore `G`.
- A family with `mu_tr(W)=m` must survive every deletion of at most `m-1` witnesses and must have at least one size-`m` deletion that destroys selection when such deletion size is feasible.
- The inherited orientation may be selected only relative to the fixed parent labels, action, and witness family; no intrinsic canonical origin is inferred from the regular action alone.

## Candidate theorem shapes — NOT YET EARNED

### A. Action / origin non-equivalence

The regular action can be fully known while no point of the torsor is canonically distinguished without extra witness structure:

`ACTION RECOVERY != TORSOR-ORIGIN RECOVERY`.

### B. Transport-opacity filtration

Nested witness families monotonically shrink the set of admissible transports from `G` toward `{id}` without retroactively making the coarser aperture identifying.

### C. Erasure robustness

For the fixed finite deterministic family,

`arbitrary e-witness erasure survival <=> mu_tr(W)>=e+1`.

All three remain candidate statements until exact execution, hostile reconstruction, hardening, and exact-head authority succeed.

## Mandatory scars

`RESIDUAL TRANSPORT SET != SETWISE STABILIZER`

`RESIDUAL FIBRE CARDINALITY != RESIDUAL TRANSPORT IDENTITY`

`ACTION RECOVERY != TORSOR_ORIGIN_RECOVERY`

`TRANSPORT_SEPARATING_RANK != BEHAVIORAL_SEPARATING_RANK`

`TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK`

`FIBRE_IDENTIFIABILITY != WITNESS_CLASS_INDEPENDENT_IDENTIFIABILITY`

`LATER_SYMMETRY_BREAKING != PRIOR_METRIC_IDENTIFIABILITY`

`EQUAL_RESIDUAL_CARDINALITY != EQUAL_RESIDUAL_STRUCTURE`

`FREE_TRANSITIVE_FINITE_ACTION != PHYSICAL_GAUGE_THEORY`

`ORIENTATION_FIBRE != HIDDEN_STATE_SPACE`

`GROUP_VALUED_RELATIVE_DIFFERENCE != PHYSICAL_DISPLACEMENT`

`FINITE_ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY`

`FINITE_WITNESS_MULTIPLICITY != SHANNON_REDUNDANCY`

No merge, deployment, publication, production, release, Vercel, source-state mutation, Proto-Loom/A16, #788 promotion, continuum topology, physical gauge theory, physical geometry, Shannon/channel coding, or universal inverse theorem follows.

Sealed ⟐
