# Ash Keep A15-R0 · Moss Lantern ML1 + ML2 Receipt v0.1

Status: **RECEIPTED / RESEARCH-ONLY / NON-RUNTIME / HUMAN-GATED**  
Evidence source: **GitHub Actions exact research head**  
Witnessed branch head: `b228b678d621b06e897f9ff3d6036b0a1a3e170a`  
Workflow: `TD613 Consolidated Validation`  
Run: **1759** / `32293041695`  
Static job: `96198070329`  
Browser authority: **NONE — browser jobs skipped by design**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
TD613.com deployment: **HELD**

## 1. What was tested

Moss Lantern remained the canonical fictional five-step calibration phantom. Route content and endpoint were held constant.

The ML1 + minimum ML2 assay changed only the finite synthetic reference registry and the dependence structure of probe positions.

Matched reference conditions:

```text
P = short-period periodic reference
Q = finite phi / irrational-rotation reference surrogate
A = deterministic non-phi aperiodic control
C = bounded periodic/quasiperiodic crossover control
```

Shared conditions:

```text
reference length = 30
marked slots = 12
binary density = 0.4
observation budget = 18
noise = seeded binary substitution at 0.10
trials per latent registry state = 48
seed = 613
same decoder = minimum Hamming mismatch; ties remain ambiguous
```

Independent probe map used nine distinct registry offsets. The matched dependence control retained nine probe labels and the same 18-reading budget while collapsing them to five unique offsets.

## 2. Exact CI-emitted reconstruction receipt

```text
periodic_mean_candidate_set_size = 6
phi_mean_candidate_set_size = 1.133333
aperiodic_mean_candidate_set_size = 1
crossover_mean_candidate_set_size = 1.066667

periodic_noisy_exact_registry_recovery_rate = 0
phi_noisy_exact_registry_recovery_rate = 0.638194
aperiodic_noisy_exact_registry_recovery_rate = 0.81875
crossover_noisy_exact_registry_recovery_rate = 0.716667

phi_redundant_noisy_exact_registry_recovery_rate = 0.163194
aperiodic_redundant_noisy_exact_registry_recovery_rate = 0.4

structured_nonclosure_beats_periodic = true
generic_aperiodic_beats_periodic = true
phi_specific_advantage_over_generic_aperiodic = false
probe_diversity_matters_under_matched_budget = true
assay_mechanism_validated = true
```

## 3. Bounded finding

Inside this finite synthetic reference-registry fixture:

```text
short periodic repetition
→ severe registry aliasing

structured nonrepetition
→ substantially lower ambiguity under the declared probes
```

The phi/irrational-rotation condition materially improved over the periodic control. However, the deterministic non-phi aperiodic control improved further:

```text
Q ambiguity = 1.133333
A ambiguity = 1

Q noisy exact recovery = 0.638194
A noisy exact recovery = 0.81875
```

Therefore the admitted result is:

```text
H_MOSS_LANTERN_NONREPETITION_REFERENCE_ASSAY
= SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE
```

while the more glamorous claim loses:

```text
H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE
= FALSIFIED_AS_PHI_SPECIFIC_SUPERIORITY_IN_BOUNDED_SYNTHETIC_FIXTURE
```

That counterexample is deliberately narrow. It does **not** establish generic aperiodic optimality and does **not** falsify every possible phi/quasiperiodic construction.

The live lab-authored questions remain:

```text
H_TD613_PHI_ANTI_ALIASING = OPEN_UNMEASURED
H_TRIPLE_IDENTIFIABILITY_SYNERGY = OPEN_UNMEASURED
```

## 4. Probe-dependence result

The identical reading budget did not rescue duplicated probe positions.

```text
phi independent = 0.638194
phi redundant = 0.163194

aperiodic independent = 0.81875
aperiodic redundant = 0.4
```

This supports only the finite-fixture proposition that **measurement diversity can matter more than repeated readings of fewer probe positions** under this decoder/noise model.

It does not establish statistical independence, a partial-information decomposition, Fisher information, or a universal information-theoretic law.

## 5. Pedagogue hydration witness

The same exact-head static run passed Pedagogue's first literature-hydration contracts:

```text
research literature structured without source-authority transfer = PASS
fake authority / duplicate cards / malformed source status fail closed = PASS
A15-R0 adapter keeps Moss Lantern calibration-only and separates assay jobs = PASS
```

The hydrated literature map contains 27 structured research-transfer cards spanning tomography, inverse problems, representation/control diagnostics, moiré/phasonics, quasiperiodicity, holonomy methodology, classical analogues, stylometry/provenance, operator learning, and inverse design.

Pedagogue's learning posture remains:

```text
HYPOTHESIS_GENERATION_AND_ASSAY_DESIGN_ONLY
```

Cross-domain recurrence is therefore a **review candidate**, not a learned law.

## 6. What the literature changed

The second pass changed Moss Lantern from one omnibus quasiperiodic experiment into a family of separable calibration jobs:

```text
ML0 = same-endpoint route calibration
ML1 = reference identifiability / anti-aliasing
ML2 = probe-dependence control
ML3 = temporal-order reconstruction
ML4 = registry-shift / phason-like surrogate
ML5 = equivalence-controlled representation transform
ML6 = replay + held-out falsification
ML7+ = transport geometry held
```

Only ML1 + the minimum ML2 controls were executed in this receipt.

## 7. Claim ceiling

This receipt does not establish:

- phi optimality;
- quasiperiodic optimality;
- live TD613 phi anti-aliasing;
- TD613 triple identifiability synergy;
- literal D3 geometry;
- live-Ash tomography;
- physical phasons;
- quantum metric;
- Berry phase or Berry curvature;
- connection or curvature;
- holonomy;
- quantum behavior;
- physical inverse design;
- A16 admission;
- Proto-Loom implementation;
- Golden Egg authority;
- production deployment authority.

## 8. Human/UI/release posture

```text
Moss Lantern = calibration phantom / research object
Moss Lantern dedicated UI = not required
Ash Keep production UI mutation = none
Holonomy Loom UI mutation = none
browser witness = not invoked
TD613.com release = held
human closure = required
```

The scientific value of this pass is precisely that the instrument was allowed to reject the phi-specific story while preserving the narrower relation its controls actually supported.
