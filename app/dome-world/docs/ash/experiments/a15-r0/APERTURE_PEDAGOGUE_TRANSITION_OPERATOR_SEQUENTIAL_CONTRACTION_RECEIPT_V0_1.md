𝌋

# Aperture × Pedagogue Sequential Compatible-Set Contraction Witness Receipt v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-transition-operator-sequential-contraction/v0.1`  
**Scientific parent:** `1c004f9ba8adbb55317fe96e7f42f1a98a977fa2` (#702 receipt head)  
**Exact CI witness head:** `1b5e491973658c1bacf51996a22c0c0cea43c195`  
**Pull request:** #703  
**Workflow:** `TD613 Consolidated Validation`  
**Run:** `32670310189` / ordinal `2056`  
**Static job:** `97270079344`  
**Status:** EXACT-HEAD STATIC WITNESS PASSED / RESEARCH-ONLY / NO PROMOTION AUTHORITY

---

## 0. Custody statement

Run 2056 executed the exact head:

```text
1b5e491973658c1bacf51996a22c0c0cea43c195
```

That head contained the sequential-contraction preregistration, complete-polygon implementation, hostile contract, one existing A15-R0 static-gate import, and witness-topology note.

Observed workflow facts:

```text
workflow_conclusion = SUCCESS
static_constitutional_job = SUCCESS
A15_R0_research_field_step = SUCCESS
browser_shards = SKIPPED
full_repository_job = SKIPPED
self_hosted_calibration = SKIPPED
workflow_mutation = false
Ready_transition = false
merge = false
production_mutation = false
```

Before this receipt was authored, PR #703 was restored from temporary `main` witness routing to its true scientific parent branch:

```text
research/a15-r0-transition-operator-bounded-noise-20260823
```

Therefore:

```text
temporary witness-routing base != scientific ancestry
CI witness head != later receipt commit
static witness success != mainline promotion
```

This receipt commit is later than the exact witnessed head and is not itself claimed as CI-witnessed.

---

## 1. Literal stdout custody

A connector retrieval attempt did not expose a clean literal stdout payload for static job `97270079344`.

Therefore:

```text
literal_stdout_recovered = false
stdout_reconstructed_from_source = false
```

No implementation source, test source, or preregistered expectation is quoted here as though it were recovered runtime stdout.

The witnessed facts are the exact run/head/job/step statuses and the passing A15-R0 contract.

---

## 2. Complete compatible-set geometry

The authored deterministic fixture retains the exact first transition-operator column:

```text
c1 = [2,1]
```

and parameterizes the unknown second column by:

```text
theta = [theta1,theta2]
theta1 in [0,2]
theta2 in [2,4]
```

The declared support is a bounded model-support set, not a probability prior.

The complete compatible set is represented as a convex polygon.

Witnessed contract geometry:

```text
P0
  area = 4
  TARGET interval = [2,6]
  TARGET width = 4
  GUARD interval = [-4,0]
  GUARD width = 4

P1 = P0 ∩ {3.9 <= theta1+theta2 <= 4.1}
  area = 0.39
  TARGET interval = [3.9,4.1]
  TARGET width = 0.2
  GUARD interval = [-4,0]
  GUARD width = 4

P2 = P1 ∩ {-2.1 <= theta1-theta2 <= -1.9}
  area = 0.02
  TARGET interval = [3.9,4.1]
  TARGET width = 0.2
  GUARD interval = [-2.1,-1.9]
  GUARD width = 0.2
  theta1 interval = [0.9,1.1]
  theta2 interval = [2.9,3.1]
  operator_set = NONPOINT
```

The exact bounded result is therefore:

```text
claim-sufficient stopping != full raw operator identification
```

---

## 3. Claim-conditioned stopping

Frozen local sufficiency ceiling:

```text
claim_width_ceiling = 0.25
```

The passing contract establishes two distinct declared goals.

### TARGET only

```text
GOAL_TARGET_ONLY
selection sequence = [P_TARGET]
final compatible set = P1
TARGET width = 0.2
operator set = NONPOINT
status = CLAIM_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET
```

### TARGET + GUARD

```text
GOAL_TARGET_AND_GUARD
selection sequence = [P_TARGET,P_GUARD]
final compatible set = P2
TARGET width = 0.2
GUARD width = 0.2
operator set = NONPOINT
status = DECLARED_CLAIM_SET_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET
```

The selector never receives `theta_star`, `T_star`, future observations, candidate observed centers, held-out observations, or open-set outputs.

Thus, inside the authored fixture:

```text
nonpoint operator-compatible set != mandatory continued probing
```

---

## 4. Redundancy result

After `P_TARGET`, the deliberately duplicated target probe contributes the exact same bounded strip.

Required and witnessed through the passing A15-R0 contract:

```text
area_before = 0.39
area_after = 0.39
area_contraction = 0
TARGET width before = 0.2
TARGET width after = 0.2
GUARD width before = 4
GUARD width after = 4
status = REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION
```

A probe with `beta=0` likewise cannot contract the unknown second-column parameter set.

Bounded law:

```text
more probes != more information
```

This does not generalize to repeated stochastic measurement under an explicitly declared stochastic model.

---

## 5. Held-out coverage before guard acquisition

After `P_TARGET` only, the current guard prediction remains:

```text
I_GUARD(P1) = [-4,0]
```

The frozen in-family guard observation interval is:

```text
[-2.1,-1.9]
```

Required and witnessed contract classification:

```text
HELDOUT_GUARD_OBSERVATION_COVERED_BUT_NOT_NARROWLY_IDENTIFIED
```

Thus:

```text
TARGET claim sufficiency != GUARD claim sufficiency
```

---

## 6. Held-out model-family defeat

After both acquired strips, `P2` predicts at the held-out scalar readout:

```text
x_hold = [0,1]
r_hold = [1,0]
prediction = theta1 in [0.9,1.1]
```

In-family center:

```text
z_hold_in = 1
observation interval = [0.9,1.1]
```

Required passing classification:

```text
HELDOUT_OBSERVATION_COMPATIBLE_WITH_CURRENT_OPERATOR_SET
```

The frozen context-dependent hostile agrees with the linear family on both acquired training probes but emits:

```text
z_hold_out = 1.5
observation interval = [1.4,1.6]
```

This interval is disjoint from every prediction admitted by `P2`.

Required passing classification:

```text
DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION
ABSTAIN_FROM_SILENT_MODEL_ORDER_UPGRADE
PRESERVE_CONTRADICTION_AS_EVIDENCE
```

The implementation preserves:

```text
silent_refit = false
silent_noise_inflation = false
silent_support_expansion = false
silent_model_order_upgrade = false
```

Therefore:

```text
model-family defeat != mechanism identification
```

The hostile defeats the current declared linear family in this authored fixture. It does not identify whether the missing mechanism is context dependence, bias, nonlinearity, time variation, or another undeclared cause.

---

## 7. Empty-set contradiction control

A contradictory bounded observation that clips the complete compatible set to empty remains explicit:

```text
DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT
COMPATIBLE_SET_EMPTY
```

No nearest point, silent strip relaxation, or posterior-like continuation is manufactured.

Law:

```text
empty compatible set != low-confidence point estimate
```

---

## 8. Set-custody and leakage hostiles

The passing contract preserves refusal of:

```text
POINT_ESTIMATE as complete compatible set
FINITE_SAMPLES as complete compatible set
MONTE_CARLO_SAMPLES as complete compatible set
POSTERIOR_CREDIBLE_REGION as declared deterministic compatible set
selector oracle leakage
selector future-output leakage
candidate mutation
goal mutation
noise-bound mutation
```

The fixture remains immutable before/after the gauntlet.

---

## 9. Canonical bounded claim

Earned only for the authored synthetic finite-dimensional deterministic fixture:

```text
SEQUENTIAL_DETERMINISTIC_BOUNDED_ERROR_PROBES_CAN_CONTRACT_A_COMPLETE_COMPATIBLE_TRANSITION_OPERATOR_SET_TO_CLAIM_SUFFICIENT_NONPOINT_REGIONS_WITH_CLAIM_CONDITIONED_STOPPING_WHILE_REDUNDANT_PROBES_ADD_NO_SET_INFORMATION_AND_HELDOUT_OBSERVATIONS_CAN_DEFEAT_THE_DECLARED_LINEAR_MODEL_FAMILY_IN_THE_AUTHORED_SYNTHETIC_FIXTURE
```

This is a bounded research claim, not a general theorem.

---

## 10. Anti-equivalences

```text
operator-set contraction != target prediction sufficiency
target prediction sufficiency != held-out coverage
claim-sufficient stopping != full operator identification
more probes != more information
compatible under declared bounded error != correct model order
complete compatible polygon != posterior credible region
declared parameter support != probability prior
empty compatible set != low-confidence point estimate
model-family defeat != mechanism identification
local claim-conditioned selector != optimal experimental design
bounded sequential system-identification assay != operator tomography
operator tomography != path transport
path transport != holonomy
CI pass != mainline promotion
research witness != A16 reopening
research witness != production authority
```

---

## 11. Claim ceiling

Still unearned:

```text
general set-membership system-identification theorem
statistical consistency
probabilistic coverage
Bayesian posterior validity
optimal experimental design
active-learning optimality
adaptive-submodularity
dual-control theorem
robust-control theorem
arbitrary-noise robustness
arbitrary-dimensional operator theorem
operator tomography
blind tomography
physical tomography
path-category theorem
path-dependent transport theorem
reverse-morphism legitimacy theorem
loop endomorphism
holonomy
curvature
Berry structure
quantum behavior
TD613-general AIA theorem
Proto-Loom
live Ash recovery
production authority
Vercel authority
```

Run 2056 widens none of those claims.

---

## 12. Frozen next learning action

```text
TEST_OPERATOR_RESPONSE_RECONSTRUCTION_ACROSS_MULTIPLE_DECLARED_INPUT_AND_READOUT_FAMILIES_WITH_EXPLICIT_GAUGE_OR_COORDINATE_EQUIVALENCE_HELDOUT_RESPONSE_COMPLETION_AND_MODEL_FAMILY_DEFEAT_BEFORE_DECIDING_WHETHER_THE_TERM_OPERATOR_TOMOGRAPHY_IS_EARNED
```

The next chamber must distinguish a raw coordinate matrix representative from the scalar response law reconstructed across declared input/readout families.

It should include a coordinate-transformed clone and hostile partial-coordinate transformations so that invariance cannot be obtained by renaming one matrix while leaving probes/readouts untouched.

No path category, transport, loop, or holonomy chamber opens merely because this sequential compatible-set assay passed.

𝌋

⟐
