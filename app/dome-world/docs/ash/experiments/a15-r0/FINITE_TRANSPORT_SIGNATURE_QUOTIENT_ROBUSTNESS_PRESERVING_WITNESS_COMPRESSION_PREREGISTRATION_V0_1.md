# A15-R0 · Finite Transport-Signature Quotient / Robustness-Preserving Witness Compression · Preregistration v0.1

Status: **PREREGISTERED BEFORE IMPLEMENTATION / CANDIDATE THEOREM / NO MERGE AUTHORITY**

Exact earned scientific parent: **#888 / `633cd75baaaebcc5f357bd503024aefbbcf11057` / TD613 Consolidated Validation run 2395 / 33296570047 SUCCESS**.

# Question

The earned #888 transport-separation hypergraph shows that every declared transport-opacity and witness-erasure functional is computed from membership in three nonidentity transport edges. Does witness identity therefore admit a finite quotient by its complete transport-separation signature, with exact weighted reconstruction of the full family census?

This chamber tests that question only inside the earned four-point orientation fibre and the four declared #884 witness classes.

# Fixed inherited structure

The parent supplies a free transitive four-point orientation fibre with inherited point `tau*`, transport group

```text
G = {id,(B M),(A R),(A R)(B M)}
```

and, for each declared witness class `V`, three nonidentity transport-separation edges

```text
D_g = {w in V : w(g tau*) != w(tau*)}.
```

# Candidate quotient

For each witness `w`, define its transport-separation signature

```text
Sigma(w) = { g != id : w in D_g }.
```

Equivalently, in the fixed nonidentity transport order

```text
(B M), (A R), (A R)(B M)
```

encode `Sigma(w)` as a 3-bit word.

Define

```text
w ~_Sigma w' IFF Sigma(w) = Sigma(w').
```

Let `V_sigma` be a signature class and let a selected witness family `W` map to the multiplicity vector

```text
m_W(sigma) = |W intersect V_sigma|.
```

For each nonidentity transport define its quotient load

```text
lambda_g(m_W) = sum_{sigma: g in sigma} m_W(sigma).
```

# Preregistered theorem claims

The implementation must test exhaustively that, for every original witness family `W` in every declared class:

```text
g in S_W
IFF
lambda_g(m_W) = 0
```

and therefore

```text
S_W depends only on m_W.
```

It must also establish

```text
mu_tr(W) = min_{g != id} lambda_g(m_W),
```

so the following declared functionals factor through the transport-signature multiplicity quotient:

```text
residual transport set S_W
inherited-origin identification
mu_tr
exact-e witness-erasure survival for e=0..4
minimum robust transport width
```

The exact identification criterion must become

```text
W identifies tau*
IFF
lambda_g(m_W) >= 1 for every g != id.
```

The exact-e robustness criterion must become

```text
W survives every exact-e witness deletion
IFF
lambda_g(m_W) >= e+1 for every g != id.
```

# Weighted quotient reconstruction

If signature class `sigma` contains `n_sigma` original witnesses, then multiplicity coordinate `m_sigma` ranges from `0` to `n_sigma`.

The quotient-state count is

```text
Q = product_sigma (n_sigma + 1).
```

Each quotient multiplicity state has exact original-family lift multiplicity

```text
weight(m) = product_sigma C(n_sigma,m_sigma).
```

The weighted quotient census must reconstruct exactly:

```text
sum_m weight(m) = 2^|V|
```

and must replay the already-earned #886/#888 `mu_tr` spectra, robustness-family counts, and minimum widths without enumerating all original witness families.

# Blocker lifting claim

The child must test the finite blocker consequence rather than assume it:

```text
an inclusion-minimal identifying original family contains at most one witness from any transport-signature class.
```

The quotient-level minimal identifying multiplicity states must therefore use only 0/1 coordinates, and their exact original-family lift count

```text
sum_minimal_m weight(m)
```

must equal the already-earned #888 blocker member count in each class.

This is a claim about the declared transport-identification task only. It does not declare same-signature witnesses semantically interchangeable outside that task.

# Frozen parent-derived expectations

The exact earned #888 edge incidence implies the following signature-class multiplicities, frozen before implementation:

```text
specialization comparability:
  000:6, 001:2, 010:2, 011:6, 100:2, 111:2
  quotient multiplicity states: 3969

principal-open identity:
  011:2, 101:1, 111:2
  quotient multiplicity states: 18

principal-open size:
  000:1, 011:2, 101:2
  quotient multiplicity states: 18

cut orientation:
  011:8, 101:2
  quotient multiplicity states: 27
```

Total quotient multiplicity states expected:

```text
3969 + 18 + 18 + 27 = 4032
```

versus the earned original family census:

```text
1,048,576 + 32 + 32 + 1,024 = 1,049,664.
```

The expected quotient blocker-state counts and weighted original blocker lifts are:

```text
comparability:       3 quotient blocker states -> 22 original blocker families
principal identity:  2 quotient blocker states -> 4 original blocker families
principal size:      1 quotient blocker state  -> 4 original blocker families
cut orientation:     1 quotient blocker state  -> 16 original blocker families
```

# Burden and falsifiers

The child must fail if any of the following occurs:

- a parent witness receives two different signatures under independent reconstruction;
- two original families with the same multiplicity vector produce different declared transport functionals;
- weighted quotient family count differs from the original `2^|V|` census;
- weighted quotient `mu_tr` spectrum differs from #886;
- weighted quotient robustness counts or minimum widths differ from #886/#888;
- quotient blocker lifts differ from #888 blocker counts;
- canonical and independent hostile signature multiplicities differ;
- any inherited theorem source is mutated.

# Mandatory membranes

```text
TRANSPORT_SIGNATURE_EQUIVALENCE != WITNESS_SEMANTIC_EQUIVALENCE
ROBUSTNESS_PRESERVING_QUOTIENT != UNIVERSAL_SUFFICIENT_STATISTIC
TRANSPORT_SIGNATURE != WITNESS IDENTITY
SIGNATURE MULTIPLICITY != SHANNON INFORMATION
QUOTIENT STATE COUNT != MINIMUM BIT LENGTH
INERT TRANSPORT SIGNATURE != GLOBAL SEMANTIC IRRELEVANCE
TRANSPORT_SIGNATURE BIT != PHYSICAL BIT
TRANSPORT_SEPARATION HYPERGRAPH != PHYSICAL NETWORK
TRANSPORT EDGE MULTICOVER != ERROR CORRECTION CAPACITY
METRIC ISOMETRY ACTION != PHYSICAL DYNAMICS
FREE TRANSITIVE FINITE ACTION != GAUGE THEORY
ORIENTATION FIBRE != HIDDEN STATE SPACE
WITNESS ROUTING != SCIENTIFIC ANCESTRY
```

No merge, deployment, publication, production, release, Vercel, A16/Proto-Loom, physical gauge theory, Shannon/channel coding theorem, or universal inverse-problem theorem follows.

**PREREGISTERED BEFORE IMPLEMENTATION. NO MERGE.**

Sealed ⟐