# Ash Keep A15-R0 · Moss Lantern ML3 Temporal-Order Tomography Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NON-RUNTIME / HUMAN-GATED**  
Sequence authority: **FALSE**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Live Ash binding: **NONE**  
Proto-Loom implementation: **NONE**  
Connection declared: **FALSE**  
Curvature claim: **FALSE**  
Holonomy claim: **FALSE**

## 0. Research question

ML0 established only:

```text
same endpoint != same route history
```

ML1 + minimum ML2 established, inside a finite synthetic registry fixture, that structured nonrepetition can reduce aliasing while duplicated probe positions lose information under a matched reading budget.

ML3 asks a different inverse question:

```text
Can route ORDER be reconstructed
when visited operations, route boundaries, endpoint,
and observation budget are matched?
```

The assay must not use Pedagogue's full route-memory comparator as its observer. Route memory already receives the route and computes route divergence; using it as tomography would reveal the answer to the measurement process.

## 1. Literature hydration constraints

The 2026 Pedagogue research pass motivates four bounded design laws:

1. Multi-time processes require probes that are informationally sufficient for the temporal object being reconstructed.
2. Sequential observations can carry structure unavailable to a temporally flattened aggregate.
3. Temporal networks are trajectories through state/graph space rather than unordered bags of snapshots.
4. Reconstruction paths and adjacent transitions can be first-class model structure rather than disposable intermediate states.

These are transferable methodological relations only. Quantum process papers do not grant quantum ontology to Moss Lantern.

## 2. Latent route family

ML3 uses a finite permutation family with fixed boundaries.

```text
fixed open boundary = open-practice-case
movable fictional micro-operations = [
  custody-hold,
  projection-observe,
  rest,
  prepare-return
]
fixed terminal action = return
fixed endpoint = returned-practice-capsule
```

All 24 permutations of the four movable operations are latent candidates.

Every candidate therefore has:

```text
same operation multiset = true
same operation count = true
same open boundary = true
same terminal action = true
same endpoint = true
```

Only temporal order differs.

`prepare-return` is an ML3-only fictional micro-operation. It does not modify the canonical live Ash route or Moss Lantern's ML0 fixture.

## 3. Observer firewall

The reconstruction observer receives only a two-coordinate synthetic witness state.

It may not receive:

- latent route labels;
- latent route index;
- absolute timestamps;
- transition timestamps;
- Pedagogue `route_projection`;
- Levenshtein distance;
- expected-route comparison output;
- hidden intermediate witness states.

Candidate routes and the declared forward operator family are known to the decoder, as in a finite inverse problem. The hidden route instance is not.

## 4. Positive control · order-sensitive classical operator train

Witness space:

```text
x ∈ Z_31^2
x0 = [1, 2]^T
```

The four movable operations receive fixed invertible 2×2 matrices over `Z_31`:

```text
H = [[1,2],[3,1]]
P = [[0,3],[3,0]]
R = [[0,3],[2,3]]
T = [[2,3],[2,2]]
```

For latent permutation `π = (π1, π2, π3, π4)`:

```text
x_final(π) = T_{π4} T_{π3} T_{π2} T_{π1} x0 mod 31
```

The observer sees only:

```text
[u, v] = x_final(π)
```

All six unordered operator pairs in the authored positive family must fail the commutation check:

```text
Ti Tj != Tj Ti
```

This is ordinary finite-dimensional classical algebra. It is not a quantum noncommutativity claim.

## 5. Negative control · commuting operator family

The null uses the same latent 24-permutation family, same start vector, same modulus, same two-coordinate observation budget, and four declared operations, but replaces the positive operators with commuting diagonal matrices:

```text
H0 = [[2,0],[0,1]]
P0 = [[3,0],[0,1]]
R0 = [[5,0],[0,1]]
T0 = [[7,0],[0,1]]
```

All permutations must therefore yield the same final witness:

```text
x_final = [24, 2]^T mod 31
```

The null asks whether the decoder falsely manufactures temporal identifiability when the forward process contains no order-sensitive residue.

## 6. Order-blind aggregate null

Independently of the operator null, every route exposes the same allowed order-blind metadata:

```text
operation multiset
operation count
open boundary
terminal action
endpoint
```

Therefore an endpoint/multiset-only observer must retain all 24 candidate routes.

This makes explicit:

```text
same visited operations + same endpoint
cannot identify order by themselves
```

## 7. Noise and replay

Default noise:

```text
seed = 613
coordinate jitter probability = 0.10
jitter set = {-2,-1,+1,+2} mod 31
trials per latent route = 64
```

No `Math.random()` is permitted.

Decoder:

```text
minimum circular-L1 distance
between observed [u,v]
and every declared candidate signature
```

Ties remain ambiguous.

## 8. Metrics

Each operator family reports:

```text
latent_route_count
unique_signature_count
exact_unique_recovery_rate
mean_candidate_set_size
maximum_candidate_set_size
noisy_exact_recovery_rate
ambiguous_decode_rate
wrong_unique_decode_rate
pairwise_noncommuting_pair_count
pairwise_commuting_pair_count
```

Global controls report:

```text
same_operation_multiset = true
same_endpoint = true
observer_receives_route_labels = false
observer_receives_absolute_timestamps = false
full_route_memory_used = false
observation_budget = 2 coordinates
```

## 9. Decision law

### H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY

Bounded synthetic support requires:

```text
positive unique_signature_count = 24
positive exact_unique_recovery_rate = 1
positive noisy_exact_recovery_rate >= 0.85
positive pairwise_noncommuting_pair_count = 6

commuting-null unique_signature_count = 1
commuting-null exact_unique_recovery_rate = 0
commuting-null mean_candidate_set_size = 24
commuting-null ambiguous_decode_rate = 1
commuting-null pairwise_commuting_pair_count = 6

order-blind candidate_set_size = 24
observer firewall intact
```

A failed control falsifies the assay mechanism. The threshold is a calibration criterion, not a universal scientific constant.

### Live architecture hypothesis

Regardless of the synthetic result:

```text
H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY = OPEN_UNMEASURED
```

A future TD613 experiment would need a declared TD613 forward operator and admitted measurements. Moss Lantern cannot promote itself into that claim.

## 10. Interpretation ceiling

A passing ML3 fixture may establish only:

```text
A finite classical order-sensitive process can retain
reconstructable temporal-order information in a terminal witness
while route multiset and endpoint are fixed,
and the matched commuting null does not.
```

It does not establish:

- quantum temporal tomography;
- indefinite causal order;
- non-Markovian quantum memory;
- physical noncommutativity;
- live TD613 temporal-order identifiability;
- D3 geometry;
- connection;
- curvature;
- holonomy;
- Berry phase;
- Berry curvature;
- physical phasons;
- Proto-Loom;
- A16 admission;
- production authority.

## 11. Pedagogue learning seam

If ML3 passes, Pedagogue may record an **independent synthetic assay witness** for the already hydrated generic relation:

```text
ORDER_IS_PART_OF_PROCESS_STATE
```

That witness still cannot promote the relation into Pedagogue law. It only advances the relation from:

```text
external cross-domain review candidate
```

to:

```text
external cross-domain review candidate
+
internal bounded synthetic assay witness
```

Human closure and another genuinely independent product/research context remain required before any shared-law promotion discussion.

## 12. UI / release posture

```text
Moss Lantern dedicated UI = NOT REQUIRED
Ash UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
```
