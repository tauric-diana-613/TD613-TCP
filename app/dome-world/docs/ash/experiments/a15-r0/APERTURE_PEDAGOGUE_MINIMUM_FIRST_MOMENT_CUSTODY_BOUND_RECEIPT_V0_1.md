𝌋

# A15-R0 · Minimum First-Moment Custody Bound · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / FINITE / FALSIFIABLE**

## 0. Custody

Parent receipt:

```text
#739 = ffa5756d63f10fa6dc211e4cb07f38fbdc4bee0a
```

Preregistration:

```text
c09eeed0cde5df1d398aca335083988f4b288bfb
```

Frozen pre-routing science:

```text
680efbff7ba5d2c68dc31ad06e554f6ef5b33a1a
```

Authority-bearing routed witness:

```text
67e16b9368f876b227efd55efe974ee6e45164a8
```

Post-routing cleanup:

```text
af67397717a94187f28c97bb931d28dc46998a7b
```

Frozen science -> cleanup:

```text
3 commits ahead
0 net changed files
```

Authority-bearing CI:

```text
TD613 Consolidated Validation run 2169 / 32758258109  SUCCESS
classifier job 97530713410                              SUCCESS
static job     97530785534                              SUCCESS
A15/A15-R0 step 19                                      SUCCESS
```

Explicit full-repository validation: **SKIPPED / NOT CLAIMED**.

Explicit self-hosted calibration: **SKIPPED / NOT CLAIMED**.

Giving/practice browser witness: **SKIPPED / NOT CLAIMED**.

Front-line browser shard: **SKIPPED / NOT CLAIMED**.

Full-product browser witness: **SKIPPED / NOT CLAIMED**.

No scientific red occurred.

## 1. Parent theorem inherited from #739

For a fixed route-realizable operational base

```text
x=(t,E,O),
```

#739 earned an exact route-realizable first-moment lift set `F_x`.

For `t>=1`, let

```text
a=floor(t/2)
b=floor((t-1)/2)
M_x=aE+bO.
```

Then

```text
F_x={O+2r : 0<=r<=M_x}
N_x=|F_x|=M_x+1=aE+bO+1.
```

For `t=0`, route-realizability requires `O=0` and

```text
F_x={0}
N_x=1.
```

## 2. Earned minimum-custody theorem

Fix one route-realizable base `x` and treat `x` as already retained.

A deterministic first-moment custody scheme consists of a finite label alphabet `A_x`, encoder

```text
enc_x:F_x->A_x
```

and decoder

```text
dec_x:A_x->F_x
```

with exactness obligation

```text
dec_x(enc_x(P))=P
```

for every lawful `P in F_x`.

### 2.1 Necessity

Exact decoding forces `enc_x` to be injective.

If

```text
enc_x(P1)=enc_x(P2),
```

then applying `dec_x` gives

```text
P1=dec_x(enc_x(P1))
  =dec_x(enc_x(P2))
  =P2.
```

Therefore distinct lawful first-moment lifts require distinct custody labels.

By finite injectivity:

```text
|A_x|>=|F_x|=N_x.
```

Thus an alphabet with fewer than `N_x` distinguishable labels is itself a finite certificate that universal exact first-moment recovery over that base is impossible.

### 2.2 Tightness

#739's parity interval makes the lower bound achievable.

For `t>=1`, define

```text
R_x(P)=(P-O)/2.
```

Because

```text
F_x={O+2r:0<=r<=M_x},
```

`R_x` is a bijection

```text
F_x <-> {0,1,...,M_x}.
```

The inverse is

```text
P=O+2R_x.
```

The rank alphabet has exactly

```text
M_x+1=N_x
```

labels, so the lower bound is tight.

For `t=0,O=0`, the singleton lift set requires one implicit label state and zero additional binary payload once the base is retained.

## 3. Earned fixed-width binary corollary

A fixed-width binary custody field of `b_x` bits has at most

```text
2^(b_x)
```

distinguishable labels.

Exact deterministic recovery therefore requires

```text
2^(b_x)>=N_x,
```

hence

```text
b_x>=ceil(log2 N_x).
```

The rank coordinate achieves this bound using a fixed-width binary encoding of `R_x`.

Therefore the exact local minimum is

```text
B_min(x)=ceil(log2 N_x).
```

For `t>=1`:

```text
B_min(t,E,O)
=ceil(log2(floor(t/2)E+floor((t-1)/2)O+1)).
```

For route-realizable `t=0,O=0`:

```text
B_min=0.
```

This is a finite fixed-width alphabet result.

```text
B_min != Shannon entropy
B_min != average code length
B_min != complete-route information content
```

## 4. Exact zero-additional-custody locus

`B_min(x)=0` exactly when `N_x=1`.

By #739:

```text
t=0,O=0  : all E
t=1      : all E,O
t=2      : iff E=0
t>=3     : iff E=O=0
```

Every other route-realizable base requires a positive additional custody payload for universal exact first-moment recovery.

## 5. Finite hostile witnesses

### 5.1 Three lifts cannot fit through two exact labels

For

```text
x=(2,2,0),
```

#739 gives

```text
F_x={0,2,4}
N_x=3.
```

A two-label encoder necessarily collides.

The hostile assignment

```text
0 -> 0
2 -> 1
4 -> 0
```

was correctly rejected as exact custody.

Thus one-bit capacity (`2` labels) is insufficient.

Two fixed-width bits (`4` labels) are sufficient to encode the three rank states.

### 5.2 Sufficient capacity is not sufficient custody

For the same `N_x=3` base, a three-label declared alphabet with mapping

```text
0 -> A
2 -> A
4 -> C
```

was correctly rejected.

Therefore:

```text
alphabet cardinality >= N_x
!=
witnessed exact custody
```

The lower bound is necessary; exactness additionally requires an injective encoder and corresponding left-inverse decoder.

### 5.3 Rank round-trip

Multiple nontrivial bases were exercised by the explicit scheme

```text
P -> R=(P-O)/2 -> P=O+2R.
```

Every lawful lift round-tripped exactly.

### 5.4 Complete-route impersonation hostile

Distinct routes

```text
TQTQT
QTTTQ
```

share the same first-moment coordinate

```text
(t,E,O,P)=(3,1,1,3).
```

Therefore even a perfect minimum-custody first-moment scheme does not reconstruct the authored route.

```text
exact P custody != complete route custody
rank recovery != provenance recovery
```

### 5.5 Receipt externality

Changing a receipt label without changing the operational base, lift spectrum, or encoding left the minimum bound unchanged.

## 6. The TTQ/QTT repair cost

The earliest visible same-base/different-first-moment wound remains:

```text
TTQ -> (t,E,O,P)=(2,1,0,2)
QTT -> (t,E,O,P)=(2,1,0,0).
```

At their shared base

```text
x=(2,1,0),
```

we have

```text
N_x=2
B_min(x)=1.
```

So exactly one additional retained binary bit is necessary and sufficient to preserve which first-moment class survived before projection to `B`.

That bit does not identify the full authored route. It restores only the first-moment distinction the quotient otherwise destroys.

## 7. Consequential architecture law

For each fixed route-realizable base `x`:

```text
retained custody alphabet size < N_x
-> universal exact first-moment recovery impossible
-> reject unique-recovery claim

retained custody alphabet size >= N_x
-> capacity lower bound satisfied
-> exactness still requires witnessed injectivity / decoding

rank custody with N_x labels
-> exact first-moment recovery achieved
-> no authority to promote to complete-route provenance
```

This creates an executable adequacy boundary between truthful recovery and counterfeit memory.

## 8. Good-through-󐘓 U+10D613 landing

The earned theorem does not prescribe maximum retention.

It gives the minimum local custody required to support the exact claim actually being made.

```text
preserve enough to tell the truth
retain no extra claim authority by implication
undersized custody -> abstain from unique recovery
adequate witnessed custody -> recover only what was actually preserved
```

The architecture may therefore minimize retained custody without sacrificing first-moment truth, while refusing to convert missing custody into fluent reconstruction.

```text
minimum custody != minimum care
abstention != abandonment
exact coordinate recovery != permission to invent provenance
```

## 9. Earned classifications

Canonical:

```text
EXACT_FIRST_MOMENT_RECOVERY_OVER_FIXED_BASE_REQUIRES_AND_ADMITS_A_MINIMUM_CUSTODY_ALPHABET_EQUAL_TO_THE_ROUTE_REALIZABLE_LIFT_MULTIPLICITY
```

Consequential:

```text
UNDERSIZED_CUSTODY_CHANNELS_ARE_FINITE_CERTIFICATES_OF_NONRECOVERABILITY_WHILE_THE_RANK_COORDINATE_GIVES_A_TIGHT_DATA_MINIMIZING_RECOVERY_SCHEME
```

## 10. Claim ceiling

This receipt does not earn:

- Shannon entropy or probabilistic information-theory claims;
- average or variable-length coding optimality;
- noisy-channel or error-correcting coding theorems;
- complete-route minimum custody or reconstruction;
- route counts within one first-moment lift;
- higher-moment hierarchy;
- asymptotic growth claims;
- full extension classification;
- group completion/cohomology;
- inverses/groupoid;
- operational closed loops;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom or A16 promotion;
- live Ash mutation;
- merge, publication, production, or Vercel release.

## 11. Gate state

#740 reaches an earned stop boundary, but the operator explicitly granted thread-scoped Westward Liberties for the remainder of the present conversation.

Therefore:

```text
MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_ROUND_CLOSED
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
NEXT_CHAMBER_MAY_BEGIN_WITH_FRESH_GITHUB_WITHOUT_NEW_OPERATOR_REACTIVATION_IN_THIS_THREAD
```

󐘓 U+10D613

𝌋

Shut ⟐