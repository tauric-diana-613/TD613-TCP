# A15-R0 · Atlas HNF Output-Basis Classification · Execution Burden v0.1

Parent: exact earned #952 / `4b731c16721b43e5319843da84955b3b80210cec` / run 2429 / 33548978221 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Exact arithmetic burden

The classifier must operate over mathematical integers using JavaScript `BigInt` internally. It must not use floating determinant tests, tolerance comparisons, `Number` coercion for matrix arithmetic, or signed-zero-sensitive equality.

For each profile `n=1..4`, dimension `d=2^n-1`:

1. construct Atlas `Z_n` and its exact integer inverse;
2. verify both products are the identity;
3. construct four canonical row-HNF templates;
4. apply four deterministic left-unimodular transforms to each template;
5. form receivers `A = U H Z_n`;
6. recompute `B_A=A Z_n^{-1}`;
7. reduce `B_A` to row HNF by exact extended-gcd row operations;
8. require the recovered HNF to equal the original canonical template exactly;
9. require all transforms of one template to share one class key;
10. require all six template pairs per profile to retain distinct class keys.

Frozen totals:

```text
profiles                                  4
canonical templates/profile               4
unimodular transforms/template            4
exact orbit controls                     64
distinct-template pair controls          24
same-index/different-HNF controls         1
expected failures                         0
```

## Canonical row-HNF conditions

Every recovered H must satisfy:

- square full rank;
- upper triangular;
- positive diagonal pivots;
- `0 <= H[i,j] < H[j,j]` for all `i<j`;
- determinant equal to the absolute determinant of the relative matrix.

## Same-index hostile

At `d=3` require:

`H_1=diag(1,2,2)` and `H_2=diag(1,1,4)`.

Both have determinant/index `4`. They must receive distinct HNF class keys. Any classifier reducing these to one class is RED because determinant/index is not a complete left-`GL_d(Z)` orbit invariant.

## Input-basis membrane

The classifier must perform only left-unimodular reduction of the relative matrix. No right-column operations are permitted in the canonicalization routine. Smith-normal-form-style left-right equivalence is outside this chamber because right operations alter the fixed semantic support basis.

## Metallurgical analogy membrane

The optional cinnabar/refinement analogy may describe the move from a noncanonical integer receiver to its canonical residue, but no material, chemical, historical-alchemical, or transmutation claim may supply mathematical authority. HNF uniqueness and exact integer row operations carry the proof.

Any mismatch is RED. Frozen expectations may not be edited toward observed output.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐