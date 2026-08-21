# Aperture × Pedagogue Replay-Envelope + Held-Out Consequence Assay v0.1

Status: **AUTHORED / PRE-EXECUTION / A15-R0 SYNTHETIC RESEARCH ONLY**

## Question

The prior replay-stability witness separated:

```text
diagnostic stability
!=
question-selection stability
```

The next question is narrower and more hostile:

> Can the local decision boundaries be mapped, and does crossing a categorical question-selection boundary correspond to a discontinuity in the underlying held-out consequence landscape?

This assay uses **decision-envelope geometry** only in the ordinary mathematical sense of local boundary location. It does not promote information geometry, Fisher geometry, curvature, connection, holonomy, or any physical geometric claim.

## Predeclared boundary families

### A. Sigma-floor diagnostic boundary

The fixed full-rank operator has

```text
sigma_min = 0.25
condition_number = 4
```

With the installed typed-deficit rule, the local diagnostic boundary is therefore the declared `sigma_min_floor = 0.25`. Equality remains on the admitted side; a floor just above the observed value exposes `NUMERICAL_STABILITY_DEFICIT`.

### B. Correlated-noise diagnostic boundary

For the identity raw operator whitened by

```text
Sigma(rho) = [[1,rho],[rho,1]]
```

and a declared condition-number ceiling `c = 10`, the whitened condition number is

```text
kappa(rho) = sqrt((1 + rho) / (1 - rho))
```

so the predeclared analytic boundary is

```text
rho* = (c^2 - 1) / (c^2 + 1) = 99/101
```

The assay must verify the installed diagnosis immediately below and above that boundary without changing the raw operator.

### C. Question-selection boundary

For the fixed structural deficit and the two already-witnessed candidate questions:

```text
P_ORTH = orthogonal y
P_DIAG = normalized diagonal x+y
```

both carrying the same valid correlated covariance family, the assay must numerically bracket the `P_ORTH -> P_DIAG` selection boundary inside the previously witnessed interval:

```text
0.545 < rho_selection* < 0.547
```

The final bracket width must be below `1e-8`. No analytic closed form is assumed.

## Held-out consequence object

The selector ranks candidate questions using the declared covariance-whitened widening criterion. It does **not** consult held-out truth or a universal downstream utility.

To test whether a categorical selection flip should be narrated as a universal performance cliff, the assay evaluates several predeclared held-out linear functionals of the reconstructed latent state under each candidate's same declared covariance model:

```text
H_Y     = [0, 1]
H_DIFF  = [1,-1]
H_SUM   = [1, 1]
```

For each candidate question `q`, reconstruction-error covariance is calculated exactly as:

```text
C_q = A_q^{-1} Sigma A_q^{-T}
```

and each held-out functional receives its own variance:

```text
V(H,q) = H C_q H^T
```

No held-out functional participates in question selection.

## Authored expectations / falsifiers

The assay passes only if all of the following hold:

1. the sigma-floor diagnostic boundary remains exactly the declared local `0.25` boundary;
2. the correlated-noise diagnostic boundary agrees with `99/101` to numerical tolerance and exposes different typed diagnoses immediately below and above it;
3. the question-selection boundary is bracketed inside `(0.545, 0.547)` to width `< 1e-8`;
4. each candidate's held-out variance functions remain continuous across the local selection-boundary neighborhood;
5. the categorical selected question flips across that neighborhood;
6. at least one held-out functional prefers `P_ORTH` and at least one prefers `P_DIAG` on **both** sides of the selection boundary;
7. therefore no universal-best-question claim is admitted;
8. no scalar aggregation of held-out consequences is permitted;
9. the installed Aperture replay flag remains `HELD_NOT_YET_WITNESSED` in this research commit;
10. no production, standalone UI, Vercel, live Ash, Proto-Loom, physical tomography, information geometry, connection, curvature, holonomy, Berry, quantum, or autonomous-experiment authority is created.

## Intended anti-equivalences

```text
categorical decision boundary != physical/performance cliff
smooth candidate consequence surface != smooth selected-policy consequence
question selected by one declared criterion != universally best question
local boundary map != universal robustness radius
held-out consequence audit != held-out-driven selection
research witness != installed release authority
```

## Claim ceiling

A positive result would support only a bounded synthetic statement:

> In this authored linear/covariance fixture, local typed-diagnosis and question-selection boundaries can be mapped; the underlying candidate consequence functions remain smooth through a question-selection switch, while the discrete selection policy can change which consequence vector is realized. Different held-out functionals can prefer different candidate questions.

Anything stronger remains open.
