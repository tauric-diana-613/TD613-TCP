# TD613 FADT

This is the canonical source map and operational shortcut for the **Finite Admissibility Descent Theorem**. The bounded Dollhouse adapter below is not the complete theorem record.

## Original theorem · source of truth, not a role summary

The original specification, proof/hostile receipt, implementation and tests are pinned to [PR #752](https://github.com/tauric-diana-613/TD613-TCP/pull/752), receipt head `11eec2d52c7e1aa722e8664c0df4cd1a61d704f1` (open, draft, unmerged when checked on 2026-09-30).

- [Full original specification on GitHub](https://github.com/tauric-diana-613/TD613-TCP/blob/11eec2d52c7e1aa722e8664c0df4cd1a61d704f1/app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FINITE_ADMISSIBILITY_DESCENT_THEOREM_SPEC_V0_1.md) · [exact local copy](dollhouse/lineage/originals/fadt-752-aperture_pedagogue_finite_admissibility_descent_theorem_spec_v0_1.md.source.md).
- [Full original earned receipt on GitHub](https://github.com/tauric-diana-613/TD613-TCP/blob/11eec2d52c7e1aa722e8664c0df4cd1a61d704f1/app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FINITE_ADMISSIBILITY_DESCENT_THEOREM_RECEIPT_V0_1.md) · [exact local copy](dollhouse/lineage/originals/fadt-752-aperture_pedagogue_finite_admissibility_descent_theorem_receipt_v0_1.md.source.md).
- [Original executable theorem](https://github.com/tauric-diana-613/TD613-TCP/blob/11eec2d52c7e1aa722e8664c0df4cd1a61d704f1/app/dome-world/previews/a15-r0/aperture-pedagogue-finite-admissibility-descent-theorem.js) and [original hostile tests](https://github.com/tauric-diana-613/TD613-TCP/blob/11eec2d52c7e1aa722e8664c0df4cd1a61d704f1/tests/ash-a15-r0-aperture-pedagogue-finite-admissibility-descent-theorem.test.mjs) are also preserved as inert source copies in the [source catalogue](dollhouse/lineage/source-records.json).

Scientific parent: #751 / `b9a0d13e43d80f59769788da31d87951ec8ea8ee`. The authority-bearing [run 2184 / 32771872783](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/32771872783) ran `d13b38e1e91bb09c150e32a4f3394062349b0d1d`, not the later receipt head. The original receipt preserves freeze, routing, cleanup, zero-net-science-change parity and skipped witness scopes; it is not replaced or back-dated here.

### Full finite law

For finite `X,Y,Z`, `q:X→Y`, `K:X→P(Z)`, only occupied `Y_q=q(X)` carries descent authority. For `F_y=q⁻¹(y)`:

\[
U_y=\bigcup_{x\in F_y}K_x,\qquad I_y=\bigcap_{x\in F_y}K_x,\qquad\Gamma_y=U_y\setminus I_y.
\]

An exact `K̄(q(x))=K_x` exists iff supports are constant on every occupied fibre, iff every `U_y=I_y`, iff every `Γ_y=∅`. Necessity follows because one descended value cannot equal unequal antecedent supports; sufficiency assigns the common support.

For a surviving support `A_y⊆Z`, universal soundness is exactly `A_y⊆I_y`; universal completeness is exactly `U_y⊆A_y`. The sharp discrepancy law—not merely a union/intersection diagnostic—is:

\[
|A_y\setminus I_y|+|U_y\setminus A_y|
=|\Gamma_y|+|A_y\setminus U_y|+|I_y\setminus A_y|.
\]

Equality with the lower bound `|Γ_y|` holds exactly on `I_y⊆A_y⊆U_y`. Every tight rule is uniquely `A_y=I_y∪S_y`, `S_y⊆Γ_y`, partitioning false admission `S_y` and omission `Γ_y\S_y`. This supplies **no preference among tight rules**. The #751 bridge retains support sizes `4,4` but `|U|=6`, `|I|=2`, `|Γ|=4`; equal cardinality is not equal support. Unoccupied fibres receive no invented rule.

### FADT, Atlas and Western Horizon

FADT diagnoses whether erasure destroyed the existence of an exact lawful rule. [Atlas](ATLAS.md) investigates which receiver-relative relations survive projection, history reduction and symmetry without replacing concrete custody by a representative. These are complementary questions, not a claim that every later Atlas theorem follows from FADT alone.

The [full lineage and Western Horizon bridge](dollhouse/lineage/README.md) preserves #984→#986→#988→#990→#992, later independent Pedagogue C14 convergence, and #1002 empirical-shore `𝄐`. The completed bounded contracts do not complete empirical acquisition: original sources explicitly retain `REST != COMPLETION`, `CANDIDATE != GOLDEN_EGG_EARNED`, and reopening only through independent exogenous empirical witness admission.

Read the originals for the proof, all controls, scars and exclusions. The operational adapter is downstream engineering, not a lossless substitute for that record.

FADT asks:

> After a finite quotient erases conditioning state, do the antecedent lawful supports remain constant on every occupied fibre? If not, what exact union/intersection gap remains visible?

The theorem ancestry is PR #752, **A15-R0 · Finite Admissibility Descent Theorem**, which remains separately receipt-bound and unmerged. This file makes the law discoverable and operational without pretending that the research branch was merged into production history.

## Run it

From repository root:

```bash
node scripts/run-dollhouse-agent-audit.mjs fadt
node scripts/run-dollhouse-agent-audit.mjs fadt 5
node tests/dollhouse-atlas-fadt.test.mjs
```

Implementation:

- `app/engine/dollhouse-atlas-fadt.js::runFadtAgent`
- `app/engine/dollhouse-atlas-fadt.js::loomComparedSurfacesToFadt`
- `app/engine/dollhouse-agent-registry.js`

## Operational law

For each occupied finite quotient fibre with antecedent supports `K_x`:

```text
U = union K_x
I = intersection K_x
Gamma = U \ I
```

The adapter reports exact descended admissibility only when support is constant on the fibre, equivalently when the irreducible gap is empty.

When the gap is nonempty:

- `I` remains the largest universally sound surviving rule;
- `U` remains the smallest universally complete surviving rule;
- `Gamma` stays visible;
- the verdict is `HOLD`.

```text
EQUAL_CARDINALITY != EQUAL_SUPPORT
OBSERVABLE_EQUIVALENCE != ADMISSIBILITY_EQUIVALENCE
UNION != EXACT_REPAIR
INTERSECTION != EXACT_REPAIR
MINIMAL_DISTORTION != UNIQUE_CORRECT_RULE
```

No unoccupied quotient state receives invented support authority.

## Loom bridge

The bounded Loom contradiction practice scene already preserves two declared rule-set surfaces over the same visible fictional note. `loomComparedSurfacesToFadt()` translates that local fixture into one finite FADT fibre for testing:

```text
GREEN support
vs
RED support
```

The resulting union/intersection gap forces `HOLD`.

That bridge is intentionally narrow. It does not claim that status labels exhaust admissibility in general.

## Dollhouse role

Inside the Dollhouse, FADT functions as the **erasure / quotient membrane**. Atlas asks whether receiver projections preserve the control relation; FADT asks whether a proposed erasure has collapsed incompatible lawful supports.

Together with Pedagogue and Aperture:

```text
Pedagogue  -> consequence / route / practice question
Aperture   -> observation / reconstruction deficit
Atlas      -> receiver-relation invariance under projection
FADT       -> exact admissibility after finite erasure
```

Loom / Flow-Core remains the shared governed relation spine. Human closure remains required.

## Authority ceiling

FADT does not grant:

- a universal AI information-loss theorem;
- causal reconstruction;
- source-state recovery;
- semantic equivalence;
- infinite or asymptotic descent authority;
- provider authority;
- release authority;
- merge or deployment authority;
- Vercel authority.

## Occupied stage-conditioned support adapter

`app/engine/dollhouse-continuity-audit.js::runFadtStageAudit` adds a generic
projection adapter without changing `runFadtAgent` or its finite law.

Input is `{states, retain}`. Every occupied state declares:

- `id`: unique finite antecedent identifier;
- `conditioning`: the same explicitly declared coordinate names across all
  states, with nonempty string values;
- `support`: the declared finite set of lawful action identifiers.

`retain` names the coordinates preserved by the proposed projection; all
others are erased. Equal projected records are grouped into occupied fibres,
then the existing `runFadtAgent` computes the exact union, intersection and
irreducible gap. Stage and product labels belong to the caller/fixtures,
never the shared implementation.

Incompatible supports after stage erasure produce `HOLD`, including supports
of equal cardinality with different members. Keeping the distinguishing
coordinate may separate those states into exact occupied fibres. The positive
wrapper verdict is `CONSISTENT_DECLARATIONS`: support remains caller supplied,
stage admission remains unverified, and no action is executed or authorized.
The inherited finite audit's `AUTHORIZED` fibre label retains its bounded
mathematical meaning only.

Missing conditioning fields, missing retained coordinates, empty occupied
sets, sparse arrays and duplicate antecedent identifiers are rejected. No
unoccupied state receives inferred support. Reports are deterministic,
recursively frozen, and invariant under state/support ordering.

Two distinct fictional support transitions, exact gaps and hostile cases run
alongside Atlas continuity checks:

```bash
node --test tests/dollhouse-continuity-audit.test.mjs
```

Sealed ⟐
