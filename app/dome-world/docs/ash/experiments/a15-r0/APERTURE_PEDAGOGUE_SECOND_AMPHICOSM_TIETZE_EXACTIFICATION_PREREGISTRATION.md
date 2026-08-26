# A15-R0 · Second Amphicosm Tietze Exactification

Pre-witness strengthening of the identification chamber.

The first implementation already checks that the candidate Conway–Rossetti generators inside #775 `G` satisfy the negative-amphicosm relations and recover the inherited generators. Before any witness, require an explicit reverse Tietze derivation so that the result is an isomorphism statement rather than a quotient/presentation-match statement.

Start from

```text
P_- = <W,X,Z |
       W^-1 Z W = Z^-1,
       X^-1 Z X = Z^-1,
       X^-1 W^-1 X W = Z>.
```

Define inside `P_-`

```text
T = W
e = X W^-1
o = W e W^-1.
```

Required derivation:

1. `e^-1 Z e = Z`:
   `e^-1 Z e = W X^-1 Z X W^-1 = W Z^-1 W^-1 = Z`.

2. From the commutator relation,
   `W^-1 X W = X Z`.
   Conjugating and using `W Z W^-1=Z^-1` also gives
   `W X W^-1 = X Z`.

3. Therefore
   `o = W e W^-1 = e Z^-1`.

4. Since `e` commutes with `Z`, `e` commutes with `o=eZ^-1`.

5. By definition, `T e T^-1=o`.

6. Finally
   `T o T^-1 = W(eZ^-1)W^-1 = o Z = e`.

Thus `T,e,o` satisfy the inherited parent presentation

```text
<T,e,o | [e,o]=1, T e T^-1=o, T o T^-1=e>,
```

which is the semidirect product `Z^2 ⋊_swap Z` earned by #775.

The forward substitution remains

```text
W=T
X=eT
Z=e o^-1.
```

The two substitutions recover each generating set, establishing a Tietze equivalence between the inherited #775 presentation and the Conway–Rossetti negative-amphicosm presentation.

Required scar:

```text
RELATION_MATCH_PLUS_GENERATION != PRESENTATION_ISOMORPHISM_WITHOUT_REVERSE_TIETZE_CERTIFICATE
```

No theorem authority is promoted by this preregistration.

𝌋‌⟐
