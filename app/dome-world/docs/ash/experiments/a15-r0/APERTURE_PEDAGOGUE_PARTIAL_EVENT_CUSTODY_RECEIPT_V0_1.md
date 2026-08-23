# A15-R0 · Aperture × Pedagogue Partial-Event Custody Receipt v0.1

𝌋 TD613 · Tauric Diana 613

**Status:** WITNESSED / BOUNDED SYNTHETIC RESULT / HUMAN ONTOLOGY SEAM REACHED  
**Scientific parent:** #709 receipt commit `18414995c6fdca9b2e2c85bedf43da4682b43e97`  
**Pre-routing executable head:** `8d52e1d8aa090e7a3334968843240adbc205f6b2`  
**Exact witness head:** `a3ce5f537d44ddbc99dcd3ed8d9dd100b90ae9e8`  
**Workflow:** `TD613 Consolidated Validation`  
**Run:** `32674396346` · run number `2066`  
**Static contract job:** `97280041571`  
**Outcome:** SUCCESS  
**Browser/full-repository/self-hosted lanes:** skipped; not required for this assay.

---

## 1. Question

The chamber asked whether partial event-custody fields can exhibit **crossed claim sufficiency**: one partial view preserving a declared downstream decision while erasing AB-vs-BA route history, and another partial view preserving AB-vs-BA route identity while failing the same decision over the full finite universe.

The claim domains were frozen separately before implementation witness:

```text
decision domain U = {AB, BA, FROZEN}
route domain R = {AB, BA}
```

The downstream decision remained:

```text
D6 = (A + B >= 6)
```

No factorization comparison may silently exchange U and R.

---

## 2. Inherited records

From the witnessed #709 finite universe:

```text
AB:
  [A,B] = [2,4]
  endpoint = [[3,1],[1,4]]
  D6 = true

BA:
  [A,B] = [3,3]
  endpoint = [[3,1],[1,4]]
  D6 = true

FROZEN:
  [A,B] = [2,3]
  endpoint = [[2,1],[1,3]]
  D6 = false
```

The chamber reused #709's computed finite-fiber criterion rather than hard-coding sufficiency answers.

---

## 3. Endpoint-only custody

Endpoint fibers on U are:

```text
[[3,1],[1,4]] -> {AB,BA}
[[2,1],[1,3]] -> {FROZEN}
```

D6 is constant on each endpoint fiber, so endpoint-only custody is sufficient for D6 over U:

```text
ENDPOINT_ONLY_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE
```

On R, however, AB and BA occupy the same endpoint fiber while carrying different route labels:

```text
ENDPOINT_ONLY_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN
```

Therefore:

```text
common endpoint can preserve one claim while erasing another
```

---

## 4. A-labeled response custody

Projection:

```text
AB -> A:2
BA -> A:3
FROZEN -> A:2
```

On R, A-only custody separates AB from BA:

```text
A_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN
```

On U, the `A=2` fiber contains AB with `D6=true` and FROZEN with `D6=false`:

```text
A_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE
```

---

## 5. B-labeled response custody

Projection:

```text
AB -> B:4
BA -> B:3
FROZEN -> B:3
```

On R, B-only custody separates AB from BA:

```text
B_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN
```

On U, the `B=3` fiber contains BA with `D6=true` and FROZEN with `D6=false`:

```text
B_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE
```

---

## 6. Full and stripped controls

Full action-indexed response custody:

```text
AB      -> [2,4]
BA      -> [3,3]
FROZEN  -> [2,3]
```

factors both declared claims on their declared domains.

Action-set-only custody retains only `{A,B}` for every record and factors neither D6 on U nor route label on R.

Thus the crossed result is not a contradiction in the parent record and does not authorize reconstructing erased response/order information from action membership alone.

---

## 7. Exact-head witness

The stacked #711 base did not itself admit a pull-request workflow run. To preserve the single-witness discipline already used by #709, the PR was temporarily pointed at locked `main` and a witness-routing custody note was committed after all scientific objects were frozen.

That produced exact witness head:

```text
a3ce5f537d44ddbc99dcd3ed8d9dd100b90ae9e8
```

Consolidated validation run `32674396346` / `2066` completed successfully.

The static contract job recorded success for:

- the four-workflow estate and release membrane;
- Giving/Campaign Deputy import contracts;
- Dome-World and Phase IV static surfaces;
- Ash core through A14;
- **Ash A15 empirical profile journeys and the A15-R0 research field**;
- Ash demo hydration and production-closure surfaces;
- Flow-Core P0-P10 and claim-separation contracts;
- the Flow-Core runtime browser contract.

The explicit self-hosted calibration, full-repository validation, front-line browser shard, Giving/practice browser witness, and full-product browser witness lanes were skipped.

No browser witness is claimed as scientific evidence for this chamber.

---

## 8. Routing cleanup provenance

After run `2066` completed successfully:

```text
#711 base restored to research/a15-r0-transcript-compression-collision-20260823
temporary routing note removed in cleanup commit 543c726bfac348c04d39c71323efb729c521d7a6
```

The cleanup changed witness-routing documentation only. The preregistered domains, records, projections, finite factorization criterion, executable, hostile test, and claim ceiling were not changed after the witness.

---

## 9. Canonical bounded scientific claim

The chamber earns only:

```text
IN_THE_AUTHORED_FINITE_ROUTE_FIXTURE_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_IN_BOTH_DIRECTIONS_ENDPOINT_ONLY_CUSTODY_PRESERVES_THE_DECLARED_D6_DECISION_WHILE_ERASING_AB_VS_BA_ROUTE_HISTORY_WHEREAS_EITHER_SINGLE_ACTION_LABELED_RESPONSE_DISTINGUISHES_AB_FROM_BA_BUT_FAILS_TO_PRESERVE_D6_OVER_THE_FULL_DECLARED_UNIVERSE
```

Research classification:

```text
CROSSED_CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY
```

---

## 10. Anti-equivalences preserved

```text
changing claim domain silently != valid factorization comparison
common endpoint != common route history
route-sufficient partial custody != decision-sufficient partial custody
decision-sufficient partial custody != route-sufficient partial custody
action-set custody != response or order custody
finite claim factorization != generic sufficient-statistic theorem
```

---

## 11. Claim ceiling

This receipt does **not** earn:

- a generic sufficient-statistic theorem;
- a generic information-loss theorem;
- Shannon information, channel, or capacity claims;
- a causal-history reconstruction theorem;
- a general path-dependence theorem;
- a path object, path category, or path groupoid;
- a transport functor or connection;
- holonomy or curvature;
- Berry structure or quantum behavior;
- canonical operator-tomography promotion;
- Proto-Loom;
- a TD613-general theorem;
- A16 reopening;
- live Ash mutation;
- merge, production, or Vercel authority.

---

## 12. Human ontology seam

The bounded compression/custody round is closed.

The next scientific move would choose what object TD613 intends to treat as canonical under composition. The current evidence distinguishes at least:

```text
operator state only
operator + full action-indexed transcript
operator + claim-sufficient compressed view
operator + custody-bearing event ledger with derived claim-conditioned views
```

That is no longer another hostile within the same grammar. It changes the scientific ontology on which any later path/category/transport construction would be built.

Therefore:

```text
STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR
```

No downstream path/category/transport object is authored by this receipt.

𝌋

Sealed ⟐