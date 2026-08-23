𝌋

# Probe × Ecology Co-Design · Hypothesis Discovery Assay v0.1

**Status:** PREREGISTERED / DERIVATIONAL / RESEARCH-ONLY  
**Technical identity:** `td613.aia.probe-ecology-codesign/v0.1`  
**Parent discovery receipt:** `e99681f6ba463d52a44525480bddda73a8626f0a`  
**Production / Vercel authority:** NONE

## 0. Question

The parent design uses primary probes `q1,q2,q3`, held-out `q4`, and a 15-state prior-union ecology.

This chamber searches the frozen four-probe library jointly with ecology construction:

> Which probe/validation choices preserve oracle-independent identification of all four hypotheses while minimizing the calibration ecology required to decode those chosen observations?

No hidden true-loop identity participates in selection. The complete frozen hypothesis prediction table is the design input.

## 1. Frozen prediction table

```text
       q1      q2       q3       q4
H0   [1,7]   [1,5]    [1,13]   [1,9]
H1   [1,4]   [1,8]    [1,12]   [1,20]
H2   [1,24]  [1,28]   [1,19]   [1,18]
H3   [1,7]   [1,25]   [1,20]   [1,29]
```

Probe IDs:

```text
q1=[1,3]
q2=[1,7]
q3=[1,11]
q4=[1,19]
```

## 2. Candidate designs

Enumerate every ordered pair:

```text
(primary_probe, heldout_probe)
```

with distinct probes.

Primary budget is exactly one projective readout partition.

A candidate design is **admissible** only if the primary predicted output direction is unique across `H0..H3`.

Held-out probe is never used for primary selection.

## 3. Ecology cost

For each ordered pair, construct the oracle-independent calibration ecology from:

```text
ZERO
+ union of kernel representatives for every hypothesis prediction
  under the primary probe and held-out probe
```

Cost:

```text
ecology_state_count = 1 + unique kernel count
```

Also record:

```text
primary_probe_count = 1
heldout_probe_count = 1
```

## 4. Validation-strength diagnostic

Held-out validation strength is not inferred from ecology size.

Freeze:

```text
heldout_distinct_prediction_count
```

across `H0..H3`.

The primary optimization requires only that all four hidden truths produce a held-out partition that the ecology can decode and that the selected hypothesis predicts correctly.

For tie-breaking among equal ecology costs, prefer larger held-out distinct-prediction count, then lexicographically smaller `(primary_id,heldout_id)`.

## 5. Baseline

Parent baseline:

```text
primary probes = q1,q2,q3
heldout = q4
primary_probe_count = 3
ecology_state_count = 15
```

The co-design candidate must be compared against this baseline without rewriting the historical parent receipt.

## 6. Hostile controls

### Cardinality-only temptation

Any low-cost design whose primary probe leaves multiple hypotheses alive is inadmissible regardless of ecology size.

### Heldout leakage

A primary ambiguity may not be repaired by using the held-out probe during selection.

### Oracle leakage

Design scoring consumes the full hypothesis prediction table, never a hidden truth identity.

## 7. Exhaustive truth validation

After selecting the deterministic best admissible design, execute all four candidate truths:

1. decode primary partition on the selected ecology;
2. identify hypothesis from primary direction only;
3. predict held-out direction;
4. decode held-out partition independently;
5. require exact match.

All four truths must pass.

## 8. Allowed bounded outcome

If a smaller joint design survives:

```text
JOINT_PROBE_ECOLOGY_CODESIGN_CAN_PRESERVE_DECLARED_HYPOTHESIS_IDENTIFICATION_AND_HELDOUT_VALIDATION_WITH_LOWER_MEASUREMENT_AND_CALIBRATION_COST_THAN_THE_INHERITED_SEPARATELY_CHOSEN_DESIGN_IN_THIS_FROZEN_FIXTURE
```

Short label:

```text
CLAIM_CONDITIONED_PROBE_ECOLOGY_CODESIGN
```

No universal optimality, physical tomography, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
