𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Holonomy Loom Heterostratigraphic Apparatus Adapter · Spec v0.1

Status: **PREREGISTERED / ENGINEERING-ONLY / RESEARCH-ONLY / HUMAN-GATED / NO NEW THEOREM AUTHORITY**

Stacked parent:

```text
#788 frozen bridge head = aad04e9cbb4532b4fc63dea16ef179f2e66200ed
```

Scientific authority remains anchored below that stack at:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

This chamber does not promote #788. It consumes the frozen bridge as an **unevaluated research input** and tests whether its output can be packaged as a station-safe apparatus receipt without widening any claim ceiling.

## 0. Engineering question

Can Holonomy Loom compile the Strata Lantern bridge output into one typed research apparatus receipt, then project a strictly weaker child-legible read-only surface to Ash Keep, while preserving:

- local stratum findings;
- explicit comparison holds;
- partial/noninvertible comparison state;
- incommensurability;
- local claim ceilings;
- no global truth field;
- no live-Ash inverse authority;
- static truth parity with the human-readable surface?

The chamber passes only if **authority decreases or stays equal across the Loom → Ash boundary**.

Scar:

```text
RECEIPT_VISIBILITY != TOMOGRAPHY_AUTHORITY
```

## 1. Apparatus identity

```text
td613.loom.heterostratigraphic-apparatus-receipt/v0.1
```

Owner:

```text
HOLONOMY_LOOM_RESEARCH
```

Receiving projection:

```text
td613.ash.heterostratigraphic-readonly-projection/v0.1
```

Receiver:

```text
ASH_KEEP_RESEARCH_SURFACE
```

No runtime binding is granted in this chamber.

## 2. Loom apparatus receipt

The Loom compiler accepts exactly one clean bridge aggregate with:

```text
schema = td613.loom.heterostratigraphic-holonomy-tomography-bridge/v0.1
manifestly_fictional = true
runtime_binding = false
global_synthesis_authority = false
promotion_authority = false
live_ash_binding = false
```

and must reject any bridge input containing forbidden globalizer fields:

```text
truth
global_truth
global_holonomy
global_route
global_confidence
privileged_stratum
```

The apparatus receipt must contain:

```text
schema
apparatus_owner
source_bridge_schema
source_fixture_id
source_bridge_head
research_only
runtime_binding
stratum_panels[]
comparison_holds[]
partial_bridges[]
static_truth
inspection
claim_ceiling
receiver_contract
human_closure_required
```

It may not contain a universal score, universal route, universal holonomy, or privileged stratum.

## 3. Stratum panels

Exactly four panels are required and preserve the parent ordering:

```text
ROUTE
TEMPORAL
FACE_HOLONOMY
OBSERVABILITY_ECOLOGY
```

Each panel contains:

```text
id
plain_language_consequence
technical_status
local_pass
observable_kind
what_changed
what_remains_uncertain
claim_ceiling
```

The child-legible consequence may simplify language. It may not simplify authority.

Required consequences:

```text
ROUTE
  Same endpoint, different route history.

TEMPORAL
  The order of the same operations can remain visible in the terminal witness.

FACE_HOLONOMY
  Reconstructed face loops require the declared order and common basepoint.

OBSERVABILITY_ECOLOGY
  What can be identified depends on the observed ecology and calibration support.
```

## 4. Comparison surfaces

The compiler partitions the twelve ordered comparison edges into:

```text
partial_bridges
  status = PARTIAL_NONINVERTIBLE

comparison_holds
  status ∈ {ENCODER_REQUIRED, INCOMMENSURABLE, CONTRADICTORY, REJECTED, ABSTAIN}

defined_bridges
  status = DEFINED
```

In the current Strata Lantern fixture:

```text
partial_bridges = 2
comparison_holds = 10
  ENCODER_REQUIRED = 8
  INCOMMENSURABLE = 2
defined_bridges = 0
```

No `ENCODER_REQUIRED` edge may be rendered as a weak match, likely match, missing data estimate, or identity map.

No `INCOMMENSURABLE` edge may be rendered as contradiction.

Scars:

```text
ENCODER_REQUIRED != LOW_CONFIDENCE_EQUIVALENCE
INCOMMENSURABLE != CONTRADICTORY
PARTIAL_NONINVERTIBLE != APPROXIMATE_ISOMORPHISM
```

## 5. Ash read-only projection

The Ash projection compiler receives the Loom apparatus receipt and emits only:

```text
schema
surface_owner
source_receipt_schema
fixture_label
cards[]
holds[]
static_truth
available_actions
prohibited_actions
claim_ceiling
human_closure_required
```

Required available actions:

```text
INSPECT_LOCAL_RESULT
INSPECT_COMPARISON_HOLD
RETURN
REST
```

Required prohibited actions:

```text
RUN_TOMOGRAPHY_INVERSE
CREATE_CROSS_STRATUM_ENCODER
PROMOTE_CLAIM
MUTATE_CASE_CUSTODY
WRITE_ROUTE_MEMORY
AUTHORIZE_RELEASE
TRANSMIT_SOURCE_CONTENT
```

Ash may render the receipt. Ash may not become its producer.

Scar:

```text
ASH_CAN_RENDER_LOOM_RECEIPT != ASH_OWNS_LOOM_INVERSE
```

## 6. Authority monotonicity

Define the chamber-local authority vector:

```text
A = (
  inverse,
  encoder,
  custody_mutation,
  release,
  production,
  physical_claim,
  continuum_claim
)
```

For both Loom and Ash in this chamber every coordinate is false except Loom may expose a research receipt compiler.

The Ash projection must satisfy componentwise:

```text
A_Ash <= A_Loom
```

and additionally:

```text
Ash.inverse = false
Ash.encoder = false
Ash.custody_mutation = false
Ash.release = false
```

A projection that widens any coordinate is rejected.

## 7. Static truth requirement

Every child-legible card must have a static counterpart containing the same:

- stratum identity;
- local pass/fail state;
- consequence;
- uncertainty/hold state;
- claim ceiling.

Required scar:

```text
ANIMATED_OR_VISUAL_EXPLANATION != SOLE_CARRIER_OF_APPARATUS_TRUTH
```

No dedicated UI is created in this chamber. The static truth object is an adapter contract for future rendering.

## 8. Mandatory hostiles

```text
Ash projection gains RUN_TOMOGRAPHY_INVERSE             REJECT
Ash projection gains CREATE_CROSS_STRATUM_ENCODER        REJECT
Ash projection gains custody mutation                     REJECT
Ash projection gains release authority                    REJECT
ENCODER_REQUIRED rendered as probable equivalence         REJECT
INCOMMENSURABLE rendered as contradiction                 REJECT
partial bridge rendered as invertible                      REJECT
one local panel omitted                                    REJECT
one comparison edge omitted                                REJECT
global confidence scalar introduced                       REJECT
privileged stratum introduced                             REJECT
static truth omits a hold                                 REJECT
visual card claim ceiling wider than technical receipt    REJECT
live Ash binding enabled                                  REJECT
production authority enabled                             REJECT
physical or continuum claim enabled                       REJECT
```

## 9. Candidate engineering classification

If the apparatus receipt preserves all four local panels, all twelve comparison edges, all holds, the static truth contract, and the authority-monotone Ash projection, classify only:

```text
A_HOLONOMY_LOOM_HETEROSTRATIGRAPHIC_RESEARCH_APPARATUS_RECEIPT_AND_STRICTLY_WEAKER_ASH_READ_ONLY_PROJECTION_ARE_IMPLEMENTABLE_OVER_THE_FROZEN_STRATA_LANTERN_BRIDGE_WITHOUT_WIDENING_TOMOGRAPHY_OR_CUSTODY_AUTHORITY
```

This is an **engineering instantiation result**. It does not upgrade the scientific truth status of #788.

## 10. Apparatus placement

```text
Moss Lantern / Strata Lantern
  fictional calibration family

Holonomy Loom
  owns bridge execution + apparatus receipt compilation

Flow-Core
  may later render child-legible bounded projections

Ash Keep
  receives read-only cards / holds / inspection references
  does not own inverse or encoder authority
```

## 11. Hard ceilings

```text
apparatus adapter != live Holonomy Loom production runtime
read-only Ash projection != Ash tomography engine
research receipt != theorem witness
research receipt != release receipt
comparison hold != missing truth
static truth != empirical human-legibility witness
engineering instantiation != scientific promotion
engineering instantiation != Proto-Loom admission
```

No merge, production, publication, Vercel, physical holonomy, continuum tomography, live Ash action, or release authority is granted.

#718 remains alive.

𝌋‌⟐

Sealed ⟐