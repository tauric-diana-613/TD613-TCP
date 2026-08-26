𝌋‌⟐

# A15-R0 · Universal-Coefficient Holonomy Representability · Pre-Witness Correction 001

Status: **PREREGISTERED / PRE-CORRECTION / PRE-WITNESS**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

Original chamber preregistration:

```text
3e91d37f1bd8faa582f5f2c2ab047850aae8e737
```

Original implementation:

```text
592760a21209654ebd8970bfff89b6a832c0874f
```

## Exact pre-witness mismatch

The inherited #775 `explicitBarH2BasisCertificate()` stores its exact group payload as

```text
basis.global_H2 = "Z ⊕ Z/2"
```

while the first implementation aggregate accidentally required

```text
basis.global_H2 === "H2_bar(B;Z) ≅ Z ⊕ Z/2"
```

The theorem content is identical; the comparison wrapper is not.

No CI witness has been attempted. This is therefore a pre-witness implementation correction, not a repaired scientific red.

## Authorized correction

Create one narrow wrapper module that:

1. reuses the original implementation's individual certificates unchanged;
2. recomputes only the UCT aggregate gate against the exact inherited payload `"Z ⊕ Z/2"`;
3. recomputes the top-level aggregate status and earned classification list from the already-declared component certificates;
4. preserves every theorem statement, hostile, authority ceiling, and scar from the original preregistration.

The original implementation remains in ancestry as provenance. It is not itself an authority-bearing aggregate after this correction.

Forbidden changes:

```text
no theorem widening
no coefficient-group widening beyond the preregistered arbitrary-Ab statement
no naturality change
no faithful-target criterion change
no minimal-image change
no #775 mutation
no SRC mutation
no workflow mutation
no merge
no production
no Vercel
```

Canonical scar:

```text
EXACT_PARENT_PAYLOAD != PROSE_WRAPPER_STRING
```

𝌋‌⟐

Sealed ⟐