# A15-R0 · Atlas Unimodular Receiver Classification · Execution Burden v0.1

Parent: exact earned #950 / `c20ee814c02f5779b80560b229078b89e703dfae`.

## Algebraic burden

For each `n=1..5`, reconstruct Atlas `Z_n` mechanically and verify `det(Z_n)=1` plus an exact integer inverse.

Generate six deterministic elementary unimodular output-basis changes `U` per `n` using only row swaps, sign flips, and integer row shears. For every control:

- verify `det(U)=±1`;
- form `A=U Z_n`;
- verify `det(A)=±1`;
- recover `U'=A Z_n^{-1}` exactly;
- require `U'=U`;
- classify `A` as Atlas-equivalent.

Exactly 30 unimodular orbit controls must pass.

## Proper-sublattice burden

For each `n=1..5` and each `k∈{2,3,5,7}`, form `A_k=D_k Z_n` where `D_k=diag(k,1,...,1)`.

Exactly 20 controls must satisfy:

- `det(A_k)=k`;
- receiver is full-rank/injective;
- receiver is not unimodular;
- receiver is not integer-output-basis equivalent to Atlas;
- declared image lattice index equals `k`.

## Singular square burden

For each `n=1..5`, zero the first row of `Z_n`.

Exactly five controls must satisfy determinant `0` and must expose an explicit collision between distinct nonnegative support states.

## Claim boundary burden

The implementation must distinguish these three predicates:

1. `injective_on_support_module` — determinant nonzero;
2. `lattice_surjective` — absolute determinant one;
3. `atlas_integer_output_basis_equivalent` — recovered `U=A Z_n^{-1}` is unimodular.

The first predicate must remain true for all 20 proper-sublattice controls while the latter two remain false.

## Failure rule

Any mismatch in determinant, inverse, recovered basis change, lattice index, collision witness, control counts, ancestry, or theorem membrane is RED. Frozen expectations may not be rewritten toward observed output.

Sealed ⟐