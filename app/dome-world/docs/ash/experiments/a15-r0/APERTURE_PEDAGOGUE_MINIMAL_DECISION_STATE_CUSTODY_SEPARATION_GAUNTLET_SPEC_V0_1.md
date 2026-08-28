# A15-R0 · Aperture × Pedagogue Minimal Decision-State / Custody-State Separation Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-typed-policy-state-aliasing/v0.1`  
Authority: A2 derivational research only  
Installed Aperture mutation: forbidden  
Pedagogue promotion authority: forbidden  
Production / Vercel authority: forbidden

## 0. Question

The parent fixture established that deficit class plus scalar conditioning geometry can alias two oriented operator states that require opposite exact repairs. Route custody can disambiguate those nominal branches, but the parent fixture explicitly refused to claim that route provenance is uniquely necessary.

This gauntlet asks a narrower question:

> **What is the smallest decision state that preserves the repair distinction under small operator perturbations, while keeping fuller route provenance in custody for replay rather than forcing it into the action state?**

The assay compares four candidate decision representations:

```text
D0 = typed deficit class only
D1 = typed deficit class + scalar geometry
D2 = typed deficit class + current signed orientation
D3 = typed deficit class + route provenance
```

It also tests route-label corruption and a central decision-equivalence band where both repair questions are admissible.

No general minimal-sufficient-statistic claim follows.

## 1. Frozen perturbation family

Reuse the parent repair matrices with:

```text
epsilon = 0.001
Q_PLUS_REPAIR
Q_MINUS_REPAIR
```

Current responsive row family:

```text
r(s,m) = [1, s*m]
s in {+1,-1}
m in {0.0008, 0.0010, 0.0012}
```

Each `+m` state carries route provenance `Q_A`; each `-m` state carries route provenance `Q_B`.

For every matched magnitude pair, required pre-repair properties are:

```text
same typed deficit class
same disposition
same rank
same sigma_min
same sigma_max
same condition number
opposite signed orientation
```

The candidate repair family is identical on every state.

## 2. Frozen repair consequence

For the six outer states:

```text
signed +m -> Q_PLUS_REPAIR must close / Q_MINUS_REPAIR must remain PROPOSE
signed -m -> Q_MINUS_REPAIR must close / Q_PLUS_REPAIR must remain PROPOSE
```

`close` means post-question Aperture disposition `ASK_NOTHING` under the existing local thresholds.

Thus an orientation-aware selector can close all six outer states while any deterministic selector whose state is sign-invariant cannot choose opposite repairs inside a matched +/- pair.

## 3. Candidate decision representations

### D0 · deficit class only

Input:

```text
NUMERICAL_STABILITY_DEFICIT
```

Frozen deterministic tie rule:

```text
Q_MINUS_REPAIR alphabetically follows Q_PLUS_REPAIR;
choose Q_MINUS_REPAIR only if explicitly encoded by the state;
otherwise default Q_PLUS_REPAIR.
```

Expected outer closure ceiling:

```text
3 / 6
```

### D1 · deficit class + scalar geometry

Input may include:

```text
rank
sigma_min
sigma_max
condition_number
```

but not signed row orientation or route provenance.

Because each +/- pair is scalar-geometry matched, any deterministic exact action must be identical within each pair.

Expected outer closure ceiling:

```text
3 / 6
```

The implementation must explicitly group by scalar signature and verify paired opposite orientations.

### D2 · deficit class + current signed orientation

Input adds only:

```text
sign(responsive_row[1])
```

Frozen policy:

```text
positive -> Q_PLUS_REPAIR
negative -> Q_MINUS_REPAIR
zero -> DECISION_EQUIVALENT_BAND / deterministic no-preference token
```

Expected outer closure:

```text
6 / 6
```

No route identity may be consulted.

### D3 · deficit class + route provenance

Frozen policy:

```text
Q_A -> Q_PLUS_REPAIR
Q_B -> Q_MINUS_REPAIR
unknown route -> ABSTAIN_ROUTE_STATE_UNDECLARED
```

Expected clean-provenance outer closure:

```text
6 / 6
```

The selector may not inspect signed orientation.

## 4. Route-corruption hostile control

Create a copy of the six outer states with route labels swapped:

```text
positive rows carry Q_B
negative rows carry Q_A
```

Current operator rows remain unchanged.

Required:

```text
D2 signed-orientation selector -> 6 / 6 closure
D3 route-provenance selector -> 0 / 6 closure
```

This control does not establish that provenance is unimportant. It establishes only that **provenance and current decision state serve different jobs** in this fixture.

Custody must preserve the corrupted route label exactly as supplied; the decision assay may not silently repair it from geometry.

## 5. Decision-equivalence band

Add central exact-known states:

```text
m in {0, 0.0001, 0.0002}
for +/- where applicable
```

The executable assay must re-audit both repair candidates for each state rather than assume sign matters.

Expected bounded result under the frozen thresholds:

```text
for |m| <= 0.0002:
  Q_PLUS_REPAIR -> ASK_NOTHING
  Q_MINUS_REPAIR -> ASK_NOTHING
```

These states therefore form a **decision-equivalence band** for this two-question candidate family.

Within the band:

```text
more policy-state detail != more decision value
```

The receipt must record that orientation and route provenance can remain present in custody while being unnecessary for choosing between these two actions in this local band.

No universal equivalence threshold follows.

## 6. Custody / decision separation

Every synthetic state must retain a custody packet:

```text
state_id
route_provenance
responsive_row
scalar_geometry
Aperture diagnosis
candidate family
post-action replay outcomes
```

The selected **decision state** may be a strict projection of that custody packet.

Required anti-equivalence:

```text
minimal decision state != minimal evidentiary receipt
```

The assay must never delete provenance merely because the action selector does not need it.

## 7. Success criterion

Pass only if:

1. all three outer +/- magnitude pairs are scalar-geometry matched;
2. D0 closes exactly 3/6 outer states;
3. D1 closes exactly 3/6 outer states;
4. D2 closes 6/6 outer states without route identity;
5. D3 closes 6/6 outer states with clean provenance and no orientation input;
6. under route-label swap D2 stays 6/6 and D3 falls to 0/6;
7. every central-band state is closed by both repair candidates;
8. custody retains route provenance regardless of selector projection;
9. no selector executes observations automatically;
10. installed Aperture remains unchanged;
11. no policy optimality or general sufficiency claim is promoted.

Allowed bounded statement:

> **In this finite synthetic repair task, current signed orientation is sufficient to preserve the exact repair distinction across the declared outer perturbation grid, while typed deficit plus scalar geometry remains aliased. Clean route provenance is equally discriminating there but becomes brittle under a deliberate route-label corruption control. Near the authored sign boundary both repairs are admissible, creating a local decision-equivalence band. The fixture therefore separates the information needed for a local action choice from the fuller provenance retained for replay and audit.**

## 8. Anti-equivalences

```text
decision state != custody state
minimal local action state != sufficient statistic theorem
provenance not needed by selector != provenance not needed by system
route-label corruption != normal custody operation
signed orientation != curvature
signed orientation != route history
same action consequence != same latent state
decision-equivalent band != state equivalence
6/6 closure != policy optimality
counterfactual replay != autonomous experiment execution
```

## 9. Claim ceiling

No active learning, reinforcement learning, optimal experimental design, sufficient-statistic theorem, Markov-state theorem, causal intervention theorem, general observability theorem, physical sensor control, physical/blind/operator tomography, connection, curvature, Berry structure, geometric phase, holonomy, TD613-general AIA theorem, Proto-Loom, autonomous execution, production authority, or Vercel authority.

## 10. Frozen next learning action

If witnessed:

```text
TEST_DECISION_STATE_CUSTODY_STATE_SEPARATION_UNDER_NOISY_ORIENTATION_ESTIMATION_AND_PROVENANCE_INDEPENDENCE_CHECKS_BEFORE_ANY PEDAGOGUE POLICY PROMOTION ACTIVE LEARNING CLAIM OR HOLONOMY PROMOTION
```

The next assay must attack whether the compact decision projection remains trustworthy when the orientation coordinate is estimated rather than exact, and whether claimed independent custody witnesses are genuinely independent.

---

Preregistration boundary: **frozen before executable implementation.**