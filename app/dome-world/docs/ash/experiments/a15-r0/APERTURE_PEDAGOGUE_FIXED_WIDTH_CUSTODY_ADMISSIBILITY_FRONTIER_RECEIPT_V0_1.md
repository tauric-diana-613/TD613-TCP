𝌋

# A15-R0 · Fixed-Width Custody Admissibility Frontier · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent receipt:

```text
#740
76e3726ba58f7b4b5594c0a41557e26d58e4b62a
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

---

## 0. Custody

```text
preregistration       f407182b5786ca786b93b5e39d89322dbbb69c69
frozen science        c6ff4b6dbfaca5ff9d846a3a6de276a4bc0ca82c
routed witness        e67e8b61a3c888bc28837224b5b61d25957523e0
post-route cleanup    2f755fb7c5be853e927dd115c3678dcd51501a87
```

Authority-bearing witness:

```text
TD613 Consolidated Validation run 2171 / 32759469106  SUCCESS
classifier job 97534567904                              SUCCESS
static job     97534625746                              SUCCESS
A15/A15-R0 step 19                                      SUCCESS
```

No scientific red occurred.

Explicit full-repository validation, self-hosted calibration, front-line browser, Giving/practice browser, and full-product browser scopes were skipped and are not claimed.

Frozen science `c6ff4b6d...` -> cleanup `2f755fb7...` contains three routing/custody commits and **zero net changed files**.

---

## 1. Earned object

Fix a route-realizable operational base

```text
x=(t,E,O)
```

and a finite fixed binary custody width

```text
b>=0.
```

A `b`-bit custody field has exactly

```text
C_b=2^b
```

distinguishable labels.

#739 established the exact route-realizable first-moment lift set.

For `t=0`, route-realizability requires `O=0` and

```text
F_x={0}
N_x=1.
```

For `t>=1`, define

```text
M_x=floor(t/2)E+floor((t-1)/2)O.
```

Then

```text
F_x={O+2r : 0<=r<=M_x}
N_x=M_x+1.
```

#740 established that exact deterministic first-moment custody over fixed `x` requires and admits an alphabet of minimum size

```text
K_min(x)=N_x,
```

with exact minimum fixed-width binary payload

```text
B_min(x)=ceil(log2 N_x).
```

---

## 2. Earned sharp fixed-width admissibility theorem

For every route-realizable `x` and every finite `b>=0`, exact deterministic first-moment custody using a `b`-bit fixed-width field is possible **if and only if**

```text
N_x <= 2^b.
```

For `t>=1`, because `N_x=M_x+1`, this is exactly equivalent to

```text
M_x <= 2^b-1
```

or

```text
floor(t/2)E + floor((t-1)/2)O <= 2^b-1.
```

Thus the exact certified domain is

```text
D_b = {
  (0,E,0) : E>=0
}
union
{
  (t,E,O) : t>=1,
  floor(t/2)E + floor((t-1)/2)O <= 2^b-1
}.
```

Earned iff classification:

```text
x in D_b
iff
b fixed binary bits can support exact deterministic first-moment custody at x.
```

---

## 3. Necessity

#740's exact minimum-custody theorem gives:

```text
exact deterministic recovery
=> injective encoder F_x -> A_x
=> |A_x| >= N_x.
```

A `b`-bit field has `|A_x|<=2^b`.

Therefore exactness requires

```text
N_x<=2^b.
```

For `t>=1`:

```text
N_x=M_x+1,
```

so exactness requires

```text
M_x<=2^b-1.
```

Outside this domain, impossibility occurs by finite cardinality before model quality, decoder sophistication, or inference strategy enters the question.

---

## 4. Sufficiency

Inside the domain, #740's rank coordinate

```text
R=(P-O)/2
```

satisfies

```text
0<=R<=M_x<=2^b-1.
```

Therefore `R` fits injectively in exactly `b` binary bits.

The witnessed encoder is

```text
P -> R=(P-O)/2 -> binary_b(R).
```

The witnessed decoder on lawful labels is

```text
binary_b(R) -> R -> P=O+2R.
```

Every lawful first-moment lift round-trips exactly.

Unused binary labels, when `N_x<2^b`, are explicitly **not histories**. Decoding a bit pattern whose rank lies outside `0,...,M_x` abstains rather than fabricating an additional lawful past.

---

## 5. Boundary sharpness

For `t>=1`, equality

```text
M_x=2^b-1
```

gives

```text
N_x=2^b.
```

The rank map uses every available binary label and exact custody remains possible.

One unit beyond:

```text
M_x=2^b
```

gives

```text
N_x=2^b+1,
```

which cannot inject into `2^b` labels.

Therefore the frontier is exact and sharp.

Witnessed controls include:

```text
b=0:
  inside  (2,0,0)  N=1
  outside (2,1,0)  N=2

b=1:
  inside  (2,1,0)  N=2
  outside (2,2,0)  N=3

b=2:
  inside  (2,3,0)  N=4
  outside (2,4,0)  N=5
```

Mixed `E/O` control at `b=2`, `t=3`:

```text
inside  (3,1,2): M=3, N=4
outside (3,2,2): M=4, N=5.
```

---

## 6. Earned universal finite fixed-width impossibility

For every finite integer `b>=0`, define the explicit finite route-realizable base

```text
x_b=(2,2^b,0).
```

Then

```text
M_xb
= floor(2/2)2^b + floor(1/2)0
= 2^b,
```

and therefore

```text
N_xb=2^b+1.
```

But the fixed-width field has only

```text
2^b
```

labels.

Hence

```text
N_xb > 2^b,
```

so no injective exact encoder exists at `x_b`.

Therefore:

```text
NO_FINITE_GLOBALLY_FIXED_BINARY_CUSTODY_WIDTH_CAN_UNIVERSALLY_PRESERVE_EXACT_FIRST_MOMENT_HISTORY_OVER_ALL_ROUTE_REALIZABLE_BASES
```

This theorem is not an asymptotic extrapolation. Every proposed finite width `b` is defeated by one explicit finite witness base `x_b`.

One counterexample to the symbolic family would falsify the universal theorem.

---

## 7. Retestability / falsification surface

The result remains exactly falsifiable.

It fails if any one of the following is produced:

1. A route-realizable base inside `D_b` for which no injective `b`-bit exact rank custody scheme exists.
2. A route-realizable base outside `D_b` for which a deterministic exact `b`-bit encoder/decoder exists over the entire lawful lift set.
3. A lawful first-moment lift inside `D_b` that fails binary-rank round-trip.
4. A boundary point `M_x=2^b-1` that is not exactly recoverable.
5. A point `M_x=2^b` that is exactly recoverable with only `b` bits.
6. A finite `b` for which `x_b=(2,2^b,0)` does not have `N_xb=2^b+1`.
7. An implementation that promotes an unused bit pattern into a lawful history.
8. An implementation that certifies a colliding encoder merely because nominal bit capacity is adequate.

---

## 8. Hostiles that survived

### 8.1 Off-by-one frontier hostile

The incorrect condition

```text
M_x<=2^b
```

was rejected. The exact condition is

```text
M_x<=2^b-1.
```

The witness `x_b=(2,2^b,0)` sits exactly at the incorrect extra point and requires `2^b+1` labels.

### 8.2 Unused-label hostile

At

```text
x=(2,1,0), b=2,
```

only two lawful lifts exist:

```text
P=0 -> 00
P=2 -> 01.
```

The labels

```text
10
11
```

abstain as unused. They are capacity residue, not hidden histories.

### 8.3 Collision laundering hostile

At

```text
x=(2,3,0), b=2,
```

capacity is exactly four labels for four lawful lifts.

A deliberately colliding encoder still fails exact certification.

Thus:

```text
adequate nominal width
!=
witnessed exact custody.
```

### 8.4 `t=0` hostile

Every route-realizable `(0,E,0)` remains admissible even at `b=0`, because the first-moment lift spectrum is singleton.

Coordinates `(0,E,O>0)` abstain as not route-realizable rather than being misclassified by the frontier.

### 8.5 Complete-route impersonation hostile

Distinct authored routes sharing `(t,E,O,P)` still receive the same exact first-moment custody encoding.

Therefore:

```text
exact fixed-width first-moment custody
!=
complete route provenance.
```

---

## 9. Consequential architecture law

The earned architecture law is:

```text
A fixed-width custody field defines an exact claim-admissibility domain.
```

For a chosen width `b`, the system may make exact first-moment recovery claims only on `D_b` with a witnessed injective encoder/decoder.

Outside `D_b`, the lawful options are:

```text
1. widen/adapt the custody field;
2. explicitly bound the supported state domain;
3. abstain from unique first-moment recovery.
```

A storage schema, API field, database column, model token budget, or transport envelope may not treat implementation convenience as universal provenance authority.

The theorem therefore turns field width into a finite, testable **epistemic claim boundary**.

---

## 10. Good-through-󐘓 U+10D613 landing

Earned landing law:

```text
schema width is claim authority
insufficient width -> visible abstention
unused labels -> not invented histories
adequate width -> recover only the coordinate actually preserved
```

This preserves the #740 data-minimization result.

The theorem does not demand that TD613 retain everything. It says that when a system chooses a bounded custody field, it must either remain inside the domain that field can truthfully support or make the insufficiency visible.

The result blocks a particularly dangerous form of synthetic memory:

```text
fixed schema convenience
-> silent collision / truncation
-> fluent unique reconstruction
-> counterfeit provenance
```

The earned membrane instead requires:

```text
fixed schema convenience
-> exact domain check
-> recover when certified
-> abstain when not certified.
```

---

## 11. Earned classifications

Canonical:

```text
FIXED_b_BIT_FIRST_MOMENT_CUSTODY_IS_EXACTLY_ADMISSIBLE_ON_THE_SHARP_DOMAIN_N_x_LE_2_POW_b
```

Consequential:

```text
NO_FINITE_GLOBALLY_FIXED_BINARY_CUSTODY_WIDTH_CAN_UNIVERSALLY_PRESERVE_EXACT_FIRST_MOMENT_HISTORY_OVER_ALL_ROUTE_REALIZABLE_BASES
```

Architectural:

```text
FIXED_WIDTH_CUSTODY_SCHEMA_DEFINES_A_SHARP_EXACT_RECOVERY_DOMAIN_AND_MUST_ABSTAIN_OR_WIDEN_BEYOND_IT
```

---

## 12. Claim ceiling

Still not earned:

- Shannon entropy;
- probabilistic information theory;
- average-case or variable-length coding optimality;
- source coding theorems;
- noisy-channel or error-correcting capacity;
- cryptographic security;
- complete-route custody or reconstruction;
- route counts within a single first-moment lift;
- higher moments or asymptotic hierarchy;
- full extension classification;
- group completion or group cohomology;
- inverses or groupoid structure;
- operational loops;
- connection, holonomy, curvature, Berry phase, or quantum analogy;
- Proto-Loom;
- A16;
- live Ash mutation;
- merge;
- publication;
- production;
- Vercel release;
- ontology promotion.

The phrase `universal impossibility` remains restricted to **finite globally fixed-width deterministic exact first-moment custody over the full unbounded route-realizable base domain**.

---

## 13. Stop boundary

```text
FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_ROUND_CLOSED
NEXT_EARNED_CHAMBER_MAY_PROCEED_UNDER_THREAD_SCOPED_WESTWARD_LIBERTIES
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
```

No merge, publication, production, Vercel release, Proto-Loom/A16 promotion, or ontology promotion occurred.

󐘓 U+10D613

𝌋

Noted ⟐