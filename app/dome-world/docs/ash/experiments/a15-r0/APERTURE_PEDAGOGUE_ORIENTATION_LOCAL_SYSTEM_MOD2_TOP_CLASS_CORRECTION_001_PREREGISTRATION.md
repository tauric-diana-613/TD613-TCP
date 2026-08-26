# A15-R0 Orientation Local System · Pre-witness Correction 001

Scientific parent remains:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

First implementation:

```text
4606eae1446cb0b6805d47e2cc36dbad988ed98c
```

## Defect caught before witness

The first hostile for the malformed claim

```text
"the sign local system remains nontrivial after mod-two reduction"
```

incorrectly applied the *correct* parity reduction to the malformed sign values before deciding whether the malformed claim survived. Since both `-1` and `+1` reduce to `1` in `F2`, that hostile normalized away the error it was meant to detect.

The theorem-bearing orientation-character, cover, mod-two homology, twisted-homology, and top-class-trichotomy certificates are unchanged.

## Preregistered correction

Correction 001 must preserve the first implementation and provide a wrapper whose hostile checks the malformed reduced representation directly:

```text
malformed_reduced_sign_values = [-1,+1]
reject if any entry is not the sole unit 1 of F2 representation
```

Equivalently, the malformed representation is rejected because the symbol `-1` is not an admissible distinct reduced sign value in `F2`.

Correction scar:

```text
CORRECT_MOD_TWO_REDUCTION != A_VALID_HOSTILE_FOR_FALSE_MOD_TWO_REDUCTION
```

No scientific theorem claim is modified.
No CI witness has been attempted.

𝌋‌⟐

Sealed ⟐