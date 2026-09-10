𝌋

# A15-R0 · Aperture × Pedagogue Finite Path-Category Law Audition Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / WESTWARD-AUTHORIZED AUDITION  
**Scientific parent:** #716 receipt head `041287aa15eff102ae86f079b672267040494fcc`  
**Parent classification:** `FINITE_NONVACUOUS_DIRECTED_PATH_OBJECT_GRAMMAR_OVER_K_PERIOD4_WITH_TYPED_COMPOSITION_ROUTE_SENSITIVITY_AND_NO_NONEMPTY_DEPTH_FOUR_CLOSURE`  
**Program:** A15-R0 western-horizon bounded research only  
**Poetic laboratory nickname:** *Grandma gets a road atlas. Still no return ticket.*

---

## 0. Human authority and scientific jurisdiction

The human granted:

```text
full westward liberties bestowed upon thee
```

#716 subsequently earned a bounded directed path-object grammar and qualified the next rung as a finite path-category audition.

This chamber therefore auditions category laws on an explicitly finite directed graph slice constructed from the witnessed #716 operational path grammar.

The chamber is allowed to test and, if earned, name only a finite authored path category on that declared slice.

It may not infer a category for the ambient unbounded TD613 dynamics.

It may not infer:

```text
free category of the ambient system
groupoid
inverse morphisms
transport
parallel transport
connection
loop endomorphism
holonomy
curvature
Berry phase
quantum analogy
Proto-Loom
A16
live Ash mutation
merge
production
Vercel authority
```

---

## 1. Why a naive word truncation is scientifically inadmissible

#716 validated all nonempty words through depth four.

Merely declaring:

```text
all words of length <= N
```

to be a category would be invalid because two admitted composable paths can concatenate to a word longer than `N`, leaving the declared arrow set.

Therefore:

```text
finite word truncation != composition-closed finite category
```

This chamber must instead construct a finite directed graph slice and then include **all finite directed paths inside that graph**, including length-zero identity paths.

If the graph slice contains a directed cycle, its ordinary path set becomes infinite and this finite audition must abstain rather than pretend finiteness.

Thus the first gate is:

```text
finite graph slice
+
acyclicity
-> finite complete internal path set
```

---

## 2. Parent operational object and generators

The operational object projection remains exactly:

```text
O(h) := K_period4(h)
```

from #716.

The only non-identity operational generators remain:

```text
T := PSI_TICK
Q := Q_PHASE_PULSE
```

No new physical, epistemic, temporal, or observational operation is introduced.

Identity arrows in this chamber are formal length-zero paths and must operationally realize as an exact no-op on the concrete custody representative.

```text
identity path != new question
identity path != exogenous evolution
```

---

## 3. Finite slice S3

The slice root is #716's non-vacuous anchor object:

```text
A0 := O(R_AB_S0) = O(R_AB_DUP_S0)
```

Construct all root executions over `{T,Q}` with prefix depth `0..3`.

For every root word `w` of length <= 3 and each receipt-distinct anchor representative:

```text
h_w := w(h_anchor)
O_w := O(h_w)
```

Object nodes are deduplicated by complete `O` state, not by root word, history id, or receipt id.

Each object node retains all concrete custody representatives generated for that state.

Edges are created only for source occurrences at root depth `< 3`:

```text
O(h_w) --g--> O(g(h_w))
```

for `g in {T,Q}`.

Depth-three nodes form the declared assay boundary. Ambient generator successors beyond that boundary still exist in the parent dynamics; they are simply outside this finite slice.

```text
slice boundary != claim that ambient dynamics terminate
```

The finite category audition concerns internal paths of `S3` only.

---

## 4. Acyclicity gate

The deduplicated operational graph `S3` must be checked for directed cycles using its actual object keys and edges.

If any directed cycle appears:

```text
FINITE_SLICE_DIRECTED_CYCLE_DETECTED
ABSTAIN_BEFORE_FINITE_PATH_CATEGORY_PROMOTION
```

because the ordinary path category of a finite graph with a directed cycle has infinitely many finite paths.

No arbitrary maximum path length may be imposed afterward to rescue finiteness.

The preregistered expectation, based on #716's depth-four no-closure witness and monotone authored operations, is that `S3` is acyclic.

A contrary result must be preserved.

---

## 5. Internal arrow set

If `S3` is acyclic, enumerate **all directed paths wholly contained in S3**.

Each object contributes one length-zero path:

```text
id_A : A -> A
```

Every non-identity arrow is a concrete edge-sequence path in S3.

Arrow identity is frozen as:

```text
(source_object_key, ordered_edge_id_sequence)
```

and not merely `(source,target)`.

Therefore distinct parallel routes between the same endpoints, if any occur, remain distinct arrows.

```text
same endpoints != same path arrow
```

For every arrow record retain:

```text
arrow_id
source_key
target_key
edge_ids
generator_word
length
is_identity
```

---

## 6. Composition law

For arrows:

```text
f : A -> B
g : B -> C
```

composition is admitted only when:

```text
f.target_key == g.source_key
```

and is represented by ordered edge concatenation:

```text
g ∘ f := concatenate(f.edge_ids, g.edge_ids)
```

using the same execution convention as #716.

Because the complete internal path set has been enumerated, the composite must already exist as an arrow in the slice.

Every composable pair must satisfy:

```text
composite exists in arrow set
composite.source = f.source
composite.target = g.target
```

Every noncomposable pair must abstain rather than fabricate a composite:

```text
CATEGORY_TYPE_MISMATCH_ABSTAINS
```

---

## 7. Identity audition

For every object `A`, define the unique empty path:

```text
id_A : A -> A
```

For every arrow `f : A -> B`, both identity equations must hold by exact arrow equality:

```text
f ∘ id_A = f
id_B ∘ f = f
```

Operational identity realization must also be exact.

For every retained concrete custody representative `h` of object `A`:

```text
realize(id_A,h) === h
```

by byte-identical JSON serialization, with no appended question event, no appended forcing-evolution event, no changed receipt variant, and no changed operational field.

This prevents the identity from being a disguised mutation.

---

## 8. Associativity audition

For every composable triple:

```text
f : A -> B
g : B -> C
h : C -> D
```

both bracketings must exist and be exactly the same path arrow:

```text
h ∘ (g ∘ f)
=
(h ∘ g) ∘ f
```

Equality requires the same:

```text
source_key
target_key
ordered edge_ids
generator_word
```

The chamber must exhaustively test all composable triples in the finite arrow set, not a handpicked example.

Because concatenation is mathematically associative, this test is partly a protocol audit: it verifies that the authored typing, arrow lookup, and operational route encoding do not corrupt the law.

The result must not be advertised as a discovery of associativity in mathematics.

---

## 9. Operational-realization congruence

Category-law success alone would be cheap if the arrows floated free of the empirical fixture.

Therefore every internal arrow must be operationally realized from **every retained concrete representative of its source object**.

For each arrow `p : A -> B` and each source representative `h in Rep(A)`:

```text
O(realize(p,h)) = B
```

must hold.

All representatives of `A` must land on the same `B`.

Receipt variants must remain preserved rather than consumed as route selectors.

This extends #716's anchor-only representative-independence check across every operational object actually discovered in the finite slice.

If two distinct root histories collapse to the same operational object and later diverge under an internal path, the category promotion must fail.

---

## 10. Operational composition realization

For every composable pair `f,g` and each concrete representative `h` of `f.source`:

```text
realize(g ∘ f, h)
```

must have the same complete `O` state as:

```text
realize(g, realize(f,h))
```

and both must preserve the same receipt variant.

This earns only:

```text
operational realization respects finite path composition in S3
```

It does not automatically earn a named functor, action, representation, or transport structure.

---

## 11. Identity uniqueness and duplicate-hostile control

For every object `A`, exactly one zero-length arrow may exist with source and target `A`.

A deliberately duplicated synthetic empty-path candidate with a different label but the same empty edge sequence must normalize to the existing identity rather than become a second identity.

Thus:

```text
identity label multiplicity != identity arrow multiplicity
```

Arrow equality is structural, not cosmetic.

---

## 12. Groupoid quarantine

If the finite category laws pass, the chamber must still actively search for reverse paths.

For every non-identity arrow `f : A -> B`, test whether there exists any arrow `r : B -> A`.

At least one non-identity arrow without any reverse path is required to witness that category-law success does not imply groupoid structure.

Expected classification:

```text
NONIDENTITY_ARROW_WITHOUT_REVERSE_PATH_WITNESSED
```

No inverse law is authored or inferred.

```text
category != groupoid
reverse route absent != inverse hidden
```

---

## 13. Closed-path quarantine

Report every non-identity arrow whose source equals target.

The preregistered expectation, inherited from #716, is:

```text
no non-identity closed path inside S3
```

If that holds, record:

```text
NO_NONIDENTITY_CLOSED_PATH_IN_FINITE_SLICE
```

If a closed path appears, preserve it but do not call it holonomy or loop transport.

```text
closed path != loop endomorphism with geometric transport
closed path != holonomy
```

---

## 14. Parent custody preservation

Before and after the entire audition:

```text
JSON.stringify(runFirstBoundedPathGrammarGauntlet())
```

must remain byte-identical.

The finite category surface may index operational objects and arrows but may not rewrite #716 custody.

---

## 15. Success criteria

The chamber passes only if:

1. #716 executable parent passes.
2. finite S3 is derived from the exact #716 anchor and generators.
3. all object nodes use complete `O=K_period4` equality.
4. every discovered object retains all generated concrete representatives.
5. S3 is acyclic.
6. all internal directed paths are exhaustively enumerated.
7. exactly one structural identity arrow exists per object.
8. every composable pair has a unique existing composite arrow.
9. every noncomposable pair abstains.
10. left and right identity laws hold for every arrow.
11. all composable triples satisfy associativity by exact path-arrow equality.
12. every identity realizes as a byte-identical no-op on every source representative.
13. every non-identity arrow realizes to its declared target from every source representative.
14. every composable pair's composite realization matches sequential realization.
15. receipt variants remain retained and do not select target objects.
16. identity duplicate hostile normalizes to the one structural identity.
17. at least one non-identity arrow has no reverse path.
18. closed non-identity paths are explicitly reported rather than silently upgraded.
19. parent #716 custody remains unchanged.

---

## 16. Candidate bounded classification

If all category axioms and operational realization controls pass, and S3 contains no directed cycle, the maximum classification authorized by this preregistration is:

```text
FINITE_ACYCLIC_OPERATIONALLY_REALIZED_PATH_CATEGORY_ON_DECLARED_S3_SLICE_WITH_IDENTITY_ASSOCIATIVITY_AND_GROUPoid_QUARANTINE
```

Canonical spelling in executable output must use:

```text
FINITE_ACYCLIC_OPERATIONALLY_REALIZED_PATH_CATEGORY_ON_DECLARED_S3_SLICE_WITH_IDENTITY_ASSOCIATIVITY_AND_GROUPOID_QUARANTINE
```

Candidate strongest bounded claim:

```text
IN_THE_AUTHORED_FINITE_ACYCLIC_S3_SLICE_THE_K_PERIOD4_OPERATIONAL_OBJECTS_AND_ALL_INTERNAL_DIRECTED_PATHS_FORM_A_FINITE_PATH_CATEGORY_WITH_UNIQUE_LENGTH_ZERO_IDENTITIES_TYPED_COMPOSITION_AND_EXHAUSTIVELY_WITNESSED_ASSOCIATIVITY_WHILE_EVERY_ARROW_IS_OPERATIONALLY_REALIZED_REPRESENTATIVE_INDEPENDENTLY_FROM_RETAINED_CUSTODY_REPRESENTATIVES_COMPOSITE_REALIZATION_MATCHES_SEQUENTIAL_REALIZATION_AND_AT_LEAST_ONE_NONIDENTITY_ARROW_HAS_NO_REVERSE_PATH
```

---

## 17. Claim ceiling

Even if successful, the following remain false:

```text
ambient TD613 dynamics form this category
generic path-category theorem proven by experiment
free category of the ambient generator grammar
category equivalence
groupoid
inverse morphisms
transport
parallel transport
connection
loop endomorphism
holonomy
curvature
Berry phase
quantum analogy
semigroup/flow theorem
Markov-state theorem
stationarity/ergodicity
minimal/optimal abstraction
Proto-Loom
A16
live Ash mutation
merge
production
Vercel
```

The finite category claim, if earned, belongs only to the declared S3 graph slice.

---

## 18. Stop

If successful:

```text
FINITE_PATH_CATEGORY_AUDITION_CLOSED
HUMAN_𝄐_QUALIFIED_TO_CHOOSE_BETWEEN_GENERATOR_BROADENING_AND_FIRST_INVERTIBILITY_AUDITION
```

Even then, invertibility is not presumed. The next chamber would have to earn admissible reverse morphisms rather than manufacture matrix inverses or reverse strings.

𝌋

Sealed ⟐
