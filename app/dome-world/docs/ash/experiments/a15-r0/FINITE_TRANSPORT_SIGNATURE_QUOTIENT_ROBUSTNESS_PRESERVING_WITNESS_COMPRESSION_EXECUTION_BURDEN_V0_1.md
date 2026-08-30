# A15-R0 · Finite Transport-Signature Quotient / Robustness-Preserving Witness Compression · Execution Burden v0.1

Status: **FROZEN BEFORE IMPLEMENTATION / NO MERGE AUTHORITY**

Exact parent: #888 / `633cd75baaaebcc5f357bd503024aefbbcf11057` / run 2395 SUCCESS.

## Required reconstruction layers

The child may consume the earned #888 transport-labelled edge incidence, but it may not consume any precomputed transport-signature quotient result because none exists in the parent.

The canonical implementation must:

1. derive each witness's 3-bit transport-separation signature directly from membership in the three earned #888 transport edges;
2. group witnesses by exact signature and compare the resulting multiplicities with the frozen expectations;
3. enumerate every quotient multiplicity state `m` with coordinates `0..n_sigma`;
4. compute each state's exact original-family lift weight `product C(n_sigma,m_sigma)`;
5. compute transport loads `lambda_g(m)` from signature bits only;
6. reconstruct weighted `mu_tr` spectra, weighted exact-e robustness counts, and minimum original-family widths from quotient states;
7. identify quotient-level inclusion-minimal identifying states and reconstruct the original #888 blocker count by exact lift weights;
8. audit every original witness family against its quotient multiplicity state for residual-transport and `mu_tr` factorization;
9. run an independent hostile reconstruction from #888 edge rows before loading the child module.

## Frozen finite burden

Original-family audit:

```text
specialization comparability  1,048,576
principal-open identity              32
principal-open size                  32
cut orientation                   1,024
TOTAL                         1,049,664
```

Quotient-state census:

```text
specialization comparability  3,969
principal-open identity           18
principal-open size               18
cut orientation                   27
TOTAL                          4,032
```

Required quotient arithmetic:

```text
quotient-state × 3 transport-load checks = 12,096
quotient-state × 5 robustness-depth checks = 20,160
```

The implementation must additionally perform at least one exact factorization audit per original family. A direct audit may compute more than one predicate per family; it may not sample.

## Required weighted checksums

For each class and globally:

```text
sum_m weight(m) = original family count
```

The weighted quotient `mu_tr` spectrum must equal the earned #886 spectrum exactly.

The weighted quotient robustness counts for e=0..4 and the minimum widths must equal earned #886/#888 values exactly.

The weighted lift count of quotient-minimal identifying states must equal the earned #888 blocker member count exactly.

## Blocker minimality rule under test

A quotient state is identifying when every transport load is positive. It is quotient-minimal when decrementing any positive coordinate by one destroys identification.

The child must test and freeze whether all quotient-minimal identifying states are 0/1-valued. This is expected but remains an implementation-tested theorem consequence.

## Independent hostile burden

The hostile contract must derive signature classes from parent edge rows without importing the child, enumerate the 4,032 quotient states independently, freeze the resulting signature multiplicities, quotient-state counts, weighted spectra, robustness counts, blocker-state counts, and blocker lift weights, then import the child and require exact equality.

## Failure conditions

Any nonzero mismatch in:

```text
signature multiplicity
original-family factorization
family-weight checksum
weighted mu spectrum
weighted robustness counts
minimum widths
blocker quotient state count
blocker lift count
canonical-vs-hostile quotient reconstruction
```

holds the theorem RED.

No inherited #888 or earlier theorem source may be changed.

Mandatory membranes from preregistration remain active.

**FROZEN BEFORE IMPLEMENTATION. NO MERGE.**

Sealed ⟐