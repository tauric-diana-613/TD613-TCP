# A15-R0 · Finite Orientation-Fibre Transport-Opacity / Witness-Erasure Robustness — Preregistration v0.1

Status: **PREREGISTERED BEFORE THEOREM CODE**.

Exact earned parent: `faef60c732e057fe6c678fe4cc7ae7318192f694` (#884; TD613 Consolidated Validation run 2393 / 33289854969 SUCCESS).

## Frozen finite specimen

Use only the earned #884 four-topology orientation fibre, inherited point `tau*=1111111110`, its earned four-element metric-isometry action `G={id,(B M),(A R),(A R)(B M)}`, and the four declared #884 witness classes:

- 20 specialization-comparability predicates;
- 5 principal-open identity witnesses;
- 5 principal-open size witnesses;
- 10 recovered-cut orientation coordinates.

No new topology, metric, physical sensor, stochastic channel, semantic label, or source-state coordinate may be introduced.

## Transport-opacity object

Because the #882/#884 action on the four-point fibre is free and transitive, each compatible topology equals `g tau*` for a unique `g in G`.

For an inherited-valued witness `w`, define the residual transport set

`S_w = { g in G : w(g tau*) = w(tau*) }`.

For a selected witness family `W`, define

`S_W = intersection_{w in W} S_w`.

`W` identifies the inherited orientation exactly iff `S_W={id}`.

This residual transport set is NOT preregistered as a subgroup and is NOT the setwise stabilizer of the residual topology cell. The chamber must compute both objects separately and preserve counterexamples when they differ.

## Preregistered robustness statistic

For every selected witness family `W`, define

`mu_tr(W) = min_{g != id} #{ w in W : w(g tau*) != w(tau*) }`.

For each exact erasure count `e`, directly enumerate every `E subseteq W` with `|E|=e` and test whether `S_{W\E}={id}`.

### Candidate exact finite equivalence

For this fixed finite torsor and declared witness family:

`every exact-e witness deletion preserves inherited-origin identification`

IFF

`mu_tr(W) >= e+1`.

The implementation must test the equivalence by direct deletion enumeration rather than assert it from analogy with #878.

## Frozen census plan

For each of the four #884 witness classes independently:

1. enumerate all `2^n` selected witness families;
2. compute each family's inherited residual topology cell `F_W`;
3. compute `S_W` from the group action directly;
4. compute the exact setwise stabilizer of `F_W` separately;
5. record whether `S_W` equals that stabilizer;
6. compute `mu_tr(W)`;
7. enumerate exact-e deletions for `e=0..min(4,|W|)`;
8. compare direct erasure survival with the `mu_tr>=e+1` criterion;
9. record the exact-family count, `mu_tr` spectrum, robust-family counts by e, and minimum witness width surviving e arbitrary deletions when such families exist;
10. record the transport-separating rank `r_tr=min |W|` over exact identifying families.

Cross-class unions are OUT OF SCOPE in this chamber; otherwise the much larger mixed vocabulary would confound witness-class redundancy with within-class robustness.

## Frozen positive and negative controls

- empty witness family leaves all four transports;
- any #884 singleton identifying witness must have `S_W={id}` and `mu_tr=1`;
- every single cut-orientation coordinate must leave exactly two transports;
- every single principal-open-size witness must fail singleton identification;
- at least one declared residual cell must witness `RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER` if the earned data support such a counterexample; if none exists, report zero rather than manufacture one;
- criterion mismatches must equal zero for theorem success.

## Claim ceiling / mandatory scars

`RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER`

`TRANSPORT_SEPARATING_RANK != BEHAVIORAL_SEPARATING_RANK`

`TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK`

`WITNESS_ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY`

`SEPARATION_MULTIPLICITY != SHANNON_DISTANCE`

`FINITE_WITNESS_WIDTH != MINIMUM_BIT_LENGTH`

`METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS`

`FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY`

`CUT_ORIENTATION_COORDINATE != PHYSICAL_ORIENTATION`

`ORIENTATION_FIBRE != HIDDEN_STATE_SPACE`

`LATER_SYMMETRY_BREAKING != PRIOR_METRIC_IDENTIFIABILITY`

`WITNESS_ROUTING != SCIENTIFIC_ANCESTRY`

No merge, deployment, publication, production, release, Vercel, source-state mutation, physical gauge theory, coding-capacity theorem, Shannon/entropy theorem, continuum topology, universal inverse-problem theorem, or natural-language semantic reconstruction follows.

Sealed ⟐