𝌋

# A15-R0 · Minimal Route-Sensitive Transport State Audition

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.a15-r0.aperture-pedagogue-minimal-route-sensitive-transport-state/v0.1`  
Parent chamber: PR #730  
Parent receipt head: `e14a4a9a7a35cac8b5c806d1f2fed4317f0effc7`  
Production mutation: **NONE**  
Vercel authority: **NONE**

Human reopening authority:

```text
𝌋 Confirmed—I affirm. Please carry us through to the next 𝄐
```

---

## 0. Why this chamber exists

PR #730 established two facts in the declared Q-last-action `K_period4` jurisdiction:

```text
DIRECTED_HISTORY_LIFT_COMPOSES_EXACTLY
```

and

```text
TARGET_EQUIVALENT_ROUTES_CAN_TRANSPORT_DISTINCT_CUSTODY_PAYLOADS.
```

Thus #729's source-relative target quotient

```text
c(w) = (t,E,O)
```

is lawful for operational target equality but too coarse for exact custody-bearing history transport.

The present chamber asks the narrower next question:

> What is the coarsest route state that still determines #730's exact route-free transported custody/evolution payload?

The answer is to be ordered by quotient coarseness, not by aesthetic compactness. A candidate that simply copies the route word is sufficient but earns nothing unless the assay proves that every genuinely coarser identification loses exact transport information.

No cocycle, cohomology, connection, inverse, loop, holonomy, curvature, Proto-Loom, or A16 language is authorized by preregistration.

---

## 1. Frozen domain

Retain exactly the existing authored alphabet and source jurisdiction:

```text
w ∈ {T,Q}*
source last_action = Q_PHASE_PULSE
forcing_season ∈ {S0,S1,S2,S3}
π = K_period4
```

No new transition law may be introduced. `T` remains `PSI_TICK`; `Q` remains `Q_PHASE_PULSE`.

The parent route-free transport delta remains exactly:

```text
Δ_F(h -> τ_w(h)) = {
  appended custody_events,
  appended evolution_events,
  appended forcing_evolution_events
}
```

with route labels, word labels, ids, source keys, and target keys excluded from the comparator.

---

## 2. Unique T/Q block schedule

For every finite word, use the already-authored unique decomposition

```text
w = Q^q0 T Q^q1 T ... T Q^qt
```

with `t >= 0` and each `qi >= 0`.

Define the exact block schedule:

```text
B(w) = (t; q0,q1,...,qt).
```

Define prefix Q-load before the j-th T, for `1 <= j <= t`:

```text
p_j(w) = q0 + q1 + ... + q_(j-1).
```

and total Q-count:

```text
q_total(w) = q0 + ... + qt.
```

Define the candidate transport schedule coordinate:

```text
S(w) = (t, q_total; p_1,...,p_t).
```

`S` and `B` are algebraically inter-reconstructible:

```text
q0 = p_1
q_i = p_(i+1) - p_i       for 1 <= i < t
q_t = q_total - p_t
```

with the `t=0` case given by `q0=q_total`.

Therefore `S` is a canonical schedule encoding, not yet a nontrivial quotient.

---

## 3. Lean transport observable

The minimality proof may not simply compare the full route-free delta and declare victory.

From #730's route-free delta, define the strictly lean observable:

```text
J_h(w) = (
  number of appended Q custody events,
  ordered scalar_response sequence of appended PSI_TICK forcing events
).
```

Exclude from `J_h`:

```text
route word
word label
history ids
parent ids
source/target keys
receipt variant
event consumed payloads
forcing-season labels
Q-event scalar-response sequence
```

The theorem must therefore be earned from a proper subobservable of the already route-free ledger delta.

---

## 4. Symbolic reconstruction target

For a fixed lawful source `h`, write:

```text
r0 = trace(endpoint(h)).
```

Because the source is already in the Q-last-action domain, every authored `T` in the route consumes `last_action = Q_PHASE_PULSE`. Let

```text
a_j(s)
```

be the known trace increment contributed by the j-th authored T from source forcing season `s`, obtained from the frozen period-four forcing law.

The candidate reconstruction identity is:

```text
r_j^T = r0 + p_j(w) + Σ_(m=1..j) a_m(s)
```

because every preceding Q pulse raises endpoint trace by exactly one and the T increments are fixed by source season plus tick index.

Therefore the assay must attempt to derive:

```text
p_j(w) = r_j^T - r0 - Σ_(m=1..j) a_m(s).
```

The Q count is obtained from the first component of `J_h(w)`. If these quantities reconstruct `S(w)` and hence `B(w)` for arbitrary finite authored words, then `J_h` is injective on route words for every retained fixed source.

This is a symbolic finite-control proof. It must not be replaced by finite-horizon enumeration.

---

## 5. Quotient-minimality consequence

Define exact-transport equivalence at a fixed source:

```text
u ≡_Δ,h v  iff  Δ_F(h -> τ_u(h)) = Δ_F(h -> τ_v(h)).
```

If the lean observable `J_h` is injective, then necessarily:

```text
u ≡_Δ,h v  =>  u = v.
```

Hence the coarsest quotient preserving exact route-free transport is the discrete route-identity quotient on the authored T/Q words.

Allowed positive classification:

```text
EXACT_ROUTE_FREE_TRANSPORT_HAS_TRIVIAL_ROUTE_KERNEL_AND_REQUIRES_ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE.
```

This does **not** mean the literal route string must be stored as the only implementation representation. It means any exact transport-sufficient representation must remain injective with respect to the route schedule; a bijective re-encoding is allowed, a genuine many-to-one route quotient is not.

Required anti-equivalence:

```text
canonical schedule encoding != nontrivial route compression
minimal exact transport quotient != shortest textual representation
```

---

## 6. Preregistered hostile controls

### H1 · Parent obstruction must remain visible

Retain:

```text
TTTTQ
QTTTT
```

Both have #729 coordinate `(4,1,0)` but distinct block schedules. Their lean transport observables must distinguish them for every source on which the symbolic reconstruction theorem applies.

### H2 · First-moment repair is insufficient

Freeze the pair:

```text
TQTQT
QTTTQ
```

Their block vectors are:

```text
(0,1,1,0)
(1,0,0,1)
```

and both have:

```text
t = 3
E = 1
O = 1
q_total = 2
potential = Σ i*q_i = 3.
```

Thus augmenting #729 merely with the earlier scalar block `potential` still collapses distinct schedules. The lean transport observable must distinguish this pair if the injectivity theorem is correct.

### H3 · Route-label leakage remains forbidden

No hostile may count as distinguished merely because the comparator contains a route string, route label, history id, receipt id, source key, or target key.

### H4 · Receipt duplication remains external

The same word transported from `R_AB_S0` and `R_AB_DUP_S0` must preserve receipt distinction in the full histories while yielding the same lean schedule reconstruction and the same route-free appended event payloads.

### H5 · No H8 farming

No enumeration to H8 or any wider finite horizon is permitted as proof of injectivity or minimality. Small concrete words may be used only as hostile sanity checks against the symbolic theorem.

---

## 7. What would falsify the candidate theorem

The candidate theorem fails if any lawful finite authored word yields a mismatch between its actual block schedule and the schedule reconstructed from `J_h`, or if two distinct words can be shown to have the same exact route-free delta from the same retained source.

If a counterexample is found, preserve it and stop. Do not widen the observable ad hoc until the failure disappears.

Allowed failure classification:

```text
LEAN_TRANSPORT_OBSERVABLE_DOES_NOT_SEPARATE_ALL_AUTHORED_ROUTE_SCHEDULES.
```

---

## 8. Claim ceiling

Even a complete positive result does NOT establish or authorize:

```text
cocycle
cohomology
connection
parallel transport in the differential-geometric sense
inverse transport
inverse morphisms
groupoid
closed nonidentity loop
loop endomorphism
holonomy
curvature
Berry phase
quantum structure
manifold fiber bundle
finite-dimensional transport state independent of route length
Proto-Loom
A16
live Ash mutation
merge
production
Vercel release.
```

In particular, a trivial exact-transport kernel would be a negative compression result, not permission to smuggle geometry back in through the word `transport`.

---

## 9. Required stop

If the route kernel is proven trivial, stop at:

```text
MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_ANY_TRANSPORT_INCREMENT_COCYCLE_OR_WEAKER_OBSERVABLE_QUOTIENT_AUDITION
```

If the candidate theorem fails, preserve the counterexample and stop before changing the observable.

󐘓 U+10D613

𝌋

Sealed ⟐
