𝌋

# Partition Signature Decoder Radius · Bounded Attack Geometry Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.partition-signature-decoder-radius/v0.1`  
**Parent distance receipt:** `PARTITION_SIGNATURE_CODE_DISTANCE_RECEIPT_V0_1.json`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Purpose

The parent chamber established, for the frozen two-packet `q3/q4` hypothesis signatures, minimum **anchored reassignment distance 4** between every pair of clean codewords.

This chamber does **not** import generic coding-theory correction/detection radii by analogy.

Instead it constructs the exact finite attack graph induced by the custody operation already used in the one-move and two-move corruption assays, then evaluates the actual clean-codeword decoder geometry.

Questions:

1. Can any attack of at most three single membership reassignments transform one clean hypothesis signature into another clean hypothesis signature?
2. Under the declared nearest-clean-signature decoder, what corruption budget is guaranteed to preserve unique source recovery?
3. At what budget does decoder ambiguity first become reachable?
4. At what budget can a wrong clean hypothesis become uniquely nearer than the true source even though the received signature is not itself a clean codeword?
5. Does exact clean-codeword acceptance retain a larger corruption-detection envelope than nearest-codeword correction?

No statement about arbitrary adversaries, cryptographic security, Byzantine tolerance, physical noise, or TD613-general coding is admissible.

---

## 1. Frozen ecology and clean codebook

Ecology:

```text
ZERO
D_12
D_13
D_16
D_17
D_18
D_19
D_24
```

Frozen projective directions:

```text
       q3       q4
H0   [1,13]   [1,9]
H1   [1,12]   [1,20]
H2   [1,19]   [1,18]
H3   [1,20]   [1,29]
```

Each projective direction induces one unlabeled partition of the same eight named ecology states.

Each two-packet clean signature is

```text
C(Hj) = [ Pi_q3(Hj), Pi_q4(Hj) ].
```

The parent chamber's frozen minimum clean-codeword anchored reassignment distance is 4.

---

## 2. Trusted anchor and custody model

`ZERO` is a trusted named anchor and is never moved by the attack generator.

Every non-ZERO ecology identity must occur exactly once in each packet partition at every attack state.

A single **membership reassignment** acts on exactly one packet and exactly one non-ZERO candidate identity:

1. choose one non-ZERO candidate `x`;
2. remove `x` from its current partition block;
3. place `x` into either:
   - the ZERO-containing block,
   - any other existing block,
   - or a new singleton block;
4. delete an emptied non-ZERO source block if necessary;
5. canonicalize the resulting unlabeled partition.

No-op moves are excluded.

A two-packet attack step applies exactly one such reassignment to either `q3` or `q4`.

Attack cost is the shortest path length in this generated two-packet state graph from the clean source signature.

The assay must exhaustively breadth-first enumerate all distinct signatures reachable from each clean source at shortest cost 0, 1, 2, and 3.

This attack cost is operational. It must not be replaced by a generic Hamming-distance analogy.

---

## 3. Generalized anchored reassignment distance for decoding

Received partitions may have a different number of blocks from clean partitions, so the parent equal-block matching routine is insufficient.

For any received packet partition `P` and clean packet partition `Q`, define the decoding distance as follows.

### 3.1 ZERO block is anchored

The block containing `ZERO` in `P` is paired only with the block containing `ZERO` in `Q`.

Its retained score is the number of named candidate identities in their intersection, including `ZERO`.

### 3.2 Remaining blocks are unlabeled

Remove the ZERO blocks.

Among all one-to-one matchings between the remaining blocks, with unmatched blocks permitted through zero-overlap dummy matches, maximize the total number of candidate identities preserved in matched block intersections.

For one eight-state packet:

```text
anchored_reassignment_distance(P,Q)
  = 8 - maximum_preserved_identity_count.
```

For a two-packet signature:

```text
D([P3,P4],[Q3,Q4])
  = d_anchor(P3,Q3) + d_anchor(P4,Q4).
```

Implementation must compute the maximum overlap exactly, not greedily.

This chamber uses this quantity only as an explicitly authored decoder score. It does **not** preregister or assume a global metric theorem or triangle inequality.

---

## 4. Decoders

For received signature `R`, compute its distance to all four clean codewords.

### Decoder N: nearest clean signature

Return:

```text
UNIQUE_NEAREST(Hj)
```

only when exactly one clean hypothesis achieves the minimum distance.

Return:

```text
NEAREST_TIE
```

when two or more clean hypotheses share the minimum.

For evaluation against a known simulated source `Hs`, classify:

```text
CORRECT_UNIQUE_NEAREST
WRONG_UNIQUE_NEAREST
NEAREST_TIE
```

### Decoder E: exact clean-codeword acceptance

Return the matching hypothesis only if the complete received two-packet signature equals one frozen clean codeword exactly.

Otherwise return:

```text
NON_CODEWORD_EVIDENCE_CONFLICT
```

If the received signature exactly equals a different clean hypothesis, classify:

```text
CLEAN_CODEWORD_IMPERSONATION
```

---

## 5. Preregistered obligations

### O1 · Clean-codeword impersonation lower bound

For every source hypothesis and every attack state with shortest attack cost `<= 3`:

```text
received signature != every other clean codeword.
```

Therefore Decoder E must report zero false clean-codeword impersonations through budget 3.

This obligation is a direct finite attack-space check, not merely a restatement of the parent distance receipt.

### O2 · One-reassignment unique recovery

Every state at shortest attack cost exactly 1 must classify under Decoder N as:

```text
CORRECT_UNIQUE_NEAREST.
```

If any one-move state ties or selects a wrong hypothesis, one-reassignment correction is not earned.

### O3 · Two-reassignment ambiguity must exist

At least one shortest-cost-2 state must produce:

```text
NEAREST_TIE.
```

Frozen constructive target family:

- source H0;
- transform the `q3` packet exactly into H1's clean `q3` partition using the known two-membership kernel substitution;
- leave `q4` at H0.

If the resulting signature is not equidistant from H0 and H1 under the generalized anchored decoder score, the expected ambiguity fails.

### O4 · No wrong-unique nearest at cost <= 2

Exhaustive BFS must find zero `WRONG_UNIQUE_NEAREST` states at shortest attack cost 1 or 2 from any source.

This is not inferred from generic radius folklore; it must be checked over the complete generated state sets.

### O5 · Three-reassignment wrong-unique nearest must exist

At least one shortest-cost-3 state must produce:

```text
WRONG_UNIQUE_NEAREST.
```

Frozen constructive target family:

- source H0;
- transform `q3` exactly to H1's clean `q3` partition (2 moves);
- apply one additional membership reassignment in `q4` along a shortest path from H0's clean `q4` partition toward H1's clean `q4` partition.

The intended hostile geometry is:

```text
D(received,H0) = 3
D(received,H1) = 1
```

or another strictly wrong-unique configuration at the same shortest attack cost.

If no wrong-unique nearest state exists at cost 3, that stronger robustness result must be reported instead.

### O6 · Detection/correction separation

If O1-O5 all hold, the chamber may state only the bounded separation:

```text
exact clean-codeword impersonation is excluded through attack budget 3,
while unique nearest-source recovery is guaranteed only through budget 1;
budget 2 admits ambiguity;
budget 3 admits wrong-unique nearest decoding.
```

Do not translate these results into a generic `(n,k,d)` code claim.

---

## 6. Required exhaustive ledgers

For each source `H0..H3` and each exact shortest attack cost `k=0..3`, freeze:

```text
reachable_signature_count
CORRECT_UNIQUE_NEAREST count
NEAREST_TIE count
WRONG_UNIQUE_NEAREST count
NON_CODEWORD_EVIDENCE_CONFLICT count
CLEAN_CODEWORD_IMPERSONATION count
```

Also freeze explicit witness paths for:

```text
first cost-2 nearest tie
first cost-3 wrong-unique nearest
```

Each witness path must identify packet, moved candidate, source block, destination block, and resulting canonical signature after every step.

---

## 7. Hostile implementation controls

Implementation must fail closed if any of the following occurs:

1. ZERO is moved;
2. a candidate identity is duplicated or dropped;
3. an attack transition is a no-op but counted as cost;
4. BFS first-visit shortest-path discipline is violated;
5. the decoder's non-ZERO block matching uses a greedy overlap choice rather than an exact maximum;
6. a received non-codeword is automatically assigned to the nearest hypothesis without preserving whether the result was a tie or conflict;
7. exact acceptance and nearest decoding are conflated.

---

## 8. Claim ceiling

Even if every obligation survives, the strongest admissible conclusion is:

```text
BOUNDED_TWO_PACKET_PARTITION_SIGNATURE_ATTACK_GEOMETRY_IS_EXHAUSTIVELY_CHARACTERIZED_THROUGH_THREE_MEMBERSHIP_REASSIGNMENTS_IN_THE_AUTHORED_EIGHT_STATE_FIXTURE.
```

Potential bounded subclaims:

```text
clean-codeword impersonation requires >= 4 generated membership reassignments;
unique nearest-source recovery survives every generated one-reassignment attack;
two reassignments can create nearest-clean ambiguity;
three reassignments can create wrong-unique nearest decoding;
exact codeword acceptance and nearest decoding have different robustness envelopes.
```

Explicitly unearned:

```text
generic error-correcting code theorem
arbitrary corruption tolerance
cryptographic integrity
Byzantine fault tolerance
provenance recovery from terminal observation
TD613-general robustness theorem
physical robustness
Proto-Loom
production authority
Vercel authority
```

No PR. No CI request. No production mutation. No Vercel release gesture.

𝌋 U+10D613

⟐
