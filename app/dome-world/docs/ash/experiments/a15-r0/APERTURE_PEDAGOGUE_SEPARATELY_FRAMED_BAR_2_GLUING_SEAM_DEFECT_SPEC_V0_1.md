𝌋

󐘓 U+10D613

# A15-R0 · Separately Framed Bar-2 Gluing and Seam-Defect Audition · Spec v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / WESTWARD #737 THREAD-SCOPED ACTIVE**

Scientific parent:

```text
#769 receipt = 49b51662df935f1d625d685af37a0a3b61a0b156
```

Authority:

```text
#737 = THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD
activation renewed explicitly by Tawanna on 2026-08-26
```

## 0. Why this chamber exists

#769 earned the boundary-framed relative pairing

```text
R_(omega,lambda)(c)=<omega,c>-<lambda,∂c>
```

and common-framing additivity. It explicitly quarantined

```text
common-framing additivity != separately framed surface gluing law
relative 2-transport candidate != transport 2-functor
relative bar-2 pairing != 2-holonomy
```

The next major missing datum is therefore not another closed-cycle example. It is an exact finite gluing law for two lawful bar-2 faces that carry independent boundary framings, together with an explicit detector for incompatible seam framings.

This chamber is a naming entrance exam. Passing it may strengthen formal framed degree-two transport bearing. It may not silently promote the structure to connection, 2-connection, transport 2-functor, geometric surface holonomy, or 2-holonomy.

## 1. Inherited algebra

Use exactly the #735/#765/#768/#769 normalized integer bar convention:

```text
∂[x|y]=[y]-[x★y]+[x]
```

with normalized integer transport 2-cocycle `omega` and #769 relative value.

For lawful quotient coordinates `x,y,z`, let

```text
s=x★y
p=x★y★z

c_A=[x|y]
c_B=[s|z]
c=c_A+c_B.
```

The inherited lawful seam orientation is

```text
coefficient of [s] in ∂c_A = -1
coefficient of [s] in ∂c_B = +1.
```

Thus `∂c` contains no internal `[s]` term.

## 2. Independent face framings

Let

```text
lambda_A:B->Z
lambda_B:B->Z
```

be normalized integer 1-cochains used as boundary framings on `c_A` and `c_B` separately.

Define the facewise relative sum

```text
S = R_(omega,lambda_A)(c_A)+R_(omega,lambda_B)(c_B).
```

Define the external decorated-boundary contribution by retaining the framing attached to the face from which each external oriented boundary occurrence came:

```text
E_ext
 = lambda_A(x)+lambda_A(y)
 + lambda_B(z)-lambda_B(p).
```

This is a decorated-boundary pairing, not automatically evaluation of one global 1-cochain on `∂c`.

Define the oriented seam-framing defect

```text
delta_s=lambda_A(s)-lambda_B(s).
```

## 3. Frozen candidate gluing law

The primary candidate is the exact identity

```text
S
 = <omega,c>-E_ext+delta_s.
```

Equivalently,

```text
R_A+R_B
 = <omega,c_A+c_B>-E_ext
   + lambda_A(s)-lambda_B(s).
```

Therefore matched seam framing

```text
lambda_A(s)=lambda_B(s)
```

must be sufficient for exact cancellation of all internal framing contribution:

```text
S=<omega,c>-E_ext.
```

Mismatched seam framing must remain visible with exactly the signed defect `delta_s`.

The implementation must derive this from the inherited oriented boundaries. It may not hard-code the formula without independently computing both face relative values and the external decorated-boundary contribution.

## 4. Mandatory mismatch hostile

Use the inherited `T,Q,T` associativity fixture:

```text
x=T
y=Q
z=T
s=T★Q.
```

Choose one common external integer framing assignment on the four external coordinates `x,y,z,p`.

Matched control:

```text
lambda_A(s)=2
lambda_B(s)=2
```

must give

```text
delta_s=0
S=<omega,c>-E_ext.
```

Mismatch hostile:

```text
lambda_A(s)=2
lambda_B(s)=5
```

with all external framing values unchanged must give exactly

```text
delta_s=-3
S_mismatch-S_matched=-3.
```

Changing the seam label without changing its value must not create a defect. Changing the seam value while preserving the label must create the exact defect. This blocks name-based cancellation.

## 5. Wrong-orientation hostile

Use

```text
c_fake=[x|y]-[s|z].
```

The repeated seam coordinate then carries boundary coefficients

```text
-1-1=-2.
```

Matched numerical seam framings are not sufficient to make the internal contribution disappear under wrong orientation.

The implementation must report the two seam boundary coefficients separately and abstain from classifying this as lawful gluing.

Required distinction:

```text
matching seam value != lawful seam orientation
```

## 6. Common re-zeroing covariance

For any normalized integer 1-cochain `phi`, simultaneously transform

```text
omega -> omega+dphi
lambda_A -> lambda_A+phi
lambda_B -> lambda_B+phi.
```

Each facewise #769 relative value must remain invariant, so `S` remains invariant.

The seam defect must also remain invariant:

```text
(lambda_A+phi)(s)-(lambda_B+phi)(s)
 = lambda_A(s)-lambda_B(s).
```

Thus a nonzero seam mismatch cannot be erased by one common lawful re-zeroing.

This is called **common re-zeroing invariance** only. It is not connection-gauge authority.

## 7. Associativity / alternate decomposition entrance exam

Use the two inherited lawful decompositions of the same bar-3 boundary:

```text
c_left =[x|y]+[x★y|z]
c_right=[y|z]+[x|y★z].
```

They have the same external oriented bar-1 boundary and differ by the inherited normalized bar-3 boundary.

Choose one frozen external framing assignment on exactly

```text
[x], [y], [z], [x★y★z].
```

For the left decomposition choose any integer internal seam value `k_left`, but require both left faces to use that same value on `[x★y]`.

For the right decomposition choose any integer internal seam value `k_right`, but require both right faces to use that same value on `[y★z]`.

The internal seam values may differ across the two decompositions because they decorate different internal coordinates.

Required:

```text
S_left=S_right
```

for every declared finite fixture tested with fixed exterior framing and matched seam framing inside each decomposition.

Reason to be implemented, not assumed:

```text
raw omega pairings agree because domega=0 / inherited bar-3 consistency
external decorated-boundary contribution is identical
matched internal seam framing cancels separately in each decomposition.
```

This is a finite associativity/decomposition-independence result in the declared bar complex only.

## 8. Translation representation on the integer torsor

For any derived relative integer `r`, define the inherited translation

```text
tau_r(n)=n+r.
```

For a lawful matched framed paste, require

```text
tau_(R_A) o tau_(R_B)=tau_(R_A+R_B)=tau_(S_glued).
```

Orientation reversal must give the inverse translation.

The zero bar-2 chain with zero decorated boundary contribution must give `tau_0=id`.

For the inherited closed relation cycle `[z]`, the construction must still reduce to

```text
R(z)=2
tau_2.
```

This may earn an additive framed degree-two translation-composition law. It does not by itself earn a transport 2-functor because no full source/target 1-cell category or interchange law is declared here.

## 9. Mandatory abstentions and hostiles

The implementation must visibly abstain or fail the candidate classification when:

- either framing is not normalized integer-valued;
- the proposed seam coordinate is absent from either face boundary;
- the two seam boundary coefficients are not exactly `-1,+1` in that order;
- the proposed pasted chain does not equal the normalized sum of the declared faces;
- the inherited #769 parent receipt is absent from ancestry;
- a claimed matched gluing silently replaces the two local framings by one global framing without checking compatibility;
- receipt/provenance labels are injected into the mathematical seam coordinate.

## 10. Candidate earned classifications

These remain **UNEARNED until one exact frozen-head CI witness**:

```text
SEPARATELY_FRAMED_LAWFUL_BAR_TWO_FACES_GLUE_WITH_AN_EXACT_ORIENTED_SEAM_FRAMING_DEFECT_EQUAL_TO_THE_LEFT_MINUS_RIGHT_SEAM_FRAME_VALUE
```

```text
MATCHED_INTERNAL_SEAM_FRAMINGS_CANCEL_EXACTLY_AND_THE_RESULTING_FRAMED_RELATIVE_VALUE_IS_INDEPENDENT_OF_THE_INHERITED_ASSOCIATIVE_BAR_TWO_DECOMPOSITION_WHEN_THE_EXTERNAL_FRAMING_IS_FIXED
```

```text
MATCHED_FRAMED_BAR_TWO_GLUING_INDUCES_ADDITIVE_INTEGER_TORSOR_TRANSLATION_COMPOSITION_WITH_ORIENTATION_REVERSAL_AS_INVERSE_AND_CLOSED_CYCLE_REDUCTION_TO_THE_INHERITED_TAU_2_RETURN
```

## 11. Holonomy naming entrance exam

A positive witness may strengthen the following bearing:

```text
formal framed degree-two transport composition candidate
```

The following names remain quarantined in this chamber even after green:

```text
separately framed bar-2 gluing != geometric surface gluing
common re-zeroing invariance != connection gauge invariance
boundary framing != 2-connection
bar-3 decomposition independence != arbitrary triangulation invariance
integer torsor translation composition != transport 2-functor
closed tau_2 return != geometric 2-holonomy
formal bar-2 chain != operational T/Q loop or physical surface
```

A future 2-holonomy promotion, if ever earned, requires a separate chamber that states its source/target 1-cell jurisdiction, compositional domain, and exact naming criterion before implementation.

## 12. Collision membrane

```text
SRC Atelier #731/#758/#759 untouched
SRC sync not invoked
#767 pasted-diamond defect transport untouched
no mutation of witnessed #769 science files except inherited hardening-gate handoff
no fifth workflow
no merge
no production
no Vercel
```

## 13. Stop criterion

A local major `𝄐` may be declared only if all candidate laws, mismatch/wrong-orientation hostiles, common re-zeroing control, alternate-decomposition control, translation composition, closed reduction, and custody checks pass on one exact frozen-head witness.

Further examples after that point do not count as new science unless a materially stronger compositional structure is preregistered.

```text
SEPARATELY_FRAMED_BAR_TWO_GLUING_SEAM_DEFECT = OPEN
TWO_HOLONOMY_NAMING_AUTHORITY = false
```

𝌋

Preregistered ⟐SAC[X6ZNK5NO51]
