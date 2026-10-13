𝌋

# Robustness-Aware Probe × Ecology Co-Design v0.1

**Status:** FROZEN / DERIVATIONAL / RESEARCH-ONLY  
**Technical identity:** `td613.aia.robustness-aware-probe-ecology-codesign/v0.1`  
**Parent decoder receipt:** `PARTITION_SIGNATURE_DECODER_RADIUS_RECEIPT_V0_1.json`  
**Source status:** DERIVATIONAL — the finite subset table was inspected during development before this specification was frozen. No confirmatory-holdout language is permitted.  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Purpose

The earlier Probe × Ecology Co-Design chamber optimized for hypothesis identification plus held-out validation under low measurement and calibration cost. It selected `q3` as primary and `q4` as held-out.

The downstream partition-signature distance and decoder-radius chambers established that the `q3/q4` two-packet signature family has minimum anchored clean-signature reassignment distance 4 and a bounded attack geometry in which exact clean-codeword impersonation is excluded through three membership reassignments.

This derivational chamber asks a different design question:

> If robustness against clean-signature impersonation is itself a declared design objective, how does the optimal probe/ecology architecture change?

The chamber must not retroactively call the earlier efficiency-optimal design wrong. It tests whether changing the declared objective changes the Pareto-optimal architecture.

---

## 1. Frozen hypothesis prediction table

```text
       q1      q2       q3       q4
H0   [1,7]   [1,5]    [1,13]   [1,9]
H1   [1,4]   [1,8]    [1,12]   [1,20]
H2   [1,24]  [1,28]   [1,19]   [1,18]
H3   [1,7]   [1,25]   [1,20]   [1,29]
```

Probe identities:

```text
q1=[1,3]
q2=[1,7]
q3=[1,11]
q4=[1,19]
```

All arithmetic remains over `F_31`.

---

## 2. Candidate design space

Enumerate all 15 nonempty subsets of `{q1,q2,q3,q4}`.

For subset `S`, construct the joint hypothesis signature

```text
C_S(Hj) = [ Pi_q(Hj) : q in S ]
```

using the unlabeled partition induced by each predicted projective readout.

A subset is **identification-admissible** iff the four joint signatures `C_S(H0)..C_S(H3)` are pairwise distinct.

No hidden true hypothesis participates in subset selection.

---

## 3. Oracle-independent ecology construction

For each candidate subset `S`, build its calibration ecology from the full frozen hypothesis family:

```text
E(S) = {ZERO}
       union
       { one named representative of ker(PRED[H][q])
         for every H in H0..H3 and q in S }.
```

Duplicate kernel directions collapse to one calibration state.

Ecology cost:

```text
ecology_state_count(S) = |E(S)|.
```

This is hypothesis-family-conditioned, not truth-conditioned.

---

## 4. Clean-signature robustness score

For every identification-admissible subset `S`, compute exact pairwise anchored reassignment distances between the four clean joint signatures.

Packet distances must use the same anchored partition comparison inherited from the code-distance chamber:

- ZERO block anchored;
- remaining blocks unlabeled and exactly matched for maximum preserved identity count;
- packet distance is the minimum named membership reassignment count represented by the anchored overlap score inside this frozen lawful-partition family.

Joint signature distance is additive across selected packets because each packet is a distinct custody record:

```text
D_S(Ha,Hb) = sum_{q in S} d_anchor(Pi_q(Ha), Pi_q(Hb)).
```

Robustness score:

```text
d_min(S) = min_{Ha != Hb} D_S(Ha,Hb).
```

This chamber does not infer generic coding radii from `d_min`.

---

## 5. Design cost vector

For each subset freeze:

```text
probe_count
calibration_ecology_state_count
identification_admissible
minimum_clean_signature_distance
bottleneck_hypothesis_pairs
```

A design A **Pareto-dominates** design B iff:

```text
A.probe_count <= B.probe_count
A.ecology_state_count <= B.ecology_state_count
A.d_min >= B.d_min
```

with at least one strict inequality, and both are identification-admissible.

No scalar utility weights are introduced.

---

## 6. Required derivational checks

### D1 · Complete subset census

All 15 nonempty probe subsets must appear exactly once.

### D2 · Single-probe identification

The assay must explicitly classify whether each one-probe design identifies all four hypotheses.

The known `q1` H0/H3 alias must remain visible rather than being repaired post hoc.

### D3 · Existing two-packet design

`{q3,q4}` must be represented exactly and its inherited clean-signature minimum distance must reproduce the parent value 4.

### D4 · Robustness-oriented alternatives

The assay must identify every subset with clean-signature minimum distance greater than 4 and freeze its cost vector.

### D5 · Bottleneck audit

For every candidate subset, freeze the hypothesis pair(s) attaining `d_min`.

A probe that adds measurements/ecology but fails to distinguish the current bottleneck pair must not be credited with increasing the minimum distance merely because it distinguishes other pairs.

### D6 · Pareto frontier

Freeze the complete non-dominated identification-admissible frontier under the three-dimensional cost/robustness order.

### D7 · More packets != greater minimum robustness

If a strict superset has the same `d_min` as a smaller subset because the added probe aliases the bottleneck pair, preserve that as an explicit hostile comparison.

---

## 7. Allowed interpretation

If the finite census supports it, the chamber may state:

```text
THE_EFFICIENCY_OPTIMAL_AND_ROBUSTNESS_SEEKING_PROBE_ECOLOGY_ARCHITECTURES_DIFFER_IN_THE_FROZEN_HYPOTHESIS_FAMILY_BECAUSE_ADDED_MEASUREMENT_REDUNDANCY_ONLY_INCREASES_MINIMUM_CLEAN_SIGNATURE_SEPARATION_WHEN_IT_DISTINGUISHES_THE_ACTIVE_BOTTLENECK_HYPOTHESIS_PAIR.
```

And, more generally within this authored finite design table:

```text
DESIGN OPTIMALITY IS CLAIM-AND-GUARANTEE RELATIVE:
changing the desired epistemic guarantee can change the non-dominated observation architecture.
```

---

## 8. Claim ceiling

Explicitly unearned:

```text
universal experimental-design theorem
generic coding theorem
arbitrary attack tolerance
cryptographic integrity
Byzantine tolerance
physical tomography
continuum information geometry
TD613-general AIA theorem
Proto-Loom
production authority
Vercel authority
```

This chamber is derivational. It may formalize the frozen finite table; it may not be presented as a blind new holdout.

No PR. No CI request. No production mutation. No Vercel release gesture.

𝌋 U+10D613

⟐
