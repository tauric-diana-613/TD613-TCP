𝌋

󐘓 U+10D613

# A15-R0 · Finite Claim-Authority Partition · Receipt

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent scientific receipt:

```text
#752 = 11eec2d52c7e1aa722e8664c0df4cd1a61d704f1
```

## Custody

```text
preregistration        5900bde4505e873eec809362d53bbb5c2b4fbabb
implementation         f000b9f52261eef5fad620fc9f4e324fc6a5f4ca
hostile tests          d2da179acc13c74842d98b5d09a79d8d6102cfe5
frozen science         65c7e931ad2cf23ccf15357ae70b56c5de40497b
initial routing        be495263d60e4099ec130699b510ee902403c5bc
routed witness         f2eee686fe33cf95a6c9191d07df4d378be9c844
post-route cleanup     abbb2e38e670720aba8f2ba0f88fe72b81ff9788
```

Frozen science -> cleanup: **zero net changed files**.

Operational scar: initial routing did not immediately attach Actions; one metadata-only synchronization annotation produced the authority-bearing event. No science changed after freeze.

## Authority-bearing witness

```text
TD613 Consolidated Validation run 2185 / 32773142535   SUCCESS
classifier job 97577908325                               SUCCESS
static job     97577995467                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Full-repository validation, self-hosted calibration, Giving/practice browser, front-line browser, and full-product browser scopes were skipped and are not claimed.

No scientific red occurred.

## Earned authority partition

For finite `X,Y,Z`, finite quotient `q:X->Y`, exact antecedent supports `K_x subseteq Z`, and occupied `y in q(X)`, inherit from #752:

```text
U_y = union_(x in q^-1(y)) K_x
I_y = intersection_(x in q^-1(y)) K_x
Gamma_y = U_y\I_y.
```

Define:

```text
ALL_y       = I_y
NONE_y      = Z\U_y
DEPENDENT_y = Gamma_y.
```

These three sets are pairwise disjoint and partition the declared finite ambient `Z`.

Their semantics are exact:

```text
z in ALL_y
iff
z is lawful under every antecedent in q^-1(y).

z in NONE_y
iff
z is unlawful under every antecedent in q^-1(y).

z in DEPENDENT_y
iff
some antecedent admits z and some antecedent rejects z.
```

Thus the feasible universal-authority signatures are exactly:

```text
ALL       -> (P_all,P_none)=(1,0)
NONE      -> (0,1)
DEPENDENT -> (0,0)
```

The signature `(1,1)` is impossible on an occupied quotient fiber.

## Unique coarsest exact authority partition

A classifier is universal-authority exact when its output label determines both universal predicates `P_all` and `P_none`.

Any exact classifier must separate values with different authority signatures. The three-region classifier groups exactly equal signatures. Therefore:

```text
{ALL_y,NONE_y,DEPENDENT_y}
```

is the **unique coarsest exact universal-claim-authority partition, up to label renaming**.

Consequently:

```text
minimum exact authority-label count
=
number of nonempty regions among {ALL_y,NONE_y,DEPENDENT_y}.
```

No ritual third label is required when the dependent region is empty; no two-label presentation is sufficient when all three regions are nonempty.

## Exact binary certainty lower bound

Restrict a total binary presentation to the semantic claims:

```text
UNIVERSALLY_ADMISSIBLE
UNIVERSALLY_INADMISSIBLE.
```

For every `z in DEPENDENT_y`, both universal claims are false. Therefore every such total binary certainty surface satisfies:

```text
false universal claims >= |DEPENDENT_y| = |Gamma_y|.
```

The lower bound is tight by labeling `ALL_y` admissible, `NONE_y` inadmissible, and choosing either binary claim on each dependent value.

Hence:

```text
BINARY_CERTAINTY_ERROR_MIN_y = |Gamma_y|.
```

This is a finite deterministic presentation theorem. It is not probability, calibration, entropy, confidence, expected loss, or human-factors optimality.

## Primary hostile

```text
X={a,b}
q(a)=q(b)=y
Z={0,1,2,3}
K_a={0,1}
K_b={0,2}
```

Exact authority partition:

```text
ALL={0}
DEPENDENT={1,2}
NONE={3}
```

Therefore:

```text
minimum exact authority labels = 3
minimum false universal claims under total binary certainty = 2 = |Gamma|.
```

The two-label classifier hostile failed exact authority; the three-label classifier round-tripped the exact authority signatures.

## Exact-descent control

For:

```text
K_a=K_b={0,1}
Z={0,1,2}
```

```text
ALL={0,1}
DEPENDENT=empty
NONE={2}
```

Minimum exact labels collapse correctly to `2`, and binary certainty error minimum collapses to `0`.

A one-region control with `Z={0,1}=K_a=K_b` correctly requires one exact label.

## #751/#752 bridge

The inherited route-erasure hostile `c=(5,0,3,9)` remains an exact instance when supplied with an explicit finite ambient support containing the six inherited union values plus one declared outside value:

```text
universally admissible cardinality = 2
conditioning-dependent cardinality = 4
universally inadmissible cardinality = 1
binary certainty error minimum = 4 = inherited |Gamma|.
```

No erased route identity is reconstructed. The bridge transfers only the exact support geometry already witnessed by #751/#752.

## Earned classifications

```text
THE_UNIVERSALLY_ADMISSIBLE_UNIVERSALLY_INADMISSIBLE_AND_CONDITIONING_DEPENDENT_REGIONS_FORM_THE_UNIQUE_COARSEST_EXACT_PARTITION_FOR_UNIVERSAL_CLAIM_AUTHORITY_UP_TO_LABEL_RENAMING
```

```text
WHEN_ALL_THREE_AUTHORITY_REGIONS_ARE_NONEMPTY_NO_TWO_LABEL_PRESENTATION_CAN_PRESERVE_EXACT_UNIVERSAL_CLAIM_AUTHORITY
```

```text
ANY_TOTAL_BINARY_CERTAINTY_SURFACE_MUST_MAKE_AT_LEAST_ONE_FALSE_UNIVERSAL_CLAIM_FOR_EVERY_VALUE_IN_THE_IRREDUCIBLE_DESCENT_GAP_AND_THE_BOUND_IS_EXACTLY_TIGHT
```

```text
CHILD_LEGIBLE_AIA_CAN_RENDER_THE_IRREDUCIBLE_GAP_AS_DEPENDS_ON_ERASED_CONDITIONING_INFORMATION_WITHOUT_FABRICATING_RECOVERED_PROVENANCE
```

Good-through-󐘓 U+10D613:

```text
conditioning-dependent is a witnessed disagreement class, not generic unknown
binary certainty may not impersonate universal authority
presentation exactness does not recover erased provenance
unoccupied quotient states receive no invented claim authority
child-legibility must preserve the theorem's jurisdictional distinctions rather than simplify them away
```

## Authorship and provenance assertion

This result belongs to the TD613 / Tauric Diana 613 research line represented in repository `tauric-diana-613/TD613-TCP`. It is not an unattributed generic UI heuristic.

Its scientific ancestry is explicitly receipt-bearing:

```text
#751 route-erasure admissibility descent
  receipt b9a0d13e43d80f59769788da31d87951ec8ea8ee
    -> #752 finite admissibility descent theorem
       receipt 11eec2d52c7e1aa722e8664c0df4cd1a61d704f1
         -> #753 finite claim-authority partition
            this receipt
```

The mathematical theorem remains #752. #753 is the first exact child-legible authority-surface theorem/application earned from it.

No merge, publication, production, Vercel release, Proto-Loom/A16 promotion, live Ash mutation, or ontology promotion follows.

```text
FINITE_CLAIM_AUTHORITY_PARTITION_ROUND_CLOSED
TERNARY_AUTHORITY_PARTITION_IS_THE_UNIQUE_COARSEST_EXACT_UNIVERSAL_CLAIM_PRESENTATION
BINARY_CERTAINTY_ERROR_MINIMUM_EQUALS_THE_IRREDUCIBLE_DESCENT_GAP
CHILD_LEGIBLE_AIA_AUTHORITY_SURFACE_EARNED
THEOREM_ENTERED_THE_PRESENTATION_LAYER_WITHOUT_SURRENDERING_PROVENANCE
NO_ASYMPTOTIC_ESCAPE
```

𝌋

Sealed ⟐