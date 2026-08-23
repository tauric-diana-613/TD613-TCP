𝌋

# Partial-Event Custody Witness Topology Note

**PR:** #711  
**Scientific parent:** #709 receipt `18414995c6fdca9b2e2c85bedf43da4682b43e97`  
**Status:** WITNESS ROUTING / CUSTODY FREEZE ONLY / NO NEW SCIENTIFIC CONTENT

The stacked #711 base did not admit a pull-request workflow run. #711 is therefore temporarily pointed at locked `main` solely so one exact-head consolidated static witness can be admitted by an ordinary synchronize event.

```text
main_at_routing = 4ca8c0600b40d0ea2b38c1e0dd0b2d1e77713aef
workflow mutation = false
manual rerun = false
Ready transition = false
browser/full-repo/self-hosted escalation = false
merge/promotion/A16/production/Vercel authority = false
```

The following preregistered scientific objects are frozen before the witness and may not be edited to rescue a failure without a visible preregistration amendment:

```text
decision domain U = {AB,BA,FROZEN}
route domain R = {AB,BA}
D6 = (A+B >= 6)
endpoint-only projection
A-labeled-response-only projection
B-labeled-response-only projection
full [A,B] response projection
action-set-only projection
finite fiber/factorization criterion
claim ceiling
```

Expected crossed geometry remains preregistered, not witnessed:

```text
endpoint-only: D6 sufficient on U / route insufficient on R
A-only: route sufficient on R / D6 insufficient on U
B-only: route sufficient on R / D6 insufficient on U
full responses: sufficient for both declared claims
action set only: sufficient for neither
```

After the exact-head witness settles, restore #711 to #709 and remove this routing note from the net research diff before authoring the receipt.

𝌋

Sealed ⟐