𝌋

# A15-R0 · Composition-Boundary Custody Amplification · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Scientific parent:

```text
#741 receipt = 5415eafb5da59beba68fcffc83475d04c19db1d4
```

Westward authority:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Custody

```text
preregistration       5c7ba42b10c4497c31e8862887d6b50562285fe5
frozen science        56ffd3f018e053271ec29b7155e7042bbb8da3eb
routed witness        d65d613a6643119b35e001be8aab269556022d8a
post-route cleanup    ca0a2214f2031b777d3c62bb486a7b60a36aa9ce
```

Frozen science -> cleanup contains three routing-only commits and zero net changed files.

Authority-bearing witness:

```text
TD613 Consolidated Validation run 2173 / 32760528566  SUCCESS
classifier job 97538026462                              SUCCESS
static job     97538090822                              SUCCESS
A15/A15-R0 step 19                                      SUCCESS
```

Explicit full-repository validation: **SKIPPED / NOT CLAIMED**.

Explicit self-hosted calibration: **SKIPPED / NOT CLAIMED**.

Front-line browser witness: **SKIPPED / NOT CLAIMED**.

Giving/practice browser witness: **SKIPPED / NOT CLAIMED**.

Full-product browser witness: **SKIPPED / NOT CLAIMED**.

No scientific red occurred.

### Operational scars preserved

1. Before the research branch existed, the first attempt to write the preregistration file was rejected by GitHub with a branch-not-found 404. No repository mutation occurred. The branch was then created from the exact #741 receipt head and the preregistration was written unchanged.
2. The first routing-note commit did not attach a workflow run. A routing-metadata-only synchronization annotation produced the exact-head pull-request event. No scientific file changed.
3. A premature live-log fetch returned a transient blob-not-found 404 while the job was still running. The workflow/job status APIs remained authoritative and later recorded the successful completed witness.

These are infrastructure/custody scars, not theorem failures.

## 1. Earned theorem A · affine first-moment rank composition

For route-realizable bases

```text
x=(t,E,O)
y=(u,F,G)
q_y=F+G
```

and lawful first-moment ranks

```text
R_x=(P_x-O)/2
R_y=(P_y-G)/2,
```

define

```text
kappa(x,y)=floor(t/2)(F+G)+(t mod 2)G.
```

Then for every finite authored concatenation with these factor coordinates,

```text
R_xy=R_x+R_y+kappa(x,y).
```

The proof is symbolic from the already-witnessed #733 first-moment composition law and #729 parity-twisted quotient product.

If `t` is even:

```text
O_(x★y)=O+G
R_xy=R_x+R_y+(t/2)(F+G).
```

If `t` is odd:

```text
O_(x★y)=O+F
R_xy=R_x+R_y+((t-1)/2)F+((t+1)/2)G
    =R_x+R_y+floor(t/2)(F+G)+G.
```

Thus the affine law is exact.

## 2. Earned theorem B · exact factorization-conditioned rank spectrum

Let #739's maximum lawful ranks be `M_x` and `M_y`.

If custody retains only the factorization statement

```text
product arose as x followed by y
```

while not retaining the exact internal factor routes, then the exact lawful output-rank set is

```text
C_(x,y)={kappa(x,y)+r : 0<=r<=M_x+M_y}.
```

Therefore

```text
|C_(x,y)|=M_x+M_y+1.
```

There are no interior gaps. Every predicted rank received a constructive route witness by choosing factor ranks whose sum is the required residual and invoking the #739 route constructors before concatenation.

## 3. Earned theorem C · exact boundary-erasure expansion

Let

```text
z=x★y.
```

After factorization custody is erased and only the product base `z` remains, #739 admits the full rank set

```text
R_z={0,1,...,M_z}.
```

The factorization-conditioned interval sits inside that full interval.

The exact number of omitted low-rank candidates is

```text
L(x,y)=kappa(x,y).
```

The exact number of omitted high-rank candidates is

```text
U(x,y)=M_z-[kappa(x,y)+M_x+M_y].
```

The symbolic parity reduction gives the explicit nonnegative formula

```text
U(x,y)
 = floor(u/2)(E+O)+(u mod 2)O     when t even
 = floor(u/2)(E+O)+(u mod 2)E     when t odd.
```

Hence

```text
M_z=M_x+M_y+L(x,y)+U(x,y).
```

The exact first-moment rank-candidate expansion caused by forgetting the declared factorization is

```text
A_boundary(x,y)
 = |R_z|-|C_(x,y)|
 = L(x,y)+U(x,y)
 = M_z-M_x-M_y.
```

This counts additional lawful **first-moment rank candidates**. It does not count authored routes and carries no probability or entropy interpretation.

## 4. Earned theorem D · no finite D_b is composition-closed

For every finite `b>=0`, define the explicit route-realizable factor pair

```text
x_b=(1,2^b,0)
y=(1,0,0).
```

Each factor has

```text
M=0
N=1
B_min=0.
```

Thus both lie in `D_0` and therefore in every `D_b`.

But #729 composition gives

```text
x_b★y=(2,2^b,0).
```

For the product:

```text
M=2^b
N=2^b+1
B_min=ceil(log2(2^b+1))=b+1.
```

Therefore, for every finite `b`,

```text
x_b in D_b
y   in D_b
x_b★y notin D_b.
```

So:

```text
FOR_EVERY_FINITE_b_THE_FIXED_WIDTH_EXACT_CUSTODY_DOMAIN_D_b_IS_NOT_CLOSED_UNDER_THE_QUOTIENT_MONOID_PRODUCT.
```

Even more sharply:

```text
TWO_ZERO_ADDITIONAL_CUSTODY_INPUTS_CAN_COMPOSE_TO_REQUIRE_ARBITRARILY_LARGE_FINITE_OUTPUT_CUSTODY_WIDTH.
```

The universal authority is the explicit finite witness family, not horizon enumeration.

## 5. Boundary-erasure family · one candidate becomes 2^b+1

For the same `x_b,y`:

```text
M_x=M_y=0
kappa=0
C_(x_b,y)={0}.
```

With the factorization retained, the output has exactly one first-moment rank candidate.

After the factorization is forgotten and only `x_b★y=(2,2^b,0)` remains:

```text
R_(x_b★y)={0,1,...,2^b}.
```

Thus

```text
A_boundary(x_b,y)=2^b.
```

This is an exact finite certificate that a composition boundary can carry custody value at first-moment resolution even when both factor bases locally require zero additional first-moment bits.

## 6. Critical anti-overclaim

Composition itself did not destroy the actual first moment.

When exact factor ranks are preserved,

```text
R_xy=R_x+R_y+kappa
```

computes the composed rank exactly.

The newly admitted alternatives arise when the factorization and/or composed-rank custody needed to constrain later interpretation is discarded.

Therefore:

```text
composition != information loss
boundary erasure can cause admissible-history expansion
```

Likewise:

```text
factorization boundary != complete route provenance
conditioned rank spectrum != route-count spectrum
rank-candidate expansion != Shannon entropy
first-moment custody != complete authored-route custody
```

## 7. Forensic-AI interpretation · high speculation, explicitly non-promoted

The theorem is internal to TD613's declared finite route grammar. It does not prove a theorem about arbitrary LLMs, RAG systems, databases, or agent stacks.

It does, however, supply a rigorous experimental analogue for a recurrent provenance problem in composed information systems: individually adequate summaries or annotations need not remain adequate after a composition step if the derivation boundary that constrained interpretation is discarded.

That analogy is especially relevant to systems that repeatedly compress, aggregate, merge, or re-register intermediate results. It remains an analogy until a separate empirical bridge is designed and witnessed.

## 8. Good-through-󐘓 U+10D613 landing

The earned architecture law is:

```text
input admissibility != output admissibility
composition boundary != disposable metadata when the claim depends on it
boundary erasure may widen lawful-history ambiguity
exact factor ranks can be composed exactly
output custody must be revalidated after composition
```

The ethical rule remains minimum truthful custody rather than indiscriminate retention:

```text
preserve the smallest factor/boundary/rank information required by the intended claim;
when that information is erased, narrow the claim, widen custody prospectively, or abstain.
```

No invented history may be inserted merely because the boundary-erased product base permits additional lawful candidates.

## 9. Earned classifications

Canonical:

```text
FIRST_MOMENT_RANK_COMPOSES_AFFINELY_WITH_EXACT_BOUNDARY_OFFSET_AND_RETAINED_FACTORIZATION_DEFINES_A_STRICTLY_SMALLER_CONDITIONED_LIFT_SPECTRUM_WHEN_BOUNDARY_EXPANSION_IS_POSITIVE
```

Consequential:

```text
FOR_EVERY_FINITE_WIDTH_b_TWO_ZERO_ADDITIONAL_CUSTODY_INPUTS_CAN_COMPOSE_TO_AN_OUTPUT_REQUIRING_b_PLUS_1_BITS_SO_NO_D_b_IS_COMPOSITION_CLOSED
```

Architectural:

```text
COMPOSITION_MUST_REVALIDATE_OR_WIDEN_CUSTODY_BECAUSE_LOCAL_INPUT_TRUTHFULNESS_DOES_NOT_INHERIT_TO_A_BOUNDARY_ERASED_OUTPUT
```

## 10. Claim ceiling

Still not earned:

- complete-route reconstruction;
- route counts within a rank;
- Shannon entropy, mutual information, channel capacity, or probabilistic uncertainty;
- variable-length or average-case coding optimality;
- noisy channels/error correction;
- cryptographic provenance;
- a general theorem about arbitrary AI/database/retrieval architectures;
- higher-moment completeness or asymptotics;
- full extension classification;
- group completion/cohomology, inverses, groupoid, or operational loop claims;
- connection, holonomy, curvature, Berry, or quantum analogy;
- Proto-Loom or A16;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

```text
COMPOSITION_BOUNDARY_CUSTODY_AMPLIFICATION_ROUND_CLOSED
WESTWARD_LIBERTIES_GATE_737 = THREAD_SCOPED_ACTIVE
```

󐘓 U+10D613

𝌋

Sealed ⟐