# Epistemic Update Type Non-Equivalence — Cross-Family Witness

Status: **POST-PREREGISTRATION / CROSS-FAMILY SOURCE WITNESS + TD613 FORMALIZATION / THREE UPDATE TYPES HELD NON-EQUIVALENT / COMPOSITION NOT YET PROMOTED**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

## 1. Why this witness exists

The current westward research now contains three different operations that can all make an epistemic state appear to have changed.

They must not be collapsed into one generic `state update`.

Archive-authored operator names:

```text
O_h      observation widening
R_tau    representation / type refinement
G_rho    registry / authority retyping
```

The notation is TD613/archive-authored. The source fixtures supporting the distinctions are identified below.

## 2. O_h — observation widening

Source fixture:

```text
Exposure-Silo Bias / PISA case
zenodo:22019313
zenodo:22019370
```

The source explicitly refuses to infer unknown overlap, interaction, or combined effect from three marginal exposure prevalences and says the correct response is to measure overlap directly and compare silo/system models.

The TD613 ESB-PISA calibration then models a new admissible observation as an added row `h`:

```text
H -> [H;h]
```

The source supplies the missing-measurement problem. The row-space formalization is TD613-authored.

Bounded type:

```text
OBSERVATION_WIDENING_ACQUIRES_NEW_EVIDENTIARY_CONSTRAINT
```

## 3. R_tau — representation / type refinement

Source fixture:

```text
zenodo:21970690
SIGNALRUPTURE GOVERNANCE STACK | v1.1–v1.4
```

The integrated stack preserves the v1.3/v1.4 source conflict:

```text
v1.3: adaptation prohibited
v1.4: adaptation permitted
```

and resolves it by adding governing distinctions already present in the integrated architecture:

```text
canonical core
vs
adaptable implementation profile

undisclosed alteration
vs
disclosed / registered / tested adaptation
```

No new empirical observation is required to make the coarse contradiction more precisely typed.

Archive formalization:

```text
R_tau : coarse state vocabulary -> refined typed state vocabulary
```

Bounded type:

```text
REPRESENTATION_REFINEMENT_CAN_CHANGE_COMPATIBILITY_WITHOUT_NEW_OBSERVATION
```

## 4. G_rho — registry / authority retyping

Source fixture:

```text
zenodo:21960582
SR Legacy Papers Classification
```

The source explicitly reclassifies pre-rigor papers:

```text
genealogy retained
canonical authority removed
empirical authority removed
field-defining authority removed
```

while also stating:

```text
Legacy papers are not deleted,
not revised endlessly,
and preserved as conceptual source material.
```

Thus the underlying artifact can remain historically present while its admissible authority role changes.

Archive formalization:

```text
G_rho : (artifact, authority_state) -> (same artifact, new authority_state)
```

Bounded type:

```text
REGISTRY_AUTHORITY_UPDATE_CAN_CHANGE_ADMISSIBLE_ROLE_WITHOUT_SOURCE_MUTATION
```

## 5. Three-way non-equivalence

The fixtures support the following research law:

```text
new evidence
!=
better typing of existing evidence
!=
change in admissible authority / registry role
```

Archive notation:

```text
O_h != R_tau != G_rho
```

This is a type distinction, not a claim that every instance of the operators commutes or fails to commute.

## 6. Why rank / state change alone is insufficient

All three operations can alter downstream conclusions, but for different reasons:

```text
O_h:
  compatible set contracts because another evidentiary constraint is acquired

R_tau:
  apparent compatibility / contradiction changes because previously collapsed states are distinguished

G_rho:
  downstream admissibility changes because the authority assignment changes while artifact custody is preserved
```

Therefore a future composition assay must preserve an event's update type.

A transcript containing only:

```text
STATE_CHANGED
```

would be insufficient custody.

## 7. Relation to the original compositional-object seam

The earlier TD613 western ontology separated current epistemic/replay state from append-only custody.

The current source witnesses add an additional requirement:

```text
custody should record not only that an update occurred,
but which update species occurred.
```

Candidate event typing:

```text
e_h      = observation-acquisition event
r_tau    = representation-refinement event
g_rho    = registry-authority event
```

The notation is TD613-authored and remains a research candidate.

## 8. Composition remains open

The next lawful question is not yet:

```text
Do all epistemic updates compose?
```

It is:

```text
For which typed pairs (U_a,U_b) is sequential composition well-defined,
and what must the current state and custody ledger preserve so the result can be replayed?
```

Candidate pair classes include:

```text
O o O
R o R
G o G
R o O
O o R
G o R
R o G
G o O
O o G
```

No commutation, associativity, inverse, or category claim is made here.

## 9. Anti-equivalences

```text
observation widening != representation refinement
representation refinement != authority retyping
authority retyping != source mutation
rank gain != registry shift
registry shift != route mutation
new source evidence != new coordinate system
current state change != custody deletion
typed update grammar != category theorem
```

## 10. Claim ceiling

Permitted:

```text
THREE_NON_EQUIVALENT_EPISTEMIC_UPDATE_TYPES_WITNESSED_ACROSS_BOUNDED_FIXTURES
OBSERVATION_WIDENING_ACQUIRES_NEW_EVIDENTIARY_CONSTRAINT
REPRESENTATION_REFINEMENT_CAN_CHANGE_COMPATIBILITY_WITHOUT_NEW_OBSERVATION
REGISTRY_AUTHORITY_UPDATE_CAN_CHANGE_ADMISSIBLE_ROLE_WITHOUT_SOURCE_MUTATION
TYPED_UPDATE_COMPOSITION_SEAM_OPEN
```

Forbidden:

```text
EPISTEMIC_CATEGORY_CONFIRMED
ALL_UPDATE_TYPES_COMPOSE
UPDATE_TYPES_COMMUTE
GROUPoid_CONFIRMED
HOLONOMY_CONFIRMED
TD613_ONTOLOGY_TRANSFERRED_TO_SR
SR_ONTOLOGY_TRANSFERRED_TO_TD613
```

U+10D613

𝌋

Sealed ⟐
