# A15-R0 · Atlas Matroidal Receiver Closure / Basis Exchange Burden

Frozen before implementation.

Parent: `#924 / ae53ebdc5fa970c162768fb694e826edc23fb0bb`.

## Ground set

```text
E={q00,q01,q10,q11}
|E|=4
subsets=16
```

The successor must import the earned #924 certificate only as an ancestry and source-closure gate. Matroid structure must be derived from the complete earned closure tables, not from the expected labels `U_1_2` or `U_2_3`.

## Closure-axiom census

For each D and Q closure:

```text
extensivity checks                    16
idempotence checks                    16
ordered subset pairs                 256
inclusion premises                    81
Steinitz candidate (S,x,y) triples   256
rank/closure checks                    64
rank-submodularity pairs              256
```

Combined:

```text
extensivity checks                    32
idempotence checks                    32
ordered subset pairs                 512
inclusion premises                   162
Steinitz candidate triples           512
rank/closure checks                  128
rank-submodularity pairs             512
```

Every failure count must be zero.

## Steinitz exchange exact targets

The hostile must count the number of triples whose antecedent is true, rather than merely checking implications vacuously.

```text
D true antecedents  16
Q true antecedents  30
combined            46
failures             0
```

## Rank reconstruction

Rank is reconstructed only from closure:

```text
r(X)=min{|I| : X subseteq cl(I)}
```

Required exact spectra:

```text
D rank-frequency {0:4,1:12}
Q rank-frequency {0:2,1:6,2:8}
```

Required closure/rank identity on every subset-coordinate case:

```text
e in cl(S) iff r(S union {e}) = r(S)
```

Required rank submodularity on every ordered pair:

```text
r(S)+r(T) >= r(S union T)+r(S intersect T)
```

## Derived combinatorics

Independent sets are those with `r(I)=|I|`.

```text
D independent masks [0,2,4]
Q independent masks [0,1,2,3,4,5,6]
```

Bases are maximal independent sets / independent sets of full rank:

```text
D bases [2,4]
Q bases [3,5,6]
```

These must equal the earned #924 minimum faithful receiver masks exactly.

Circuits must be derived as minimal dependent nonempty sets:

```text
D circuits [1,6,8]
Q circuits [7,8]
```

Loops must be derived as singleton circuits / elements of `cl(empty)`:

```text
D loops [0,3]
Q loops [3]
```

Nonloop parallel pairs must be derived from rank-two-element tests or two-element circuits:

```text
D [[1,2]]
Q []
```

## Basis exchange

For every ordered basis pair and every `x in B1\B2`, require some `y in B2\B1` such that `(B1-x)+y` is a basis.

```text
D obligations 2; failures 0
Q obligations 6; failures 0
combined       8; failures 0
```

## Exact finite identifications

Only after all preceding checks pass may the child register:

```text
D ~= U_{1,2} direct-sum two loops
Q ~= U_{2,3} direct-sum one loop
```

This is an isomorphism statement about the declared four-coordinate finite receiver closures, not a claim that arbitrary receiver closures are matroids.

## Negative membranes

```text
MATROIDAL_RECEIVER_CLOSURE != UNIVERSAL_RECEIVER_MATROID_THEOREM
MATROID_RANK != SHANNON_INFORMATION
MATROID_LOOP != PHYSICAL_DISCONNECTION
MATROID_PARALLELISM != DUPLICATE_PHYSICAL_SENSOR
BASIS != UNIQUE_OPTIMAL_EXPERIMENT
RECEIVER_EXCHANGE != CAUSAL_SUBSTITUTABILITY
FINITE_MATROID_ISOMORPHISM != PHYSICAL_STRUCTURE
MINIMUM_FAITHFUL_RECEIVER_BASIS != MINIMUM_PHYSICAL_SENSOR_ARRAY
CLOSURE_EXCHANGE_IN_THIS_FIXTURE != UNIVERSAL_CLOSURE_EXCHANGE
```

Sealed ⟐