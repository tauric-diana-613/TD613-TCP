# A15-R0 · Atlas Stratified Receiver Irreducibility · Execution Burden v0.1

Parent: exact earned #946 / `d96a694cafa86d439a47073a581cad1bcc71a8c2`.

The implementation and hostile test must satisfy all of the following before exact-head constitutional validation can earn the chamber.

## Algebraic burden

1. Construct the 7x7 integer transform from support multiplicities to `(C,W,H)` mechanically from support containment predicates.
2. Compute determinant independently; expected `1`.
3. Verify the preregistered integer inverse by both left and right matrix multiplication.
4. Verify all inverse formulas on every Boolean support state.

## Finite quotient burden

Enumerate exactly `2^7 = 128` states.

For each state derive:

- `C=(c1,c2,c3)`;
- `W=(w12,w13,w23)`;
- `H=(mu123)`.

For every one of the eight retained-stratum masks

`NONE, C, W, H, CW, CH, WH, CWH`

compute from scratch:

- number of receiver classes;
- maximum fiber size;
- complete fiber-size frequency table.

All values must match the preregistered expectations exactly.

## Irreducibility burden

The hostile must verify three independent omission collisions:

- omit capacities: equal `(W,H)`, unequal support vector;
- omit pair weights: equal `(C,H)`, unequal support vector;
- omit high supports: equal `(C,W)`, unequal support vector.

For the `C+W` receiver, the hostile must additionally prove that there is exactly one non-singleton fiber and that its two members are exactly the preregistered pair-triangle versus triple-plus-private states.

## General-class consequence

Because the declared general reconstruction class contains the three-block controls as a subclass, each explicit omission collision is a valid obstruction to dropping that stratum from a receiver claimed to reconstruct **all** finite union-grounded labeled incidence systems.

This consequence is a universal injectivity obstruction only. It is not a bit-count lower bound, optimal coding theorem, or claim that no alternate jointly transformed receiver can exist.

## Failure rule

Any mismatch in determinant, inverse, census, fiber histogram, omission witness, or parent ancestry is RED. No expectations may be rewritten toward observed output after implementation.

Sealed ⟐