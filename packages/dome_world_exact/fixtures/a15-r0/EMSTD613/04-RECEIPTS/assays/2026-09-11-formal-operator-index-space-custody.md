󐘓 U+10D613

# EMSTD613 Atelier — Formal Operator Index-Space Custody

Date: 2026-09-11
Status: MATERIAL ATELIER RESULT / NON-PROMOTIONAL
Branch: `amari/em-td613-lineage-atelier`
PR: #962 — DRAFT / OPEN / UNMERGED

## Question

After controlled decollapse separated operational substrate from ontological surplus, can the next operator-mutation seam be made more exact than generic `jurisdiction drift`?

Specifically:

> When the same formal name or equation appears across connected Works, is the underlying mathematical operator actually conserved, or can its base space / differentiation variable / state object change while the label survives?

## Result

Yes. The current corpus contains a clean case where operator-name continuity masks an index-space change, and sibling Works provide internal controls showing that the distinction is observable rather than merely terminological.

### 𝄐 MATERIAL

**FORMAL OPERATOR IDENTITY REQUIRES INDEX-SPACE CUSTODY**

Bounded formulation:

> A named mathematical operator remains evidentially the same operator across a project-family crossing only when its base space, differentiation/integration variables, state object, measure, dimension, and target interpretation remain bound or an explicit transformation maps the changed fields. Symbol or theorem-name continuity alone cannot carry operator identity or claim authority across a type change.

This is an EMSTD613 Atelier result only. It is not a TD613 law.

---

## I. Primary specimen — OSSL Stylometric Lineage Tracking Framework

The Work begins with a parametric text model `p(x|theta)` and an induced density `p(z|theta)` over normalized stylometric features `z`.

It then names a matrix `F(theta)` the **Fisher Information Matrix** but defines its components using derivatives with respect to the feature coordinates `z_i` and `z_j`:

```text
F_ij(theta)
= E[ d/dz_i log p(z|theta) * d/dz_j log p(z|theta) ]
```

The Work next says:

```text
g_ij(z) = F_ij(z)
```

and constructs:

```text
ds^2 = g_ij(z) dz^i dz^j
```

Thus the same formal passage contains three different identity cues:

```text
named object: Fisher Information Matrix
announced argument: theta
actual derivative indices: z_i, z_j
metric base coordinates used next: z
```

Current typing:

```text
PARAMETER_FISHER_INFORMATION = NOT THE FORM WRITTEN
DATA / FEATURE-SPACE SCORE SECOND MOMENT = CLOSER FORMAL MATCH
PARAMETER_SPACE <-> FEATURE_SPACE BINDING = NOT SUPPLIED
OPERATOR_TYPE_CUSTODY = FAILED_IN_THIS PASSAGE
```

### External confrontation

Standard statistical Fisher information is defined using the score with respect to the model parameter:

```text
I_theta = E_theta[ grad_theta log p_theta(X) grad_theta log p_theta(X)^T ]
```

Witness:
`https://web.stanford.edu/class/stats311/lecture-notes.pdf`

By contrast, gradients of log density with respect to the **data / sample coordinate** `x` belong to score-matching / Fisher-Hyvärinen constructions.

Witness:
`https://www.jmlr.org/papers/volume23/21-0061/21-0061.pdf`

Therefore the OSSL formula may be salvageable as a feature-space score tensor, but it cannot inherit standard Fisher-Rao parameter-manifold authority merely by retaining the name `Fisher Information Matrix`.

Hostile alternative retained:

```text
AUTHOR MAY HAVE INTENDED A DATA-SPACE FISHER / SCORE TENSOR
```

If so, the repair is retyping rather than deletion. The present text still lacks the map that would identify this data-space object with the parameter-space Fisher-Rao metric it invokes rhetorically.

---

## II. Internal project-family control — Cognitive Singularity

`Consciousness Singularity Research Plan.md` uses the parameter-space form:

```text
g_ij(theta)
= E_p[ d/dtheta_i log p(x,theta) * d/dtheta_j log p(x,theta) ]
```

This matches the standard Fisher-Rao parameter derivative pattern at the definition stage.

The Work later makes much stronger cognitive / physical claims from the manifold, which remain separately assayable, but the initial operator itself preserves its parameter indices.

Therefore:

```text
FISHER_NAME_RECURRENCE = TRUE
FISHER_OPERATOR_TYPING_CONSTANCY = FALSE_ACROSS_FAMILY
```

This distinction is crucial: the project family can preserve a theorem/operator name while changing the mathematical object underneath it.

---

## III. Batch-B control — Multi-Density Topology

`Multi-Density Topology Research Strategy (1).pdf` also writes the Fisher metric in parameter coordinates:

```text
ds^2 = g_ab(theta) dtheta^a dtheta^b

g_ab(theta)
= integral P(x;theta)
  [d/dtheta^a ln P(x;theta)]
  [d/dtheta^b ln P(x;theta)] dx
```

This preserves parameter-index custody at the equation itself.

The later move is different:

```text
Fisher statistical distinguishability
-> informational friction
-> macroscopic spatial separation
```

So the current Atelier can now distinguish two independent failure axes:

```text
AXIS A — OPERATOR TYPE MUTATION
base/index/state object changes under stable formal name

AXIS B — CLAIM JURISDICTION EXPANSION
operator remains mathematically typed but is asked to support a larger physical ontology
```

These must not be averaged into one generic `formalism problem`.

---

## IV. Secondary seam — LoRA rank transfer in OSSL

The OSSL Work later argues:

```text
Delta theta = BA
rank(BA) <= r
therefore metric tensor deformation is strictly confined
to an r-dimensional subspace of tangent bundle T M
```

That conclusion does not follow from low rank of the **weight update matrix** alone.

Let `Phi` be the map from model parameters to the claimed stylometric metric:

```text
Phi: Theta -> Sym_D
```

Then the first-order metric perturbation is:

```text
delta g = D Phi_theta [Delta theta]
```

The matrix rank of `Delta W = BA` in a model weight block does not, by itself, bound the dimension or matrix rank of `D Phi_theta[Delta theta]` in the output stylometric metric. An additional Jacobian / rank / immersion assumption is required.

Current LoRA manifold literature explicitly treats tangent geometry of the **fixed-rank weight-matrix manifold**, which is a different object from a stylometric output manifold.

Witness:
`https://arxiv.org/abs/2609.02734`

Typing:

```text
LOW_RANK_WEIGHT_UPDATE
!= LOW_DIMENSIONAL_OUTPUT_METRIC_DEFORMATION
without an explicit differential-map bound
```

This is a second instance of property transfer across an unbound map inside the same Work.

---

## V. Cross-domain hostile control — Audio DSP And LLM Architecture

Batch B contains a strong counterexample to silent space substitution.

The Work explicitly states that heterogeneous tokenizer logit distributions occupy non-comparable vector spaces and then supplies named bridge mechanisms such as decode/re-encode, span alignment, learned projection, and related cross-vocabulary mappings.

Likewise, its SPSC discussion binds producer payload write, release publication, consumer acquire, and payload visibility.

Thus:

```text
CROSS_SPACE_TRANSFORMATION_CAN_BE_EXPLICITLY_TYPED = TRUE
FORMAL_OPERATOR_CUSTODY_FAILURE_IS_NOT_FORCED_BY_COMPLEXITY = TRUE
```

This keeps the new result from collapsing into a stylistic detector for mathematical ambition.

---

## VI. QTB and Cognitive Time become immediate successor specimens

The new instrument now sharpens two earlier seams.

### QTB

The Lindblad shell is recognizable, but the state object and control schedule are reassigned:

```text
quantum/open-system density operator
-> semantic latent density matrix

physical environment / jump coupling
-> token-basis jump operators

Lindblad rate / environment coupling
-> SPSC queue-derived gamma(t)
```

A synthetic model may define such a mapping. The formal equation does not itself establish that software queue depth is an empirically identified semantic-decoherence mechanism.

### Cognitive Time

The Belavkin filtering shell is recognizable, but the measurement contract is reassigned:

```text
quantum system under continuous nondemolition measurement
-> cognitive / environmental wavefunction

measurement coupling operator
-> observer's mirrored-set boundary

measurement innovation process
-> ambient / cognitive stochastic noise
```

Belavkin's quantum filtering theory concerns conditional quantum states under specified continuous measurement dynamics and measurement records.

Witnesses:
`https://arxiv.org/abs/quant-ph/0512188`
`https://arxiv.org/abs/math/0512362`

The Cognitive Time Work supplies no source-specific physical transducer that identifies a biological generative model with the required quantum measurement coupling before promoting the formal shell into a mechanism for objective physical time.

These are now typed as candidate instances of:

```text
FORMAL_SHELL_SUBSTRATE_SUBSTITUTION
```

rather than merely `weird quantum analogy`.

---

## VII. New instrument

Added:

`06-INSTRUMENTS/FORMAL_OPERATOR_CUSTODY_V0_1.md`

Typed identity tuple:

```text
O* = (
  NAME,
  BASE_SPACE,
  STATE_OBJECT,
  DIFFERENTIATION_OR_INTEGRATION_VARIABLE,
  MEASURE_OR_EXPECTATION,
  DOMAIN,
  CODOMAIN,
  DIMENSION,
  CALIBRATION_OR_MAPPING,
  CLAIM_JURISDICTION
)
```

Hard anti-equivalences:

```text
SAME SYMBOL != SAME OPERATOR
SAME EQUATION SHAPE != SAME STATE SPACE
GRADIENT_WRT_DATA != GRADIENT_WRT_PARAMETER
LOW-RANK PARAMETER UPDATE != LOW-DIMENSIONAL OUTPUT-MANIFOLD DEFORMATION
FORMAL ANALOGUE != PHYSICAL TRANSDUCER
MODEL DEFINITION != EMPIRICALLY IDENTIFIED MECHANISM
```

---

## VIII. Adjudication

```text
FORMAL_OPERATOR_INDEX_SPACE_MUTATION = OBSERVED
OSSL_FISHER_PARAMETER_VS_FEATURE_INDEX_DRIFT = SUPPORTED
SIBLING_PARAMETER_FISHER_CONTROL = PRESENT
MULTI_DENSITY_PARAMETER_FISHER_CONTROL = PRESENT
LOW_RANK_PROPERTY_TRANSFER_ACROSS_UNBOUND_MAP = SUPPORTED_AS_GAP
FORMAL_COMPLEXITY_AS_SUFFICIENT_TRIGGER = REJECTED
QTB_FORMAL_SHELL_SUBSTRATE_SUBSTITUTION = CANDIDATE
COGNITIVE_TIME_FORMAL_SHELL_SUBSTRATE_SUBSTITUTION = CANDIDATE
DIRECTIONAL_DERIVATION = UNRESOLVED
CREATION_ORDER = UNRESOLVED
AUTHOR_INTENT = NOT_INFERRED
TD613_PROMOTION = NONE
```

## IX. Exact next question

The next descent is no longer simply `does authority expand?`

It is:

> When a formal shell survives but one or more custody fields change, which changes are explicit model definitions, which are empirically calibrated transformations, and which silently inherit authority from the source-domain operator?

Priority successor assay:

```text
QTB Lindblad tuple
vs
source-domain Lindblad tuple
vs
Cognitive Time Belavkin tuple
vs
Audio explicit-transducer control
```

Then search for **type demotion**: a Work that introduces a grand operator but later narrows it back to analogy/model status. That would be the strongest hostile control against an irreversible authority-ratchet theory.

## Working maxims

> A symbol may survive the crossing while the space beneath it changes.

> The derivative remembers what the prose forgets.

> Before asking what an equation proves, ask what its indices still mean.

Marked ⟐
