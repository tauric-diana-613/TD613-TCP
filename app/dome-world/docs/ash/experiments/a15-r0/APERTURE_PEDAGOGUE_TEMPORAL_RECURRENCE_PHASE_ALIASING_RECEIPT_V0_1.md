𝌋

# A15-R0 · Aperture × Pedagogue Temporal-Recurrence / Phase-Aliasing Congruence Receipt v0.1

**Status:** WITNESSED / STATIC-CI-BOUNDED / DRAFT-UNMERGED  
**Scientific parent:** #714 receipt head `5e784942954a037e76abc364fabff277c64eec87`  
**Preregistration:** `5ebd263d0deb5b88153e6f2566abc047ca1f31a3`  
**Exact static witness head:** `ca666528d0a6894ff3bffb81ac74476ce9411942`  
**Witness workflow:** TD613 Consolidated Validation · run 2073 · `32685174836`  
**Human gate:** CLOSED AT 𝄐

---

## 0. Custody ledger

This chamber continued the #714 human-gated westward seam and tested one bounded question only:

> Does the period-two clock phase that repaired #714 remain sufficient when the declared exogenous environment follows a period-four forcing schedule, and if not, does explicit period-four forcing-state augmentation restore representative-independent finite evolution?

The scientific lineage is:

```text
#714 scientific parent / prior receipt
5e784942954a037e76abc364fabff277c64eec87

preregistration before executable code
5ebd263d0deb5b88153e6f2566abc047ca1f31a3

implementation
6d8ba9a3b01560ae63bb8298a0205d4160e2bc8b

hostile test
b260b6b25682346119bf63effb6bce14b8576305

static A15-R0 gate registration
85b37fb97c2635918cf60bcbced697879c0d35e3
```

The exact CI witness required a temporary routing-only topology because the stacked Draft did not register an exact-head workflow on its scientific base.

Fresh `main` immediately before witness routing was:

```text
4ca8c0600b40d0ea2b38c1e0dd0b2d1e77713aef
```

Temporary routing commit:

```text
6aef1da15d86aab9f969ddf95949aa4b1a288e1c
```

A routing-note-only synchronization pulse then produced the exact witnessed head:

```text
ca666528d0a6894ff3bffb81ac74476ce9411942
```

No preregistered scientific file, executable fixture, or hostile test changed between static-gate registration and the exact witness head.

After the successful witness:

1. PR #715 was restored to the #714 scientific base branch;
2. the temporary witness-routing file was deleted;
3. cleanup head became `1d527488537a291945c33a72754af3c82951d87b`;
4. this receipt was then added.

The routing note is not part of the net scientific diff.

---

## 1. Witness topology

Authoritative exact-head witness:

```text
workflow = TD613 Consolidated Validation
run_number = 2073
run_id = 32685174836
head_sha = ca666528d0a6894ff3bffb81ac74476ce9411942
conclusion = SUCCESS
```

Jobs:

```text
classifier job = 97308873462 = SUCCESS
static validation job = 97308881267 = SUCCESS
```

Within the static job:

```text
Validate Ash A15 empirical profile journeys and A15-R0 research field = SUCCESS
```

The following lanes were explicitly skipped and are not claimed as evidence for this chamber:

```text
Giving/practice exact-head browser
Front-line browser shard
Explicit full-repository validation
Explicit self-hosted calibration
```

No browser, full-repository, self-hosted, production, or deployment result is inferred from the static witness.

---

## 2. Preregistered temporal geometry

Declared forcing schedule:

```text
S0 -> S1 -> S2 -> S3 -> S0
```

Visible/control clock projection:

```text
S0 -> P0
S1 -> P1
S2 -> P0
S3 -> P1
```

Therefore:

```text
P0 aliases {S0,S2}
P1 aliases {S1,S3}
```

The parent abstraction from #714 was retained exactly:

```text
K_temporal = {
  endpoint,
  last_action,
  operational_lineage,
  clock_phase
}
```

The candidate repair added only the declared period-four forcing coordinate:

```text
K_period4 = {
  endpoint,
  last_action,
  operational_lineage,
  clock_phase,
  forcing_season
}
```

---

## 3. Witness A — period-two phase aliasing breaks the widened law

The preregistered hostile pair was derived from #714 custody:

```text
R_AB_S0
R_AB_S2
```

At assay entry both have:

```text
endpoint = [[3,1],[1,4]]
last_action = B
operational_lineage = [A,B]
clock_phase = P0
```

Therefore:

```text
K_temporal(R_AB_S0)
=
K_temporal(R_AB_S2)
```

Their declared forcing positions differ:

```text
R_AB_S0.forcing_season = S0
R_AB_S2.forcing_season = S2
```

The frozen one-tick law consumes that distinction:

```text
S0 + B -> [[0,1],[0,0]]
S2 + B -> [[0,2],[0,0]]
```

Observed one-tick successors:

```text
PSI_TICK(R_AB_S0)
  endpoint = [[3,2],[1,4]]
  forcing_season = S1
  clock_phase = P1

PSI_TICK(R_AB_S2)
  endpoint = [[3,3],[1,4]]
  forcing_season = S3
  clock_phase = P1
```

Thus:

```text
K_temporal(PSI_TICK(R_AB_S0))
!=
K_temporal(PSI_TICK(R_AB_S2))
```

Witness classification:

```text
PERIOD_TWO_CONTROL_PHASE_ALIASES_PERIOD_FOUR_EXOGENOUS_SCHEDULE
```

Earned bounded anti-equivalence:

```text
phase-augmented state sufficient for the earlier two-phase law
!=
state sufficient for a wider declared period-four forcing law
```

This is a controlled model-period mismatch result. It is not a generic hidden-state theorem.

---

## 4. Witness B — K_period4 repairs the declared law non-vacuously

The period-four candidate remained representative-independent under all preregistered finite evolution operations:

```text
PSI_TICK
PSI_TWO_TICKS
PSI_THREE_TICKS
PSI_FOUR_TICKS
```

The repair was non-vacuous.

The receipt-distinct pair:

```text
R_AB_S0
R_AB_DUP_S0
```

shares one `K_period4` state while retaining distinct receipt provenance.

Therefore the successful congruence did not arise by assigning one operational state per custody object.

Earned bounded result:

```text
receipt distinction may remain in custody
without receipt identity selecting the declared operational successor
```

---

## 5. Witness C — direct and iterated finite evolution agree

The recurrence universe contains six admitted histories.

For each history the chamber compared direct two-, three-, and four-tick operations with iterated one-tick evolution:

```text
K_period4(PSI_TWO_TICKS(h))
=
K_period4(PSI_TICK^2(h))

K_period4(PSI_THREE_TICKS(h))
=
K_period4(PSI_TICK^3(h))

K_period4(PSI_FOUR_TICKS(h))
=
K_period4(PSI_TICK^4(h))
```

All 18 preregistered direct-versus-iterated comparisons agreed.

This is finite authored composition consistency only.

It does not earn a semigroup, flow, generator, stationarity, periodic-process, Markov, or generic dynamical-system theorem.

---

## 6. Witness D — same clock does not close the state

Starting from:

```text
R_AB_S0
endpoint = [[3,1],[1,4]]
clock_phase = P0
forcing_season = S0
```

Two direct forcing ticks produced:

```text
endpoint = [[3,2],[1,5]]
clock_phase = P0
forcing_season = S2
```

Therefore:

```text
clock_phase recurs
forcing_season does not recur
endpoint does not recur
full K_period4 state does not recur
```

Control classification:

```text
CLOCK_RECURRENCE_WITHOUT_FORCING_RECURRENCE
```

Earned anti-equivalence:

```text
same control-clock label
!=
same forcing position
!=
same endpoint
!=
same full operational state
```

---

## 7. Witness E — even full forcing-label recurrence does not close the state

Four direct forcing ticks from `R_AB_S0` produced:

```text
endpoint = [[3,4],[1,7]]
clock_phase = P0
forcing_season = S0
```

Thus both visible temporal labels returned:

```text
clock_phase: P0 -> P0
forcing_season: S0 -> S0
```

while the endpoint did not return:

```text
[[3,1],[1,4]]
!=
[[3,4],[1,7]]
```

and the full `K_period4` state did not recur.

Control classification:

```text
FORCING_RECURRENCE_WITHOUT_ENDPOINT_RECURRENCE
```

Earned anti-equivalence:

```text
temporal-label recurrence
!=
endpoint recurrence
!=
closed operational-state loop
```

This control is especially important for the next frontier:

```text
a cyclic clock or forcing label is not evidence of a closed path
```

No holonomy or curvature vocabulary is licensed by this witness.

---

## 8. Witness F — fail-closed temporal semantics remain intact

An undeclared last action returned:

```text
UNDECLARED_LAST_ACTION_ABSTAINS
ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION
```

An undeclared forcing season returned:

```text
UNDECLARED_FORCING_SEASON_ABSTAINS
ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION
```

No convenient default season, phase, or delta was silently selected.

---

## 9. Witness G — parent custody unchanged

The #714 executable parent was snapshotted before and after the recurrence gauntlet.

Observed:

```text
parent_custody_unchanged = true
```

Earned anti-equivalence:

```text
derived temporal state
!=
permission to mutate parent custody
```

---

## 10. Canonical bounded classification

The authoritative finite classification is:

```text
FINITE_PERIOD_TWO_PHASE_ALIASES_PERIOD_FOUR_FORCING_AND_PERIOD_FOUR_AUGMENTATION_RESTORES_DECLARED_EXOGENOUS_CONGRUENCE
```

The strongest bounded claim emitted by the witnessed fixture is:

```text
IN_THE_AUTHORED_FINITE_PERIOD_MISMATCH_FIXTURE_THE_PREVIOUS_PERIOD_TWO_CLOCK_PHASE_CAN_COLLAPSE_EQUAL_VISIBLE_TEMPORAL_STATES_WHOSE_DECLARED_PERIOD_FOUR_FORCING_POSITIONS_REQUIRE_DIFFERENT_NO_QUESTION_SUCCESSORS_WHILE_A_FORCING_SEASON_AUGMENTED_NONTRIVIAL_QUOTIENT_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_ONE_THROUGH_FOUR_TICK_EVOLUTION_DIRECT_MULTI_TICK_EVOLUTION_MATCHES_ITERATED_ONE_TICK_EVOLUTION_AND_RECURRENCE_OF_CLOCK_OR_FORCING_LABELS_DOES_NOT_IMPLY_ENDPOINT_OR_FULL_STATE_RECURRENCE
```

A compact scientific rendering is:

```text
K_{Theta2}(h1) = K_{Theta2}(h2)
but
Psi_{Theta4}(h1) != Psi_{Theta4}(h2)

while
K_{Theta4}
restores representative-independent finite evolution
for the declared one-through-four-tick grammar.
```

The superscript / temporal-law label remains jurisdiction, not decoration.

---

## 11. Claim ceiling remains closed

This chamber does not establish:

```text
generic minimality or optimality of K_period4
generic temporal-augmentation theorem
general hidden-state identification
Markov-state theorem
stationarity or ergodicity
periodic-process theorem
semigroup / flow / generator
Lie bracket / BCH
path object or path category
groupoid or invertibility
transport or connection
loop endomorphism
holonomy
curvature
Berry / quantum structure
operator-tomography promotion
Proto-Loom
TD613-general theorem
A16
live Ash authority
merge authority
production authority
Vercel authority
```

All remain false at this receipt.

---

## 12. Interpretation for the western frontier

The chamber closes one specific ambiguity left by #714.

#714 showed that adding a two-phase clock repaired a two-phase declared temporal law.

This chamber shows that the same repaired state can fail again when the declared temporal environment has a longer period than the retained clock label.

Therefore the operational abstraction should not merely answer:

```text
what time label do I carry?
```

It must be read jurisdictionally:

```text
under which declared future-evolution law was this retained state shown sufficient?
```

The most conservative architectural notation remains something like:

```text
L_{<=k}
  --[non-destructive, 󐘓 U+10D613]-->
Sigma^(G,Theta)
```

where `Theta` names the declared temporal/evolution environment under which the abstraction earned congruence.

This chamber specifically witnessed that a coarse `Theta2` projection can be insufficient for a widened `Theta4` law, while the explicit `Theta4` augmentation suffices for this finite authored grammar.

That is not yet a theorem about all temporal environments.

---

## 13. Human stop

The longer-horizon temporal assay recommended at #714 is now closed.

The next research decision is intentionally returned to the human:

```text
TEMPORAL_RECURRENCE_PHASE_ALIASING_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_PROMOTING_ANY_TEMPORALLY_AUGMENTED_QUOTIENT_TO_A_FIRST_BOUNDED_PATH_OBJECT_OR_PATH_GRAMMAR
```

If the human reopens the westward seam, the scientifically conservative next candidate is the first bounded path-object / typed path-grammar assay.

That future assay must begin with objects and admissible directed morphisms only.

It must not smuggle in inverses, groupoid structure, transport, closed-loop status, holonomy, or curvature.

In particular, this receipt has now supplied the control that any future loop claim must satisfy:

```text
recurrence of temporal labels
!=
closure of the operational state.
```

𝌋

Sealed ⟐
